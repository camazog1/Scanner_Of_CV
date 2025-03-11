import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

function Button({ iconClass, text, action, onClick }) {
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const handleClick = () => {
        console.log(`Button clicked: ${text}`);
        if (onClick) {
            onClick();
        } else {
            switch (action) {
            case 'uploadPDF':
                fileInputRef.current.click();
                break;
            case 'takePhoto':
                setShowCamera(true);
                break;
            case 'uploadImage':
                fileInputRef.current.click();
                break;
            default:
                console.log('Acción no definida');
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log(file);
        navigate('/file-preview', { state: { file } });
    };

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
        navigate('/file-preview', { state: { file: imageSrc } });
        setShowCamera(false);
    };

    return (
        <>
            <button className="button-style" onClick={handleClick}>
                <i className={iconClass}></i>
                <span>{text}</span>
            </button>
            {(action === 'uploadPDF' || action === 'uploadImage') && (
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept={action === 'uploadPDF' ? 'application/pdf' : 'image/*'}
                    onChange={handleFileChange}
                />
            )}
            {showCamera && action === 'takePhoto' && (
                <div>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={350}
                        height={350}
                        videoConstraints={{ facingMode: "user" }}
                        style={{ transform: 'scaleX(-1)' }} // Aplica la transformación para evitar el efecto espejo
                    />
                    <button onClick={handleCapture}>Capturar Foto</button>
                </div>
            )}
        </>
    );
}

export default Button;