import os
import shutil
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from google.cloud import vision
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
import os
import shutil
import json
import re

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/home/carlosm/Documentos/Projects/Scanner_of_CV/google_credentials.json"
load_dotenv()
router = APIRouter()

UPLOAD_DIR = Path("uploads") 
UPLOAD_DIR.mkdir(exist_ok=True) 

# ============================ ROUTES ============================

@router.post("/CV_Extraction/")
async def upload_file(name: str, email: str, phone: str, file: UploadFile = File(...)):
    allowed_types = ["image/png", "image/jpeg", "application/pdf"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, content={"error": "Invalid format."})
    
    if not is_valid_email(email):
        return JSONResponse(status_code=400, content={"error": "Invalid email format."})
    
    file_extension = Path(file.filename).suffix

    if file_extension != ".pdf":
        file_extension = ".png" 
    
    file.filename = f"file{file_extension}"

    file_path = UPLOAD_DIR / file.filename  
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)  

    return extract_text(file_path, name, email, phone)

# ============================ FUNCIONES ============================

def is_valid_email(email: str) -> bool:
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def extract_text(path: str, name: str, email: str, phone: str):

    file_extension = Path(path).suffix

    if file_extension == ".png":
        response = extract_text_image(name, email, phone)
    elif file_extension == ".pdf":
        response = extract_text_pdf(name, email, phone)
    else:
        response = "File extension not supported."

    response = response.replace("```json","").replace("```", "").removeprefix("\n").removesuffix("\n")
    print(response)
    data = json.loads(response)

    return data


def extract_text_image(name, email, phone):
    client_vision = vision.ImageAnnotatorClient()
    path_image = "uploads/file.png"

    with open(path_image, 'rb') as image_file:
        file = image_file.read()

    image = vision.Image(content=file)

    response_vision = client_vision.text_detection(image=image)
    texts = response_vision.text_annotations

    extracted_text = texts[0].description if texts else ""
    return organizeJSON(extracted_text, name, email, phone)

def extract_text_pdf(name, email, phone):
    client_vision = vision.ImageAnnotatorClient()
    path_pdf = "uploads/file.pdf"

    with open(path_pdf, 'rb') as pdf_file:
        content = pdf_file.read()

    feature = vision.Feature(type=vision.Feature.Type.DOCUMENT_TEXT_DETECTION)
    request = vision.AnnotateFileRequest(
        input_config=vision.InputConfig(
            content=content,
            mime_type="application/pdf"
        ),
        features=[feature]
    )

    response = client_vision.batch_annotate_files(requests=[request])

    extracted_text = ""
    for file_response in response.responses:
        for page_response in file_response.responses:
            if page_response.full_text_annotation:
                extracted_text += page_response.full_text_annotation.text

    return organizeJSON(extracted_text, name, email, phone)


def organizeJSON(extracted_text: str, name: str, email: str, phone: str) -> str:

    if not extracted_text:
        return "No se detectó texto en el archivo."

    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL")
    client_deepseek = OpenAI(api_key=api_key, base_url=base_url)

    with open('/home/carlosm/Documentos/Projects/Scanner_of_CV/docs/schema.json', 'r') as f:
        schema_content = json.dumps(json.load(f))

    with open('/home/carlosm/Documentos/Projects/Scanner_of_CV/docs/schema_with_example.json', 'r') as f:
        schema_example_content = json.dumps(json.load(f))

    response_deepseek = client_deepseek.chat.completions.create(
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
    return response_deepseek.choices[0].message.content