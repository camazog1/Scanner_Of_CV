from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import scan, upload, processing

app = FastAPI()

app.include_router(scan.router) 
app.include_router(upload.router)
app.include_router(processing.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}