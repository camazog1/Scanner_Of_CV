import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@styles/FilePreview.css"; // Asegúrate de tener los estilos base aquí

function FilePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeData = location.state?.resumeData;

  const handleEdit = () => {
    navigate("/file-upload", {
      state: {
        resumeData,
        fromPreview: true
      }
    });
  };

  const handleSend = () => {
    console.log("Enviando...", resumeData);
    // Aquí podrías hacer la lógica para enviar la info
  };

  return (
    <div className="file-preview" style={{ textAlign: "center", padding: "2rem" }}>
      <h2 style={{ fontWeight: "bold" }}>Hoja de vida #COHS2025</h2>

      <div
        style={{
          backgroundColor: "#D9D9D9",
          borderRadius: "20px",
          width: "220px",
          margin: "1.5rem auto",
          padding: "1rem",
        }}
      >
        <img
          src="/img/placeholder.png" // usa aquí una imagen tuya o la que subiste
          alt="Preview"
          style={{ width: "80px", height: "80px", margin: "auto" }}
        />
        <p style={{ fontWeight: "bold", marginTop: "1rem" }}>Fecha de creación</p>
        <p style={{ fontSize: "0.9rem", color: "#444" }}>09/02/2023</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "60%", margin: "auto" }}>
        <button
          style={{
            backgroundColor: "#07008C",
            color: "white",
            padding: "0.7rem",
            borderRadius: "10px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleEdit}
        >
          Editar ✏️
        </button>

        <button
          style={{
            backgroundColor: "#22D97E",
            color: "white",
            padding: "0.7rem",
            borderRadius: "10px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleSend}
        >
          Enviar 🚀
        </button>
      </div>
    </div>
  );
}

export default FilePreview;
