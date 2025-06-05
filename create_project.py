import requests
import json

# Define the project data
project_data = {
    "name": "Test Project",
    "description": "Test description",
    "type": "upload"
}

# Send the request to create a project
try:
    response = requests.post(
        "http://localhost:8000/api/projects",
        json=project_data
    )
    
    # Check if request was successful
    if response.status_code == 200:
        project = response.json()["project"]
        print(f"Project created successfully! ID: {project['id']}")
        print(json.dumps(project, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {str(e)}") 