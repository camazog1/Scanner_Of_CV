import "@styles/index.css";

function App() {
  return (
    <div className="app-container">
      <h1>Bienvenid@!</h1>
      <h2>¿Cómo deseas subir la hoja de vida del aspirante?</h2>

      <div className="buttons-container">
        <button className="button-style">
          <i className="bi bi-file-earmark-minus-fill"></i> 
          <span>Subir PDF</span>
        </button>
        <button className="button-style">
          <i className="bi bi-camera-fill"></i> 
          <span>Tomar foto</span>
        </button>
        <button className="button-style">
          <i className="bi bi-image-fill"></i> 
          <span>Subir imagen de la galeria </span>
        </button>
      </div>
    </div>
  );
}

export default App;
