# tests/api/test_cv_upload.py
import pytest
from fastapi.testclient import TestClient
import io
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_extract_text():
    """Fixture para simular la extracción de texto"""
    with patch('app.routes.main_process.extract_text') as mock:
        mock.return_value = '{"basics": {"name": "Test User", "email": "test@example.com", "phone": "1234567890"}}'
        yield mock

def test_upload_file_jpeg(mock_extract_text):
    """Test subida de archivo JPEG"""
    # Crear un archivo JPEG ficticio
    image_content = io.BytesIO(b'fake jpeg content')
    
    # Llamar al endpoint
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("test_image.jpg", image_content, "image/jpeg")}
    )
    
    # Verificaciones
    assert response.status_code == 200
    data = response.json()
    assert data["basics"]["name"] == "Test User"
    assert data["basics"]["email"] == "test@example.com"
    assert data["basics"]["phone"] == "1234567890"
    mock_extract_text.assert_called_once()

def test_upload_file_pdf(mock_extract_text):
    """Test subida de archivo PDF"""
    # Crear un archivo PDF ficticio
    pdf_content = io.BytesIO(b'fake pdf content')
    
    # Llamar al endpoint
    response = client.post(
        "/CV_Extraction/?name=Test+User&email=test@example.com&phone=1234567890",
        files={"file": ("test_doc.pdf", pdf_content, "application/pdf")}
    )
    
    # Verificaciones
    assert response.status_code == 200
    data = response.json()
    assert data["basics"]["name"] == "Test User"
    assert mock_extract_text.called