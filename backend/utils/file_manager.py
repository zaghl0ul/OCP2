import os
import shutil
import aiofiles
from typing import Optional, List, Dict, Any, BinaryIO
from pathlib import Path
import hashlib
import mimetypes
from datetime import datetime
import json
import logging
from fastapi import UploadFile, HTTPException
import aiofiles.os
import uuid

logger = logging.getLogger(__name__)

class FileManager:
    """
    Handles file operations, storage, and management
    """
    
    def __init__(self):
        """Initialize file manager with path configurations"""
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.uploads_dir = os.path.join(self.base_dir, "uploads")
        self.temp_dir = os.path.join(self.base_dir, "temp")
        self.outputs_dir = os.path.join(self.base_dir, "outputs")
        
        # Configuration from environment variables
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE_MB", "500")) * 1024 * 1024  # Convert to bytes
        
        # Allowed file types
        self.allowed_video_extensions = [
            'mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v', '3gp'
        ]
        self.allowed_audio_extensions = [
            'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'
        ]
        self.allowed_image_extensions = [
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'
        ]
        
        # Create directories if they don't exist
        self._ensure_dirs()
        
        # File metadata storage (in production, use database)
        self.file_metadata: Dict[str, Dict[str, Any]] = {}
    
    def _ensure_dirs(self):
        """Ensure required directories exist"""
        for directory in [self.uploads_dir, self.temp_dir, self.outputs_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)
                logger.info(f"Created directory: {directory}")
    
    def get_temp_dir(self) -> str:
        """Get the temporary directory path"""
        return self.temp_dir
    
    def get_uploads_dir(self) -> str:
        """Get the uploads directory path"""
        return self.uploads_dir
    
    def get_outputs_dir(self) -> str:
        """Get the outputs directory path"""
        return self.outputs_dir
    
    def get_file_hash(self, file_path: Path) -> str:
        """
        Calculate MD5 hash of a file
        """
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def get_file_info(self, file_path: Path) -> Dict[str, Any]:
        """
        Get comprehensive file information
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        stat = file_path.stat()
        mime_type, _ = mimetypes.guess_type(str(file_path))
        
        return {
            "name": file_path.name,
            "path": str(file_path),
            "size": stat.st_size,
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "mime_type": mime_type,
            "extension": file_path.suffix.lower().lstrip('.'),
            "created_at": datetime.fromtimestamp(stat.st_ctime),
            "modified_at": datetime.fromtimestamp(stat.st_mtime),
            "hash": self.get_file_hash(file_path)
        }
    
    def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """
        Validate uploaded file
        """
        # Check file size
        if hasattr(file, 'size') and file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            )
        
        # Check file extension
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        extension = file.filename.lower().split('.')[-1]
        all_allowed = (
            self.allowed_video_extensions + 
            self.allowed_audio_extensions + 
            self.allowed_image_extensions
        )
        
        if extension not in all_allowed:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(all_allowed)}"
            )
        
        # Determine file category
        if extension in self.allowed_video_extensions:
            category = "video"
        elif extension in self.allowed_audio_extensions:
            category = "audio"
        elif extension in self.allowed_image_extensions:
            category = "image"
        else:
            category = "unknown"
        
        return {
            "filename": file.filename,
            "extension": extension,
            "category": category,
            "content_type": file.content_type,
            "size": getattr(file, 'size', None)
        }
    
    def _generate_secure_filename(self, original_filename):
        """Generate a secure filename with timestamp and hash"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(f"{original_filename}{uuid.uuid4()}".encode()).hexdigest()[:8]
        
        # Extract extension
        if '.' in original_filename:
            _, ext = os.path.splitext(original_filename)
            return f"{timestamp}_{file_hash}{ext}"
        else:
            return f"{timestamp}_{file_hash}"
    
    async def save_upload(self, file: UploadFile, project_id: str) -> str:
        """Save an uploaded file to the uploads directory"""
        # Create project directory if it doesn't exist
        project_dir = os.path.join(self.uploads_dir, project_id)
        if not os.path.exists(project_dir):
            os.makedirs(project_dir)
        
        # Generate secure filename
        secure_filename = self._generate_secure_filename(file.filename)
        file_path = os.path.join(project_dir, secure_filename)
        
        # Save file
        try:
            async with aiofiles.open(file_path, 'wb') as out_file:
                # Read chunks to handle large files
                while content := await file.read(1024 * 1024):  # 1MB chunks
                    await out_file.write(content)
            
            logger.info(f"File saved: {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving file {file.filename}: {e}")
            raise
    
    async def create_temp_file(self, filename: str = None) -> str:
        """Create a temporary file and return its path"""
        if not filename:
            filename = f"temp_{uuid.uuid4()}.tmp"
        
        temp_path = os.path.join(self.temp_dir, self._generate_secure_filename(filename))
        
        # Create empty file
        async with aiofiles.open(temp_path, 'wb') as f:
            pass
        
        return temp_path
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file safely"""
        try:
            if os.path.exists(file_path):
                await aiofiles.os.remove(file_path)
                logger.info(f"Deleted file: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False
    
    def cleanup_project_files(self, project_id: str) -> bool:
        """Clean up all files associated with a project"""
        try:
            # Clean up uploads
            project_upload_dir = os.path.join(self.uploads_dir, project_id)
            if os.path.exists(project_upload_dir):
                shutil.rmtree(project_upload_dir)
                logger.info(f"Cleaned up upload directory for project: {project_id}")
            
            # Clean up outputs
            project_output_dir = os.path.join(self.outputs_dir, project_id)
            if os.path.exists(project_output_dir):
                shutil.rmtree(project_output_dir)
                logger.info(f"Cleaned up output directory for project: {project_id}")
            
            return True
        except Exception as e:
            logger.error(f"Error cleaning up files for project {project_id}: {e}")
            return False
    
    def cleanup_temp_files(self, max_age_hours: int = 24) -> int:
        """Clean up temporary files older than the specified age"""
        try:
            cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
            count = 0
            
            for filename in os.listdir(self.temp_dir):
                file_path = os.path.join(self.temp_dir, filename)
                if os.path.isfile(file_path) and os.path.getmtime(file_path) < cutoff_time:
                    os.remove(file_path)
                    count += 1
            
            logger.info(f"Cleaned up {count} temporary files")
            return count
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {e}")
            return 0
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage statistics
        """
        def get_dir_size(directory: Path) -> int:
            total_size = 0
            for file_path in directory.rglob("*"):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
            return total_size
        
        upload_size = get_dir_size(Path(self.uploads_dir))
        output_size = get_dir_size(Path(self.outputs_dir))
        temp_size = get_dir_size(Path(self.temp_dir))
        
        return {
            "upload_dir": {
                "path": str(Path(self.uploads_dir)),
                "size_bytes": upload_size,
                "size_mb": round(upload_size / (1024 * 1024), 2)
            },
            "output_dir": {
                "path": str(Path(self.outputs_dir)),
                "size_bytes": output_size,
                "size_mb": round(output_size / (1024 * 1024), 2)
            },
            "temp_dir": {
                "path": str(Path(self.temp_dir)),
                "size_bytes": temp_size,
                "size_mb": round(temp_size / (1024 * 1024), 2)
            },
            "total_size_mb": round((upload_size + output_size + temp_size) / (1024 * 1024), 2),
            "file_count": len(self.file_metadata)
        }
    
    def create_backup(self, backup_dir: Optional[Path] = None) -> Path:
        """
        Create a backup of important files and metadata
        """
        if backup_dir is None:
            backup_dir = Path("backups")
        
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"backup_{timestamp}"
        backup_path.mkdir()
        
        # Backup file metadata
        metadata_file = backup_path / "file_metadata.json"
        with open(metadata_file, 'w') as f:
            # Convert datetime objects to strings for JSON serialization
            serializable_metadata = {}
            for file_id, metadata in self.file_metadata.items():
                serializable_metadata[file_id] = {}
                for key, value in metadata.items():
                    if isinstance(value, datetime):
                        serializable_metadata[file_id][key] = value.isoformat()
                    else:
                        serializable_metadata[file_id][key] = value
            
            json.dump(serializable_metadata, f, indent=2)
        
        # Copy upload directory
        if Path(self.uploads_dir).exists():
            shutil.copytree(Path(self.uploads_dir), backup_path / "uploads")
        
        logger.info(f"Backup created: {backup_path}")
        return backup_path