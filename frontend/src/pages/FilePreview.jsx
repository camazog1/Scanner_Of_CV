import React, { useState, useEffect, useMemo } from "react";
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
    phone: "",
  });

  // Estado para manejar el proceso de carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
      <div className="container mt-5">
        <div className="alert alert-warning p-4 shadow-sm">
          <h4 className="alert-heading">No se seleccionó ningún archivo</h4>
          <p>Por favor, seleccione un archivo o capture una imagen para continuar.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
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

      console.log(
        "Enviando archivo:",
        typeof file === "string" ? "Imagen capturada" : file.name,
      );
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

  // Memorizar la vista previa del archivo
  const filePreview = useMemo(() => {
    if (typeof file === "string") {
      // Es una imagen base64 (capturada con la cámara)
      return (
        <div className="preview-container">
          <img src={file} alt="Vista previa de la imagen" className="img-fluid rounded shadow" />
        </div>
      );
    } else if (file.type.startsWith("image/")) {
      // Es un archivo de imagen subido
      return (
        <div className="preview-container">
          <img
            src={URL.createObjectURL(file)}
            alt="Vista previa de la imagen"
            className="img-fluid rounded shadow"
          />
        </div>
      );
    } else {
      // Es un PDF
      return (
        <div className="preview-container pdf-container">
          <embed
            src={URL.createObjectURL(file)}
            type={file.type}
            className="pdf-preview"
          />
        </div>
      );
    }
  }, [file]); // Solo se recalcula si `file` cambia

  return (
    <div className="file-preview-page">
      {/* Overlay de carga */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-black">Procesando archivo, por favor espere...</p>
          </div>
        </div>
      )}
      
      <div className="preview-card">
        <div className="preview-layout">
          {/* Columna de vista previa */}
          <div className="preview-column">
            <div className="p-4">
              {filePreview} {/* Usar la vista previa memorizada */}
              
              <div className="file-info mt-3">
                <h5 className="border-bottom pb-2">Información del archivo</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-light">
                    <i className="bi bi-file-earmark me-2"></i>
                    <strong>Tipo:</strong> {typeof file === "string" ? "Imagen capturada" : file.type}
                  </li>
                  <li className="list-group-item bg-light">
                    <i className="bi bi-hdd me-2"></i>
                    <strong>Tamaño:</strong> {typeof file === "string"
                      ? "N/A"
                      : `${(file.size / 1024).toFixed(2)} KB`}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Columna de formulario */}
          <div className="form-column">
            <div className="p-4">
              <h4 className="mb-4 text-center"><b>Datos del Aspirante</b></h4>
              
              {/* Formulario de datos del usuario */}
              <UserForm userData={userData} setUserData={setUserData} />
              
              {/* Mensajes de error o éxito */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </div>
              )}
              
              {/* Botones */}
              <div className="button-controls mt-4">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleGoBack}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Confirmar y Procesar
                    </>
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