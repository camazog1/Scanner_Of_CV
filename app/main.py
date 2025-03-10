from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import scan, upload, TextProcessing, edit

app = FastAPI()

app.include_router(scan.router) 
app.include_router(upload.router)
app.include_router(TextProcessing.router)
app.include_router(edit.router) 
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}