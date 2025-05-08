import React, { useReducer, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import CV_MODEL_JSON from "@data/TEMPLATES/CV_MODEL.js";
import TRANSLATIONS from "@data/CV/Translations.js";
import FilePreview from "@pages/FilePreview";

import renderSection from "./RenderSection.jsx";
import { cvReducer } from './reducer.js';
import { validateVisibleSections } from './utils.js';
import ModalError from "./ModalError.jsx";
import ModalSuccess from "./ModalSuccess.jsx";



import "@styles/EditCV.css";

const OPTIONAL_SECTIONS = [
    "awards",
    "publications",
    "certificates",
    "volunteer",
    "languages",
    "interests",
    "references",
    "projects",
]
const ALL_SECTIONS = Object.keys(CV_MODEL_JSON);
const VISIBLE_SECTIONS = ALL_SECTIONS.filter(section => !OPTIONAL_SECTIONS.includes(section));


const initialState = {
    data: null,
    step: 0,
    visibleSections: ALL_SECTIONS.filter(section => !OPTIONAL_SECTIONS.includes(section))
};

function EditCV({ initialData = null, onEditComplete = null }) {
    const location = useLocation();
    const resumeData = initialData || location.state?.processedData;
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [missingSection, setMissingSection] = useState("");


    const [state, dispatch] = useReducer(cvReducer, {
        ...initialState,
        data: resumeData || null
    });

    useEffect(() => {
        if (!resumeData) {
            const timeout = setTimeout(() => {
                dispatch({ type: "SET_DATA", payload: JSON.parse(JSON.stringify(CV_MODEL_JSON)) });
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [resumeData, initialData]);

    const handleChange = (section, index, key, value, subKey = null) => {
        dispatch({ type: "UPDATE_FIELD", payload: { section, index, key, value, subKey } });
    };

    const handleAddItem = (section, subkey = null) => {
        dispatch({ type: "ADD_ITEM", payload: { section, subkey } });
    };

    const handleRemoveItem = (section, index, subkey = null) => {
        dispatch({ type: "REMOVE_ITEM", payload: { section, index, subkey } });
    };

    const handleSubmit = async () => {
        const validation = validateVisibleSections(state.data, state.visibleSections); // Use `state.visibleSections` not `VISIBLE_SECTIONS`
        
        if (!validation.valid) {
            const section = validation.section;
            const index = state.visibleSections.indexOf(section);
    
            if (index !== -1) {
                dispatch({ type: "SET_STEP", payload: index });
            }
    
            setMissingSection(TRANSLATIONS[section] || section);
            setShowValidationModal(true);
            return;
        }
    
        try {
            if (onEditComplete) {
                onEditComplete(state.data);
                setShowSuccessModal(true);
            }
            // navigate('/file-preview', { state: { resumeData: state.data } });
        } catch (error) {
            console.error("Error al guardar el CV:", error);
            alert("Error al guardar el CV: " + error.message);
        }
    };

    const toggleSetShowValidationModal = () => {
        setShowValidationModal(!showValidationModal);
    };
    const toggleShowSuccessModal = () => {
        console.log("Toggling modal");
        setShowSuccessModal(prev => !prev);
    };
    

    if (!state.data || Object.keys(state.data).length === 0)
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "300px" }}
            >
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    
    return (
        <>
            <div className="container-fluid w-100 vh-auto p-4 bg-light">
                {showValidationModal && (
                    <ModalError
                        missingSection={missingSection}
                        toggleSetShowValidationModal={toggleSetShowValidationModal}
                    />
                )}
                {showSuccessModal && <ModalSuccess toggle={toggleShowSuccessModal} />}



                <div className="row mt-4">
                    {/* LEFT: Main form */}
                    <div className="col-md-9">
                        {/* Display Encouraging Message */}
                        <div className="mb-3 text-center text-success">
                            {Math.round(((state.step + 1) / state.visibleSections.length) * 100) < 50 ? (
                                <p>¡Sigue así! Estás avanzando muy bien.</p>
                            ) : Math.round(((state.step + 1) / state.visibleSections.length) * 100) < 80 ? (
                                <p>¡Casi terminas! Solo un poco más.</p>
                            ) : (
                                <p>¡Lo lograste! Estás a punto de terminar.</p>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="progress mb-3">
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{
                                    width: `${((state.step + 1) / state.visibleSections.length) * 100}%`,
                                }}
                                aria-valuenow={state.step + 1}
                                aria-valuemin="0"
                                aria-valuemax={state.visibleSections.length}
                            >
                                {/* Percentage inside the bar */}
                                <span className="progress-text">
                                    {Math.round(((state.step + 1) / state.visibleSections.length) * 100)}%
                                </span>
                            </div>
                        </div>

                        <h2 className="text-center mb-4">{TRANSLATIONS[state.visibleSections[state.step]]}</h2>

                        {/* Render Current Section */}
                        {state.visibleSections[state.step] && state.data[state.visibleSections[state.step]] && (
                            <fieldset>
                                {renderSection(
                                    state.data[state.visibleSections[state.step]],
                                    state.visibleSections[state.step],
                                    handleChange,
                                    handleAddItem,
                                    handleRemoveItem
                                )}
                            </fieldset>
                        )}



                        <form>
                            <div className="navigation-buttons-c w-100 d-flex justify-content-between mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    disabled={state.step === 0}
                                    onClick={() => dispatch({ type: "SET_STEP", payload: state.step - 1 })}
                                >
                                    &lt; Anterior
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (state.step < state.visibleSections.length - 1) {
                                            dispatch({ type: "SET_STEP", payload: state.step + 1 });
                                        } else {
                                            handleSubmit();
                                        }
                                    }}
                                >
                                    {state.step === state.visibleSections.length - 1 ? "Finalizar" : "Siguiente >"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: Optional sections */}
                    <div className="col-md-3">
                        <div className="bg-white p-3 border rounded shadow-sm">
                            <h5 className="fw-bold mb-3">Agregar secciones</h5>
                            {OPTIONAL_SECTIONS
                                .filter(section => !state.visibleSections.includes(section))
                                .map(section => (
                                    <button
                                        key={section}
                                        className="btn btn-outline-primary btn-sm d-block mb-2 w-100"
                                        onClick={() => dispatch({ type: "ADD_SECTION", payload: section })}
                                    >
                                        + {TRANSLATIONS[section]}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditCV;