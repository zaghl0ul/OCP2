import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
import json
from datetime import datetime, timedelta
import httpx
from sqlalchemy.orm import Session

# Provider-specific imports
try:
    import openai
except ImportError:
    openai = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    import requests
except ImportError:
    requests = None

logger = logging.getLogger(__name__)

class APIManager:
    """Manages connections to various AI API providers"""
    
    def __init__(self):
        """Initialize the API manager"""
        self.http_client = httpx.AsyncClient(timeout=60.0)
        
        # Supported providers
        self.providers = {
            "openai": {
                "name": "OpenAI",
                "base_url": "https://api.openai.com/v1",
                "models_endpoint": "/models",
                "models": []
            },
            "gemini": {
                "name": "Google Gemini",
                "base_url": "https://generativelanguage.googleapis.com",
                "models_endpoint": "/v1beta/models",
                "models": []
            },
            "anthropic": {
                "name": "Anthropic",
                "base_url": "https://api.anthropic.com",
                "models_endpoint": "/v1/models",
                "models": []
            }
        }
        
        # Connection cache
        self.connection_cache = {}
        self.cache_timeout = timedelta(minutes=5)
        
        # Rate limiting
        self.rate_limits = {
            'openai': {'requests_per_minute': 60, 'tokens_per_minute': 90000},
            'gemini': {'requests_per_minute': 60, 'tokens_per_minute': 32000},
            'lmstudio': {'requests_per_minute': 1000, 'tokens_per_minute': 100000}
        }
        
        self.usage_tracking = {}
    
    def get_providers(self) -> List[Dict[str, Any]]:
        """Get a list of all supported AI providers"""
        return [
            {
                "id": provider_id,
                "name": provider_info["name"],
                "url": provider_info["base_url"]
            }
            for provider_id, provider_info in self.providers.items()
        ]
    
    def get_provider_info(self, provider: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific provider"""
        return self.providers.get(provider)
    
    def get_provider_models(self, provider: str) -> List[str]:
        """Get available models for a provider (simplified version for health check)"""
        if provider not in self.providers:
            return []
        
        # Return default models for each provider
        if provider == "openai":
            return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
        elif provider == "gemini":
            return ["gemini-pro", "gemini-pro-vision"]
        elif provider == "anthropic":
            return ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]
        else:
            return []
    
    async def get_available_models(self, provider: str, api_key: str, db_session=None, security_manager=None, settings_repo=None) -> List[Dict[str, Any]]:
        """Get available models for a provider"""
        if provider not in self.providers:
            return []
        
        provider_info = self.providers[provider]
        
        try:
            if provider == "openai":
                return await self._get_openai_models(api_key)
            elif provider == "gemini":
                return await self._get_gemini_models(api_key)
            elif provider == "anthropic":
                return await self._get_anthropic_models(api_key)
            else:
                return []
        except Exception as e:
            logger.error(f"Error getting models for {provider}: {e}")
            return []
    
    async def _get_openai_models(self, api_key: str) -> List[Dict[str, Any]]:
        """Get OpenAI models"""
        # For simplicity, we'll return a static list of models
        return [
            {"id": "gpt-4", "name": "GPT-4", "description": "Most capable OpenAI model", "supports_vision": True},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "description": "Faster GPT-4 variant", "supports_vision": True},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "description": "Fast and efficient model", "supports_vision": True}
        ]
    
    async def _get_gemini_models(self, api_key: str) -> List[Dict[str, Any]]:
        """Get Google Gemini models"""
        # For simplicity, we'll return a static list of models
        return [
            {"id": "gemini-pro", "name": "Gemini Pro", "description": "Google's most capable text model", "supports_vision": False},
            {"id": "gemini-pro-vision", "name": "Gemini Pro Vision", "description": "Multimodal model with vision capabilities", "supports_vision": True}
        ]
    
    async def _get_anthropic_models(self, api_key: str) -> List[Dict[str, Any]]:
        """Get Anthropic models"""
        # For simplicity, we'll return a static list of models
        return [
            {"id": "claude-3-opus", "name": "Claude 3 Opus", "description": "Most capable Anthropic model", "supports_vision": True},
            {"id": "claude-3-sonnet", "name": "Claude 3 Sonnet", "description": "Balance of intelligence and speed", "supports_vision": True},
            {"id": "claude-3-haiku", "name": "Claude 3 Haiku", "description": "Fastest Anthropic model", "supports_vision": True}
        ]
    
    async def test_connection(self, provider: str, api_key: str) -> Dict[str, Any]:
        """Test the connection to an AI provider"""
        if provider not in self.providers:
            return {"success": False, "message": f"Unsupported provider: {provider}"}
        
        provider_info = self.providers[provider]
        
        try:
            if provider == "openai":
                return await self._test_openai(api_key)
            elif provider == "gemini":
                return await self._test_gemini(api_key)
            elif provider == "anthropic":
                return await self._test_anthropic(api_key)
            else:
                return {"success": False, "message": f"No test implementation for {provider}"}
        except Exception as e:
            logger.error(f"Error testing {provider} connection: {e}")
            return {"success": False, "message": str(e)}
    
    async def _test_openai(self, api_key: str) -> Dict[str, Any]:
        """Test OpenAI API connection"""
        url = f"{self.providers['openai']['base_url']}/models"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        async with self.http_client as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                return {"success": True, "message": "OpenAI API connection successful"}
            else:
                error_msg = response.json().get("error", {}).get("message", "Unknown error")
                return {"success": False, "message": f"OpenAI API error: {error_msg}"}
    
    async def _test_gemini(self, api_key: str) -> Dict[str, Any]:
        """Test Google Gemini API connection"""
        url = f"{self.providers['gemini']['base_url']}/v1beta/models?key={api_key}"
        
        async with self.http_client as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                return {"success": True, "message": "Google Gemini API connection successful"}
            else:
                error_msg = response.json().get("error", {}).get("message", "Unknown error")
                return {"success": False, "message": f"Google Gemini API error: {error_msg}"}
    
    async def _test_anthropic(self, api_key: str) -> Dict[str, Any]:
        """Test Anthropic API connection"""
        url = f"{self.providers['anthropic']['base_url']}/v1/models"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
        
        async with self.http_client as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                return {"success": True, "message": "Anthropic API connection successful"}
            else:
                error_msg = response.json().get("error", {}).get("message", "Unknown error")
                return {"success": False, "message": f"Anthropic API error: {error_msg}"}
    
    async def close(self):
        """Close the HTTP client"""
        await self.http_client.aclose()
    
    def validate_api_key(self, provider: str, api_key: str) -> Dict[str, Any]:
        """Validate API key format"""
        if not api_key or not api_key.strip():
            return {
                'valid': False,
                'message': 'API key cannot be empty'
            }
        
        if provider == 'openai':
            if not api_key.startswith('sk-'):
                return {
                    'valid': False,
                    'message': 'OpenAI API keys should start with "sk-"'
                }
            if len(api_key) < 20:
                return {
                    'valid': False,
                    'message': 'OpenAI API key appears to be too short'
                }
        
        elif provider == 'gemini':
            if len(api_key) < 20:
                return {
                    'valid': False,
                    'message': 'Gemini API key appears to be too short'
                }
        
        elif provider == 'lmstudio':
            # LM Studio doesn't require API keys
            return {
                'valid': True,
                'message': 'LM Studio does not require an API key'
            }
        
        return {
            'valid': True,
            'message': 'API key format appears valid'
        }
    
    def estimate_cost(self, provider: str, model: str, input_tokens: int, output_tokens: int) -> Dict[str, Any]:
        """Estimate cost for API usage"""
        try:
            provider_info = self.providers.get(provider, {})
            models = provider_info.get('models', [])
            
            model_info = next((m for m in models if m['id'] == model), None)
            if not model_info:
                return {
                    'estimated_cost': 0.0,
                    'currency': 'USD',
                    'breakdown': 'Model not found'
                }
            
            cost_per_1k = model_info.get('cost_per_1k_tokens', 0.0)
            total_tokens = input_tokens + output_tokens
            estimated_cost = (total_tokens / 1000) * cost_per_1k
            
            return {
                'estimated_cost': round(estimated_cost, 6),
                'currency': 'USD',
                'breakdown': {
                    'input_tokens': input_tokens,
                    'output_tokens': output_tokens,
                    'total_tokens': total_tokens,
                    'cost_per_1k_tokens': cost_per_1k
                }
            }
            
        except Exception as e:
            logger.error(f"Error estimating cost: {e}")
            return {
                'estimated_cost': 0.0,
                'currency': 'USD',
                'breakdown': f'Error: {str(e)}'
            }
    
    def track_usage(self, provider: str, model: str, input_tokens: int, output_tokens: int):
        """Track API usage for rate limiting and analytics"""
        try:
            current_time = datetime.now()
            
            if provider not in self.usage_tracking:
                self.usage_tracking[provider] = {
                    'requests': [],
                    'tokens': [],
                    'total_requests': 0,
                    'total_tokens': 0
                }
            
            # Add current usage
            self.usage_tracking[provider]['requests'].append(current_time)
            self.usage_tracking[provider]['tokens'].append({
                'timestamp': current_time,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'total_tokens': input_tokens + output_tokens
            })
            
            # Update totals
            self.usage_tracking[provider]['total_requests'] += 1
            self.usage_tracking[provider]['total_tokens'] += input_tokens + output_tokens
            
            # Clean old entries (keep only last hour)
            cutoff_time = current_time - timedelta(hours=1)
            self.usage_tracking[provider]['requests'] = [
                req_time for req_time in self.usage_tracking[provider]['requests']
                if req_time > cutoff_time
            ]
            self.usage_tracking[provider]['tokens'] = [
                token_data for token_data in self.usage_tracking[provider]['tokens']
                if token_data['timestamp'] > cutoff_time
            ]
            
        except Exception as e:
            logger.error(f"Error tracking usage: {e}")
    
    def check_rate_limits(self, provider: str) -> Dict[str, Any]:
        """Check if rate limits are being approached"""
        try:
            if provider not in self.usage_tracking:
                return {
                    'within_limits': True,
                    'requests_used': 0,
                    'tokens_used': 0,
                    'message': 'No usage tracked yet'
                }
            
            current_time = datetime.now()
            minute_ago = current_time - timedelta(minutes=1)
            
            # Count requests in last minute
            recent_requests = len([
                req_time for req_time in self.usage_tracking[provider]['requests']
                if req_time > minute_ago
            ])
            
            # Count tokens in last minute
            recent_tokens = sum([
                token_data['total_tokens']
                for token_data in self.usage_tracking[provider]['tokens']
                if token_data['timestamp'] > minute_ago
            ])
            
            # Get limits
            limits = self.rate_limits.get(provider, {
                'requests_per_minute': 1000,
                'tokens_per_minute': 100000
            })
            
            requests_limit = limits['requests_per_minute']
            tokens_limit = limits['tokens_per_minute']
            
            within_limits = (recent_requests < requests_limit * 0.9 and 
                           recent_tokens < tokens_limit * 0.9)
            
            return {
                'within_limits': within_limits,
                'requests_used': recent_requests,
                'requests_limit': requests_limit,
                'tokens_used': recent_tokens,
                'tokens_limit': tokens_limit,
                'requests_percentage': (recent_requests / requests_limit) * 100,
                'tokens_percentage': (recent_tokens / tokens_limit) * 100
            }
            
        except Exception as e:
            logger.error(f"Error checking rate limits: {e}")
            return {
                'within_limits': True,
                'error': str(e)
            }
    
    def get_usage_stats(self, provider: str) -> Dict[str, Any]:
        """Get usage statistics for a provider"""
        try:
            if provider not in self.usage_tracking:
                return {
                    'total_requests': 0,
                    'total_tokens': 0,
                    'recent_activity': []
                }
            
            tracking_data = self.usage_tracking[provider]
            
            # Get recent activity (last 24 hours)
            current_time = datetime.now()
            day_ago = current_time - timedelta(days=1)
            
            recent_activity = [
                {
                    'timestamp': token_data['timestamp'].isoformat(),
                    'input_tokens': token_data['input_tokens'],
                    'output_tokens': token_data['output_tokens'],
                    'total_tokens': token_data['total_tokens']
                }
                for token_data in tracking_data['tokens']
                if token_data['timestamp'] > day_ago
            ]
            
            return {
                'total_requests': tracking_data['total_requests'],
                'total_tokens': tracking_data['total_tokens'],
                'recent_requests_24h': len(recent_activity),
                'recent_tokens_24h': sum(activity['total_tokens'] for activity in recent_activity),
                'recent_activity': recent_activity[-10:]  # Last 10 activities
            }
            
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            return {
                'error': str(e)
            }
    
    def clear_cache(self):
        """Clear connection cache"""
        self.connection_cache.clear()
        logger.info("API connection cache cleared")
    
    def reset_usage_tracking(self, provider: Optional[str] = None):
        """Reset usage tracking for a provider or all providers"""
        if provider:
            if provider in self.usage_tracking:
                del self.usage_tracking[provider]
                logger.info(f"Usage tracking reset for {provider}")
        else:
            self.usage_tracking.clear()
            logger.info("Usage tracking reset for all providers")