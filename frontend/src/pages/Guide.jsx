
import React from "react";
import GuideAccordion from "../components/GuideAccordion";

function Guide() {
  return (
    <div className="dashboard-container">
      <h1>¡Bienvenido!</h1>
      <h2>A continuación encontrarás la guía de uso de HireLens</h2>
      <GuideAccordion />
    </div>
  );
}

export default Guide;