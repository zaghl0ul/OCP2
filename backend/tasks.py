import asyncio
import logging
from typing import List
from datetime import datetime
import uuid

from celery_app import celery_app
from services.video_processor import VideoProcessor
from models.database import Project, Clip
from models.repositories import ProjectRepository, ClipRepository
from utils.db_manager import SessionLocal

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def process_youtube_url_task(self, project_id: str, youtube_url: str) -> dict:
    """Download and process a YouTube video."""
    db = SessionLocal()
    try:
        ProjectRepository.update_project(db, project_id, {"status": "processing", "youtube_url": youtube_url})
        processor = VideoProcessor()
        video_data = asyncio.run(processor.process_youtube_url(youtube_url))
        ProjectRepository.update_project(db, project_id, {"video_data": video_data, "status": "uploaded"})
        return video_data
    except Exception as e:
        logger.error(f"Error processing YouTube video: {e}")
        ProjectRepository.update_project(db, project_id, {"status": "error"})
        raise
    finally:
        db.close()

async def _simulate_analysis(project: Project, prompt: str) -> List[Clip]:
    await asyncio.sleep(2)
    clips: List[Clip] = []
    clip_types = {
        "funny": [("Hilarious reaction", 85), ("Comedy gold moment", 92), ("Unexpected humor", 78)],
        "engaging": [("Hook moment", 88), ("Peak engagement", 94), ("Attention grabber", 82)],
        "educational": [("Key insight", 90), ("Learning moment", 87), ("Important concept", 85)],
        "emotional": [("Touching moment", 89), ("Emotional peak", 93), ("Heartfelt scene", 86)]
    }

    clip_type = "engaging"
    for key in clip_types.keys():
        if key in prompt.lower():
            clip_type = key
            break

    selected = clip_types[clip_type]
    for i, (title, score) in enumerate(selected):
        clip = Clip(
            id=str(uuid.uuid4()),
            title=title,
            start_time=i * 30,
            end_time=(i * 30) + 15,
            score=score,
            explanation=f"This clip shows {title.lower()} based on the analysis criteria: {prompt}",
            created_at=datetime.now().isoformat()
        )
        clips.append(clip)
    return clips

@celery_app.task(bind=True)
def analyze_video_task(self, project_id: str, prompt: str) -> list:
    """Run simulated analysis and create clips."""
    db = SessionLocal()
    try:
        project = ProjectRepository.get_project_by_id(db, project_id)
        if not project:
            raise ValueError("Project not found")
        ProjectRepository.update_project(db, project_id, {"analysis_prompt": prompt, "status": "analyzing"})
        clips = asyncio.run(_simulate_analysis(project, prompt))
        for c in clips:
            clip_dict = {
                "project_id": project_id,
                "title": c.title,
                "description": c.explanation,
                "start_time": c.start_time,
                "end_time": c.end_time,
                "tags": []
            }
            ClipRepository.create_clip(db, clip_dict)
        ProjectRepository.update_project(db, project_id, {"status": "completed"})
        return [clip.to_dict() for clip in ClipRepository.get_clips_by_project(db, project_id)]
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        ProjectRepository.update_project(db, project_id, {"status": "error"})
        raise
    finally:
        db.close()

