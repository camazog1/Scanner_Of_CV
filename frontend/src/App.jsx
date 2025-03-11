import React from 'react';
import { useNavigate } from 'react-router-dom';
import "@styles/index.css";
import Button from './components/Button';

function App() {
  const navigate = useNavigate();

  const handleButtonClick = (action) => {
    if (action === 'takePhoto') {
      navigate('/camera');
    }
  };

  return (
    <div className="app-container">
      <h1>Bienvenid@!</h1>
      <h2>¿Cómo deseas subir la hoja de vida del aspirante?</h2>

      <div className="buttons-container">
        <Button 
          iconClass="bi bi-file-earmark-minus-fill" 
          text="Subir PDF" 
          action="uploadPDF" 
        />
        <Button 
          iconClass="bi bi-camera-fill" 
          text="Tomar foto" 
          action="takePhoto" 
          onClick={() => handleButtonClick('takePhoto')}
        />
        <Button 
          iconClass="bi bi-image-fill" 
          text="Subir imagen de la galeria" 
          action="uploadImage" 
        />
      </div>
    </div>
  );
}

export default App;