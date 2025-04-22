# tests/api/test_error_handling.py
import pytest
from fastapi.testclient import TestClient
import io
from app.main import app

client = TestClient(app)

def test_upload_invalid_format():
    """Test subida de formato no permitido"""
    # Crear un archivo de formato no permitido
    text_content = io.BytesIO(b'This is a text file')
    
    # Llamar al endpoint
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("test.txt", text_content, "text/plain")}
    )
    
    # Verificaciones
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

def test_invalid_email_format():
    """Test validación de formato de email"""
    # Crear un archivo válido
    image_content = io.BytesIO(b'fake jpeg content')
    
    # Llamar al endpoint con un email inválido
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=invalid-email&phone=1234567890",
        files={"file": ("test_image.jpg", image_content, "image/jpeg")}
    )
    
    # Verificaciones
    assert response.status_code == 400
    assert "Invalid email format" in response.json()["error"]

def test_missing_required_params():
    """Test para parámetros faltantes"""
    # Crear un archivo válido
    image_content = io.BytesIO(b'fake jpeg content')
    
    # Llamar al endpoint sin el nombre
    response = client.post(
        "/CV_Extraction/?email=test@example.com&phone=1234567890",
        files={"file": ("test_image.jpg", image_content, "image/jpeg")}
    )
    
    # Verificaciones
    assert response.status_code == 422  # Unprocessable Entity