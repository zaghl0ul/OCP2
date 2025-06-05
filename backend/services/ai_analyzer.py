import asyncio
import logging
import json
import base64
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import tempfile
import os
import time
import random

# AI provider imports
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

from models.project import Clip
from services.video_processor import VideoProcessor

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """Service for analyzing videos using various AI providers"""
    
    def __init__(self):
        self.video_processor = VideoProcessor()
        self.supported_providers = ['openai', 'gemini', 'lmstudio']
        
        # Analysis templates
        self.analysis_templates = {
            'humor': {
                'system_prompt': "You are an expert at identifying funny and humorous moments in videos. Analyze the content and identify clips that would make people laugh.",
                'scoring_criteria': "Rate based on comedic timing, unexpected moments, reactions, and general humor appeal."
            },
            'engagement': {
                'system_prompt': "You are an expert at identifying engaging and attention-grabbing moments in videos. Find clips that would hook viewers and keep them watching.",
                'scoring_criteria': "Rate based on visual interest, emotional impact, information density, and viewer retention potential."
            },
            'educational': {
                'system_prompt': "You are an expert at identifying educational and informative moments in videos. Find clips that teach or explain concepts clearly.",
                'scoring_criteria': "Rate based on clarity of explanation, educational value, practical applicability, and learning potential."
            },
            'emotional': {
                'system_prompt': "You are an expert at identifying emotionally impactful moments in videos. Find clips that evoke strong emotional responses.",
                'scoring_criteria': "Rate based on emotional intensity, relatability, storytelling impact, and viewer connection."
            },
            'viral': {
                'system_prompt': "You are an expert at identifying viral-worthy moments in videos. Find clips with high shareability and social media potential.",
                'scoring_criteria': "Rate based on shareability, uniqueness, trending potential, and social media appeal."
            }
        }
        
        self.providers = {
            "openai": self._analyze_with_openai,
            "gemini": self._analyze_with_gemini,
            "lmstudio": self._analyze_with_lmstudio,
            "anthropic": self._analyze_with_anthropic
        }
    
    async def analyze_video(self, video_path: str, prompt: str, provider: str, api_key: str, 
                           model_settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Analyze a video using the specified AI provider"""
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        logger.info(f"Analyzing video with {provider}: {video_path}")
        
        if provider not in self.providers:
            logger.warning(f"Unknown provider: {provider}, falling back to mock analysis")
            return await self._mock_analysis(video_path, prompt)
        
        try:
            # Call the appropriate provider's analysis method
            analysis_func = self.providers[provider]
            return await analysis_func(video_path, prompt, api_key, model_settings)
        except Exception as e:
            logger.error(f"Error analyzing video with {provider}: {e}")
            # Fall back to mock analysis
            return await self._mock_analysis(video_path, prompt)
    
    async def _analyze_with_openai(self, video_path: str, prompt: str, api_key: str,
                                model_settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Analyze video using OpenAI"""
        # This is just a mock implementation
        # In a real implementation, you would:
        # 1. Extract frames from the video
        # 2. Use OpenAI's API to analyze the frames and/or video
        # 3. Process the results
        
        logger.info("Mock OpenAI analysis running")
        await asyncio.sleep(2)  # Simulate processing time
        
        return await self._mock_analysis(video_path, prompt)
    
    async def _analyze_with_gemini(self, video_path: str, prompt: str, api_key: str,
                                model_settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Analyze video using Google Gemini"""
        # Mock implementation
        logger.info("Mock Gemini analysis running")
        await asyncio.sleep(2)  # Simulate processing time
        
        return await self._mock_analysis(video_path, prompt)
    
    async def _analyze_with_lmstudio(self, video_path: str, prompt: str, api_key: str,
                                   model_settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Analyze video segments using LM Studio local API"""
        if not requests:
            raise ImportError("Requests library not installed")
        
        try:
            # LM Studio typically runs on localhost:1234
            base_url = model_settings.get('lmstudio_url', 'http://localhost:1234')
            
            # Get analysis template
            template = self.analysis_templates.get(prompt.lower(), self.analysis_templates['engagement'])
            
            # Create analysis prompt
            analysis_prompt = self._create_analysis_prompt(prompt, template)
            
            # Prepare request
            payload = {
                "model": model_settings.get('model', 'local-model'),
                "messages": [
                    {"role": "system", "content": template['system_prompt']},
                    {"role": "user", "content": analysis_prompt}
                ],
                "temperature": model_settings.get('temperature', 0.7),
                "max_tokens": model_settings.get('max_tokens', 2000)
            }
            
            # Make request
            async with asyncio.timeout(120):  # 2 minute timeout
                response = requests.post(
                    f"{base_url}/v1/chat/completions",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
            
            if response.status_code != 200:
                raise Exception(f"LM Studio API error: {response.status_code} - {response.text}")
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parse response
            clips = self._parse_ai_response(content)
            return clips
            
        except Exception as e:
            logger.error(f"Error with LM Studio analysis: {e}")
            raise
    
    async def _analyze_with_anthropic(self, video_path: str, prompt: str, api_key: str,
                                   model_settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Analyze video using Anthropic"""
        # Mock implementation
        logger.info("Mock Anthropic analysis running")
        await asyncio.sleep(2)  # Simulate processing time
        
        return await self._mock_analysis(video_path, prompt)
    
    def _create_analysis_prompt(self, user_prompt: str, template: Dict) -> str:
        """Create structured analysis prompt for AI"""
        prompt = f"""
User Request: {user_prompt}

Scoring Criteria: {template['scoring_criteria']}

Video Segments to Analyze:
"""
        
        for segment in self._extract_analysis_segments(video_path):
            prompt += f"\nSegment {segment['index'] + 1}: {segment['start']:.1f}s - {segment['end']:.1f}s ({segment['duration']:.1f}s duration)"
        
        prompt += """

Please analyze these video segments and identify the best clips that match the user's request. For each recommended clip, provide:

1. Segment number(s) it spans
2. Exact start and end times (in seconds)
3. A catchy title (max 50 characters)
4. A score from 0-100 based on the criteria
5. A brief explanation (1-2 sentences) of why this clip is valuable

Format your response as JSON with this structure:
{
  "clips": [
    {
      "title": "Clip title",
      "start_time": 0.0,
      "end_time": 15.0,
      "score": 85,
      "explanation": "Brief explanation of why this clip is valuable."
    }
  ]
}

Provide 3-8 clips, focusing on the highest quality moments that best match the user's request.
"""
        
        return prompt
    
    def _parse_ai_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse AI response and create Clip objects"""
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")
            
            json_text = response_text[json_start:json_end]
            data = json.loads(json_text)
            
            clips = []
            for i, clip_data in enumerate(data.get('clips', [])):
                try:
                    clip = {
                        "id": f"clip_{i}_{int(clip_data['start_time'])}_{int(clip_data['end_time'])}",
                        "title": clip_data.get('title', f"Clip {i+1}"),
                        "start_time": float(clip_data.get('start_time', 0)),
                        "end_time": float(clip_data.get('end_time', 30)),
                        "score": int(clip_data.get('score', 50)),
                        "explanation": clip_data.get('explanation', 'AI-generated clip')
                    }
                    
                    # Validate clip timing
                    if clip["end_time"] > clip["start_time"] and clip["score"] >= 0 and clip["score"] <= 100:
                        clips.append(clip)
                    
                except Exception as e:
                    logger.warning(f"Error parsing clip {i}: {e}")
                    continue
            
            return clips
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            # Fallback: create default clips
            return self._create_fallback_clips()
    
    def _create_fallback_clips(self) -> List[Dict[str, Any]]:
        """Create fallback clips when AI parsing fails"""
        clips = []
        
        # Create clips from first few segments
        for i, segment in enumerate(self._extract_analysis_segments()[:5]):
            clip = {
                "id": f"fallback_clip_{i}",
                "title": f"Interesting Moment {i+1}",
                "start_time": segment['start'],
                "end_time": min(segment['start'] + 15, segment['end']),  # 15 second clips
                "score": 70 + (i * 5),  # Decreasing scores
                "explanation": "AI analysis was unable to complete. This is a suggested clip based on video structure."
            }
            clips.append(clip)
        
        return clips
    
    async def _mock_analysis(self, video_path: str, prompt: str) -> List[Dict[str, Any]]:
        """Generate mock analysis results for demo purposes"""
        # Mock data for clips
        clip_types = {
            "funny": [
                ("Hilarious reaction", "Subject displays an unexpected and humorous reaction", 85),
                ("Comedy gold moment", "Classic comedic timing and delivery", 92),
                ("Unexpected humor", "Surprising comedic twist that engages viewers", 78)
            ],
            "engaging": [
                ("Hook moment", "Strong opening that captures attention immediately", 88),
                ("Peak engagement", "Highest point of audience interest and engagement", 94),
                ("Attention grabber", "Visually striking or surprising content", 82)
            ],
            "educational": [
                ("Key insight", "Important information delivered clearly", 90),
                ("Learning moment", "Clear explanation of a complex concept", 87),
                ("Important concept", "Foundational idea explained well", 85)
            ],
            "emotional": [
                ("Touching moment", "Genuine emotional connection established", 89),
                ("Emotional peak", "Height of emotional impact in the content", 93),
                ("Heartfelt scene", "Authentic emotional display that resonates", 86)
            ]
        }
        
        # Determine clip type based on prompt
        clip_type = "engaging"  # default
        for key in clip_types.keys():
            if key.lower() in prompt.lower():
                clip_type = key
                break
        
        selected_clips = clip_types[clip_type]
        results = []
        
        # Create 3-5 clips with slight variations
        num_clips = random.randint(3, 5)
        video_length = 300  # mock 5 minute video
        
        for i in range(num_clips):
            clip_template = random.choice(selected_clips)
            
            # Calculate clip timestamps (ensure they don't overlap)
            segment_size = video_length / num_clips
            start_time = i * segment_size + random.uniform(0, segment_size * 0.3)
            duration = random.uniform(8, 15)  # 8-15 seconds
            end_time = min(start_time + duration, (i + 1) * segment_size)
            
            # Add some variation to the score
            score_variation = random.uniform(-5, 5)
            score = min(100, max(0, clip_template[2] + score_variation))
            
            # Create clip data
            clip = {
                "id": f"clip_{int(time.time())}_{i}",
                "title": clip_template[0],
                "description": clip_template[1],
                "start_time": start_time,
                "end_time": end_time,
                "score": score,
                "explanation": f"This clip shows {clip_template[0].lower()} based on the analysis criteria: {prompt}"
            }
            
            results.append(clip)
        
        # Sort by start time
        results.sort(key=lambda x: x["start_time"])
        
        logger.info(f"Generated {len(results)} mock clips from analysis")
        return results
    
    async def _extract_analysis_segments(self, file_path: str, segment_length: int = 30) -> List[Dict]:
        """Extract video segments for analysis"""
        try:
            # Get video metadata
            metadata = await self.video_processor.extract_metadata(file_path)
            duration = metadata.get('duration', 0)
            
            if duration == 0:
                raise ValueError("Could not determine video duration")
            
            # Create overlapping segments for analysis
            segments = []
            current_time = 0
            overlap = segment_length * 0.2  # 20% overlap
            
            while current_time < duration:
                end_time = min(current_time + segment_length, duration)
                
                segments.append({
                    'start': current_time,
                    'end': end_time,
                    'duration': end_time - current_time,
                    'index': len(segments)
                })
                
                current_time += segment_length - overlap
                
                # Avoid very short segments at the end
                if duration - current_time < segment_length * 0.3:
                    break
            
            logger.info(f"Created {len(segments)} segments for analysis")
            return segments
            
        except Exception as e:
            logger.error(f"Error extracting segments: {e}")
            raise
    
    def _determine_analysis_type(self, prompt: str) -> str:
        """Determine analysis type from user prompt"""
        prompt_lower = prompt.lower()
        
        # Check for keywords in prompt
        if any(word in prompt_lower for word in ['funny', 'humor', 'laugh', 'comedy', 'hilarious']):
            return 'humor'
        elif any(word in prompt_lower for word in ['viral', 'share', 'trending', 'social']):
            return 'viral'
        elif any(word in prompt_lower for word in ['teach', 'learn', 'explain', 'educational', 'tutorial']):
            return 'educational'
        elif any(word in prompt_lower for word in ['emotional', 'touching', 'sad', 'inspiring', 'heartfelt']):
            return 'emotional'
        else:
            return 'engagement'  # Default
    
    async def test_provider_connection(self, provider: str, api_key: str, settings: Dict) -> Dict[str, Any]:
        """Test connection to AI provider"""
        try:
            if provider == 'openai':
                return await self._test_openai_connection(api_key, settings)
            elif provider == 'gemini':
                return await self._test_gemini_connection(api_key, settings)
            elif provider == 'lmstudio':
                return await self._test_lmstudio_connection(api_key, settings)
            else:
                return {"success": False, "message": f"Unsupported provider: {provider}"}
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    async def _test_openai_connection(self, api_key: str, settings: Dict) -> Dict[str, Any]:
        """Test OpenAI connection"""
        if not openai:
            return {"success": False, "message": "OpenAI library not installed"}
        
        try:
            client = openai.AsyncOpenAI(api_key=api_key)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return {"success": True, "message": "OpenAI connection successful"}
        except Exception as e:
            return {"success": False, "message": f"OpenAI connection failed: {str(e)}"}
    
    async def _test_gemini_connection(self, api_key: str, settings: Dict) -> Dict[str, Any]:
        """Test Gemini connection"""
        if not genai:
            return {"success": False, "message": "Google Generative AI library not installed"}
        
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = await model.generate_content_async("Hello")
            return {"success": True, "message": "Gemini connection successful"}
        except Exception as e:
            return {"success": False, "message": f"Gemini connection failed: {str(e)}"}
    
    async def _test_lmstudio_connection(self, api_key: str, settings: Dict) -> Dict[str, Any]:
        """Test LM Studio connection"""
        if not requests:
            return {"success": False, "message": "Requests library not installed"}
        
        try:
            base_url = settings.get('lmstudio_url', 'http://localhost:1234')
            response = requests.get(f"{base_url}/v1/models", timeout=10)
            
            if response.status_code == 200:
                return {"success": True, "message": "LM Studio connection successful"}
            else:
                return {"success": False, "message": f"LM Studio returned status {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": f"LM Studio connection failed: {str(e)}"}
    
    async def get_available_models(self, provider: str, api_key: str) -> List[Dict[str, Any]]:
        """Get available models for a provider"""
        try:
            if provider == 'openai':
                return await self._get_openai_models(api_key)
            elif provider == 'gemini':
                return self._get_gemini_models()
            elif provider == 'lmstudio':
                return await self._get_lmstudio_models(api_key)
            else:
                return []
                
        except Exception as e:
            logger.error(f"Error getting models for {provider}: {e}")
            return []
    
    async def _get_openai_models(self, api_key: str) -> List[Dict[str, Any]]:
        """Get OpenAI models"""
        # Return common OpenAI models (API call would be expensive for this demo)
        return [
            {"id": "gpt-4", "name": "GPT-4", "description": "Most capable model"},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "description": "Faster GPT-4 variant"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "description": "Fast and efficient"}
        ]
    
    def _get_gemini_models(self) -> List[Dict[str, Any]]:
        """Get Gemini models"""
        return [
            {"id": "gemini-pro", "name": "Gemini Pro", "description": "Google's most capable model"},
            {"id": "gemini-pro-vision", "name": "Gemini Pro Vision", "description": "Multimodal capabilities"}
        ]
    
    async def _get_lmstudio_models(self, api_key: str) -> List[Dict[str, Any]]:
        """Get LM Studio models"""
        try:
            response = requests.get("http://localhost:1234/v1/models", timeout=10)
            if response.status_code == 200:
                models_data = response.json()
                return [{
                    "id": model["id"],
                    "name": model.get("id", "Unknown"),
                    "description": "Local model"
                } for model in models_data.get("data", [])]
        except:
            pass
        
        return [{"id": "local-model", "name": "Local Model", "description": "LM Studio local model"}]