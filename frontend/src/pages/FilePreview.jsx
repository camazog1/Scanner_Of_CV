// frontend/src/pages/FilePreview.jsx
import React, { useState, useEffect } from "react";
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
  
  // Estado para controlar el tiempo de visualización del error
  const [errorTimeout, setErrorTimeout] = useState(null);

  // Efecto para limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  if (!file) {
    return (
      <div className="alert alert-warning m-4">
        No se seleccionó ningún archivo. <br />
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate("/");
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleConfirm = async () => {
    // Limpiar errores anteriores
    setError(null);
    
    // Validar que se hayan ingresado los datos requeridos
    if (!userData.name.trim()) {
      setError("Por favor, ingresa el nombre del aspirante.");
      return;
    }
    
    if (!userData.email.trim()) {
      setError("Por favor, ingresa el correo electrónico del aspirante.");
      return;
    }
    
    if (!userData.phone.trim()) {
      setError("Por favor, ingresa el número de teléfono del aspirante.");
      return;
    }

    // Validar formato de correo electrónico
    if (!validateEmail(userData.email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log("Enviando archivo:", typeof file === 'string' ? 'Imagen capturada' : file.name);
      console.log("Datos de usuario:", userData);

      // Enviar el archivo a la API
      const response = await uploadCV(file, userData);
      
      // Procesar la respuesta exitosa
      console.log("Respuesta de la API:", response);
      setSuccess("¡Archivo procesado correctamente!");
      
      // Navegar a la pantalla de edición con los datos procesados
      setTimeout(() => {
        navigate("/file-upload", { state: { processedData: response } });
      }, 1500);
      
    } catch (err) {
      // Manejar errores
      console.error("Error al procesar el archivo:", err);
      setError(`Error al procesar el archivo: ${err.message}`);
      
      // Configurar un timeout para limpiar el error después de 10 segundos
      const timeout = setTimeout(() => {
        setError(null);
      }, 10000);
      
      setErrorTimeout(timeout);
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar el tipo de archivo para mostrar la vista previa
  const getFilePreview = () => {
    if (typeof file === "string") {
      // Es una imagen base64 (capturada con la cámara)
      return <img src={file} alt="preview" className="preview-image" />;
    } else if (file.type.startsWith("image/")) {
      // Es un archivo de imagen subido
      return <img src={URL.createObjectURL(file)} alt="preview" className="preview-image" />;
    } else {
      // Es un PDF
      return <embed src={URL.createObjectURL(file)} type={file.type} className="preview-pdf" />;
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
            {getFilePreview()}
          </div>
          <div className="file-info mb-4">
            <h5>Información del archivo:</h5>
            <p>
              <strong>Tipo:</strong> {typeof file === 'string' ? 'Imagen capturada' : file.type} <br />
              <strong>Tamaño:</strong> {typeof file === 'string' ? 'N/A' : `${(file.size / 1024).toFixed(2)} KB`} <br />
              <strong>Nombre:</strong> {typeof file === 'string' ? 'capture.jpg' : file.name}
            </p>
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