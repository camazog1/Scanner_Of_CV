import React, { useState, useEffect } from "react";
import RAW_JSON from "@data/mock/RawJson";
import TRANSLATIONS from "@data/CV/Translations";
import CV_PLACEHOLDERS from "../data/CV/Placeholders";

// Sections allowed to have dynamic add/remove functionality
const ALLOWED_SECTIONS = [
  "profiles",
  "work",
  "volunteer",
  "education",
  "awards",
  "certificates",
  "publications",
  "projects",
];

function EditCV() {
  const [data, setData] = useState(null);

  // Simulate fetching data with a delay
  useEffect(() => {
    setTimeout(() => {
      setData(RAW_JSON);
    }, 1000);
  }, []);

  // Handles changes to input fields and updates state
  const handleChange = (path, value) => {
    setData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let ref = newData;
      const keys = path.split(".");
      keys.slice(0, -1).forEach((key) => {
        if (!ref[key]) ref[key] = {};
        ref = ref[key];
      });
      ref[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Adds a new item to an array-based section
  const handleAddItem = (path, template, event) => {
    event.preventDefault();
    setData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let ref = newData;
      const keys = path.split(".");
      keys.forEach((key, index) => {
        if (!ref[key]) ref[key] = index === keys.length - 1 ? [] : {};
        ref = ref[key];
      });
      ref.push(JSON.parse(JSON.stringify(template))); // Clone template to avoid reference issues
      return newData;
    });
  };

  // Removes an item from an array-based section
  const handleRemoveItem = (path, index, event) => {
    event.preventDefault();
    setData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let ref = newData;
      const keys = path.split(".");
      keys.forEach((key) => {
        ref = ref[key];
      });
      ref.splice(index, 1); // Remove item at specified index
      return newData;
    });
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container-fluid w-100 vh-100 p-4 bg-light">
      <h1 className="text-center mb-4">Datos extraídos</h1>
      <form>
        {renderFields(data, "", handleChange, handleAddItem, handleRemoveItem)}
        <div className="w-100 d-flex justify-content-center pb-3">
          <button
            type="submit"
            className="btn btn-primary w-50"
            onClick={handleSubmit}
          >
            Continuar &gt;
          </button>
        </div>
      </form>
    </div>
  );
}

// Recursively renders form fields
function renderFields(
  data,
  path,
  handleChange,
  handleAddItem,
  handleRemoveItem,
) {
  return Object.keys(data).map((key) => {
    const value = data[key];
    const newPath = path ? `${path}.${key}` : key;
    const label = TRANSLATIONS[key] || key;
    const placeholder = getPlaceholder(newPath);

    //If it's an object call renderFields recursively
    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <fieldset
          key={newPath}
          className="border p-3 mb-3 bg-white shadow-sm rounded"
        >
          <legend className="fw-bold text-uppercase">
            <h3>{label}</h3>
          </legend>
          {renderFields(
            value,
            newPath,
            handleChange,
            handleAddItem,
            handleRemoveItem,
          )}
        </fieldset>
      );
      // If its an array, render the title and call renderFields for each item
    } else if (Array.isArray(value) && ALLOWED_SECTIONS.includes(key)) {
      const template =
        value.length > 0 ? JSON.parse(JSON.stringify(value[0])) : {};
      return (
        <div key={newPath} className="mb-3">
          <label className="fw-bold text-capitalize">
            <h3>{label}</h3>
          </label>
          {value.map((item, index) =>
            typeof item === "object" ? (
              <fieldset
                key={`${newPath}[${index}]`}
                className="border p-3 bg-white shadow-sm rounded"
              >
                <legend className="fw-bold text-uppercase">{`${label} #${index + 1}`}</legend>
                {renderFields(
                  item,
                  `${newPath}[${index}]`,
                  handleChange,
                  handleAddItem,
                  handleRemoveItem,
                )}
                <button
                  className="btn btn-danger mt-2"
                  onClick={(e) => handleRemoveItem(newPath, index, e)}
                >
                  -
                </button>
              </fieldset>
            ) : (
              <input
                key={`${newPath}[${index}]`}
                type="text"
                className="form-control mb-2 bg-secondary"
                placeholder={`Ej: ${placeholder}`}
                value={item || ""}
                onChange={(e) => {
                  const newValue = [...value];
                  newValue[index] = e.target.value;
                  handleChange(newPath, newValue);
                }}
              />
            ),
          )}
          <button
            className="btn btn-success mt-2"
            onClick={(e) => handleAddItem(newPath, template, e)}
          >
            +
          </button>
        </div>
      );
      // If its a key-value pair, render the label and an input field
    } else {
      return (
        <div key={newPath} className="mb-1">
          <label className="fw-bold text-capitalize">
            <h3>{label}</h3>
          </label>
          <input
            type="text"
            className="form-control bg-secondary"
            value={value || ""}
            onChange={(e) => handleChange(newPath, e.target.value)}
            placeholder={`Ej: ${placeholder}`}
          />
        </div>
      );
    }
  });
}

// Retrieves placeholder text for inputs
function getPlaceholder(path) {
  const keys = path.split(".");
  let ref = CV_PLACEHOLDERS;

  for (const key of keys) {
    if (Array.isArray(ref)) {
      ref = ref[0] || {};
    } else if (typeof ref === "object" && ref[key]) {
      ref = ref[key];
    } else {
      return "No disponible";
    }
  }
  return typeof ref === "string" ? ref : "No disponible";
}

export default EditCV;
