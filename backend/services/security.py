import hashlib
import secrets
import base64
import logging
from typing import Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import json

logger = logging.getLogger(__name__)

class SecurityService:
    """Service for handling encryption, authentication, and security operations"""
    
    def __init__(self):
        self.sessions = {}  # In-memory session storage
        self.session_timeout = timedelta(hours=24)
        self.failed_attempts = {}  # Track failed authentication attempts
        self.max_failed_attempts = 5
        self.lockout_duration = timedelta(minutes=15)
        
        # Generate a master key for this session (in production, this should be persistent)
        self.master_key = self._generate_master_key()
    
    def _generate_master_key(self) -> bytes:
        """Generate a master encryption key"""
        return Fernet.generate_key()
    
    def derive_key_from_password(self, password: str, salt: Optional[bytes] = None) -> Tuple[bytes, bytes]:
        """Derive an encryption key from a password"""
        if salt is None:
            salt = secrets.token_bytes(32)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key, salt
    
    def encrypt_data(self, data: str, key: Optional[bytes] = None) -> Dict[str, str]:
        """Encrypt sensitive data"""
        try:
            if key is None:
                key = self.master_key
            
            fernet = Fernet(key)
            encrypted_data = fernet.encrypt(data.encode())
            
            return {
                'success': True,
                'encrypted_data': base64.urlsafe_b64encode(encrypted_data).decode(),
                'key_used': 'master' if key == self.master_key else 'custom'
            }
            
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def decrypt_data(self, encrypted_data: str, key: Optional[bytes] = None) -> Dict[str, Any]:
        """Decrypt sensitive data"""
        try:
            if key is None:
                key = self.master_key
            
            fernet = Fernet(key)
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = fernet.decrypt(encrypted_bytes).decode()
            
            return {
                'success': True,
                'decrypted_data': decrypted_data
            }
            
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def hash_password(self, password: str) -> Dict[str, str]:
        """Hash a password with salt"""
        try:
            # Generate a random salt
            salt = secrets.token_hex(32)
            
            # Create password hash
            password_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000  # iterations
            )
            
            return {
                'success': True,
                'hash': password_hash.hex(),
                'salt': salt
            }
            
        except Exception as e:
            logger.error(f"Password hashing error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_password(self, password: str, stored_hash: str, salt: str) -> bool:
        """Verify a password against stored hash"""
        try:
            # Recreate the hash with the provided password and salt
            password_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000
            )
            
            return password_hash.hex() == stored_hash
            
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def create_session(self, user_id: str, user_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Create a new user session"""
        try:
            session_id = secrets.token_urlsafe(32)
            session_data = {
                'user_id': user_id,
                'created_at': datetime.now(),
                'last_activity': datetime.now(),
                'user_data': user_data or {},
                'is_active': True
            }
            
            self.sessions[session_id] = session_data
            
            return {
                'success': True,
                'session_id': session_id,
                'expires_at': (datetime.now() + self.session_timeout).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Session creation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_session(self, session_id: str) -> Dict[str, Any]:
        """Validate and refresh a session"""
        try:
            if session_id not in self.sessions:
                return {
                    'valid': False,
                    'reason': 'Session not found'
                }
            
            session = self.sessions[session_id]
            
            # Check if session is active
            if not session.get('is_active', False):
                return {
                    'valid': False,
                    'reason': 'Session is inactive'
                }
            
            # Check if session has expired
            last_activity = session['last_activity']
            if datetime.now() - last_activity > self.session_timeout:
                session['is_active'] = False
                return {
                    'valid': False,
                    'reason': 'Session expired'
                }
            
            # Update last activity
            session['last_activity'] = datetime.now()
            
            return {
                'valid': True,
                'user_id': session['user_id'],
                'user_data': session.get('user_data', {}),
                'session_age': (datetime.now() - session['created_at']).total_seconds()
            }
            
        except Exception as e:
            logger.error(f"Session validation error: {e}")
            return {
                'valid': False,
                'reason': f'Validation error: {str(e)}'
            }
    
    def invalidate_session(self, session_id: str) -> Dict[str, Any]:
        """Invalidate a session"""
        try:
            if session_id in self.sessions:
                self.sessions[session_id]['is_active'] = False
                return {
                    'success': True,
                    'message': 'Session invalidated'
                }
            else:
                return {
                    'success': False,
                    'message': 'Session not found'
                }
                
        except Exception as e:
            logger.error(f"Session invalidation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def cleanup_expired_sessions(self) -> Dict[str, Any]:
        """Clean up expired sessions"""
        try:
            current_time = datetime.now()
            expired_sessions = []
            
            for session_id, session_data in list(self.sessions.items()):
                last_activity = session_data['last_activity']
                if current_time - last_activity > self.session_timeout:
                    expired_sessions.append(session_id)
                    del self.sessions[session_id]
            
            return {
                'success': True,
                'cleaned_sessions': len(expired_sessions),
                'active_sessions': len(self.sessions)
            }
            
        except Exception as e:
            logger.error(f"Session cleanup error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def track_failed_attempt(self, identifier: str) -> Dict[str, Any]:
        """Track failed authentication attempts"""
        try:
            current_time = datetime.now()
            
            if identifier not in self.failed_attempts:
                self.failed_attempts[identifier] = {
                    'count': 0,
                    'first_attempt': current_time,
                    'last_attempt': current_time,
                    'locked_until': None
                }
            
            attempt_data = self.failed_attempts[identifier]
            attempt_data['count'] += 1
            attempt_data['last_attempt'] = current_time
            
            # Check if should be locked out
            if attempt_data['count'] >= self.max_failed_attempts:
                attempt_data['locked_until'] = current_time + self.lockout_duration
                return {
                    'locked': True,
                    'attempts': attempt_data['count'],
                    'locked_until': attempt_data['locked_until'].isoformat(),
                    'message': f'Account locked due to {self.max_failed_attempts} failed attempts'
                }
            
            return {
                'locked': False,
                'attempts': attempt_data['count'],
                'remaining_attempts': self.max_failed_attempts - attempt_data['count']
            }
            
        except Exception as e:
            logger.error(f"Failed attempt tracking error: {e}")
            return {
                'locked': False,
                'error': str(e)
            }
    
    def is_locked_out(self, identifier: str) -> Dict[str, Any]:
        """Check if an identifier is locked out"""
        try:
            if identifier not in self.failed_attempts:
                return {
                    'locked': False,
                    'attempts': 0
                }
            
            attempt_data = self.failed_attempts[identifier]
            locked_until = attempt_data.get('locked_until')
            
            if locked_until and datetime.now() < locked_until:
                return {
                    'locked': True,
                    'locked_until': locked_until.isoformat(),
                    'attempts': attempt_data['count'],
                    'time_remaining': (locked_until - datetime.now()).total_seconds()
                }
            
            # If lockout period has passed, reset attempts
            if locked_until and datetime.now() >= locked_until:
                del self.failed_attempts[identifier]
            
            return {
                'locked': False,
                'attempts': attempt_data.get('count', 0)
            }
            
        except Exception as e:
            logger.error(f"Lockout check error: {e}")
            return {
                'locked': False,
                'error': str(e)
            }
    
    def clear_failed_attempts(self, identifier: str) -> Dict[str, Any]:
        """Clear failed attempts for an identifier"""
        try:
            if identifier in self.failed_attempts:
                del self.failed_attempts[identifier]
                return {
                    'success': True,
                    'message': 'Failed attempts cleared'
                }
            else:
                return {
                    'success': True,
                    'message': 'No failed attempts to clear'
                }
                
        except Exception as e:
            logger.error(f"Clear failed attempts error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_api_token(self, user_id: str, permissions: Optional[List[str]] = None) -> Dict[str, Any]:
        """Generate an API token for a user"""
        try:
            token_data = {
                'user_id': user_id,
                'permissions': permissions or [],
                'created_at': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(days=30)).isoformat()
            }
            
            # Encrypt the token data
            token_json = json.dumps(token_data)
            encrypted_result = self.encrypt_data(token_json)
            
            if encrypted_result['success']:
                return {
                    'success': True,
                    'token': encrypted_result['encrypted_data'],
                    'expires_at': token_data['expires_at']
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to encrypt token'
                }
                
        except Exception as e:
            logger.error(f"API token generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_api_token(self, token: str) -> Dict[str, Any]:
        """Validate an API token"""
        try:
            # Decrypt the token
            decrypted_result = self.decrypt_data(token)
            
            if not decrypted_result['success']:
                return {
                    'valid': False,
                    'reason': 'Invalid token format'
                }
            
            # Parse token data
            token_data = json.loads(decrypted_result['decrypted_data'])
            
            # Check expiration
            expires_at = datetime.fromisoformat(token_data['expires_at'])
            if datetime.now() > expires_at:
                return {
                    'valid': False,
                    'reason': 'Token expired'
                }
            
            return {
                'valid': True,
                'user_id': token_data['user_id'],
                'permissions': token_data.get('permissions', []),
                'created_at': token_data['created_at']
            }
            
        except Exception as e:
            logger.error(f"API token validation error: {e}")
            return {
                'valid': False,
                'reason': f'Validation error: {str(e)}'
            }
    
    def sanitize_input(self, input_data: str, max_length: int = 1000) -> str:
        """Sanitize user input to prevent injection attacks"""
        try:
            # Remove null bytes
            sanitized = input_data.replace('\x00', '')
            
            # Limit length
            if len(sanitized) > max_length:
                sanitized = sanitized[:max_length]
            
            # Remove potentially dangerous characters
            dangerous_chars = ['<', '>', '"', "'", '&', ';', '|', '`']
            for char in dangerous_chars:
                sanitized = sanitized.replace(char, '')
            
            return sanitized.strip()
            
        except Exception as e:
            logger.error(f"Input sanitization error: {e}")
            return ''  # Return empty string on error
    
    def validate_file_path(self, file_path: str, allowed_extensions: Optional[List[str]] = None) -> Dict[str, Any]:
        """Validate file paths to prevent directory traversal"""
        try:
            import os
            
            # Normalize the path
            normalized_path = os.path.normpath(file_path)
            
            # Check for directory traversal attempts
            if '..' in normalized_path or normalized_path.startswith('/'):
                return {
                    'valid': False,
                    'reason': 'Directory traversal detected'
                }
            
            # Check file extension if specified
            if allowed_extensions:
                file_ext = os.path.splitext(normalized_path)[1].lower()
                if file_ext not in [ext.lower() for ext in allowed_extensions]:
                    return {
                        'valid': False,
                        'reason': f'File extension {file_ext} not allowed'
                    }
            
            return {
                'valid': True,
                'normalized_path': normalized_path
            }
            
        except Exception as e:
            logger.error(f"File path validation error: {e}")
            return {
                'valid': False,
                'reason': f'Validation error: {str(e)}'
            }
    
    def get_security_headers(self) -> Dict[str, str]:
        """Get recommended security headers"""
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    
    def audit_log(self, action: str, user_id: Optional[str] = None, 
                  details: Optional[Dict] = None, ip_address: Optional[str] = None):
        """Log security-relevant actions"""
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'action': action,
                'user_id': user_id,
                'ip_address': ip_address,
                'details': details or {}
            }
            
            # In production, this should write to a secure audit log
            logger.info(f"AUDIT: {json.dumps(log_entry)}")
            
        except Exception as e:
            logger.error(f"Audit logging error: {e}")
    
    def get_security_stats(self) -> Dict[str, Any]:
        """Get security statistics"""
        try:
            current_time = datetime.now()
            
            # Count active sessions
            active_sessions = sum(1 for session in self.sessions.values() 
                                if session.get('is_active', False))
            
            # Count locked accounts
            locked_accounts = sum(1 for attempt_data in self.failed_attempts.values()
                                if attempt_data.get('locked_until') and 
                                current_time < attempt_data['locked_until'])
            
            # Count recent failed attempts (last hour)
            hour_ago = current_time - timedelta(hours=1)
            recent_failed_attempts = sum(1 for attempt_data in self.failed_attempts.values()
                                       if attempt_data.get('last_attempt') and 
                                       attempt_data['last_attempt'] > hour_ago)
            
            return {
                'active_sessions': active_sessions,
                'total_sessions': len(self.sessions),
                'locked_accounts': locked_accounts,
                'total_tracked_attempts': len(self.failed_attempts),
                'recent_failed_attempts': recent_failed_attempts,
                'session_timeout_hours': self.session_timeout.total_seconds() / 3600,
                'max_failed_attempts': self.max_failed_attempts,
                'lockout_duration_minutes': self.lockout_duration.total_seconds() / 60
            }
            
        except Exception as e:
            logger.error(f"Security stats error: {e}")
            return {
                'error': str(e)
            }