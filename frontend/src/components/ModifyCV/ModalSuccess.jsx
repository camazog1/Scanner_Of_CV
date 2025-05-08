// src/components/ModalSuccess.jsx
import React from "react";

function ModalSuccess({ toggle }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content border-success">
                <h5 className="text-success">¡Éxito!</h5>
                <p>El CV ha sido guardado exitosamente.</p>
                <button className="btn btn-success mt-3" onClick={toggle}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}

export default ModalSuccess;
