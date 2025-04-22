# tests/conftest.py
import pytest
import os
import sys
import json
from pathlib import Path

# Añadir el directorio raíz al path para importar módulos de la app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Fixture para crear un directorio temporal para las pruebas
@pytest.fixture
def temp_dir(tmpdir):
    return Path(tmpdir)

# Fixture para crear un archivo JSON de prueba
@pytest.fixture
def sample_json_file(temp_dir):
    json_path = temp_dir / "test.json"
    data = {
        "basics": {
            "name": "Test User",
            "email": "test@example.com",
            "location": {
                "city": "Test City",
                "country": "Test Country"
            }
        },
        "skills": [
            {
                "name": "Programming",
                "level": "Advanced"
            }
        ]
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    return json_path

# Fixture para simular una aplicación FastAPI para pruebas
@pytest.fixture
def test_app():
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)  