import React, { useState, useEffect } from "react";
import RAW_JSON from "@data/mock/RawJson";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "../data/CV/Placeholders";

const SECTIONS = Object.keys(RAW_JSON);

function EditCV() {
    const [data, setData] = useState({});
    const [step, setStep] = useState(0);

    useEffect(() => {
        setData(JSON.parse(JSON.stringify(RAW_JSON)));
    }, []);

    const handleChange = (section, index, key, value) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (Array.isArray(newData[section])) {
                newData[section][index][key] = value;
            } else {
                newData[section][key] = value;
            }
            return newData;
        });
    };

    const handleAddItem = (section) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (!Array.isArray(newData[section])) newData[section] = [];
            const template = Array.isArray(RAW_JSON[section]) ? RAW_JSON[section][0] || {} : {};
            newData[section].push(JSON.parse(JSON.stringify(template)));
            return newData;
        });
    };

    const handleRemoveItem = (section, index) => {
        setData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (Array.isArray(newData[section])) {
                newData[section].splice(index, 1);
            }
            return newData;
        });
    };

    const handleSubmit = () => {
        console.log("Submitted Data:", JSON.stringify(data, null, 2));
    };


    if (!data) return <div>Loading...</div>;

    return (
        <div className="container-fluid w-100 vh-100 p-4 bg-light">
            <h1 className="text-center mb-4 mt-4">Editar CV</h1>
            <div className="d-flex justify-content-center mb-4">
                {SECTIONS.map((_, index) => (
                    <div
                        key={index}
                        className={`mx-1 w-3 h-3 rounded-full ${
                            step === index ? "bg-secondary scale-125" : "bg-secondary"
                        }`}
                    ></div>
                ))}
            </div>
            <form>
                {SECTIONS[step] && data[SECTIONS[step]] && (
                    <fieldset className="p-3 bg-white shadow-sm rounded">
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
                <div className="w-100 d-flex justify-content-between mt-4">
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
                        {step === SECTIONS.length - 1 ? "Finalizar" : "Siguiente >"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function renderSection(sectionData, section, handleChange, handleAddItem, handleRemoveItem) {
    if (!sectionData) return null;

    if (Array.isArray(sectionData)) {
        return (
            <div className="mb-3">
                {sectionData.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        {Object.keys(item).map((key) =>
                            typeof item[key] === "object" && key !== "profiles" ? (
                                // Render nested objects (e.g., complex fields)
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
                        <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(section, index)}>
                            -
                        </button>
                    </div>
                ))}
                <button type="button" className="btn btn-success mt-2" onClick={() => handleAddItem(section)}>
                    +
                </button>
            </div>
        );
    }

    return Object.keys(sectionData).map((key) =>
        Array.isArray(sectionData[key]) && key === "profiles" ? (
            // Render profiles (special case for "profiles" array)
            <div key={key} className="mb-3">
                <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                {sectionData[key].map((profile, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        {Object.keys(profile).map((subKey) => (
                            <input
                                key={subKey}
                                type="text"
                                className="form-control mb-2"
                                value={profile[subKey] || ""}
                                onChange={(e) =>
                                    handleChange(section, index, key, { ...profile, [subKey]: e.target.value })
                                }
                                placeholder={TRANSLATIONS[subKey] || subKey}
                            />
                        ))}
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveItem(key, index)}
                        >
                            -
                        </button>
                    </div>
                ))}
                <button type="button" className="btn btn-success mt-2" onClick={() => handleAddItem(key)}>
                    +
                </button>
            </div>
        ) : key === "location" && typeof sectionData[key] === "object" ? (
            // Render location (special case for "location" object)
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
            // Render other normal fields
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
