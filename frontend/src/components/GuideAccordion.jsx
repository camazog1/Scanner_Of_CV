import React, { useState } from 'react';

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
      id: 'section1',
      title: '¿Cómo subir un PDF?',
      image: '/api/placeholder/400/300',
      content: 'Para editar la información de tu perfil, dirígete a la sección "Mi perfil" en el menú principal. Una vez allí, verás un botón de "Editar perfil" que te permitirá modificar tus datos personales, información de contacto y preferencias. Recuerda guardar los cambios antes de salir.'
    },
    {
      id: 'section2',
      title: '¿Cómo subir una foto?',
      image: '/api/placeholder/400/300',
      content: 'Para subir la hoja de vida de un aspirante, pulsa el botón central en la barra inferior (icono "Subir hoja de vida"). Luego, elige el método de carga que prefieras: tomar una foto con la cámara, seleccionar una imagen de tu galería, o subir un archivo PDF. Después de cargar el documento, la aplicación procesará automáticamente la información.'
    },
    {
      id: 'section3',
      title: '¿Cómo subir una imagen de la galeria?',
      image: '/api/placeholder/400/300',
      content: 'Para consultar hojas de vida que ya has subido, ve a la sección "Mi hoja de vida" en la barra de navegación inferior. Allí encontrarás un historial con todas las hojas de vida procesadas, ordenadas por fecha. Puedes filtrar por nombre, fecha o empresa para encontrar rápidamente el documento que buscas.'
    },
    {
      id: 'section4',
      title: '¿Cómo editar un CV?',
      image: '/api/placeholder/400/300',
      content: 'Para consultar hojas de vida que ya has subido, ve a la sección "Mi hoja de vida" en la barra de navegación inferior. Allí encontrarás un historial con todas las hojas de vida procesadas, ordenadas por fecha. Puedes filtrar por nombre, fecha o empresa para encontrar rápidamente el documento que buscas.'
    }
  ];

  return (
    <div className="guide-accordion mt-4">
      {sections.map((section) => (
        <div key={section.id} className="accordion-item mb-3 border rounded overflow-hidden">
          <div 
            className="accordion-header p-3 d-flex justify-content-between align-items-center"
            onClick={() => toggleSection(section.id)}
            style={{ 
              cursor: 'pointer',
              backgroundColor: activeSection === section.id ? '#f8f9fa' : 'white',
              borderBottom: activeSection === section.id ? '1px solid #dee2e6' : 'none'
            }}
          >
            <h3 className="fs-5 mb-0">{section.title}</h3>
            <i className={`bi bi-chevron-${activeSection === section.id ? 'up' : 'down'}`}></i>
          </div>
          
          {activeSection === section.id && (
            <div className="accordion-body p-3">
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuideAccordion;