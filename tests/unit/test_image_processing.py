# tests/unit/test_image_processing.py
import pytest
from unittest.mock import patch, MagicMock
from app.routes.main_process import extract_text_image

@pytest.fixture
def mock_vision_response():
    """Fixture para simular respuesta de Google Vision API"""
    mock_text = MagicMock()
    mock_text.description = "Sample text extracted from image"
    return MagicMock(text_annotations=[mock_text])

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
def test_extract_text_image(mock_client, mock_vision_response, tmp_path):
    """Test de extracción de texto de una imagen"""
    # Configurar el mock
    mock_instance = mock_client.return_value
    mock_instance.text_detection.return_value = mock_vision_response
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_image.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'dummy image content')
    
    # Llamar a la función
    result = extract_text_image(str(img_path), "Test User", "test@example.com", "1234567890")
    
    # Verificaciones
    mock_instance.text_detection.assert_called_once()
    assert "Sample text extracted from image" in result  # El texto debería estar en la respuesta JSON

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
def test_extract_text_image_no_text(mock_client, tmp_path):
    """Test cuando no se detecta texto en la imagen"""
    # Configurar el mock para devolver una lista vacía
    mock_instance = mock_client.return_value
    mock_instance.text_detection.return_value = MagicMock(text_annotations=[])
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_image_no_text.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'dummy image content')
    
    # Llamar a la función
    result = extract_text_image(str(img_path), "Test User", "test@example.com", "1234567890")
    
    # Verificaciones
    assert result  # Debería devolver algún resultado incluso si no hay texto
    assert "test@example.com" in result  # Los datos del usuario deberían incluirse