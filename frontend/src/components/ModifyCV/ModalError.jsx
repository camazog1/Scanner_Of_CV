// src/components/ModalSuccess.jsx
import React from "react";

export default function ModalError({ missingSection, toggleSetShowValidationModal }) {
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ backgroundColor: "#fff3cd" }}> {/* Bootstrap warning bg */}
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-dark d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                className="bi bi-exclamation-triangle-fill text-warning me-2" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.706c.89 0 1.438-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                            </svg>
                            ¡Sección incompleta!
                        </h5>
                        <button type="button" className="btn-close" onClick={toggleSetShowValidationModal} />
                    </div>
                    <div className="modal-body text-dark">
                        <p>
                            La sección <strong>{missingSection}</strong> no puede estar vacía. Por favor, completa todos los campos requeridos antes de continuar.
                        </p>
                    </div>
                    <div className="modal-footer border-0">
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={toggleSetShowValidationModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}