# tests/unit/test_pdf_processing.py
import pytest
import json
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
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_pdf(mock_organize, mock_client, mock_pdf_response, tmp_path):
    """Test de extracción de texto de un PDF"""
    # Configurar el mock para Vision API
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.return_value = mock_pdf_response
    
    # Configurar mock para organizeJSON que devuelve JSON estructurado
    expected_json = '{"basics": {"name": "Test User", "email": "test@example.com", "phone": "1234567890"}}'
    mock_organize.return_value = expected_json
    
    # Crear un archivo PDF ficticio
    pdf_path = tmp_path / "test_document.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'dummy PDF content')
    
    # Llamar a la función
    result = extract_text_pdf(str(pdf_path), "Test User", "test@example.com", "1234567890")
    
    # Verificaciones
    mock_instance.batch_annotate_files.assert_called_once()
    mock_organize.assert_called_once_with(
        "Sample text extracted from PDF document", 
        "Test User", 
        "test@example.com", 
        "1234567890"
    )
    assert result == expected_json
    
    # Verificar que el resultado es un JSON válido
    json_result = json.loads(result)
    assert json_result["basics"]["name"] == "Test User"
    assert json_result["basics"]["email"] == "test@example.com"

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

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_multipage_pdf(mock_organize, mock_client, tmp_path):
    """Test de extracción de texto de un PDF con múltiples páginas"""
    # Simular un PDF con múltiples páginas
    text_page1 = "First page content with personal info"
    text_page2 = "Second page with work experience"
    
    # Crear mocks para cada página
    mock_annotation1 = MagicMock()
    mock_annotation1.text = text_page1
    mock_page_response1 = MagicMock()
    mock_page_response1.full_text_annotation = mock_annotation1
    
    mock_annotation2 = MagicMock()
    mock_annotation2.text = text_page2
    mock_page_response2 = MagicMock()
    mock_page_response2.full_text_annotation = mock_annotation2
    
    # Configurar respuesta con múltiples páginas
    mock_file_response = MagicMock()
    mock_file_response.responses = [mock_page_response1, mock_page_response2]
    
    mock_batch_response = MagicMock()
    mock_batch_response.responses = [mock_file_response]
    
    # Configurar el mock para Vision API
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.return_value = mock_batch_response
    
    # Configurar mock para organizeJSON
    expected_json = '{"basics": {"name": "Test User"}, "work": [{"position": "Developer"}]}'
    mock_organize.return_value = expected_json
    
    # Crear archivo PDF ficticio
    pdf_path = tmp_path / "multipage_document.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'multipage pdf content')
    
    # Llamar a la función
    result = extract_text_pdf(str(pdf_path), "Test User", "test@example.com", "1234567890")
    
    # Verificar que organizeJSON se llamó con el texto combinado de ambas páginas
    combined_text = text_page1 + text_page2
    mock_organize.assert_called_once_with(
        combined_text, 
        "Test User", 
        "test@example.com", 
        "1234567890"
    )
    assert result == expected_json

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_empty_pdf(mock_organize, mock_client, tmp_path):
    """Test de extracción de texto de un PDF sin texto"""
    # Configurar respuesta sin texto
    mock_page_response = MagicMock()
    mock_page_response.full_text_annotation = None  # Sin anotación de texto
    
    mock_file_response = MagicMock()
    mock_file_response.responses = [mock_page_response]
    
    mock_batch_response = MagicMock()
    mock_batch_response.responses = [mock_file_response]
    
    # Configurar el mock para Vision API
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.return_value = mock_batch_response
    
    # Configurar organizeJSON para lanzar una excepción (esperado con texto vacío)
    mock_organize.side_effect = ValueError("No text detected in the file.")
    
    # Crear archivo PDF ficticio
    pdf_path = tmp_path / "empty_document.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'empty pdf content')
    
    # Verificar que se maneja correctamente el error
    with pytest.raises(RuntimeError) as exc_info:
        extract_text_pdf(str(pdf_path), "Test User", "test@example.com", "1234567890")
    
    # El error de valor original debe estar contenido en el error runtime
    assert "No text detected in the file" in str(exc_info.value)

@patch('app.routes.main_process.vision.ImageAnnotatorClient')
@patch('app.routes.main_process.organizeJSON')
def test_extract_text_cv_pdf(mock_organize, mock_client, tmp_path):
    """Test de extracción de texto de un PDF de CV con formato específico"""
    # Simular contenido de un CV real
    cv_text = """
    MARÍA RODRÍGUEZ LÓPEZ
    Email: maria.rodriguez@example.com
    Teléfono: +34 612 345 678
    
    EXPERIENCIA LABORAL
    Ingeniera de Software - TechGlobal (2018-2023)
    - Desarrollo de microservicios con Spring Boot
    - Implementación de CI/CD con Jenkins y Docker
    
    Desarrolladora Web - DigitalSolutions (2015-2018)
    - Desarrollo frontend con Angular
    - Optimización de rendimiento web
    
    EDUCACIÓN
    Máster en Ingeniería Informática - Universidad Complutense (2013-2015)
    Grado en Ingeniería de Software - Universidad Politécnica (2009-2013)
    
    HABILIDADES
    Java, Spring, Angular, Docker, Jenkins, Git, AWS
    """
    
    # Configurar respuesta con el CV
    mock_annotation = MagicMock()
    mock_annotation.text = cv_text
    
    mock_page_response = MagicMock()
    mock_page_response.full_text_annotation = mock_annotation
    
    mock_file_response = MagicMock()
    mock_file_response.responses = [mock_page_response]
    
    mock_batch_response = MagicMock()
    mock_batch_response.responses = [mock_file_response]
    
    # Configurar el mock para Vision API
    mock_instance = mock_client.return_value
    mock_instance.batch_annotate_files.return_value = mock_batch_response
    
    # Crear un JSON completo y estructurado como respuesta esperada
    expected_json = """
    {
      "basics": {
        "name": "María Rodríguez López",
        "email": "maria.rodriguez@example.com",
        "phone": "+34 612 345 678",
        "summary": ""
      },
      "work": [
        {
          "name": "TechGlobal",
          "position": "Ingeniera de Software",
          "startDate": "2018",
          "endDate": "2023",
          "highlights": ["Desarrollo de microservicios con Spring Boot", "Implementación de CI/CD con Jenkins y Docker"]
        },
        {
          "name": "DigitalSolutions",
          "position": "Desarrolladora Web",
          "startDate": "2015",
          "endDate": "2018",
          "highlights": ["Desarrollo frontend con Angular", "Optimización de rendimiento web"]
        }
      ],
      "education": [
        {
          "institution": "Universidad Complutense",
          "area": "Ingeniería Informática",
          "studyType": "Máster",
          "startDate": "2013",
          "endDate": "2015"
        },
        {
          "institution": "Universidad Politécnica",
          "area": "Ingeniería de Software",
          "studyType": "Grado",
          "startDate": "2009",
          "endDate": "2013"
        }
      ],
      "skills": [
        {
          "name": "Java",
          "keywords": []
        },
        {
          "name": "Spring",
          "keywords": []
        },
        {
          "name": "Angular",
          "keywords": []
        }
      ]
    }
    """
    mock_organize.return_value = expected_json
    
    # Crear archivo PDF ficticio
    pdf_path = tmp_path / "cv_document.pdf"
    with open(pdf_path, 'wb') as f:
        f.write(b'cv pdf content')
    
    # Llamar a la función
    result = extract_text_pdf(str(pdf_path), "María Rodríguez López", "maria.rodriguez@example.com", "+34 612 345 678")
    
    # Verificar que organizeJSON se llamó con el texto del CV
    mock_organize.assert_called_once_with(
        cv_text, 
        "María Rodríguez López", 
        "maria.rodriguez@example.com", 
        "+34 612 345 678"
    )
    assert result == expected_json