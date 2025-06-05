from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import asyncio
import logging
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
import platform
import sys

# Import our modules
from models.project import Project as ProjectSchema, Clip as ClipSchema, AnalysisRequest
from models.database import Project, Clip, Setting
from models.repositories import ProjectRepository, ClipRepository, SettingsRepository
from services.video_processor import VideoProcessor
from services.ai_analyzer import AIAnalyzer
from services.api_manager import APIManager
from utils.security import SecurityManager
from utils.file_manager import FileManager
from utils.db_manager import get_db, init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OpenClip Pro API",
    description="AI-powered video clipping backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],  # React dev server and Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
video_processor = VideoProcessor()
ai_analyzer = AIAnalyzer()
api_manager = APIManager()
security_manager = SecurityManager()
file_manager = FileManager()

# Initialize database
@app.on_event("startup")
async def startup_db_client():
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

# Request/Response Models
class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    type: str  # 'upload' or 'youtube'
    youtube_url: Optional[str] = None

class AnalysisPromptRequest(BaseModel):
    project_id: str
    prompt: str
    provider: Optional[str] = None
    model: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    category: str  # 'api_keys', 'model_settings', 'app_settings'
    key: str
    value: Any

class APITestRequest(BaseModel):
    provider: str
    api_key: str

# YouTube URL request model
class YouTubeURLRequest(BaseModel):
    youtube_url: str

# Health check
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Check the health status of the backend service and its dependencies
    
    Returns detailed diagnostics about the backend services
    """
    try:
        # Test database connection
        db_status = "connected"
        db_error = None
        try:
            # Simple query to test if DB is working
            setting = db.query(Setting).first()
        except Exception as e:
            db_status = "error"
            db_error = str(e)
        
        # Check AI services
        ai_services = {}
        for provider_info in api_manager.get_providers():
            provider_id = provider_info["id"]
            ai_services[provider_id] = {
                "available": True,
                "models_count": len(api_manager.get_provider_models(provider_id)),
                "name": provider_info["name"]
            }
        
        # Check file system access
        fs_status = "ok"
        fs_error = None
        try:
            test_file = os.path.join(file_manager.get_temp_dir(), "health_check.txt")
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
        except Exception as e:
            fs_status = "error"
            fs_error = str(e)
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "environment": {
                "python": sys.version,
                "platform": platform.platform(),
                "processor": platform.processor()
            },
            "database": {
                "status": db_status,
                "error": db_error
            },
            "file_system": {
                "status": fs_status,
                "error": fs_error,
                "temp_dir": file_manager.get_temp_dir(),
                "uploads_dir": file_manager.get_uploads_dir()
            },
            "ai_services": ai_services
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

# API Management endpoints
@app.get("/api/providers")
async def get_providers():
    """Get all available AI providers"""
    try:
        providers = api_manager.get_providers()
        return {"providers": providers}
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get providers"}
        )

@app.get("/api/models/{provider}")
async def get_available_models(provider: str, db: Session = Depends(get_db)):
    """Get available models for a provider"""
    try:
        # Get API key securely
        api_key = security_manager.get_api_key(provider, db, SettingsRepository)
        if not api_key:
            raise HTTPException(status_code=400, detail=f"No API key configured for {provider}")
        
        models = await api_manager.get_available_models(provider, api_key, db, security_manager, SettingsRepository)
        return {"models": models}
    except Exception as e:
        logger.error(f"Error getting models: {e}")
        raise HTTPException(status_code=500, detail="Failed to get models")

@app.post("/api/settings/test-api")
async def test_api_connection(request: APITestRequest):
    """Test API connection"""
    try:
        result = await api_manager.test_connection(request.provider, request.api_key)
        return {"success": result["success"], "message": result["message"]}
    except Exception as e:
        logger.error(f"Error testing API: {e}")
        return {"success": False, "message": str(e)}

# Settings endpoints
@app.get("/api/settings")
async def get_settings(db: Session = Depends(get_db)):
    """Get user settings"""
    try:
        # Get settings from the database
        model_settings = {}
        app_settings = {}
        
        # Get model settings
        for setting in SettingsRepository.get_settings_by_category(db, "model_settings"):
            model_settings[setting.key] = setting.value
            
        # Get app settings
        for setting in SettingsRepository.get_settings_by_category(db, "app_settings"):
            app_settings[setting.key] = setting.value
            
        return {
            "model_settings": model_settings,
            "app_settings": app_settings
        }
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get settings"}
        )

@app.post("/api/settings")
async def update_settings(request: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Update user settings"""
    try:
        # Update setting in database
        setting = SettingsRepository.create_or_update_setting(
            db, request.category, request.key, request.value
        )
        
        return {"success": True, "message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to update settings"}
        )

# Projects endpoints
@app.get("/api/projects")
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    try:
        projects = ProjectRepository.get_all_projects(db)
        return {"projects": [project.to_dict() for project in projects]}
    except Exception as e:
        logger.error(f"Error getting projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to get projects")

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get a specific project"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"project": project.to_dict()}

@app.post("/api/projects")
async def create_project(request: ProjectCreateRequest, db: Session = Depends(get_db)):
    """Create a new project"""
    try:
        project_data = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "description": request.description,
            "type": request.type,
            "youtube_url": request.youtube_url,
            "status": "created",
            "analysis_prompt": ""
        }
        
        project = ProjectRepository.create_project(db, project_data)
        logger.info(f"Created project: {project.id}")
        
        return {"project": project.to_dict()}
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a project"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Delete project from database
        success = ProjectRepository.delete_project(db, project_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete project")
        
        # Clean up associated files
        file_manager.cleanup_project_files(project_id)
        
        return {"success": True, "message": "Project deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")

# Video upload endpoint
@app.post("/api/projects/{project_id}/upload")
async def upload_video(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload video file for a project"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Save file
        file_path = await file_manager.save_upload(file, project_id)
        
        # Process video metadata
        video_data = await video_processor.extract_metadata(file_path)
        
        # Update project
        updates = {
            "video_data": {
                "file_path": file_path,
                "filename": file.filename,
                "size": file.size,
                "duration": video_data.get('duration'),
                "resolution": video_data.get('resolution'),
                "fps": video_data.get('fps')
            },
            "status": "uploaded"
        }
        
        updated_project = ProjectRepository.update_project(db, project_id, updates)
        
        logger.info(f"Video uploaded for project: {project_id}")
        
        return {"project": updated_project.to_dict()}
    except Exception as e:
        logger.error(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload video")

# YouTube processing endpoint
@app.post("/api/projects/{project_id}/youtube")
async def process_youtube(project_id: str, request: YouTubeURLRequest, db: Session = Depends(get_db)):
    """Process YouTube URL for a project"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not request.youtube_url:
        raise HTTPException(status_code=400, detail="No YouTube URL provided")
    
    try:
        # Update project with the YouTube URL first
        ProjectRepository.update_project(db, project_id, {"youtube_url": request.youtube_url, "status": "processing"})
        
        # Download and process YouTube video
        video_data = await video_processor.process_youtube_url(request.youtube_url)
        
        # Update project
        updates = {
            "video_data": video_data,
            "status": "uploaded"
        }
        
        updated_project = ProjectRepository.update_project(db, project_id, updates)
        
        logger.info(f"YouTube video processed for project: {project_id}")
        
        return {"project": updated_project.to_dict()}
    except Exception as e:
        logger.error(f"Error processing YouTube video: {e}")
        # Update project status to error
        ProjectRepository.update_project(db, project_id, {"status": "error"})
        raise HTTPException(status_code=500, detail=f"Failed to process YouTube video: {str(e)}")

# Analysis endpoints
@app.post("/api/projects/{project_id}/analyze")
async def analyze_video(project_id: str, request: AnalysisPromptRequest, db: Session = Depends(get_db)):
    """Start AI analysis of the video"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.video_data:
        raise HTTPException(status_code=400, detail="No video data available")
    
    try:
        # Update project with analysis prompt
        updates = {
            "analysis_prompt": request.prompt,
            "status": "analyzing"
        }
        updated_project = ProjectRepository.update_project(db, project_id, updates)
        
        # Get API settings
        provider_setting = SettingsRepository.get_setting(db, "model_settings", "default_provider")
        provider = request.provider or (provider_setting.value if provider_setting else "openai")
        
        # Get API key securely
        api_key = security_manager.get_api_key(provider, db, SettingsRepository)
        
        if not api_key:
            raise HTTPException(status_code=400, detail=f"No API key configured for {provider}")
        
        # For demo, we'll simulate the analysis
        clips = await simulate_analysis(updated_project, request.prompt)
        
        # Create clips in database
        for clip_data in clips:
            clip_dict = {
                "project_id": project_id,
                "title": clip_data.title,
                "description": clip_data.explanation,
                "start_time": clip_data.start_time,
                "end_time": clip_data.end_time,
                "tags": []
            }
            ClipRepository.create_clip(db, clip_dict)
        
        # Update project status
        ProjectRepository.update_project(db, project_id, {"status": "completed"})
        
        # Get updated project with clips
        final_project = ProjectRepository.get_project_by_id(db, project_id)
        logger.info(f"Analysis completed for project: {project_id}")
        
        return {"project": final_project.to_dict()}
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        ProjectRepository.update_project(db, project_id, {"status": "error"})
        raise HTTPException(status_code=500, detail=f"Failed to analyze video: {str(e)}")

async def simulate_analysis(project: Project, prompt: str) -> List[Clip]:
    """Simulate AI analysis for demo purposes"""
    # Simulate processing time
    await asyncio.sleep(2)
    
    # Generate mock clips based on prompt
    clips = []
    clip_types = {
        "funny": [("Hilarious reaction", 85), ("Comedy gold moment", 92), ("Unexpected humor", 78)],
        "engaging": [("Hook moment", 88), ("Peak engagement", 94), ("Attention grabber", 82)],
        "educational": [("Key insight", 90), ("Learning moment", 87), ("Important concept", 85)],
        "emotional": [("Touching moment", 89), ("Emotional peak", 93), ("Heartfelt scene", 86)]
    }
    
    # Determine clip type based on prompt
    clip_type = "engaging"  # default
    for key in clip_types.keys():
        if key in prompt.lower():
            clip_type = key
            break
    
    selected_clips = clip_types[clip_type]
    
    for i, (title, score) in enumerate(selected_clips):
        clip = Clip(
            id=str(uuid.uuid4()),
            title=title,
            start_time=i * 30,  # 30 second intervals
            end_time=(i * 30) + 15,  # 15 second clips
            score=score,
            explanation=f"This clip shows {title.lower()} based on the analysis criteria: {prompt}",
            created_at=datetime.now().isoformat()
        )
        clips.append(clip)
    
    return clips

# Clip management endpoints
@app.put("/api/projects/{project_id}/clips/{clip_id}")
async def update_clip(project_id: str, clip_id: str, clip_data: dict, db: Session = Depends(get_db)):
    """Update a clip"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    clip = ClipRepository.get_clip_by_id(db, clip_id)
    if not clip or clip.project_id != project_id:
        raise HTTPException(status_code=404, detail="Clip not found")
    
    try:
        # Update clip data
        updated_clip = ClipRepository.update_clip(db, clip_id, clip_data)
        
        logger.info(f"Updated clip: {clip_id} in project: {project_id}")
        
        return {"clip": updated_clip.to_dict()}
    except Exception as e:
        logger.error(f"Error updating clip: {e}")
        raise HTTPException(status_code=500, detail="Failed to update clip")

@app.delete("/api/projects/{project_id}/clips/{clip_id}")
async def delete_clip(project_id: str, clip_id: str, db: Session = Depends(get_db)):
    """Delete a clip"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    clip = ClipRepository.get_clip_by_id(db, clip_id)
    if not clip or clip.project_id != project_id:
        raise HTTPException(status_code=404, detail="Clip not found")
    
    try:
        success = ClipRepository.delete_clip(db, clip_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete clip")
            
        logger.info(f"Deleted clip: {clip_id} from project: {project_id}")
        
        return {"message": "Clip deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting clip: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete clip")

# Export endpoint
@app.post("/api/projects/{project_id}/export")
async def export_clips(project_id: str, export_settings: dict, db: Session = Depends(get_db)):
    """Export clips from a project"""
    project = ProjectRepository.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    clips = ClipRepository.get_clips_by_project(db, project_id)
    if not clips:
        raise HTTPException(status_code=400, detail="No clips to export")
    
    try:
        # Process export (this would be async in production)
        video_path = project.video_data.get("file_path") if project.video_data else None
        if not video_path:
            raise HTTPException(status_code=400, detail="No video file available")
            
        export_result = await video_processor.export_clips(
            video_path,
            [clip.to_dict() for clip in clips],
            export_settings
        )
        
        logger.info(f"Exported clips for project: {project_id}")
        
        return {"export_result": export_result}
    except Exception as e:
        logger.error(f"Error exporting clips: {e}")
        raise HTTPException(status_code=500, detail="Failed to export clips")

# API Key management endpoint
@app.post("/api/settings/api-key")
async def set_api_key(request: APITestRequest, db: Session = Depends(get_db)):
    """Securely store an API key"""
    try:
        # Validate the API key first
        validation_result = await api_manager.test_connection(request.provider, request.api_key)
        
        if not validation_result.get("success", False):
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid API key for {request.provider}"}
            )
        
        # Store the key securely
        security_manager.store_api_key(
            request.provider, 
            request.api_key, 
            db_session=db, 
            settings_repo=SettingsRepository
        )
        
        return {"success": True, "message": f"API key for {request.provider} stored successfully"}
    except Exception as e:
        logger.error(f"Error storing API key: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to store API key"}
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )