from fastapi import APIRouter
from fastapi.responses import JSONResponse
from google.cloud import vision
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
import os
import shutil
import fitz
import json
import re

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google_credentials.json"
load_dotenv()

router = APIRouter()

# Función para guardar el JSON en un archivo
def save_json(data, filename):
    json_storage_dir = Path("json_storage")
    json_storage_dir.mkdir(exist_ok=True)  # Crear el directorio si no existe
    file_path = json_storage_dir / filename
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    return str(file_path)

@router.get("/extract_text")
async def extract_text(path: str):
    file_extension = Path(path).suffix

    if file_extension == ".png":
        response = extract_text_image()
    elif file_extension == ".pdf":
        response = extract_text_pdf()
    else:
        response = "File extension not supported."

    # Eliminar ```json
    response = response.replace("```json","").replace("```", "").removeprefix("\n").removesuffix("\n")
    print(response)
    data = json.loads(response)

    # Guardar el JSON generado
    json_filename = "transcribed.json"
    json_path = save_json(data, json_filename)

    return data  # Devuelve el JSON sin cambios

def extract_text_image():
    client_vision = vision.ImageAnnotatorClient()
    path_image = "uploads/file.png"

    with open(path_image, 'rb') as image_file:
        file = image_file.read()

    image = vision.Image(content=file)

    response_vision = client_vision.text_detection(image=image)
    texts = response_vision.text_annotations

    if texts:
        extracted_text = texts[0].description
        api_key = os.getenv("DEEPSEEK_API_KEY")
        base_url = os.getenv("DEEPSEEK_BASE_URL")
        client_deepseek = OpenAI(api_key=api_key, base_url=base_url)

        with open('docs/schema.json', 'r') as f:
            schema_content = json.dumps(json.load(f)) 

        with open('docs/schema_with_example.json', 'r') as f:
            schema_example_content = json.dumps(json.load(f)) 

        response_deepseek = client_deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Organize and correct the following extracted text into the provided schema format (schema.json) without adding additional information or explanations. Use the schema_with_example.json as a reference for how the schema should be filled. Only return the organized and corrected text in the required schema format."},
                {"role": "user", "content": f"Schema: {schema_content}"},
                {"role": "user", "content": f"Schema Example: {schema_example_content}"},
                {"role": "user", "content": f"Extracted Text: {extracted_text}"}
            ],
            stream=False
        )
        response = response_deepseek.choices[0].message.content

    else:
        response = "No se detectó texto en la imagen."

    shutil.rmtree("uploads")
    return response

def extract_text_pdf():
    path_pdf = "uploads/file.pdf"

    pdf_document = fitz.open(path_pdf)
    extracted_text = ""

    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        extracted_text += page.get_text()

    pdf_document.close()

    if extracted_text:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        base_url = os.getenv("DEEPSEEK_BASE_URL")
        client_deepseek = OpenAI(api_key=api_key, base_url=base_url)

        with open('docs/schema.json', 'r') as f:
            schema_content = json.dumps(json.load(f)) 

        with open('docs/schema_with_example.json', 'r') as f:
            schema_example_content = json.dumps(json.load(f)) 

        response_deepseek = client_deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Organize and correct the following extracted text into the provided schema format (schema.json) without adding additional information or explanations. Use the schema_with_example.json as a reference for how the schema should be filled. Only return the organized and corrected text in the required schema format."},
                {"role": "user", "content": f"Schema: {schema_content}"},
                {"role": "user", "content": f"Schema Example: {schema_example_content}"},
                {"role": "user", "content": f"Extracted Text: {extracted_text}"}
            ],
            stream=False
        )
        response = response_deepseek.choices[0].message.content
    else:
        response = "No se detectó texto en el PDF."

    shutil.rmtree("uploads")
    return response