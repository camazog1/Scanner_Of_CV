# tests/integration/test_edit_endpoint.py
import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_edit_json_endpoint(sample_json_file):
    """Test del endpoint de edición de JSON"""
    # Datos para actualizar
    update_data = {
        "basics": {
            "name": "Updated Name",
            "location": {
                "city": "Updated City"
            }
        }
    }
    
    # Llamada al endpoint
    response = client.put(
        "/edit_json/",
        json={
            "json_path": str(sample_json_file),
            "updated_json": update_data
        }
    )
    
    # Verificaciones
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "JSON actualizado correctamente"
    
    # Verificar que el archivo se actualizó correctamente
    with open(sample_json_file, "r", encoding="utf-8") as f:
        updated_json = json.load(f)
    
    assert updated_json["basics"]["name"] == "Updated Name"
    assert updated_json["basics"]["email"] == "test@example.com"  # No debería cambiar
    assert updated_json["basics"]["location"]["city"] == "Updated City"
    assert updated_json["basics"]["location"]["country"] == "Test Country"  # No debería cambiar

def test_edit_json_endpoint_file_not_found():
    """Test cuando el archivo JSON no existe"""
    update_data = {"name": "Test"}
    
    response = client.put(
        "/edit_json/",
        json={
            "json_path": "/path/to/nonexistent/file.json",
            "updated_json": update_data
        }
    )
    
    assert response.status_code == 404
    assert "No hay un JSON existente para editar" in response.json()["detail"]