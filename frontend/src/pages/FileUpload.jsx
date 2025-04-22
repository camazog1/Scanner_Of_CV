import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditCV from "@components/EditCV";

function FileUpload() {
  const location = useLocation();
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay datos procesados en la navegación, los establecemos en el estado
    if (location.state && location.state.processedData) {
      console.log("Datos procesados recibidos:", location.state.processedData);
      setProcessedData(location.state.processedData);
    }
    setLoading(false);
  }, [location]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
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
          <div className="alert alert-success mb-4" role="alert">
            <h4 className="alert-heading">¡Procesamiento exitoso!</h4>
            <p>El CV ha sido procesado correctamente. Puedes editar la información a continuación.</p>
          </div>
          
          <EditCV initialData={processedData} />
        </div>
      ) : (
        <EditCV />
      )}
    </div>
  );
}

export default FileUpload;