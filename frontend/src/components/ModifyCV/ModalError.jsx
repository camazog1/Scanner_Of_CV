// src/components/ModalSuccess.jsx
import React from "react";

export default function ModalSuccess({ toggle }) {
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-success">
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-success">
                            ¡Éxito!
                        </h5>
                        <button type="button" className="btn-close" onClick={toggle} />
                    </div>
                    <div className="modal-body">
                        <p>El CV ha sido guardado exitosamente.</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button className="btn btn-success" onClick={toggle}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
