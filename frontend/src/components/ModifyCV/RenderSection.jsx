import React from "react";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "@data/CV/Placeholders";

// Function to render each blank section of a CV from a RAW_JSON object
// This function is used to render the sections of the CV in the EditCV component
export default function RenderSection(sectionData, section, handleChange, handleAddItem, handleRemoveItem) {
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
                                            placeholder={
                                                CV_PLACEHOLDERS?.[section]?.[index]?.[key]?.[subKey] ??
                                                CV_PLACEHOLDERS?.[section]?.[key]?.[subKey] ??
                                                CV_PLACEHOLDERS?.[section]?.[key] ??
                                                subKey
                                            }
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
                                        placeholder={
                                            CV_PLACEHOLDERS?.[section]?.[index]?.[key] ?? key
                                        }
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
                                placeholder={
                                    CV_PLACEHOLDERS?.[section]?.[key]?.[index]?.[subKey] ??
                                    CV_PLACEHOLDERS?.[section]?.[key]?.[subKey] ??
                                    subKey
                                }
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
                            placeholder={
                                CV_PLACEHOLDERS?.[section]?.[key]?.[subKey] ??
                                subKey}
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
                    placeholder={
                        CV_PLACEHOLDERS?.[section]?.[key] ??
                        key}
                />
            </div>
        )
    );

}