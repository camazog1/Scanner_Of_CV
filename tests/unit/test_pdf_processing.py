# tests/unit/test_pdf_processing.py
import pytest
from unittest.mock import patch, MagicMock
from app.routes.main_process import extract_text_pdf

@pytest.fixture
def mock_pdf_response():
    """Fixture para simular respuesta de Google Vision API para PDF"""
    # Crear un mock para la respuesta de Vision API para PDF
    mock_text = "Sample text extracted from PDF document"
    
    # Crear una estructura de mocks que simule la respuesta anidada de Vision
    mock_annotation = MagicMock()
    mock_annotation.text = mock_text
    
    mock_page_response = MagicMock()
    mock_page_response.full_text_annotation = mock_annotation
    
    mock_file_response = MagicMock()
    mock_file_response.responses = [mock_page_response]
    
    mock_batch_response = MagicMock()
    mock_batch_response.responses = [mock_file_response]
    
    return mock_batch_response

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
def test_extract_text_pdf(mock_client, mock_pdf_response, tmp_path):
    """Test de extracción de texto de un PDF"""
    # Configurar el mock
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.return_value = mock_pdf_response
    
    # Crear un archivo PDF ficticio
    pdf_path = tmp_path / "test_document.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'dummy PDF content')
    
    # Llamar a la función
    result = extract_text_pdf(str(pdf_path), "Test User", "test@example.com", "1234567890")
    
    # Verificaciones
    mock_instance.batch_annotate_files.assert_called_once()
    assert "Sample text extracted from PDF document" in result

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
def test_extract_text_pdf_error(mock_client, tmp_path):
    """Test de manejo de errores en procesamiento de PDF"""
    # Configurar el mock para lanzar una excepción
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.side_effect = Exception("Error in PDF processing")
    
    # Crear un archivo PDF ficticio
    pdf_path = tmp_path / "test_error.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'dummy PDF content')
    
    # Verificar que se capture la excepción
    with pytest.raises(RuntimeError) as exc_info:
        extract_text_pdf(str(pdf_path), "Test User", "test@example.com", "1234567890")
    
    assert "PDF text extraction failed" in str(exc_info.value)