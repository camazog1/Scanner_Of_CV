import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditCV from "@components/EditCV";

function FileUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editComplete, setEditComplete] = useState(false);

  useEffect(() => {
    // Si hay datos procesados en la navegación, los establecemos en el estado
    if (location.state && location.state.processedData) {
      console.log("Datos procesados recibidos:", location.state.processedData);
      setProcessedData(location.state.processedData);
    }
    setLoading(false);
  }, [location]);

  // Función para manejar cuando la edición está completa
  const handleEditComplete = (updatedData) => {
    setProcessedData(updatedData);
    setEditComplete(true);
  };

  // Función para navegar a la página de previsualización
  const navigateToPreview = () => {
    navigate("/preview-json", { state: { jsonData: processedData } });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-100">
      {processedData ? (
        <div className="container">
          {!editComplete ? (
            <div className="alert alert-success mb-4" role="alert">
              <h4 className="alert-heading">¡Procesamiento exitoso!</h4>
              <p>
                El CV ha sido procesado correctamente. Puedes editar la
                información a continuación.
              </p>
            </div>
          ) : (
            <div className="alert alert-info mb-4" role="alert">
              <h4 className="alert-heading">Edición completada</h4>
              <p>
                Has completado la edición del CV. Ahora puedes previsualizar el
                resultado.
              </p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={navigateToPreview}>
                  <i className="bi bi-eye-fill me-2"></i>
                  Previsualizar CV
                </button>
              </div>
            </div>
          )}

          <EditCV
            initialData={processedData}
            onEditComplete={handleEditComplete}
          />
        </div>
      ) : (
        <EditCV />
      )}
    </div>
  );
}

export default FileUpload;
