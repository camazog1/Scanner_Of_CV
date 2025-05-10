// reducer.js
import CV_MODEL_JSON from "@data/TEMPLATES/CV_MODEL.js";
import { createEmptyTemplate } from "./utils";


export function cvReducer(state, action) {
    switch (action.type) {
        case "SET_DATA":
            return { ...state, data: action.payload};
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
                ? CV_MODEL_JSON[section][subkey]?.[0] || {}
                : CV_MODEL_JSON[section]?.[0] || {};
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
        case "ADD_SECTION": {
            const section = action.payload;
            if (!state.visibleSections.includes(section)) {
                const updatedSections = [...state.visibleSections, section];
                const newData = { ...state.data };

                if (!newData[section]) {
                    const template = CV_MODEL_JSON[section]?.[0] || {};
                    const emptyTemplate = createEmptyTemplate(template);
                    newData[section] = [emptyTemplate];
                }

                return {
                    ...state,
                    visibleSections: updatedSections,
                    data: newData
                };
            }
            return state;
        }
        case "REMOVE_ITEM": {
            const { section, index, subkey } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
        
            // Eliminar el elemento correspondiente
            if (subkey && Array.isArray(newData[section][subkey])) {
                newData[section][subkey].splice(index, 1);
            } else if (Array.isArray(newData[section])) {
                newData[section].splice(index, 1);
            }
        
            // Actualizar las secciones visibles después de la eliminación
            const updatedVisibleSections = state.visibleSections.filter(s => s !== section);
        
            // Si no hay secciones visibles, el step se ajusta a 0
            const updatedStep = updatedVisibleSections.length > 0
                ? Math.min(state.step, updatedVisibleSections.length - 1) // Asegurarse de que el step no sea mayor que el último índice
                : 0;
        
            return {
                ...state,
                data: newData,
                visibleSections: updatedVisibleSections,
                step: updatedStep, // Actualizar el step
            };
        }
        
        default:
            return state;
    }
}