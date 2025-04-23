import React from "react";
import GuideAccordion from "../components/GuideAccordion";
// Si decides crear un nuevo archivo CSS
import "../assets/styles/Guide.css"; 
// Alternativamente, si ya tienes el CSS de los acordeones importado, solo usa esa importación

function Guide() {
  return (
    <div className="guide-content">
      <h1 className="guide-title">Guía de uso de HireLens</h1>
      <div className="accordion-container">
        <GuideAccordion />
      </div>
    </div>
  );
}

export default Guide;