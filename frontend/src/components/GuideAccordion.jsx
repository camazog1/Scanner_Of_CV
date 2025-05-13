import React, { useState } from "react";

const GuideAccordion = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (sectionId) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };

  const sections = [
    {
      id: "section1",
      title: "¿Cómo subir un PDF?",
      image: "/images/subir-pdf.jpg",
      content:
        'Para subir un PDF dale click al botón "Subir PDF", seguido a esto selecciona un archivo .PDF desde tu dispositivo.',
    },

    {
      id: "section2",
      title: "¿Cómo tomar una foto?",
      image: "/images/tomar-foto.jpg",
      content:
        'Para tomar una foto desde la web de HireLens, dale click al botón "Tomar Foto", esto abrirá la cámara para tomar la foto al documento que se quiera escanear. Para tomar la foto dale click al ícono de la cámara y después "Aceptar.',
    },
    {
      id: "section3",
      title: "¿Cómo subir una imagen de la galeria?",
      image: "images/subir-imagen.jpg",
      content:
        'Para subir una imagen desde la galeria de fotos del dispositivo, dale click al botón "Subir Imagen", seguido a esto selecciona la imagen que quieres escanear.',
    },
    {
      id: "section4",
      title: "¿Cómo editar un CV?",
      hasSubsections: true,
      subsections: [
        {
          title: "1. Revisión inicial",
          image: "images/edita-cv.jpeg",
          content:
            "Una vez subido el archivo para escanear, este será procesado y extraerá la información para poder ser editada. Revisa que los datos básicos hayan sido extraídos correctamente.",
        },
        {
          title: "2. Guardar la información",
          image: "images/finalizar-edicion.jpeg",
          content:
            'Después de edita la información del documento, para guardarla has click en "Finalizar Edición".',
        },
        {
          title: "3. Vista prevía y JSON",
          image: "images/vista-previa.jpeg",
          content:
            "Al finalizar la edición se mostrará una vista prevía del texto extraído y de los datos extraídos en formato JSON.",
        },
      ],
    },
  ];

  return (
    <div className="guide-accordion mt-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className="accordion-item mb-3 border rounded overflow-hidden"
        >
          <div
            className="accordion-header p-3 d-flex justify-content-between align-items-center"
            onClick={() => toggleSection(section.id)}
            style={{
              cursor: "pointer",
              backgroundColor:
                activeSection === section.id ? "#f8f9fa" : "white",
              borderBottom:
                activeSection === section.id ? "1px solid #dee2e6" : "none",
            }}
          >
            <h3 className="fs-5 mb-0">{section.title}</h3>
            <i
              className={`bi bi-chevron-${activeSection === section.id ? "up" : "down"}`}
            ></i>
          </div>

          {activeSection === section.id && (
            <div className="accordion-body p-3">
              {section.hasSubsections ? (
                <div className="subsections">
                  {section.subsections.map((subsection, index) => (
                    <div
                      key={index}
                      className="subsection mb-4 pb-4 border-bottom"
                    >
                      <h4 className="fs-6 mb-3 text-primary">
                        {subsection.title}
                      </h4>
                      <div className="row">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <img
                            src={subsection.image}
                            alt={subsection.title}
                            className="img-fluid rounded shadow-sm"
                          />
                        </div>
                        <div className="col-md-6">
                          <p>{subsection.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <img
                      src={section.image}
                      alt={`${section.title}`}
                      className="img-fluid rounded shadow-sm"
                    />
                  </div>
                  <div className="col-md-6">
                    <p>{section.content}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuideAccordion;
