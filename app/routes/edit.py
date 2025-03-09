from fastapi import APIRouter, HTTPException
import json
import os
from pathlib import Path

router = APIRouter()

def update_nested_dict(current_dict, updated_dict):
    """
    Función recursiva para actualizar solo los campos proporcionados en un diccionario anidado.
    """
    for key, value in updated_dict.items():
        if isinstance(value, dict) and key in current_dict:
            # Si el valor es un diccionario y existe en el JSON actual, actualiza recursivamente
            update_nested_dict(current_dict[key], value)
        else:
            # Si no, actualiza el campo directamente
            current_dict[key] = value
    return current_dict

@router.put("/edit_json/")
async def edit_json(json_path: str, updated_json: dict):
    """
    Permite editar solo los campos especificados en el JSON sin perder los demás.
    """
    # Verificar si el archivo JSON existe
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="No hay un JSON existente para editar.")

    # Leer el contenido actual del JSON
    with open(json_path, "r", encoding="utf-8") as f:
        current_json = json.load(f)

    # Actualizar solo los campos proporcionados
    updated_json = update_nested_dict(current_json, updated_json)

    # Guardar los cambios
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(updated_json, f, indent=4)

    return {
        "message": "JSON actualizado correctamente",
        "updated_json": updated_json
    }