import React, { useReducer, useEffect } from "react";
import RAW_JSON from "@data/mock/RawJson";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "@data/CV/Placeholders";
import { useNavigate, useLocation } from "react-router-dom"; 
import FilePreview from "@pages/FilePreview";

const SECTIONS = Object.keys(RAW_JSON);

//Allow empty input creation for each section with a '+' button
function createEmptyTemplate(template) {
    if (!template || typeof template !== 'object') return {};
    const emptyTemplate = {};
    Object.keys(template).forEach(key => {
        if (Array.isArray(template[key])) {
            emptyTemplate[key] = [""];
        } else if (typeof template[key] === 'object' && template[key] !== null) {
            emptyTemplate[key] = createEmptyTemplate(template[key]);
        } else {
            emptyTemplate[key] = "";
        }
    });
    return emptyTemplate;
}

const initialState = {
    data: null,
    step: 0
};

function cvReducer(state, action) {
    switch (action.type) {
        case "SET_DATA":
            return { ...state, data: action.payload };
        case "SET_STEP":
            return { ...state, step: action.payload };
        case "UPDATE_FIELD": {
            const { section, index, key, value, subKey } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            if (subKey) {
                newData[section][key][index][subKey] = value;
            } else if (Array.isArray(newData[section])) {
                newData[section][index][key] = value;
            } else {
                newData[section][key] = value;
            }
            return { ...state, data: newData };
        }
        case "ADD_ITEM": {
            const { section, subkey } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const template = subkey
                ? RAW_JSON[section][subkey]?.[0] || {}
                : RAW_JSON[section]?.[0] || {};
            const emptyTemplate = createEmptyTemplate(template);
            if (subkey) {
                if (!Array.isArray(newData[section][subkey])) newData[section][subkey] = [];
                newData[section][subkey].push(emptyTemplate);
            } else {
                if (!Array.isArray(newData[section])) newData[section] = [];
                newData[section].push(emptyTemplate);
            }
            return { ...state, data: newData };
        }
        case "REMOVE_ITEM": {
            const { section, index, subkey } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            if (subkey && Array.isArray(newData[section][subkey])) {
                newData[section][subkey].splice(index, 1);
            } else if (Array.isArray(newData[section])) {
                newData[section].splice(index, 1);
            }
            return { ...state, data: newData };
        }
        default:
            return state;
    }
}

function EditCV() {
    const navigate = useNavigate();
    const location = useLocation();
    const resumeData = location.state?.processedData;

    const [state, dispatch] = useReducer(cvReducer, {
        ...initialState,
        data: resumeData || null
    });

    useEffect(() => {
        if (resumeData) {
            dispatch({ type: "SET_DATA", payload: resumeData });
        } else {
            // fallback to RAW_JSON if nothing was passed
            dispatch({ type: "SET_DATA", payload: JSON.parse(JSON.stringify(RAW_JSON)) });
        }
    }, [resumeData]);

    const handleChange = (section, index, key, value, subKey = null) => {
        dispatch({ type: "UPDATE_FIELD", payload: { section, index, key, value, subKey } });
    };

    const handleAddItem = (section, subkey = null) => {
        dispatch({ type: "ADD_ITEM", payload: { section, subkey } });
    };

    const handleRemoveItem = (section, index, subkey = null) => {
        dispatch({ type: "REMOVE_ITEM", payload: { section, index, subkey } });
    };

    const handleSubmit = () => {
        console.log("Submitted Data:", JSON.stringify(state.data, null, 2));
        navigate('/file-preview', { state: { resumeData: state.data } });
    };

    if (!state.data) return <div>Loading...</div>;

    return (
        <div className="container-fluid w-100 vh-100 p-4 bg-light">
            <h1 className="text-center mb-4 mt-4">Editar CV</h1>
            <div className="mt-4">
                <label htmlFor="formstep" className="form-label bg-info rounded text-white p-2">
                    <b>{TRANSLATIONS[SECTIONS[state.step]]}</b>
                </label>
                <input
                    name="formstep"
                    type="range"
                    min="0"
                    max={SECTIONS.length - 1}
                    value={state.step}
                    onChange={(e) => dispatch({ type: "SET_STEP", payload: parseInt(e.target.value) })}
                    className="form-range"
                />
            </div>

            <form className="pb-4">
                {SECTIONS[state.step] && state.data[SECTIONS[state.step]] && (
                    <fieldset className="p-3 bg-white shadow-sm rounded border border-dark">
                        <legend className="fw-bold">
                            {TRANSLATIONS[SECTIONS[state.step]] || SECTIONS[state.step]}
                        </legend>
                        {renderSection(
                            state.data[SECTIONS[state.step]],
                            SECTIONS[state.step],
                            handleChange,
                            handleAddItem,
                            handleRemoveItem
                        )}
                    </fieldset>
                )}
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
                            if (state.step < SECTIONS.length - 1) {
                                dispatch({ type: "SET_STEP", payload: state.step + 1 });
                            } else {
                                handleSubmit();
                            }
                        }}
                    >
                        {state.step === SECTIONS.length - 1 ? "Finalizar" : "Siguiente >"}
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
                    <div className="mb-2 p-2 border rounded">
                        {Object.keys(item).map((key) =>
                            typeof item[key] === "object" && key !== "profiles" ? (
                                // Handle sections that are objects (e.g., experience, volunteer, education)
                                <div className="mb-3">
                                    <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                                    {Object.keys(item[key]).map((subKey) => (
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            value={item[key][subKey] || ""}
                                            onChange={(e) => handleChange(section, index, key, { ...item[key], [subKey]: e.target.value })}
                                            placeholder={CV_PLACEHOLDERS[key] || subKey}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Render simple fields
                                <div className="mb-2">
                                    <label className="fw-bold">
                                        {TRANSLATIONS[key] || key}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item[key] || ""}
                                        onChange={(e) => handleChange(section, index, key, e.target.value)}
                                        placeholder={CV_PLACEHOLDERS[key] || key}
                                    />
                                </div>

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
            <div className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                {sectionData[key].map((profile, index) => (
                    <div className="mb-2 p-2 border rounded">
                        {Object.keys(profile).map((subKey) => (
                            <input
                                type="text"
                                className="form-control mb-2"
                                value={profile[subKey] || ""}
                                onChange={(e) =>
                                    handleChange(section, index, key, e.target.value, subKey)
                                }
                                placeholder={CV_PLACEHOLDERS[subKey] || subKey}
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
            <div className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                <br />
                {Object.keys(sectionData[key]).map((subKey) => (
                    <>
                    <label className="fw-bold">{TRANSLATIONS[subKey] || key}</label>
                    <input
                        type="text"
                        className="form-control mb-2"
                        value={sectionData[key][subKey] || ""}
                        onChange={(e) =>
                            handleChange(section, 0, key, { ...sectionData[key], [subKey]: e.target.value })
                        }
                        placeholder={CV_PLACEHOLDERS[subKey] || subKey}
                        />
                        
                    </>
                ))}
            </div>
        ) : (
            // Render basic KEY-VALUE pairs (not nested objects or arrays)
            <div className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                <input
                    type="text"
                    className="form-control"
                    value={sectionData[key] || ""}
                    onChange={(e) => handleChange(section, 0, key, e.target.value)}
                    placeholder={CV_PLACEHOLDERS[key] || key}
                />
            </div>
        )
    );

}

export default EditCV;