# tests/integration/test_external_services.py
import pytest
from unittest.mock import patch, MagicMock
import json
from app.routes.main_process import extract_text_image, extract_text_pdf, organizeJSON

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
def test_google_vision_integration(mock_client, tmp_path):
    """Test de integración con Google Vision API"""
    # Configuración del mock
    mock_text = MagicMock()
    mock_text.description = "Test CV Content"
    mock_response = MagicMock(text_annotations=[mock_text])
    
    mock_instance = mock_client.return_value
    mock_instance.text_detection.return_value = mock_response
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_integration.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'dummy image content')
    
    # Ejecutar con organizeJSON mockeado para evitar la llamada a DeepSeek
    with patch('app.routes.main_process.organizeJSON') as mock_organize:
        mock_organize.return_value = json.dumps({"basics": {"name": "Test"}})
        
        result = extract_text_image(str(img_path), "Test User", "test@example.com", "1234567890")
    
    # Verificaciones
    assert result
    mock_instance.text_detection.assert_called_once()

@patch('app.routes.main_process.OpenAI')
def test_deepseek_integration(mock_openai, tmp_path):
    """Test de integración con DeepSeek API"""
    # Preparar directorios y archivos necesarios
    base_dir = tmp_path
    docs_dir = base_dir / "docs"
    docs_dir.mkdir()
    
    # Crear archivos de esquema ficticios
    schema_path = docs_dir / "schema.json"
    schema_example_path = docs_dir / "schema_with_example.json"
    
    with open(schema_path, 'w') as f:
        f.write('{"basics": {"name": "", "email": ""}}')
    
    with open(schema_example_path, 'w') as f:
        f.write('{"basics": {"name": "Example Name", "email": "example@email.com"}}')
    
    # Configurar mock para OpenAI
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"basics": {"name": "Test Name", "email": "test@example.com"}}'
    
    mock_chat = MagicMock()
    mock_chat.completions.create.return_value = mock_response
    
    mock_client = MagicMock()
    mock_client.chat = mock_chat
    mock_openai.return_value = mock_client
    
    # Configurar variables de entorno para las pruebas
    with patch.dict('os.environ', {
        'DEEPSEEK_API_KEY': 'test_api_key',
        'DEEPSEEK_BASE_URL': 'https://api.deepseek.com'
    }):
        with patch('app.routes.main_process.BASE_DIR', base_dir):
            # Llamar a la función
            result = organizeJSON(
                "CV text for testing\nName: Test\nEmail: test@example.com", 
                "Test Name", 
                "test@example.com", 
                "1234567890"
            )
    
    # Verificaciones
    mock_chat.completions.create.assert_called_once()
    assert "Test Name" in result
    assert "test@example.com" in result