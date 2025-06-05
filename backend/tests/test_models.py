from pydantic import ValidationError
import pytest


def get_model():
    import backend.main as main
    return main.ProjectCreateRequest


def test_project_create_request_required_fields():
    ProjectCreateRequest = get_model()
    req = ProjectCreateRequest(name="Demo", type="upload")
    assert req.name == "Demo"
    assert req.type == "upload"


def test_project_create_request_missing_name():
    ProjectCreateRequest = get_model()
    with pytest.raises(ValidationError):
        ProjectCreateRequest(type="upload")
