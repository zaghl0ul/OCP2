from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import secrets
import hashlib
import os
from fastapi import HTTPException, status
import logging
from cryptography.fernet import Fernet
import json
import base64

logger = logging.getLogger(__name__)

class SecurityManager:
    """
    Handles authentication, authorization, and security operations
    """
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
        self.algorithm = "HS256"
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Rate limiting storage (in production, use Redis)
        self.rate_limit_storage: Dict[str, Dict[str, Any]] = {}
        
        # API key storage (in production, use database)
        self.api_keys: Dict[str, Dict[str, Any]] = {}
        
        # Get encryption key from environment or generate one
        encryption_key = os.environ.get('ENCRYPTION_KEY')
        if not encryption_key:
            # Generate a key and store it (in production, this should be persistent)
            self.key = Fernet.generate_key()
            logger.warning("Generated new encryption key. In production, set the ENCRYPTION_KEY environment variable.")
        else:
            # Use the provided key
            self.key = encryption_key.encode()
            
        self.cipher_suite = Fernet(self.key)
        
    def hash_password(self, password: str) -> str:
        """
        Hash a password using bcrypt
        """
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        """
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify and decode a JWT token
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.warning(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def generate_api_key(self, user_id: str, name: str = "Default") -> str:
        """
        Generate a new API key for a user
        """
        api_key = f"ocp_{secrets.token_urlsafe(32)}"
        
        self.api_keys[api_key] = {
            "user_id": user_id,
            "name": name,
            "created_at": datetime.utcnow(),
            "last_used": None,
            "is_active": True,
            "usage_count": 0
        }
        
        logger.info(f"Generated API key for user {user_id}")
        return api_key
    
    def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Verify an API key and return user info
        """
        if api_key not in self.api_keys:
            return None
        
        key_info = self.api_keys[api_key]
        if not key_info["is_active"]:
            return None
        
        # Update usage statistics
        key_info["last_used"] = datetime.utcnow()
        key_info["usage_count"] += 1
        
        return key_info
    
    def revoke_api_key(self, api_key: str) -> bool:
        """
        Revoke an API key
        """
        if api_key in self.api_keys:
            self.api_keys[api_key]["is_active"] = False
            logger.info(f"Revoked API key: {api_key[:10]}...")
            return True
        return False
    
    def check_rate_limit(self, identifier: str, limit: int = 100, window_minutes: int = 60) -> bool:
        """
        Check if a request is within rate limits
        """
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=window_minutes)
        
        if identifier not in self.rate_limit_storage:
            self.rate_limit_storage[identifier] = {
                "requests": [],
                "blocked_until": None
            }
        
        user_data = self.rate_limit_storage[identifier]
        
        # Check if user is currently blocked
        if user_data["blocked_until"] and now < user_data["blocked_until"]:
            return False
        
        # Clean old requests
        user_data["requests"] = [
            req_time for req_time in user_data["requests"]
            if req_time > window_start
        ]
        
        # Check rate limit
        if len(user_data["requests"]) >= limit:
            # Block user for the remaining window time
            user_data["blocked_until"] = now + timedelta(minutes=window_minutes)
            logger.warning(f"Rate limit exceeded for {identifier}")
            return False
        
        # Add current request
        user_data["requests"].append(now)
        return True
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize a filename to prevent directory traversal attacks
        """
        # Remove any path separators and dangerous characters
        import re
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        sanitized = sanitized.replace('..', '_')
        return sanitized[:255]  # Limit length
    
    def validate_file_type(self, filename: str, allowed_extensions: list) -> bool:
        """
        Validate file type based on extension
        """
        if not filename:
            return False
        
        extension = filename.lower().split('.')[-1]
        return extension in [ext.lower() for ext in allowed_extensions]
    
    def generate_secure_filename(self, original_filename: str) -> str:
        """
        Generate a secure filename with timestamp and hash
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(original_filename.encode()).hexdigest()[:8]
        
        # Extract extension
        if '.' in original_filename:
            name, ext = original_filename.rsplit('.', 1)
            return f"{timestamp}_{file_hash}.{ext}"
        else:
            return f"{timestamp}_{file_hash}"
    
    def validate_request_size(self, content_length: Optional[int], max_size_mb: int = 100) -> bool:
        """
        Validate request content size
        """
        if content_length is None:
            return True  # Let it through, will be caught later if too large
        
        max_size_bytes = max_size_mb * 1024 * 1024
        return content_length <= max_size_bytes
    
    def log_security_event(self, event_type: str, details: Dict[str, Any], severity: str = "INFO"):
        """
        Log security-related events
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "severity": severity,
            "details": details
        }
        
        if severity == "WARNING":
            logger.warning(f"Security Event: {event_type} - {details}")
        elif severity == "ERROR":
            logger.error(f"Security Event: {event_type} - {details}")
        else:
            logger.info(f"Security Event: {event_type} - {details}")
    
    def encrypt_api_key(self, api_key: str) -> str:
        """Simple encoding of an API key (not secure, just for demo)"""
        if not api_key:
            return ""
            
        try:
            # Simple base64 encoding (NOT secure for production)
            encoded = base64.b64encode(api_key.encode()).decode()
            return encoded
        except Exception as e:
            logger.error(f"Error encoding API key: {e}")
            # Return the key as-is if encoding fails
            return api_key
    
    def decrypt_api_key(self, encoded_key: str) -> str:
        """Simple decoding of an API key (not secure, just for demo)"""
        if not encoded_key:
            return ""
            
        try:
            # Check if it's already in plain text
            if not self._is_base64(encoded_key):
                return encoded_key
                
            # Simple base64 decoding (NOT secure for production)
            decoded = base64.b64decode(encoded_key.encode()).decode()
            return decoded
        except Exception as e:
            logger.error(f"Error decoding API key: {e}")
            return ""
    
    def _is_base64(self, s: str) -> bool:
        """Check if a string is base64 encoded"""
        try:
            return base64.b64encode(base64.b64decode(s.encode())).decode() == s
        except Exception:
            return False
    
    def store_api_key(self, provider: str, api_key: str, db_session, settings_repo) -> bool:
        """Store an API key securely in the database"""
        try:
            encoded_key = self.encrypt_api_key(api_key)
            settings_repo.create_or_update_setting(
                db_session, 
                "api_keys",
                provider,
                encoded_key
            )
            return True
        except Exception as e:
            logger.error(f"Error storing API key: {e}")
            return False
    
    def get_api_key(self, provider: str, db_session, settings_repo) -> Optional[str]:
        """Get a decrypted API key from the database"""
        try:
            setting = settings_repo.get_setting(db_session, "api_keys", provider)
            if not setting or not setting.value:
                return None
                
            return self.decrypt_api_key(setting.value)
        except Exception as e:
            logger.error(f"Error retrieving API key: {e}")
            return None
    
    def validate_token(self, token: str) -> bool:
        """Validate an authentication token (placeholder for future auth)"""
        # In a real implementation, this would validate JWT tokens or similar
        return True