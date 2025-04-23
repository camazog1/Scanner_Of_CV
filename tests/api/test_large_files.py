# tests/api/test_large_files.py
import pytest
import io
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def large_pdf_file():
    """Crea un archivo PDF grande simulado (5MB)"""
    content = b'X' * (5 * 1024 * 1024)  # 5MB de contenido
    return io.BytesIO(content)

@pytest.fixture
def large_image_file():
    """Crea una imagen grande simulada (8MB)"""
    content = b'Y' * (8 * 1024 * 1024)  # 8MB de contenido
    return io.BytesIO(content)

@patch('app.routes.main_process.extract_text')
def test_upload_large_pdf(mock_extract, large_pdf_file):
    """Test subida de PDF grande"""
    mock_extract.return_value = '{"basics": {"name": "Test User"}}'
    
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("large_doc.pdf", large_pdf_file, "application/pdf")}
    )
    
    assert response.status_code == 200
    assert "basics" in response.json()
    mock_extract.assert_called_once()

@patch('app.routes.main_process.extract_text')
def test_upload_large_image(mock_extract, large_image_file):
    """Test subida de imagen grande"""
    mock_extract.return_value = '{"basics": {"name": "Test User"}}'
    
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("large_image.jpg", large_image_file, "image/jpeg")}
    )
    
    assert response.status_code == 200
    assert "basics" in response.json()
    mock_extract.assert_called_once()

@patch('app.routes.main_process.extract_text')
def test_timeout_with_very_large_file(mock_extract):
    """Test de timeout con archivo extremadamente grande"""
    # Simular un timeout
    mock_extract.side_effect = Exception("Process took too long")
    
    # Crear un archivo grande
    content = io.BytesIO(b'Z' * (10 * 1024 * 1024))  # 10MB
    
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("very_large.pdf", content, "application/pdf")}
    )
    
    assert response.status_code == 500
    assert "error" in response.json()