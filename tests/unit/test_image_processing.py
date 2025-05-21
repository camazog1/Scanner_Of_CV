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
    
    # Configurar mock_text con texto de ejemplo
    mock_text = MagicMock()
    mock_text.description = "Nombre: Pedro Pérez\nExperiencia: 5 años como desarrollador\nEducación: Ingeniería"
    mock_response = MagicMock()
    mock_response.text_annotations = [mock_text]
    mock_instance.text_detection.return_value = mock_response

    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_image.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'dummy image content')

    # Llamar a la función
    result = extract_text_image(str(img_path), "Test User", "test@example.com", "1234567890")

    # Verificaciones
    mock_instance.text_detection.assert_called_once()
    assert "Test User" in result  # Verificar que el nombre está en el resultado
    assert "test@example.com" in result  # Verificar que el email está en el resultado

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

    # Realizar verificaciones específicas
    with pytest.raises(RuntimeError) as exc_info:
        extract_text_image(str(img_path), "Test User", "test@example.com", "1234567890")
    
    # Verificar que el mensaje de error es el esperado
    assert "No text detected in the file" in str(exc_info.value)

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_image_with_cv_data(mock_organize_json, mock_client, tmp_path):
    """Test de extracción de texto de una imagen con datos de CV"""
    # Simulamos texto de un CV real
    cv_text = """
    JUAN LÓPEZ MARTÍNEZ
    Email: juan.lopez@example.com
    Teléfono: +34 612 345 678
    
    EXPERIENCIA LABORAL
    Desarrollador Full Stack - TechCompany (2019-2023)
    - Desarrollo de aplicaciones web con React y Node.js
    - Implementación de bases de datos MongoDB y PostgreSQL
    
    EDUCACIÓN
    Ingeniería en Informática - Universidad Tecnológica (2015-2019)
    
    HABILIDADES
    JavaScript, Python, React, Node.js, MongoDB, Git
    """
    
    # Configurar los mocks
    mock_text = MagicMock()
    mock_text.description = cv_text
    mock_response = MagicMock()
    mock_response.text_annotations = [mock_text]
    mock_client.return_value.text_detection.return_value = mock_response
    
    # Configurar el mock para organizeJSON
    expected_json = '''{"basics": {"name": "Juan López Martínez", "email": "juan.lopez@example.com", "phone": "+34 612 345 678"}}'''
    mock_organize_json.return_value = expected_json
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_cv_image.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'fake cv image content')
    
    # Llamar a la función
    result = extract_text_image(str(img_path), "Juan López Martínez", "juan.lopez@example.com", "+34 612 345 678")
    
    # Verificaciones
    mock_client.return_value.text_detection.assert_called_once()
    assert result == expected_json
    mock_organize_json.assert_called_once_with(cv_text, "Juan López Martínez", "juan.lopez@example.com", "+34 612 345 678")

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_image_with_business_card(mock_organize_json, mock_client, tmp_path):
    """Test de extracción de texto de una imagen de tarjeta de visita"""
    # Simulamos texto de una tarjeta de visita
    business_card_text = """
    Ana García Rodríguez
    Directora de Marketing
    
    MarketingPro S.L.
    
    ana.garcia@marketingpro.com
    +34 698 765 432
    www.marketingpro.com
    """
    
    # Configurar los mocks
    mock_text = MagicMock()
    mock_text.description = business_card_text
    mock_response = MagicMock()
    mock_response.text_annotations = [mock_text]
    mock_client.return_value.text_detection.return_value = mock_response
    
    # Configurar el mock para organizeJSON
    expected_json = '''{"basics": {"name": "Ana García Rodríguez", "label": "Directora de Marketing", "email": "ana.garcia@marketingpro.com", "phone": "+34 698 765 432"}}'''
    mock_organize_json.return_value = expected_json
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_business_card.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'fake business card image content')
    
    # Llamar a la función
    result = extract_text_image(str(img_path), "Ana García Rodríguez", "ana.garcia@marketingpro.com", "+34 698 765 432")
    
    # Verificaciones
    mock_client.return_value.text_detection.assert_called_once()
    assert result == expected_json
    mock_organize_json.assert_called_once_with(business_card_text, "Ana García Rodríguez", "ana.garcia@marketingpro.com", "+34 698 765 432")

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_image_with_handwritten_notes(mock_organize_json, mock_client, tmp_path):
    """Test de extracción de texto de una imagen con notas manuscritas"""
    # Simulamos texto manuscrito
    handwritten_text = """
    Carlos Sánchez
    Tel: 654987321
    Busco trabajo como administrativo
    Experiencia: 3 años en oficina
    Excel, Word, atención al cliente
    """
    
    # Configurar los mocks
    mock_text = MagicMock()
    mock_text.description = handwritten_text
    mock_response = MagicMock()
    mock_response.text_annotations = [mock_text]
    mock_client.return_value.text_detection.return_value = mock_response
    
    # Configurar el mock para organizeJSON
    expected_json = '''{"basics": {"name": "Carlos Sánchez", "phone": "654987321", "summary": "Busco trabajo como administrativo"}}'''
    mock_organize_json.return_value = expected_json
    
    # Crear un archivo de imagen ficticio
    img_path = tmp_path / "test_handwritten.jpg"
    with open(img_path, 'wb') as f:
        f.write(b'fake handwritten note image content')
    
    # Llamar a la función
    result = extract_text_image(str(img_path), "Carlos Sánchez", "carlos@example.com", "654987321")
    
    # Verificaciones
    mock_client.return_value.text_detection.assert_called_once()
    assert result == expected_json
    mock_organize_json.assert_called_once_with(handwritten_text, "Carlos Sánchez", "carlos@example.com", "654987321")