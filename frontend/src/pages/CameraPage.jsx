import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "@styles/CameraPage.css";

function CameraPage() {
  const [facingMode, setFacingMode] = useState("environment"); // Comenzar con cámara trasera por defecto
  const [capturedImage, setCapturedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );
    };
    setIsMobile(checkMobile());

    // Solicitar permisos de cámara explícitamente
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Error al solicitar permisos de cámara:", err);
        setHasCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot({
      width: 1920,
      height: 1080,
      quality: 1.0,
    });
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
    // Cambia entre la cámara frontal y trasera en dispositivos móviles
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const handleGoBack = () => {
    navigate("/");
  };

  if (!hasCameraPermission) {
    return (
      <div className="camera-page permission-error">
        <div className="permission-container">
          <i className="bi bi-camera-video-off error-icon"></i>
          <h2>Permisos de cámara requeridos</h2>
          <p>
            Para utilizar esta funcionalidad, debes permitir el acceso a la
            cámara en tu navegador.
          </p>
          <div className="button-row">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
            <button className="btn btn-secondary" onClick={handleGoBack}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-page">
      <div className="camera-container">
        <div className="camera-content">
          {!capturedImage ? (
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: facingMode,
                }}
                className="webcam"
                mirrored={facingMode === "user"}
              />
              <div className="camera-overlay">
                <div className="camera-frame"></div>
                <p className="camera-instruction">
                  Coloca el CV dentro del marco y asegúrate de que esté bien
                  iluminado
                </p>
              </div>
            </div>
          ) : (
            <div className="captured-image-container">
              <img
                src={capturedImage}
                alt="captured"
                className="captured-image"
              />
            </div>
          )}
        </div>

        <div className="camera-controls">
          {!capturedImage ? (
            <>
              <button
                className="control-button back-button"
                onClick={handleGoBack}
                title="Volver"
              >
                <i className="bi bi-arrow-left"></i>
                <span>Volver</span>
              </button>

              <button
                className="control-button capture-button"
                onClick={handleCapture}
                title="Capturar"
              >
                <i className="bi bi-camera"></i>
              </button>

              {isMobile && (
                <button
                  className="control-button flip-button"
                  onClick={handleFlipCamera}
                  title="Cambiar cámara"
                >
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Cambiar cámara</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className="control-button secondary-button"
                onClick={handleRetake}
                title="Reintentar"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span>Reintentar</span>
              </button>

              <button
                className="control-button primary-button"
                onClick={handleAccept}
                title="Aceptar"
              >
                <i className="bi bi-check-lg"></i>
                <span>Aceptar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraPage;
