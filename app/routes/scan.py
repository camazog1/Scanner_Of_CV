from fastapi import APIRouter

router = APIRouter()

@router.get("/scan")
def get_users():
    return {"message": "Bienvenido al scanner"}