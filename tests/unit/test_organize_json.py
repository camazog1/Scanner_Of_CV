# tests/unit/test_organize_json.py
import pytest
from unittest.mock import patch, MagicMock
from app.routes.main_process import organizeJSON

@patch('app.routes.main_process.OpenAI')
def test_organize_json_with_valid_text(mock_openai, tmp_path):
    """Test organización de texto extraído en formato JSON"""
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
    mock_chat_completions = MagicMock()
    mock_chat_completions.create.return_value.choices[0].message.content = '{"basics": {"name": "John Doe", "email": "john@example.com"}}'
    
    mock_client = MagicMock()
    mock_client.chat.completions = mock_chat_completions
    mock_openai.return_value = mock_client
    
    # Configurar variables de entorno para las pruebas
    with patch.dict('os.environ', {
        'DEEPSEEK_API_KEY': 'test_api_key',
        'DEEPSEEK_BASE_URL': 'https://api.deepseek.com',
        'GOOGLE_APPLICATION_CREDENTIALS': str(tmp_path / 'credentials.json')
    }):
        with patch('app.routes.main_process.BASE_DIR', base_dir):
            # Llamar a la función con texto de ejemplo
            result = organizeJSON(
                "Sample CV text\nName: John Doe\nEmail: john@example.com", 
                "John Doe", 
                "john@example.com", 
                "1234567890"
            )
    
    # Verificaciones
    assert result == '{"basics": {"name": "John Doe", "email": "john@example.com"}}'
    mock_chat_completions.create.assert_called_once()

@patch('app.routes.main_process.OpenAI')
def test_organize_json_with_empty_text(mock_openai):
    """Test con texto vacío"""
    # Verificar que se lance una excepción apropiada
    with pytest.raises(ValueError) as exc_info:
        organizeJSON("", "Test Name", "test@example.com", "1234567890")
    
    assert "No text detected in the file" in str(exc_info.value)
    mock_openai.assert_not_called()  # No debería llamarse a la API