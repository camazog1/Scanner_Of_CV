from fastapi import FastAPI
from app.routes import scan 

app = FastAPI()

app.include_router(scan.router) 

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}