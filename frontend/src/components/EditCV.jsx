import React, { useState, useEffect } from "react";
import RAW_JSON from "@data/mock/RawJson";

function EditCV() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            setTimeout(() => {
                setData(RAW_JSON);
            }, 1000);
        };
        fetchData();
    }, []);

    const handleChange = (path, value) => {
        setData((prevData) => {
            const newData = { ...prevData };
            let ref = newData;
            const keys = path.split(".");
            keys.slice(0, -1).forEach((key) => {
                if (!ref[key]) ref[key] = {}; // Ensure path exists
                ref = ref[key];
            });
            ref[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleSubmit = (e) => {
        //Custom code to handle form submission
        // Integration with backend
        e.preventDefault();
        console.log(data);
    };
    if (!data) return <div>Loading...</div>;

    return (
        <div className="container-fluid w-100 vh-100 p-4 bg-light">
            <h1 className="text-center mb-4">Modificar Datos</h1>
            <form>
                {renderFields(data, "", handleChange)}
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                    Guardar
                </button>
            </form>
        </div>
    );
}

// Recursive function to render fields dynamically
function renderFields(data, path, handleChange) {
    return Object.keys(data).map((key) => {
        const value = data[key];
        const newPath = path ? `${path}.${key}` : key;
        
        if (typeof value === "object" && !Array.isArray(value)) {
            // Render nested objects
            return (
                <fieldset key={newPath} className="border p-3 mb-3 bg-white shadow-sm rounded">
                    <legend className="fw-bold text-uppercase"><h3>{key}</h3></legend>
                    {renderFields(value, newPath, handleChange)}
                </fieldset>
            );
        } else if (Array.isArray(value)) {
            // Render arrays
            return (
                <div key={newPath} className="mb-3">
                    <label className="fw-bold text-capitalize"><h3>{key}</h3></label>
                    {value.map((item, index) =>
                        typeof item === "object" ? (
                            <fieldset key={`${newPath}[${index}]`} className="border p-3 bg-white shadow-sm rounded">
                                <legend className="fw-bold text-uppercase">{`${key} #${index + 1}`}</legend>
                                {renderFields(item, `${newPath}[${index}]`, handleChange)}
                            </fieldset>
                        ) : (
                            <input
                                key={`${newPath}[${index}]`}
                                type="text"
                                className="form-control mb-2"
                                value={item}
                                onChange={(e) => {
                                    const newValue = [...value];
                                    newValue[index] = e.target.value;
                                    handleChange(newPath, newValue);
                                }}
                            />
                        )
                    )}
                </div>
            );
        } else {
            // Render simple input fields
            return (
                <div key={newPath} className="mb-3">
                    <label className="fw-bold text-capitalize"><h3>{key}</h3></label>
                    <input
                        type="text"
                        className="form-control"
                        value={value}
                        onChange={(e) => handleChange(newPath, e.target.value)}
                    />
                </div>
            );
        }
    });
}

export default EditCV;
