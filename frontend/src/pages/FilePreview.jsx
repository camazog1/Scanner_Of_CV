import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@styles/FilePreview.css'; // Importa el archivo CSS

function FilePreview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { file } = location.state || {};

    if (!file) {
        return <div>No se seleccionó ningún archivo.</div>;
    }

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="file-preview">
            <div className="file-container">
                {typeof file === 'string' ? (
                    <img src={file} alt="preview" />
                ) : file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="preview" />
                ) : (
                    <embed src={URL.createObjectURL(file)} type={file.type} />
                )}
            </div>
            <div className="button-container">
                <button className="rounded-button" onClick={handleGoBack}>Regresar</button>
                <button className="rounded-button" onClick={handleGoBack}>Confirmar</button>
            </div>
        </div>
    );
}

export default FilePreview;