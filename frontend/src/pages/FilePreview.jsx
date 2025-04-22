import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";
import { uploadCV } from "../services/api";
import "@styles/FilePreview.css";

function FilePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { file } = location.state || {};

  // Estado para manejar datos del usuario
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Estado para manejar el proceso de carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!file) {
    return <div>No se seleccionó ningún archivo.</div>;
  }

  const handleGoBack = () => {
    navigate("/");
  };

  const handleConfirm = async () => {
    // Validar que se hayan ingresado los datos requeridos
    if (!userData.name || !userData.email || !userData.phone) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Enviar el archivo a la API
      const response = await uploadCV(file, userData);
      
      // Procesar la respuesta exitosa
      console.log("Respuesta de la API:", response);
      setSuccess("¡Archivo procesado correctamente!");
      
      // Navegar a la pantalla de edición con los datos procesados
      setTimeout(() => {
        navigate("/file-upload", { state: { processedData: response } });
      }, 2000);
      
    } catch (err) {
      // Manejar errores
      console.error("Error al procesar el archivo:", err);
      setError(`Error al procesar el archivo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-preview">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Procesando archivo, por favor espere...</p>
        </div>
      )}

      <div className="row w-100">
        <div className="col-md-6">
          <div className="file-container mb-4">
            {typeof file === "string" ? (
              <img src={file} alt="preview" className="preview-image" />
            ) : file.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(file)} alt="preview" className="preview-image" />
            ) : (
              <embed src={URL.createObjectURL(file)} type={file.type} className="preview-pdf" />
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Confirmar Archivo</h3>
              
              {/* Formulario de datos del usuario */}
              <UserForm userData={userData} setUserData={setUserData} />
              
              {/* Mensajes de error o éxito */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              {/* Botones */}
              <div className="button-container">
                <button
                  className="btn btn-secondary me-2"
                  onClick={handleGoBack}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    "Confirmar y Procesar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilePreview;