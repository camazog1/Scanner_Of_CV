import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import '@styles/CameraPage.css'; // Importa el archivo CSS

function CameraPage() {
    const [facingMode, setFacingMode] = useState("user");
    const [capturedImage, setCapturedImage] = useState(null);
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot({ width: 1920, height: 1080, quality: 1.0 });
        setCapturedImage(imageSrc);
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleAccept = () => {
        console.log("Foto aceptada:", capturedImage);
        navigate("/file-preview", { state: { file: capturedImage } });
    };

    const handleFlipCamera = () => {
        setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
    };

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <div className="camera-page">
            {!capturedImage ? (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    height="100%"
                    videoConstraints={{ facingMode }}
                    style={{ transform: facingMode === "user" ? 'scaleX(-1)' : 'none', width: '100%', height: '100%' }}
                />
            ) : (
                <div className="captured-image-container">
                    <img src={capturedImage} alt="captured" className="captured-image" />
                </div>
            )}
            <div className="camera-controls">
                {!capturedImage ? (
                    <>
                        <button className="rounded-button" onClick={handleGoBack}>Regresar</button>
                        <button className="capture-button" onClick={handleCapture}>Capturar</button>
                        <button className="rounded-button" onClick={handleFlipCamera}>Voltear</button>
                    </>
                ) : (
                    <>
                        <button className="rounded-button" onClick={handleRetake}>Reintentar</button>
                        <button className="rounded-button" onClick={handleAccept}>Aceptar</button>
                        <button className="rounded-button" onClick={handleGoBack}>Regresar</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default CameraPage;