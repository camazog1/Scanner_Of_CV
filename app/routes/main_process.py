import os
import shutil
import json
import re
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from google.cloud import vision
from openai import OpenAI
from dotenv import load_dotenv

# Cargar variables de entorno de .env
load_dotenv()

# Obtener la ruta de las credenciales de la variable de entorno o usar una ruta relativa
BASE_DIR = Path(__file__).resolve().parent.parent.parent
credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH", str(BASE_DIR / "google_credentials.json"))

if not os.path.exists(credentials_path):
    raise FileNotFoundError(f"Google credentials file not found at: {credentials_path}")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

router = APIRouter()

UPLOAD_DIR = Path("uploads") 
UPLOAD_DIR.mkdir(exist_ok=True) 

# ========================== ROUTES ==========================

@router.post("/CV_Extraction/")
async def upload_file(name: str, email: str, phone: str, file: UploadFile = File(...)):
    allowed_types = ["image/png", "image/jpeg", "application/pdf"]
    
    try:
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file format.")

        if not is_valid_email(email):
            return JSONResponse(status_code=400, content={"error": "Invalid email format."})
        
        file_extension = Path(file.filename).suffix
        file_extension = ".png" if file_extension != ".pdf" else ".pdf"
        file.filename = f"file{file_extension}"
        file_path = UPLOAD_DIR / file.filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return extract_text(file_path, name, email, phone)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Upload error: {str(e)}"})

# ========================== FUNTIONS ==========================

def is_valid_email(email: str) -> bool:
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def extract_text(path: str, name: str, email: str, phone: str):
    try:
        file_extension = Path(path).suffix
        if file_extension == ".png":
            response = extract_text_image(name, email, phone)
        elif file_extension == ".pdf":
            response = extract_text_pdf(name, email, phone)
        else:
            raise ValueError("Unsupported file extension.")

        response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        return data

    except json.JSONDecodeError as je:
        return JSONResponse(status_code=500, content={"error": f"JSON decoding failed: {str(je)}"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Text extraction error: {str(e)}"})

def extract_text_image(name, email, phone):
    try:
        client_vision = vision.ImageAnnotatorClient()
        path_image = "uploads/file.png"

        with open(path_image, 'rb') as image_file:
            file = image_file.read()

        image = vision.Image(content=file)
        response_vision = client_vision.text_detection(image=image)
        texts = response_vision.text_annotations

        extracted_text = texts[0].description if texts else ""
        return organizeJSON(extracted_text, name, email, phone)

    except Exception as e:
        raise RuntimeError(f"Image text extraction failed: {str(e)}")

def extract_text_pdf(name, email, phone):
    try:
        client_vision = vision.ImageAnnotatorClient()
        path_pdf = "uploads/file.pdf"

        with open(path_pdf, 'rb') as pdf_file:
            content = pdf_file.read()

        request = vision.AnnotateFileRequest(
            input_config=vision.InputConfig(
                content=content,
                mime_type="application/pdf"
            ),
            features=[vision.Feature(type=vision.Feature.Type.DOCUMENT_TEXT_DETECTION)]
        )

        response = client_vision.batch_annotate_files(requests=[request])

        extracted_text = ""
        for file_response in response.responses:
            for page_response in file_response.responses:
                if page_response.full_text_annotation:
                    extracted_text += page_response.full_text_annotation.text

        return organizeJSON(extracted_text, name, email, phone)

    except Exception as e:
        raise RuntimeError(f"PDF text extraction failed: {str(e)}")

def organizeJSON(extracted_text: str, name: str, email: str, phone: str) -> str:
    try:
        if not extracted_text.strip():
            raise ValueError("No text detected in the file.")

        api_key = os.getenv("DEEPSEEK_API_KEY")
        base_url = os.getenv("DEEPSEEK_BASE_URL")
        if not api_key or not base_url:
            raise EnvironmentError("Missing DeepSeek API credentials.")

        client_deepseek = OpenAI(api_key=api_key, base_url=base_url)

        # Obtener las rutas a los archivos de esquema utilizando rutas relativas
        schema_path = BASE_DIR / "docs" / "schema.json"
        schema_example_path = BASE_DIR / "docs" / "schema_with_example.json"

        with open(schema_path, 'r') as f:
            schema_content = json.dumps(json.load(f))
        with open(schema_example_path, 'r') as f:
            schema_example_content = json.dumps(json.load(f))

        response = client_deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Organize and correct the following extracted text into the provided schema format (schema.json) without adding additional information or explanations. Use the schema_with_example.json as a reference for how the schema should be filled. Include the provided name, email, and phone for better accuracy."},
                {"role": "user", "content": f"Schema: {schema_content}"},
                {"role": "user", "content": f"Schema Example: {schema_example_content}"},
                {"role": "user", "content": f"Extracted Text: {extracted_text}"},
                {"role": "user", "content": f"Name: {name}, Email: {email}, Phone: {phone}"}
            ],
            stream=False
        )

        return response.choices[0].message.content

    except FileNotFoundError as fnf:
        raise RuntimeError(f"Schema file missing: {str(fnf)}")
    except Exception as e:
        raise RuntimeError(f"DeepSeek formatting failed: {str(e)}")