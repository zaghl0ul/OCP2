import os
import asyncio
import subprocess
import json
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
import tempfile
import shutil
from urllib.parse import urlparse
from datetime import datetime

# For YouTube processing
try:
    import yt_dlp
except ImportError:
    yt_dlp = None

from models.project import Clip, VideoData

logger = logging.getLogger(__name__)

class VideoProcessor:
    """Service for processing video files and extracting metadata"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "openclip_temp"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Supported video formats
        self.supported_formats = {
            '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', 
            '.webm', '.m4v', '.3gp', '.ogv', '.ts', '.mts'
        }
        
        # FFmpeg paths (adjust for your system)
        self.ffmpeg_path = self._find_ffmpeg()
        self.ffprobe_path = self._find_ffprobe()
        
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.outputs_dir = os.path.join(self.base_dir, "outputs")
    
    def _find_ffmpeg(self) -> Optional[str]:
        """Find FFmpeg executable"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return 'ffmpeg'
        except FileNotFoundError:
            pass
        
        # Try common installation paths
        common_paths = [
            'C:\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
            '/usr/local/bin/ffmpeg',
            '/usr/bin/ffmpeg'
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
        
        logger.warning("FFmpeg not found. Video processing will be limited.")
        return None
    
    def _find_ffprobe(self) -> Optional[str]:
        """Find FFprobe executable"""
        try:
            result = subprocess.run(['ffprobe', '-version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return 'ffprobe'
        except FileNotFoundError:
            pass
        
        # Try common installation paths
        common_paths = [
            'C:\\ffmpeg\\bin\\ffprobe.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
            '/usr/local/bin/ffprobe',
            '/usr/bin/ffprobe'
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
        
        logger.warning("FFprobe not found. Video metadata extraction will be limited.")
        return None
    
    async def extract_metadata(self, video_path: str) -> Dict[str, Any]:
        """Extract metadata from a video file"""
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        try:
            # Run ffprobe to get video information
            cmd = [
                "ffprobe", 
                "-v", "quiet", 
                "-print_format", "json", 
                "-show_format", 
                "-show_streams", 
                video_path
            ]
            
            # Run command asynchronously
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"Error extracting metadata: {stderr.decode()}")
                # Return basic info without ffmpeg data
                return {
                    "filename": os.path.basename(video_path),
                    "size": os.path.getsize(video_path),
                    "error": "Failed to extract video metadata"
                }
            
            # Parse JSON output
            data = json.loads(stdout.decode())
            
            # Extract relevant information
            metadata = {
                "filename": os.path.basename(video_path),
                "size": os.path.getsize(video_path),
                "format": data.get("format", {}).get("format_name", "unknown"),
                "duration": float(data.get("format", {}).get("duration", 0)),
                "bit_rate": int(data.get("format", {}).get("bit_rate", 0)),
            }
            
            # Find video stream
            video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
            if video_stream:
                metadata["resolution"] = f"{video_stream.get('width', 0)}x{video_stream.get('height', 0)}"
                metadata["codec"] = video_stream.get("codec_name", "unknown")
                metadata["fps"] = eval(video_stream.get("r_frame_rate", "0/1"))  # Convert fraction to float
            
            # Find audio stream
            audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
            if audio_stream:
                metadata["audio_codec"] = audio_stream.get("codec_name", "unknown")
                metadata["audio_channels"] = audio_stream.get("channels", 0)
                metadata["audio_sample_rate"] = audio_stream.get("sample_rate", 0)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata from {video_path}: {e}")
            # Return basic info on error
            return {
                "filename": os.path.basename(video_path),
                "size": os.path.getsize(video_path),
                "error": str(e)
            }
    
    async def process_youtube_url(self, youtube_url: str) -> Dict[str, Any]:
        """Process a YouTube URL and download the video"""
        if not yt_dlp:
            raise ImportError("yt-dlp is not installed. Install with 'pip install yt-dlp'")
        
        logger.info(f"Processing YouTube URL: {youtube_url}")
        
        try:
            # Create a temporary directory for the download
            download_dir = os.path.join(self.base_dir, "uploads", "youtube")
            os.makedirs(download_dir, exist_ok=True)
            
            # Create a unique filename based on the URL
            url_hash = abs(hash(youtube_url)) % 10000000
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"yt_{url_hash}_{timestamp}"
            
            # Configure yt-dlp options
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'outtmpl': os.path.join(download_dir, f"{base_filename}.%(ext)s"),
                'restrictfilenames': True,
                'noplaylist': True,
                'quiet': True,
                'no_warnings': True,
                'ignoreerrors': False,
                'noprogress': True,
            }
            
            # Download the video
            file_path = None
            video_info = None
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Get video info first
                video_info = await asyncio.to_thread(ydl.extract_info, youtube_url, download=True)
                if 'entries' in video_info:
                    # Playlist - get the first video
                    video_info = video_info['entries'][0]
                
                # Get downloaded file path
                file_path = ydl.prepare_filename(video_info)
                
                # Ensure the file exists
                if not os.path.exists(file_path):
                    raise FileNotFoundError(f"Downloaded file not found: {file_path}")
            
            # Extract metadata about the video
            metadata = await self.extract_metadata(file_path)
            
            # Combine with YouTube-specific info
            result = {
                "file_path": file_path,
                "filename": os.path.basename(file_path),
                "source": "youtube",
                "youtube_url": youtube_url,
                "youtube_title": video_info.get('title', 'Unknown'),
                "youtube_channel": video_info.get('channel', 'Unknown'),
                "youtube_upload_date": video_info.get('upload_date', 'Unknown'),
                "size": metadata.get('size', 0),
                "duration": metadata.get('duration', 0),
                "resolution": metadata.get('resolution', 'Unknown'),
                "fps": metadata.get('fps', 0),
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Error processing YouTube URL {youtube_url}: {e}")
            raise
    
    async def extract_segments(self, file_path: str, segments: List[Dict]) -> List[str]:
        """Extract video segments for analysis"""
        if not self.ffmpeg_path:
            raise Exception("FFmpeg not available for segment extraction")
        
        segment_files = []
        
        try:
            for i, segment in enumerate(segments):
                start_time = segment['start']
                duration = segment['end'] - segment['start']
                
                output_file = self.temp_dir / f"segment_{i}_{start_time}_{duration}.mp4"
                
                cmd = [
                    self.ffmpeg_path,
                    '-i', file_path,
                    '-ss', str(start_time),
                    '-t', str(duration),
                    '-c', 'copy',
                    '-avoid_negative_ts', 'make_zero',
                    str(output_file)
                ]
                
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                
                if process.returncode == 0 and output_file.exists():
                    segment_files.append(str(output_file))
                else:
                    logger.error(f"Failed to extract segment {i}: {stderr.decode()}")
            
            return segment_files
            
        except Exception as e:
            logger.error(f"Error extracting segments: {e}")
            # Clean up any partial files
            for file_path in segment_files:
                try:
                    os.remove(file_path)
                except:
                    pass
            raise
    
    async def export_clips(self, video_path: str, clips: List[Dict[str, Any]], export_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Export clips from a video based on timestamps"""
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Create output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.join(self.outputs_dir, f"export_{timestamp}")
        os.makedirs(output_dir, exist_ok=True)
        
        results = {
            "output_dir": output_dir,
            "clips": [],
            "format": export_settings.get("format", "mp4"),
            "total_clips": len(clips)
        }
        
        # Mock export for now - in production, use ffmpeg to cut clips
        for i, clip in enumerate(clips):
            # Simulate processing
            await asyncio.sleep(1)
            
            output_filename = f"clip_{i+1}_{clip.get('title', '').replace(' ', '_')}.{export_settings.get('format', 'mp4')}"
            output_path = os.path.join(output_dir, output_filename)
            
            # In production, you would run ffmpeg here to extract the clip
            # For mock purposes, we'll just create an empty file
            with open(output_path, 'w') as f:
                f.write("")
            
            results["clips"].append({
                "index": i + 1,
                "title": clip.get("title", f"Clip {i+1}"),
                "start_time": clip.get("start_time", 0),
                "end_time": clip.get("end_time", 0),
                "duration": clip.get("end_time", 0) - clip.get("start_time", 0),
                "output_path": output_path,
                "filename": output_filename
            })
        
        logger.info(f"Exported {len(clips)} clips to {output_dir}")
        return results
    
    def _build_export_command(self, source_file: str, clip: Clip, 
                             output_file: str, settings: Dict[str, Any]) -> List[str]:
        """Build FFmpeg command for clip export"""
        cmd = [self.ffmpeg_path]
        
        # Input file
        cmd.extend(['-i', source_file])
        
        # Time range
        cmd.extend(['-ss', str(clip.start_time)])
        cmd.extend(['-t', str(clip.end_time - clip.start_time)])
        
        # Video settings
        quality = settings.get('quality', 'high')
        if quality == 'high':
            cmd.extend(['-crf', '18'])
        elif quality == 'medium':
            cmd.extend(['-crf', '23'])
        else:  # low
            cmd.extend(['-crf', '28'])
        
        # Resolution
        if 'resolution' in settings and settings['resolution']:
            cmd.extend(['-vf', f"scale={settings['resolution']}:-2"])
        
        # Frame rate
        if 'fps' in settings and settings['fps']:
            cmd.extend(['-r', str(settings['fps'])])
        
        # Audio settings
        cmd.extend(['-c:a', 'aac', '-b:a', '128k'])
        
        # Output settings
        cmd.extend(['-avoid_negative_ts', 'make_zero'])
        cmd.extend(['-y'])  # Overwrite output file
        
        # Output file
        cmd.append(output_file)
        
        return cmd
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem compatibility"""
        import re
        # Remove or replace invalid characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # Limit length
        if len(filename) > 100:
            filename = filename[:100]
        return filename.strip()
    
    async def generate_thumbnail(self, file_path: str, timestamp: float) -> Optional[str]:
        """Generate thumbnail at specific timestamp"""
        if not self.ffmpeg_path:
            return None
        
        try:
            thumbnail_file = self.temp_dir / f"thumb_{timestamp}_{os.path.basename(file_path)}.jpg"
            
            cmd = [
                self.ffmpeg_path,
                '-i', file_path,
                '-ss', str(timestamp),
                '-vframes', '1',
                '-q:v', '2',
                str(thumbnail_file)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            await process.communicate()
            
            if process.returncode == 0 and thumbnail_file.exists():
                return str(thumbnail_file)
            
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
        
        return None
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """Clean up old temporary files"""
        try:
            import time
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            for file_path in self.temp_dir.rglob('*'):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        try:
                            file_path.unlink()
                            logger.info(f"Cleaned up old temp file: {file_path}")
                        except Exception as e:
                            logger.error(f"Error cleaning up {file_path}: {e}")
                            
        except Exception as e:
            logger.error(f"Error during temp file cleanup: {e}")
    
    def is_supported_format(self, file_path: str) -> bool:
        """Check if file format is supported"""
        return Path(file_path).suffix.lower() in self.supported_formats