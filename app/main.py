from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import main_process

app = FastAPI()

app.include_router(main_process.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}