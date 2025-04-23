import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "@styles/PreviewJsonPage.css";

function PreviewJsonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay datos JSON en la navegación, los establecemos en el estado
    if (location.state && location.state.jsonData) {
      setJsonData(location.state.jsonData);
    } else {
      // Si no hay datos, podemos mostrar un mensaje o redirigir
      console.warn("No hay datos JSON para previsualizar");
    }
    setLoading(false);
  }, [location]);

  const handleBackToEdit = () => {
    // Volver a la página de edición con los datos actuales
    navigate("/file-upload", { state: { processedData: jsonData } });
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(20);
    doc.text("Curriculum Vitae", 105, 15, { align: "center" });

    // Datos básicos
    if (jsonData.basics) {
      doc.setFontSize(16);
      doc.text("Información Personal", 20, 30);

      doc.setFontSize(12);
      doc.text(`Nombre: ${jsonData.basics.name || ""}`, 20, 40);
      doc.text(`Email: ${jsonData.basics.email || ""}`, 20, 45);
      doc.text(`Teléfono: ${jsonData.basics.phone || ""}`, 20, 50);

      if (jsonData.basics.summary) {
        doc.text("Resumen:", 20, 55);
        const splitSummary = doc.splitTextToSize(jsonData.basics.summary, 170);
        doc.text(splitSummary, 20, 60);
      }
    }

    let yPosition = 80; // Posición vertical actual

    // Experiencia laboral
    if (jsonData.work && jsonData.work.length > 0) {
      doc.setFontSize(16);
      doc.text("Experiencia Laboral", 20, yPosition);
      yPosition += 10;

      jsonData.work.forEach((job, index) => {
        doc.setFontSize(12);
        doc.text(`${job.position || ""} en ${job.name || ""}`, 20, yPosition);
        yPosition += 5;

        if (job.startDate || job.endDate) {
          doc.text(
            `Periodo: ${job.startDate || ""} - ${job.endDate || "Actual"}`,
            20,
            yPosition,
          );
          yPosition += 5;
        }

        if (job.summary) {
          const splitJobSummary = doc.splitTextToSize(job.summary, 170);
          doc.text(splitJobSummary, 20, yPosition);
          yPosition += splitJobSummary.length * 5;
        }

        yPosition += 5;
      });
    }

    // Educación
    if (jsonData.education && jsonData.education.length > 0) {
      // Si la posición es muy baja, cambiamos de página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text("Educación", 20, yPosition);
      yPosition += 10;

      jsonData.education.forEach((edu) => {
        doc.setFontSize(12);
        doc.text(
          `${edu.studyType || ""} en ${edu.area || ""} - ${edu.institution || ""}`,
          20,
          yPosition,
        );
        yPosition += 5;

        if (edu.startDate || edu.endDate) {
          doc.text(
            `Periodo: ${edu.startDate || ""} - ${edu.endDate || "Actual"}`,
            20,
            yPosition,
          );
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    // Habilidades
    if (jsonData.skills && jsonData.skills.length > 0) {
      // Si la posición es muy baja, cambiamos de página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text("Habilidades", 20, yPosition);
      yPosition += 10;

      jsonData.skills.forEach((skill) => {
        doc.setFontSize(12);
        doc.text(`${skill.name || ""} (${skill.level || ""})`, 20, yPosition);
        yPosition += 5;

        if (skill.keywords && skill.keywords.length > 0) {
          doc.text(`Keywords: ${skill.keywords.join(", ")}`, 20, yPosition);
          yPosition += 5;
        }

        yPosition += 3;
      });
    }

    // Añadir metadatos al PDF
    doc.setProperties({
      title: `CV - ${jsonData.basics?.name || "Anónimo"}`,
      subject: "Curriculum Vitae",
      creator: "HireLens Application",
      author: jsonData.basics?.name || "Anónimo",
    });

    // Guardar el PDF
    doc.save(
      `cv-${jsonData.basics?.name.replace(/\s+/g, "-").toLowerCase() || "anonimo"}.pdf`,
    );
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch("http://localhost:3000/save-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jsonData }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Datos guardados exitosamente en la base de datos!");
      } else {
        alert(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error);
      alert("Hubo un error al guardar los datos.");
    }
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

  if (!jsonData) {
    return (
      <div className="alert alert-warning m-4">
        No hay datos para previsualizar. <br />
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ marginTop: "4rem" }}>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">Previsualización del CV</h2>

          <div className="d-flex gap-2 mb-4">
            <button className="btn btn-secondary" onClick={handleBackToEdit}>
              <i className="bi bi-pencil-square me-2"></i>
              Volver a Editar
            </button>
            <button className="btn btn-success" onClick={downloadAsPDF}>
              <i className="bi bi-file-earmark-pdf me-2"></i>
              Descargar como PDF
            </button>
            <button className="btn btn-info" onClick={saveToDatabase}>
              <i className="bi bi-save me-2"></i>
              Guardar en Base de Datos
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Vista Previa</h3>
            </div>
            <div className="card-body">
              {jsonData.basics && (
                <div className="mb-4">
                  <h4>{jsonData.basics.name}</h4>
                  <p>{jsonData.basics.label}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Email:</strong> {jsonData.basics.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {jsonData.basics.phone}
                      </p>
                    </div>
                    <div className="col-md-6">
                      {jsonData.basics.url && (
                        <p>
                          <strong>Web:</strong> {jsonData.basics.url}
                        </p>
                      )}
                      {jsonData.basics.location &&
                        jsonData.basics.location.city && (
                          <p>
                            <strong>Ubicación:</strong>{" "}
                            {jsonData.basics.location.city},{" "}
                            {jsonData.basics.location.region}
                          </p>
                        )}
                    </div>
                  </div>
                  {jsonData.basics.summary && (
                    <div>
                      <h5>Resumen</h5>
                      <p>{jsonData.basics.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {jsonData.work && jsonData.work.length > 0 && (
                <div className="mb-4">
                  <h5>Experiencia Laboral</h5>
                  {jsonData.work.map((item, index) => (
                    <div key={`work-${index}`} className="mb-3">
                      <h6>
                        {item.position} - {item.name}
                      </h6>
                      <p className="text-muted">
                        {item.startDate} - {item.endDate || "Actual"}
                      </p>
                      <p>{item.summary}</p>
                      {item.highlights && item.highlights.length > 0 && (
                        <ul>
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {jsonData.education && jsonData.education.length > 0 && (
                <div className="mb-4">
                  <h5>Educación</h5>
                  {jsonData.education.map((item, index) => (
                    <div key={`edu-${index}`} className="mb-3">
                      <h6>
                        {item.studyType} en {item.area} - {item.institution}
                      </h6>
                      <p className="text-muted">
                        {item.startDate} - {item.endDate || "Actual"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {jsonData.skills && jsonData.skills.length > 0 && (
                <div className="mb-4">
                  <h5>Habilidades</h5>
                  <div className="row">
                    {jsonData.skills.map((skill, index) => (
                      <div key={`skill-${index}`} className="col-md-4 mb-2">
                        <div className="border rounded p-2">
                          <h6>{skill.name}</h6>
                          <p className="mb-1">{skill.level}</p>
                          {skill.keywords && (
                            <small className="text-muted">
                              {skill.keywords.join(", ")}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title mb-0">JSON</h3>
            </div>
            <div className="card-body">
              <pre
                style={{
                  maxHeight: "500px",
                  overflow: "auto",
                  fontSize: "0.8rem",
                  backgroundColor: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                }}
              >
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewJsonPage;
