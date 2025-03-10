import requests

API_URL = "http://127.0.0.1:8000"

def subir_archivo(file_path):
    """Sube una imagen a la API y devuelve la ruta del archivo subido."""
    url = f"{API_URL}/upload/"
    
    # Especificamos el tipo MIME manualmente
    files = {
        "file": (file_path, open(file_path, "rb"), "image/jpeg")
    }

    response = requests.post(url, files=files)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Archivo subido correctamente: {data['filename']}")
        return data["path"]
    else:
        print("❌ Error al subir archivo:", response.json())
        return None

if __name__ == "__main__":
    imagen_path = "imagen.jpg"
    ruta_archivo = subir_archivo(imagen_path)