import React, { useState, useEffect } from "react";
import RAW_JSON from "@data/mock/RawJson";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "@data/CV/Placeholders";

const SECTIONS = Object.keys(RAW_JSON);

function EditCV({ initialData = null }) {
    const [data, setData] = useState({});
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Si hay datos iniciales, los usamos; de lo contrario, usamos RAW_JSON
        if (initialData) {
            console.log("Usando datos iniciales:", initialData);
            setData(initialData);
        } else {
            console.log("Usando datos de plantilla predeterminada");
            setData(JSON.parse(JSON.stringify(RAW_JSON)));
        }
    }, [initialData]);

    const handleChange = (section, index, key, value, subKey = null) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));

            if (subKey) {
                // Caso especial: subsección como profiles dentro de basics
                newData[section][key][index][subKey] = value;
            } else if (Array.isArray(newData[section])) {
                newData[section][index][key] = value;
            } else {
                newData[section][key] = value;
            }

            return newData;
        });
    };

    const handleAddItem = (section, subkey = null) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));

            if (subkey) {
                if (!Array.isArray(newData[section][subkey])) newData[section][subkey] = [];
                const template = Array.isArray(RAW_JSON[section][subkey])
                    ? RAW_JSON[section][subkey][0] || {}
                    : {};
                newData[section][subkey].push(JSON.parse(JSON.stringify(template)));
            } else {
                if (!Array.isArray(newData[section])) newData[section] = [];
                const template = Array.isArray(RAW_JSON[section])
                    ? RAW_JSON[section][0] || {}
                    : {};
                newData[section].push(JSON.parse(JSON.stringify(template)));
            }

            return newData;
        });
    };


    const handleRemoveItem = (section, index, subkey = null) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (subkey && Array.isArray(newData[section][subkey])) {
                newData[section][subkey].splice(index, 1);
            } else if (Array.isArray(newData[section])) {
                newData[section].splice(index, 1);
            }
            return newData;
        });
    };


    const handleSubmit = async () => {
        console.log("Enviando datos al servidor:", JSON.stringify(data, null, 2));
        
        try {
            // Aquí podrías agregar una llamada a la API para guardar los datos finales
            // Por ejemplo:
            /*
            const response = await fetch('http://localhost:8000/save_cv/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Datos guardados exitosamente:", result);
            */
            
            // Por ahora, solo mostraremos un mensaje en consola
            alert("CV guardado exitosamente");
        } catch (error) {
            console.error("Error al guardar el CV:", error);
            alert("Error al guardar el CV: " + error.message);
        }
    };


    if (!data || Object.keys(data).length === 0) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid w-100 vh-100 p-4 bg-light">
            <h1 className="text-center mb-4 mt-4">Editar CV</h1>
            <div className="mt-4">
                <label htmlFor="formstep" className="form-label bg-info rounded text-white p-2">
                    <b>
                        {TRANSLATIONS[SECTIONS[step]]}
                    </b>
                </label>
                <input
                    name="formstep"
                    type="range"
                    min="0"
                    max={SECTIONS.length - 1}
                    value={step}
                    onChange={(e) => setStep(parseInt(e.target.value))}
                    className="form-range"
                />
            </div>

            {/* <!-- Navigation form  --> */}
            <form className="pb-4">
                {SECTIONS[step] && data[SECTIONS[step]] && (
                    <fieldset className="p-3 bg-white shadow-sm rounded border border-dark">
                        <legend className="fw-bold">
                            {TRANSLATIONS[SECTIONS[step]] || SECTIONS[step]}
                        </legend>
                        {renderSection(
                            data[SECTIONS[step]],
                            SECTIONS[step],
                            handleChange,
                            handleAddItem,
                            handleRemoveItem
                        )}
                    </fieldset>
                )}
                <div className="navigation-buttons-c w-100 d-flex justify-content-between mt-4 ">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={step === 0}
                        onClick={() => setStep((prev) => prev - 1)}
                    >
                        &lt; Anterior
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            if (step < SECTIONS.length - 1) {
                                setStep((prev) => prev + 1);
                            } else {
                                handleSubmit();
                            }
                        }}
                    >
                        {step === SECTIONS.length - 1 ? "Guardar CV" : "Siguiente >"}
                    </button>
                </div>

            </form>
        </div>
    );
}

// Function to render each blank section of a CV from a RAW_JSON object
// This function is used to render the sections of the CV in the EditCV component
function renderSection(sectionData, section, handleChange, handleAddItem, handleRemoveItem) {
    if (!sectionData) return null;

    if (Array.isArray(sectionData)) {
        return (
            <div className="mb-3">
                {sectionData.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        {Object.keys(item).map((key) =>
                            typeof item[key] === "object" && key !== "profiles" ? (
                                // Handle sections that are objects (e.g., experience, volunteer, education)
                                <div key={key} className="mb-3">
                                    <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                                    {Object.keys(item[key]).map((subKey) => (
                                        <input
                                            key={subKey}
                                            type="text"
                                            className="form-control mb-2"
                                            value={item[key][subKey] || ""}
                                            onChange={(e) => handleChange(section, index, key, { ...item[key], [subKey]: e.target.value })}
                                            placeholder={TRANSLATIONS[subKey] || subKey}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Render simple fields
                                <input
                                    key={key}
                                    type="text"
                                    className="form-control mb-2"
                                    value={item[key] || ""}
                                    onChange={(e) => handleChange(section, index, key, e.target.value)}
                                    placeholder={TRANSLATIONS[key] || key}
                                />
                            )
                        )}
                        <div className="d-flex justify-content-center gap-3">
                            <button
                                type="button"
                                className="btn btn-danger d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                                onClick={() => handleRemoveItem(section, index)}
                            >
                                -
                            </button>
                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                                onClick={() => handleAddItem(section)}
                            >
                                +
                            </button>
                        </div>

                    </div>
                ))}
                {
                    sectionData && sectionData.length === 0 && (
                        <button type="button" className="btn btn-success mt-2" onClick={() => handleAddItem(section)}>
                            +
                        </button>
                    )
                }

            </div>
        );
    }

    return Object.keys(sectionData).map((key) =>
        Array.isArray(sectionData[key]) && key === "profiles" ? (
            // special case for "profiles" array (nested object inside a section)
            <div key={key} className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                {sectionData[key].map((profile, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        {Object.keys(profile).map((subKey) => (
                            <input
                                key={`${index}-${subKey}`}
                                type="text"
                                className="form-control mb-2"
                                value={String(profile[subKey] ?? "")}

                                onChange={(e) =>
                                    handleChange(section, index, key, e.target.value, subKey)
                                }
                                placeholder={TRANSLATIONS[subKey] || subKey}
                            />


                        ))}
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveItem(section, index, key)} // <-- Aquí pasas el subkey
                        >
                            -
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    className="btn btn-success mt-2 ms-2"
                    onClick={() => handleAddItem(section, key)} // <-- "section" es "basics", "key" es "profiles"
                >
                    +
                </button>

            </div>
        ) : key === "location" && typeof sectionData[key] === "object" ? (
            // special case for "location" object (nested object inside a section)
            <div key={key} className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                {Object.keys(sectionData[key]).map((subKey) => (
                    <input
                        key={subKey}
                        type="text"
                        className="form-control mb-2"
                        value={sectionData[key][subKey] || ""}
                        onChange={(e) =>
                            handleChange(section, 0, key, { ...sectionData[key], [subKey]: e.target.value })
                        }
                        placeholder={TRANSLATIONS[subKey] || subKey}
                    />
                ))}
            </div>
        ) : (
            // Render basic KEY-VALUE pairs (not nested objects or arrays)
            <div key={key} className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                <input
                    type="text"
                    className="form-control"
                    value={sectionData[key] || ""}
                    onChange={(e) => handleChange(section, 0, key, e.target.value)}
                    placeholder={TRANSLATIONS[key] || key}
                />
            </div>
        )
    );
}

export default EditCV;