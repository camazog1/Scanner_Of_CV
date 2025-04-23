import React from "react";
import { useNavigate } from "react-router-dom";
import "@styles/index.css";
import "@styles/App.css";

function App() {
  const navigate = useNavigate();

  const handleButtonClick = (action) => {
    if (action === "takePhoto") {
      navigate("/camera");
    } else if (action === "uploadPDF") {
      document.getElementById("pdfInput").click();
    } else if (action === "uploadImage") {
      document.getElementById("imageInput").click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Archivo seleccionado:", file.name);
      navigate("/file-preview", { state: { file } });
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Bienvenido a HireLens</h1>
        <p className="welcome-subtitle">
          Escanea y digitaliza hojas de vida en segundos
        </p>
      </div>

      <div className="upload-section">
        <h2 className="upload-title">¿Cómo deseas subir la hoja de vida del aspirante?</h2>
        
        <div className="upload-options">
          <div className="upload-option" onClick={() => handleButtonClick("uploadPDF")}>
            <div className="option-icon-container pdf-bg">
              <i className="bi bi-file-earmark-pdf"></i>
            </div>
            <h3>Subir PDF</h3>
            <p>Selecciona un archivo PDF desde tu dispositivo</p>
            <button className="option-button">
              <i className="bi bi-file-earmark-arrow-up"></i> Seleccionar PDF
            </button>
            <input
              type="file"
              id="pdfInput"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="upload-option" onClick={() => handleButtonClick("takePhoto")}>
            <div className="option-icon-container camera-bg">
              <i className="bi bi-camera"></i>
            </div>
            <h3>Tomar foto</h3>
            <p>Utiliza la cámara para capturar una imagen del CV</p>
            <button className="option-button">
              <i className="bi bi-camera-fill"></i> Abrir cámara
            </button>
          </div>

          <div className="upload-option" onClick={() => handleButtonClick("uploadImage")}>
            <div className="option-icon-container gallery-bg">
              <i className="bi bi-images"></i>
            </div>
            <h3>Subir imagen</h3>
            <p>Selecciona una imagen desde tu galería</p>
            <button className="option-button">
              <i className="bi bi-image"></i> Seleccionar imagen
            </button>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      <div className="help-section">
        <p>
          <i className="bi bi-info-circle"></i> ¿Necesitas ayuda? Consulta nuestra{" "}
          <a href="/guide" className="guide-link">
            guía de uso
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;