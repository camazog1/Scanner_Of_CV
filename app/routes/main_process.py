import jwt
import datetime
import os
import shutil
import json
import re
import time
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# ========================== TOKEN ==========================

SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_muy_segura")  # ¡No uses una clave tan simple en producción!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

security = HTTPBearer()

async def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != os.getenv("API_TOKEN"):
        raise HTTPException(status_code=401, detail="Invalid API token")
    return token

@router.post("/token")
async def login(username: str, password: str):
    if username == "testuser" and password == "testpass":
        access_token_data = {"sub": username}
        access_token = create_access_token(access_token_data)
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

# ========================== ROUTES ==========================

@router.post("/CV_Extraction/", dependencies=[Depends(get_token)])
async def upload_file(name: str, email: str, phone: str, file: UploadFile = File(...)):
    allowed_types = ["image/png", "image/jpeg", "application/pdf"]
    
    try:
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file format.")

        if not is_valid_email(email):
            return JSONResponse(status_code=400, content={"error": "Invalid email format."})
        
        # Generar un nombre único para el archivo
        unique_id = str(uuid.uuid4())[:8]
        timestamp = int(time.time())
        file_extension = Path(file.filename).suffix
        file_extension = ".png" if file_extension not in [".pdf", ".png", ".jpg", ".jpeg"] else file_extension
        
        unique_filename = f"file_{timestamp}_{unique_id}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename

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
        file_extension = path.suffix
        if file_extension.lower() in [".png", ".jpg", ".jpeg"]:
            response = extract_text_image(path, name, email, phone)
        elif file_extension.lower() == ".pdf":
            response = extract_text_pdf(path, name, email, phone)
        else:
            raise ValueError(f"Unsupported file extension: {file_extension}")
        
        response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        return data

    except json.JSONDecodeError as je:
        return JSONResponse(status_code=500, content={"error": f"JSON decoding failed: {str(je)}"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Text extraction error: {str(e)}"})

def extract_text_image(path: str, name: str, email: str, phone: str):
    try:
        client_vision = vision.ImageAnnotatorClient()

        with open(path, 'rb') as image_file:
            file = image_file.read()

        image = vision.Image(content=file)
        response_vision = client_vision.text_detection(image=image)
        texts = response_vision.text_annotations

        extracted_text = texts[0].description if texts else ""
        return organizeJSON(extracted_text, name, email, phone)

    except Exception as e:
        raise RuntimeError(f"Image text extraction failed: {str(e)}")

def extract_text_pdf(path: str, name: str, email: str, phone: str):
    try:
        client_vision = vision.ImageAnnotatorClient()

        with open(path, 'rb') as pdf_file:
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
            {"role": "user", "content": "Organize and correct the following extracted text according to the provided "
            "schema format (schema.json). Use schema_with_example.json as a reference for how the schema should be "
            "completed. Fill in as many fields as possible using the extracted text and the provided name, email, and "
            "phone number. If any spelling or grammar mistakes are found, try to correct them using the context of the "
            "text and the provided information. Note that some resumes may contain additional or unstructured "
            "information—if you find loose or disorganized data, try to assign it to the appropriate section in the "
            "schema based on its context, without making up or modifying content. "
            "Very important: if any field is missing from the extracted text, it must remain exactly as in the original "
            "schema—do not remove or modify it. The output must be only the final complete JSON. Do not include any "
            "comments, explanations, or extra text—just the JSON."},
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