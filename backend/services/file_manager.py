import os
import shutil
import tempfile
import mimetypes
import hashlib
import logging
from typing import Dict, List, Optional, Any, BinaryIO, Tuple
from datetime import datetime, timedelta
from pathlib import Path
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class FileManager:
    """Service for managing file operations, uploads, and storage"""
    
    def __init__(self, base_upload_dir: str = "uploads", max_file_size: int = 500 * 1024 * 1024):  # 500MB default
        self.base_upload_dir = Path(base_upload_dir)
        self.max_file_size = max_file_size
        self.temp_dir = Path(tempfile.gettempdir()) / "openclip_temp"
        
        # Allowed file types
        self.allowed_video_extensions = {
            '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v',
            '.3gp', '.ogv', '.ts', '.mts', '.m2ts'
        }
        
        self.allowed_audio_extensions = {
            '.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'
        }
        
        self.allowed_image_extensions = {
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'
        }
        
        # File metadata storage
        self.file_metadata = {}  # In production, use a database
        
        # Create directories
        self._ensure_directories()
        
        # Thread pool for async operations
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        try:
            self.base_upload_dir.mkdir(parents=True, exist_ok=True)
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            
            # Create subdirectories
            (self.base_upload_dir / "videos").mkdir(exist_ok=True)
            (self.base_upload_dir / "audio").mkdir(exist_ok=True)
            (self.base_upload_dir / "images").mkdir(exist_ok=True)
            (self.base_upload_dir / "exports").mkdir(exist_ok=True)
            (self.base_upload_dir / "thumbnails").mkdir(exist_ok=True)
            
        except Exception as e:
            logger.error(f"Error creating directories: {e}")
            raise
    
    def get_file_type(self, filename: str) -> str:
        """Determine file type based on extension"""
        ext = Path(filename).suffix.lower()
        
        if ext in self.allowed_video_extensions:
            return 'video'
        elif ext in self.allowed_audio_extensions:
            return 'audio'
        elif ext in self.allowed_image_extensions:
            return 'image'
        else:
            return 'unknown'
    
    def validate_file(self, filename: str, file_size: int) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            # Check file size
            if file_size > self.max_file_size:
                return {
                    'valid': False,
                    'reason': f'File size ({file_size / 1024 / 1024:.1f}MB) exceeds maximum allowed size ({self.max_file_size / 1024 / 1024:.1f}MB)'
                }
            
            # Check file extension
            file_type = self.get_file_type(filename)
            if file_type == 'unknown':
                return {
                    'valid': False,
                    'reason': f'File type not supported. Allowed extensions: {self.get_allowed_extensions()}'
                }
            
            # Check filename for security
            if '..' in filename or '/' in filename or '\\' in filename:
                return {
                    'valid': False,
                    'reason': 'Invalid filename. Filename contains illegal characters.'
                }
            
            return {
                'valid': True,
                'file_type': file_type,
                'estimated_processing_time': self._estimate_processing_time(file_size, file_type)
            }
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return {
                'valid': False,
                'reason': f'Validation error: {str(e)}'
            }
    
    def _estimate_processing_time(self, file_size: int, file_type: str) -> int:
        """Estimate processing time in seconds"""
        # Rough estimates based on file size and type
        if file_type == 'video':
            # Assume 1MB takes about 2 seconds to process
            return max(10, (file_size / 1024 / 1024) * 2)
        elif file_type == 'audio':
            # Audio is faster to process
            return max(5, (file_size / 1024 / 1024) * 0.5)
        else:
            return 5
    
    def get_allowed_extensions(self) -> List[str]:
        """Get list of all allowed file extensions"""
        return sorted(list(
            self.allowed_video_extensions | 
            self.allowed_audio_extensions | 
            self.allowed_image_extensions
        ))
    
    async def save_uploaded_file(self, file_data: BinaryIO, filename: str, 
                                project_id: str, file_type: Optional[str] = None) -> Dict[str, Any]:
        """Save uploaded file to storage"""
        try:
            # Validate file first
            file_data.seek(0, 2)  # Seek to end
            file_size = file_data.tell()
            file_data.seek(0)  # Reset to beginning
            
            validation = self.validate_file(filename, file_size)
            if not validation['valid']:
                return {
                    'success': False,
                    'error': validation['reason']
                }
            
            # Determine file type
            if file_type is None:
                file_type = validation['file_type']
            
            # Generate unique filename
            file_id = self._generate_file_id(filename)
            safe_filename = self._sanitize_filename(filename)
            stored_filename = f"{file_id}_{safe_filename}"
            
            # Determine storage path
            storage_path = self.base_upload_dir / file_type / stored_filename
            
            # Save file
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                self._save_file_sync,
                file_data,
                storage_path
            )
            
            # Calculate file hash
            file_hash = await self._calculate_file_hash(storage_path)
            
            # Store metadata
            metadata = {
                'file_id': file_id,
                'original_filename': filename,
                'stored_filename': stored_filename,
                'storage_path': str(storage_path),
                'file_type': file_type,
                'file_size': file_size,
                'file_hash': file_hash,
                'project_id': project_id,
                'upload_time': datetime.now().isoformat(),
                'mime_type': mimetypes.guess_type(filename)[0],
                'processing_status': 'uploaded'
            }
            
            self.file_metadata[file_id] = metadata
            
            return {
                'success': True,
                'file_id': file_id,
                'file_path': str(storage_path),
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"File upload error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_file_sync(self, file_data: BinaryIO, storage_path: Path):
        """Synchronously save file data"""
        with open(storage_path, 'wb') as f:
            shutil.copyfileobj(file_data, f)
    
    def _generate_file_id(self, filename: str) -> str:
        """Generate unique file ID"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        hash_input = f"{filename}_{timestamp}_{os.urandom(8).hex()}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:12]
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove or replace unsafe characters
        unsafe_chars = '<>:"/\\|?*'
        for char in unsafe_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        name, ext = os.path.splitext(filename)
        if len(name) > 100:
            name = name[:100]
        
        return f"{name}{ext}"
    
    async def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self._calculate_hash_sync,
            file_path
        )
    
    def _calculate_hash_sync(self, file_path: Path) -> str:
        """Synchronously calculate file hash"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file metadata by ID"""
        return self.file_metadata.get(file_id)
    
    def get_file_path(self, file_id: str) -> Optional[str]:
        """Get file path by ID"""
        metadata = self.file_metadata.get(file_id)
        if metadata:
            return metadata['storage_path']
        return None
    
    def file_exists(self, file_id: str) -> bool:
        """Check if file exists"""
        file_path = self.get_file_path(file_id)
        if file_path:
            return Path(file_path).exists()
        return False
    
    async def delete_file(self, file_id: str) -> Dict[str, Any]:
        """Delete file and its metadata"""
        try:
            metadata = self.file_metadata.get(file_id)
            if not metadata:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            file_path = Path(metadata['storage_path'])
            
            # Delete file if it exists
            if file_path.exists():
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    self.executor,
                    file_path.unlink
                )
            
            # Remove metadata
            del self.file_metadata[file_id]
            
            return {
                'success': True,
                'message': 'File deleted successfully'
            }
            
        except Exception as e:
            logger.error(f"File deletion error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def move_file(self, file_id: str, new_location: str) -> Dict[str, Any]:
        """Move file to new location"""
        try:
            metadata = self.file_metadata.get(file_id)
            if not metadata:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            old_path = Path(metadata['storage_path'])
            new_path = Path(new_location)
            
            if not old_path.exists():
                return {
                    'success': False,
                    'error': 'Source file does not exist'
                }
            
            # Ensure destination directory exists
            new_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Move file
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                shutil.move,
                str(old_path),
                str(new_path)
            )
            
            # Update metadata
            metadata['storage_path'] = str(new_path)
            metadata['moved_at'] = datetime.now().isoformat()
            
            return {
                'success': True,
                'new_path': str(new_path)
            }
            
        except Exception as e:
            logger.error(f"File move error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def copy_file(self, file_id: str, destination: str) -> Dict[str, Any]:
        """Copy file to new location"""
        try:
            metadata = self.file_metadata.get(file_id)
            if not metadata:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            source_path = Path(metadata['storage_path'])
            dest_path = Path(destination)
            
            if not source_path.exists():
                return {
                    'success': False,
                    'error': 'Source file does not exist'
                }
            
            # Ensure destination directory exists
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                shutil.copy2,
                str(source_path),
                str(dest_path)
            )
            
            return {
                'success': True,
                'copied_to': str(dest_path)
            }
            
        except Exception as e:
            logger.error(f"File copy error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        try:
            stats = {
                'total_files': len(self.file_metadata),
                'total_size': 0,
                'file_types': {},
                'projects': {},
                'storage_paths': {
                    'base_dir': str(self.base_upload_dir),
                    'temp_dir': str(self.temp_dir)
                }
            }
            
            for file_id, metadata in self.file_metadata.items():
                file_size = metadata.get('file_size', 0)
                file_type = metadata.get('file_type', 'unknown')
                project_id = metadata.get('project_id', 'unknown')
                
                stats['total_size'] += file_size
                
                # Count by file type
                if file_type not in stats['file_types']:
                    stats['file_types'][file_type] = {'count': 0, 'size': 0}
                stats['file_types'][file_type]['count'] += 1
                stats['file_types'][file_type]['size'] += file_size
                
                # Count by project
                if project_id not in stats['projects']:
                    stats['projects'][project_id] = {'count': 0, 'size': 0}
                stats['projects'][project_id]['count'] += 1
                stats['projects'][project_id]['size'] += file_size
            
            # Convert sizes to human readable format
            stats['total_size_mb'] = stats['total_size'] / 1024 / 1024
            stats['max_file_size_mb'] = self.max_file_size / 1024 / 1024
            
            return stats
            
        except Exception as e:
            logger.error(f"Storage stats error: {e}")
            return {
                'error': str(e)
            }
    
    async def cleanup_temp_files(self, max_age_hours: int = 24) -> Dict[str, Any]:
        """Clean up temporary files older than specified age"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
            cleaned_files = []
            
            if self.temp_dir.exists():
                for file_path in self.temp_dir.iterdir():
                    if file_path.is_file():
                        file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                        if file_mtime < cutoff_time:
                            try:
                                file_path.unlink()
                                cleaned_files.append(str(file_path))
                            except Exception as e:
                                logger.warning(f"Could not delete temp file {file_path}: {e}")
            
            return {
                'success': True,
                'cleaned_files': len(cleaned_files),
                'files': cleaned_files
            }
            
        except Exception as e:
            logger.error(f"Temp cleanup error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def cleanup_orphaned_files(self) -> Dict[str, Any]:
        """Clean up files that exist on disk but not in metadata"""
        try:
            orphaned_files = []
            
            # Get all files in storage
            for subdir in ['videos', 'audio', 'images', 'exports', 'thumbnails']:
                subdir_path = self.base_upload_dir / subdir
                if subdir_path.exists():
                    for file_path in subdir_path.iterdir():
                        if file_path.is_file():
                            # Check if file is referenced in metadata
                            file_referenced = any(
                                metadata['storage_path'] == str(file_path)
                                for metadata in self.file_metadata.values()
                            )
                            
                            if not file_referenced:
                                try:
                                    file_path.unlink()
                                    orphaned_files.append(str(file_path))
                                except Exception as e:
                                    logger.warning(f"Could not delete orphaned file {file_path}: {e}")
            
            return {
                'success': True,
                'cleaned_files': len(orphaned_files),
                'files': orphaned_files
            }
            
        except Exception as e:
            logger.error(f"Orphaned cleanup error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_project_files(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all files for a specific project"""
        try:
            project_files = []
            
            for file_id, metadata in self.file_metadata.items():
                if metadata.get('project_id') == project_id:
                    project_files.append({
                        'file_id': file_id,
                        'filename': metadata.get('original_filename'),
                        'file_type': metadata.get('file_type'),
                        'file_size': metadata.get('file_size'),
                        'upload_time': metadata.get('upload_time'),
                        'processing_status': metadata.get('processing_status')
                    })
            
            return sorted(project_files, key=lambda x: x.get('upload_time', ''), reverse=True)
            
        except Exception as e:
            logger.error(f"Get project files error: {e}")
            return []
    
    async def create_thumbnail(self, file_id: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """Create thumbnail for video/image file"""
        try:
            metadata = self.file_metadata.get(file_id)
            if not metadata:
                return {
                    'success': False,
                    'error': 'File not found'
                }
            
            file_type = metadata.get('file_type')
            if file_type not in ['video', 'image']:
                return {
                    'success': False,
                    'error': 'Thumbnails only supported for video and image files'
                }
            
            source_path = metadata['storage_path']
            
            if output_path is None:
                thumb_filename = f"thumb_{metadata['file_id']}.jpg"
                output_path = self.base_upload_dir / "thumbnails" / thumb_filename
            
            # Create thumbnail directory if it doesn't exist
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Try to create thumbnail using FFmpeg
            try:
                import subprocess
                
                # FFmpeg command to extract thumbnail at 5 seconds
                cmd = [
                    'ffmpeg',
                    '-i', str(source_path),
                    '-ss', '00:00:05',  # Extract at 5 seconds
                    '-vframes', '1',    # Extract only 1 frame
                    '-vf', 'scale=320:180',  # Scale to 320x180
                    '-y',  # Overwrite output file
                    str(output_path)
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0 and output_path.exists():
                    return {
                        'success': True,
                        'thumbnail_path': str(output_path),
                        'message': 'Thumbnail created successfully'
                    }
                else:
                    # Fallback: create a simple placeholder image
                    self._create_placeholder_thumbnail(output_path)
                    return {
                        'success': True,
                        'thumbnail_path': str(output_path),
                        'message': 'Created placeholder thumbnail (FFmpeg not available)'
                    }
                    
            except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
                logger.warning(f"FFmpeg thumbnail creation failed: {e}")
                # Fallback: create a simple placeholder image
                self._create_placeholder_thumbnail(output_path)
                return {
                    'success': True,
                    'thumbnail_path': str(output_path),
                    'message': 'Created placeholder thumbnail (FFmpeg error)'
                }
            
        except Exception as e:
            logger.error(f"Thumbnail creation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_placeholder_thumbnail(self, output_path: Path):
        """Create a simple placeholder thumbnail using PIL"""
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a 320x180 image with dark background
            img = Image.new('RGB', (320, 180), color='#1f2937')
            draw = ImageDraw.Draw(img)
            
            # Add text
            try:
                # Try to use a default font
                font = ImageFont.load_default()
            except:
                font = None
            
            text = "Video Thumbnail"
            if font:
                # Get text size and center it
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (320 - text_width) // 2
                y = (180 - text_height) // 2
                draw.text((x, y), text, fill='#9ca3af', font=font)
            else:
                # Fallback without font
                draw.text((120, 85), text, fill='#9ca3af')
            
            # Save the image
            img.save(output_path, 'JPEG')
            
        except ImportError:
            # If PIL is not available, create a simple text file as fallback
            with open(output_path.with_suffix('.txt'), 'w') as f:
                f.write('Thumbnail placeholder - PIL not available')
        except Exception as e:
            logger.warning(f"Could not create placeholder thumbnail: {e}")
    
    def update_processing_status(self, file_id: str, status: str, details: Optional[Dict] = None):
        """Update file processing status"""
        try:
            if file_id in self.file_metadata:
                self.file_metadata[file_id]['processing_status'] = status
                self.file_metadata[file_id]['status_updated_at'] = datetime.now().isoformat()
                
                if details:
                    self.file_metadata[file_id]['processing_details'] = details
                
                logger.info(f"Updated processing status for {file_id}: {status}")
            
        except Exception as e:
            logger.error(f"Status update error: {e}")
    
    def export_metadata(self) -> Dict[str, Any]:
        """Export file metadata for backup"""
        try:
            return {
                'export_time': datetime.now().isoformat(),
                'total_files': len(self.file_metadata),
                'metadata': self.file_metadata
            }
            
        except Exception as e:
            logger.error(f"Metadata export error: {e}")
            return {
                'error': str(e)
            }
    
    def import_metadata(self, metadata_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Import file metadata from backup"""
        try:
            imported_count = 0
            
            if 'metadata' in metadata_dict:
                for file_id, metadata in metadata_dict['metadata'].items():
                    self.file_metadata[file_id] = metadata
                    imported_count += 1
            
            return {
                'success': True,
                'imported_files': imported_count
            }
            
        except Exception as e:
            logger.error(f"Metadata import error: {e}")
            return {
                'success': False,
                'error': str(e)
            }