from typing import Any, Dict, List, Optional, Union
import re
from pathlib import Path
from pydantic import BaseModel, validator
from fastapi import HTTPException

class ValidationError(Exception):
    """Custom validation error"""
    pass

class ProjectValidator:
    """Validators for project-related data"""
    
    @staticmethod
    def validate_project_name(name: str) -> str:
        """Validate project name"""
        if not name or not name.strip():
            raise ValidationError("Project name cannot be empty")
        
        if len(name.strip()) > 100:
            raise ValidationError("Project name cannot exceed 100 characters")
        
        # Check for invalid characters
        if re.search(r'[<>:"/\\|?*]', name):
            raise ValidationError("Project name contains invalid characters")
        
        return name.strip()
    
    @staticmethod
    def validate_description(description: Optional[str]) -> Optional[str]:
        """Validate project description"""
        if description is None:
            return None
        
        if len(description) > 1000:
            raise ValidationError("Description cannot exceed 1000 characters")
        
        return description.strip()
    
    @staticmethod
    def validate_youtube_url(url: str) -> str:
        """Validate YouTube URL"""
        youtube_patterns = [
            r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]+)',
            r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)'
        ]
        
        for pattern in youtube_patterns:
            if re.match(pattern, url):
                return url
        
        raise ValidationError("Invalid YouTube URL format")

class FileValidator:
    """Validators for file-related operations"""
    
    ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'}
    MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
    
    @staticmethod
    def validate_video_file(filename: str, file_size: int) -> None:
        """Validate video file"""
        # Check extension
        file_path = Path(filename)
        if file_path.suffix.lower() not in FileValidator.ALLOWED_VIDEO_EXTENSIONS:
            raise ValidationError(
                f"Invalid file type. Allowed: {', '.join(FileValidator.ALLOWED_VIDEO_EXTENSIONS)}"
            )
        
        # Check file size
        if file_size > FileValidator.MAX_FILE_SIZE:
            max_size_mb = FileValidator.MAX_FILE_SIZE / (1024 * 1024)
            raise ValidationError(f"File size exceeds {max_size_mb}MB limit")
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove path components
        filename = Path(filename).name
        
        # Replace unsafe characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            max_name_length = 255 - len(ext) - 1
            filename = name[:max_name_length] + '.' + ext if ext else name[:255]
        
        return filename

class AnalysisValidator:
    """Validators for AI analysis operations"""
    
    MAX_PROMPT_LENGTH = 2000
    MIN_PROMPT_LENGTH = 10
    
    @staticmethod
    def validate_analysis_prompt(prompt: str) -> str:
        """Validate analysis prompt"""
        if not prompt or not prompt.strip():
            raise ValidationError("Analysis prompt cannot be empty")
        
        prompt = prompt.strip()
        
        if len(prompt) < AnalysisValidator.MIN_PROMPT_LENGTH:
            raise ValidationError(f"Prompt must be at least {AnalysisValidator.MIN_PROMPT_LENGTH} characters")
        
        if len(prompt) > AnalysisValidator.MAX_PROMPT_LENGTH:
            raise ValidationError(f"Prompt cannot exceed {AnalysisValidator.MAX_PROMPT_LENGTH} characters")
        
        return prompt
    
    @staticmethod
    def validate_provider(provider: str) -> str:
        """Validate AI provider"""
        allowed_providers = {'openai', 'gemini', 'lmstudio', 'anthropic'}
        
        if provider not in allowed_providers:
            raise ValidationError(f"Invalid provider. Allowed: {', '.join(allowed_providers)}")
        
        return provider

class SecurityValidator:
    """Validators for security-related data"""
    
    @staticmethod
    def validate_api_key(provider: str, api_key: str) -> str:
        """Validate API key format"""
        if not api_key or not api_key.strip():
            raise ValidationError("API key cannot be empty")
        
        api_key = api_key.strip()
        
        # Provider-specific validation
        if provider == 'openai':
            if not api_key.startswith('sk-') or len(api_key) < 20:
                raise ValidationError("Invalid OpenAI API key format")
        elif provider == 'gemini':
            if len(api_key) < 10:
                raise ValidationError("Invalid Gemini API key format")
        
        return api_key
    
    @staticmethod
    def sanitize_user_input(text: str) -> str:
        """Basic sanitization for user input"""
        if not text:
            return ""
        
        # Remove control characters
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        
        # Limit length
        return text[:5000]  # General limit for user input

def validate_request_data(data: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
    """Generic validation function for request data"""
    validated_data = {}
    
    for field, rule in rules.items():
        value = data.get(field)
        
        # Required field check
        if rule.get('required', False) and value is None:
            raise ValidationError(f"Required field '{field}' is missing")
        
        # Skip validation if value is None and not required
        if value is None:
            validated_data[field] = None
            continue
        
        # Type validation
        expected_type = rule.get('type')
        if expected_type and not isinstance(value, expected_type):
            raise ValidationError(f"Field '{field}' must be of type {expected_type.__name__}")
        
        # Custom validator
        validator_func = rule.get('validator')
        if validator_func:
            try:
                validated_data[field] = validator_func(value)
            except ValidationError:
                raise
            except Exception as e:
                raise ValidationError(f"Validation failed for field '{field}': {str(e)}")
        else:
            validated_data[field] = value
    
    return validated_data 