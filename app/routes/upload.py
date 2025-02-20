import os
import shutil
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

UPLOAD_DIR = Path("uploads") 
UPLOAD_DIR.mkdir(exist_ok=True) 

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    allowed_types = ["image/png", "image/jpeg", "application/pdf"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato no permitido")
    
    file.filename = file.filename.replace(" ", "_")

    file_path = UPLOAD_DIR / file.filename  
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)  

    return {"filename": file.filename, "content_type": file.content_type, "path": str(file_path), "URL": f"/files/{file.filename}"}
