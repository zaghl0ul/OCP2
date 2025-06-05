import sys
import types
import os
import pytest

@pytest.fixture(scope="session", autouse=True)
def mock_backend_dependencies():
    # Allow importing backend.* modules
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    # Create lightweight 'models' package used by backend
    proj_module = types.ModuleType("models.project")
    class Project: ...
    class Clip:
        def __init__(self, **kwargs):
            pass
    class AnalysisRequest: ...
    class VideoData: ...
    proj_module.Project = Project
    proj_module.Clip = Clip
    proj_module.AnalysisRequest = AnalysisRequest
    proj_module.VideoData = VideoData

    db_module = types.ModuleType("models.database")
    class ProjectDB: ...
    class ClipDB: ...
    class Setting: ...
    db_module.Base = object
    db_module.Project = ProjectDB
    db_module.Clip = ClipDB
    db_module.Setting = Setting

    repo_module = types.ModuleType("models.repositories")
    class ProjectRepository:
        @staticmethod
        def get_all_projects(db):
            return []
        @staticmethod
        def get_project_by_id(db, project_id):
            return None
        @staticmethod
        def create_project(db, data):
            return types.SimpleNamespace(id="1", to_dict=lambda: data)
        @staticmethod
        def delete_project(db, project_id):
            return True
        @staticmethod
        def update_project(db, project_id, data):
            return types.SimpleNamespace(id=project_id, to_dict=lambda: data)
    class ClipRepository:
        @staticmethod
        def get_clip_by_id(db, clip_id):
            return None
        @staticmethod
        def update_clip(db, clip_id, clip_data):
            return types.SimpleNamespace(to_dict=lambda: clip_data)
        @staticmethod
        def delete_clip(db, clip_id):
            return True
        @staticmethod
        def get_clips_by_project(db, project_id):
            return []
        @staticmethod
        def create_clip(db, clip_dict):
            return types.SimpleNamespace(id="c1", to_dict=lambda: clip_dict)
    class SettingsRepository:
        @staticmethod
        def create_or_update_setting(db, category, key, value):
            return None
        @staticmethod
        def get_settings_by_category(db, category):
            return []
        @staticmethod
        def get_setting(db, category, key):
            return None
    repo_module.ProjectRepository = ProjectRepository
    repo_module.ClipRepository = ClipRepository
    repo_module.SettingsRepository = SettingsRepository

    models_pkg = types.ModuleType("models")
    models_pkg.project = proj_module
    models_pkg.database = db_module
    models_pkg.repositories = repo_module

    sys.modules.setdefault("models", models_pkg)
    sys.modules.setdefault("models.project", proj_module)
    sys.modules.setdefault("models.database", db_module)
    sys.modules.setdefault("models.repositories", repo_module)

    yield

    # Cleanup
    for name in ["models", "models.project", "models.database", "models.repositories"]:
        sys.modules.pop(name, None)
