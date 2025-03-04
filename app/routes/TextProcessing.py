from fastapi import APIRouter
from google.cloud import vision
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
import os
import shutil
import fitz

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google_credentials.json"
load_dotenv()

router = APIRouter()

@router.get("/extract_text")
async def extract_text(path: str):
    file_extension = Path(path).suffix

    if file_extension == ".png":
        response = extract_text_image()
    elif file_extension == ".pdf":
        response = extract_text_pdf()
    else:
        response = "File extension not supported."

    return {"response": response}

def extract_text_image():
    client_vision = vision.ImageAnnotatorClient()
    path_image = "uploads/image.png"

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

        response_deepseek = client_deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Organize and correct the following text, without adding additional information or explanations. Only the organized and corrected text is returned:"},
                {"role": "user", "content": extracted_text}
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

        response_deepseek = client_deepseek.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Organize and correct the following text, without adding additional information or explanations. Only the organized and corrected text is returned:"},
                {"role": "user", "content": extracted_text}
            ],
            stream=False
        )
        response = response_deepseek.choices[0].message.content
    else:
        response = "No se detectó texto en el PDF."

    shutil.rmtree("uploads")
    return response