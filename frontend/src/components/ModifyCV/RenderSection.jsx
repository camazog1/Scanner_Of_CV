import React, { useState, useEffect } from "react";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "@data/CV/Placeholders";
import { REQUIRED_SECTIONS } from "@data/CV/Constants";
import { countries, regions, getCitiesByRegion } from "./utils";

function typeOfInput(key, parentKey = null) {
    const lower = key.toLowerCase();

    if (lower.includes("level")) {
        return "select";
    }
    if (lower.includes("image") || lower === "imagen") {
        return "file";
    }
    if (lower.includes("date")) {
        return "date";
    }
    if (lower.includes("phone") || lower.includes("teléfono")) {
        return "tel";
    }
    
    // Campos específicos para ubicación
    if (parentKey === "location") {
        if (key === "countryCode") return "country-select";
        if (key === "region") return "region-select";
        if (key === "city") return "city-select";
    }
    
    return "text";
}

function shouldSkipField(key, sectionType, parentKey) {
    if (key === "url") {
        // Allow only in profiles
        return parentKey !== "profiles";
    }

    return false; // No skip otros campos
}

// Componente separado para la ubicación
const LocationFields = ({ locationData, section, handleChange }) => {
    const [selectedCountry, setSelectedCountry] = useState(locationData.countryCode || "CO");
    const [selectedRegion, setSelectedRegion] = useState(locationData.region || "");
    const [availableRegions, setAvailableRegions] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    
    useEffect(() => {
        if (selectedCountry) {
            setAvailableRegions(regions[selectedCountry] || []);
        } else {
            setAvailableRegions([]);
        }
        
        if (selectedRegion) {
            setAvailableCities(getCitiesByRegion(selectedRegion));
        } else {
            setAvailableCities([]);
        }
    }, [selectedCountry, selectedRegion]);

    return (
        <div className="mb-3">
            <label className="fw-bold">{TRANSLATIONS.location || "Ubicación"}</label>
            <br />
            {Object.keys(locationData)
                .filter(subKey => !shouldSkipField(subKey, section, "location"))
                .map((subKey) => {
                    const inputType = typeOfInput(subKey, "location");
                    
                    // Dropdown para país (solo Colombia por ahora)
                    if (inputType === "country-select") {
                        return (
                            <div key={subKey} className="mb-2">
                                <label className="fw-bold">{TRANSLATIONS[subKey] || subKey}</label>
                                <select 
                                    className="form-control"
                                    value={locationData[subKey] || "CO"} 
                                    onChange={(e) => {
                                        const newCountry = e.target.value;
                                        setSelectedCountry(newCountry);
                                        
                                        // Resetear región y ciudad cuando cambia el país
                                        const newLocationData = { 
                                            ...locationData, 
                                            [subKey]: newCountry,
                                            region: "",
                                            city: ""
                                        };
                                        
                                        handleChange(section, 0, "location", newLocationData);
                                    }}
                                >
                                    <option value="">Seleccione un país</option>
                                    {countries.map(country => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    }
                    
                    // Dropdown para departamento
                    if (inputType === "region-select") {
                        return (
                            <div key={subKey} className="mb-2">
                                <label className="fw-bold">{TRANSLATIONS[subKey] || subKey}</label>
                                <select 
                                    className="form-control"
                                    value={locationData[subKey] || ""}
                                    onChange={(e) => {
                                        const newRegion = e.target.value;
                                        setSelectedRegion(newRegion);
                                        
                                        // Resetear ciudad cuando cambia la región
                                        const newLocationData = { 
                                            ...locationData, 
                                            [subKey]: newRegion,
                                            city: ""
                                        };
                                        
                                        handleChange(section, 0, "location", newLocationData);
                                    }}
                                >
                                    <option value="">Seleccione un departamento</option>
                                    {availableRegions.map(region => (
                                        <option key={region} value={region}>
                                            {region}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    }
                    
                    // Dropdown para ciudad
                    if (inputType === "city-select") {
                        return (
                            <div key={subKey} className="mb-2">
                                <label className="fw-bold">{TRANSLATIONS[subKey] || subKey}</label>
                                <select 
                                    className="form-control"
                                    value={locationData[subKey] || ""}
                                    disabled={!selectedRegion}
                                    onChange={(e) => {
                                        const newCity = e.target.value;
                                        const newLocationData = { 
                                            ...locationData, 
                                            [subKey]: newCity
                                        };
                                        
                                        handleChange(section, 0, "location", newLocationData);
                                    }}
                                >
                                    <option value="">
                                        {!selectedRegion 
                                            ? "Primero seleccione un departamento" 
                                            : "Seleccione una ciudad"}
                                    </option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    }
                    
                    // Otros campos de location (dirección, código postal, etc.)
                    return (
                        <div key={subKey} className="mb-2">
                            <label className="fw-bold">{TRANSLATIONS[subKey] || subKey}</label>
                            <input
                                type="text"
                                className="form-control mb-2"
                                value={locationData[subKey] || ""}
                                onChange={(e) => handleChange(
                                    section,
                                    0,
                                    "location",
                                    { ...locationData, [subKey]: e.target.value }
                                )}
                                placeholder={CV_PLACEHOLDERS?.[section]?.location?.[subKey] ?? subKey}
                            />
                        </div>
                    );
                })}
        </div>
    );
};

// Function to render each blank section of a CV from a RAW_JSON object
export default function RenderSection(props) {
    const { sectionData, section, handleChange, handleAddItem, handleRemoveItem } = props;

    if (!sectionData) return null;

    const isRequiredSection = (section) => REQUIRED_SECTIONS.includes(section);

    // Helper to render input based on type
    const renderInput = (type, value, onChange, placeholder, options = {}) => {
        if (type === "select") {
            return (
                <select className="form-control" value={value || ""} onChange={onChange}>
                    <option value="">Seleccione un nivel</option>
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                </select>
            );
        }

        return (
            <input
                type={type}
                className="form-control"
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                {...options}
            />
        );
    };

    // Render array-based sections
    if (Array.isArray(sectionData)) {
        return (
            <div className="mb-3">
                {sectionData.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        {Object.keys(item)
                            .filter(key => !shouldSkipField(key, section, null))
                            .map((key) => {
                                // Handle nested objects (except profiles)
                                if (typeof item[key] === "object" && key !== "profiles") {
                                    return (
                                        <div key={key} className="mb-3">
                                            <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                                            {Object.keys(item[key])
                                                .filter(subKey => !shouldSkipField(subKey, section, key))
                                                .map((subKey) => (
                                                    <input
                                                        key={subKey}
                                                        type={typeOfInput(subKey)}
                                                        className="form-control mb-2"
                                                        value={item[key][subKey] || ""}
                                                        onChange={(e) => handleChange(
                                                            section,
                                                            index,
                                                            key,
                                                            { ...item[key], [subKey]: e.target.value }
                                                        )}
                                                        placeholder={
                                                            CV_PLACEHOLDERS[section][0]?.[key] ??
                                                            TRANSLATIONS[subKey] ??
                                                            subKey
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    );
                                }

                                // Handle simple fields
                                return (
                                    <div key={key} className="mb-2">
                                        <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                                        {renderInput(
                                            typeOfInput(key),
                                            item[key],
                                            (e) => handleChange(section, index, key, e.target.value),
                                            CV_PLACEHOLDERS?.[section]?.[0]?.[key] ?? key
                                        )}
                                    </div>
                                );
                            })}

                        <div className="d-flex justify-content-center gap-3">
                            {(!isRequiredSection(section) || sectionData.length > 1) && (
                                <button
                                    type="button"
                                    className="btn btn-danger d-flex align-items-center justify-content-center w-auto"
                                    style={{ width: '40px', height: '40px' }}
                                    onClick={() => handleRemoveItem(section, index)}
                                >
                                    Eliminar
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center justify-content-center w-auto"
                                style={{ width: '40px', height: '40px' }}
                                onClick={() => handleAddItem(section)}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                ))}

                {sectionData.length === 0 && (
                    <button
                        type="button"
                        className="btn btn-success mt-2"
                        onClick={() => handleAddItem(section)}
                    >
                        +
                    </button>
                )}
            </div>
        );
    }

    // Render object-based sections
    return Object.keys(sectionData)
        .filter(key => !shouldSkipField(key, section, null))
        .map((key) => {
            // Profiles array (nested in basics)
            if (Array.isArray(sectionData[key]) && key === "profiles") {
                return (
                    <div key={key} className="mb-3">
                        <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                        {sectionData[key].map((profile, index) => (
                            <div key={index} className="mb-2 p-2 border rounded">
                                {Object.keys(profile)
                                    .filter(subKey => !shouldSkipField(subKey, section, "profiles"))
                                    .map((subKey) => (
                                        <input
                                            key={subKey}
                                            type="text"
                                            className="form-control mb-2"
                                            value={profile[subKey] || ""}
                                            onChange={(e) => handleChange(section, index, key, e.target.value, subKey)}
                                            placeholder={
                                                CV_PLACEHOLDERS?.[section]?.[key]?.[0]?.[subKey] ??
                                                CV_PLACEHOLDERS?.[section]?.[key]?.[subKey] ??
                                                TRANSLATIONS[subKey] ??
                                                subKey
                                            }
                                        />
                                    ))}
                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleRemoveItem(section, index, key)}
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => handleAddItem(section, key)}
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            // Location object with dropdown selects
            if (key === "location" && typeof sectionData[key] === "object") {
                return <LocationFields 
                    key={key}
                    locationData={sectionData[key]} 
                    section={section} 
                    handleChange={handleChange} 
                />;
            }

            // Basic key-value fields
            return (
                <div key={key} className="mb-3">
                    <label className="fw-bold">{TRANSLATIONS[key] || key}</label>
                    {renderInput(
                        typeOfInput(key),
                        sectionData[key],
                        (e) => handleChange(section, 0, key, e.target.value),
                        CV_PLACEHOLDERS?.[section]?.[key] ?? key
                    )}
                </div>
            );
        });
}