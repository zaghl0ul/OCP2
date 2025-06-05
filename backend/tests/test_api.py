from fastapi.testclient import TestClient


def get_client():
    import backend.main as main
    return TestClient(main.app)


def test_get_providers():
    client = get_client()
    response = client.get("/api/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    assert any(p["id"] == "openai" for p in data["providers"])
