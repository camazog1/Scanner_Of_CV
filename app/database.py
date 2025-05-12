import sqlite3
from passlib.context import CryptContext

# Configuración para cifrar contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear la base de datos y la tabla de usuarios
def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            token TEXT
        )
    """)
    conn.commit()
    conn.close()

# Función para agregar un usuario
def add_user(username: str, password: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    hashed_password = pwd_context.hash(password)
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
    conn.commit()
    conn.close()

# Función para verificar usuario y contraseña
def verify_user(username: str, password: str) -> bool:
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return pwd_context.verify(password, result[0])
    return False

# Función para guardar un token
def save_token(username: str, token: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET token = ? WHERE username = ?", (token, username))
    conn.commit()
    conn.close()

# Función para verificar un token
def verify_token(token: str) -> bool:
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT token FROM users WHERE token = ?", (token,))
    result = cursor.fetchone()
    conn.close()
    return result is not None