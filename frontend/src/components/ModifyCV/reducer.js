// reducer.js
import CV_MODEL_JSON from "@data/TEMPLATES/CV_MODEL.js";
import { createEmptyTemplate } from "./utils";
import { REQUIRED_SECTIONS } from "@data/CV/Constants";

export function cvReducer(state, action) {
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

                const newStep = updatedSections.length - 1;

                return {
                    ...state,
                    visibleSections: updatedSections,
                    data: newData,
                    step: newStep,
                };
            }
            return state;
        }
        case "REMOVE_ITEM": {
            const { section, index, subkey } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));

            // Remove the corresponding element
            if (subkey && Array.isArray(newData[section][subkey])) {
                newData[section][subkey].splice(index, 1);

                // Just update the data, don't touch visibleSections for nested items
                return {
                    ...state,
                    data: newData
                };
            } else if (Array.isArray(newData[section])) {
                newData[section].splice(index, 1);

                // Only update visibleSections if section array becomes empty AND it's not a required section
                let updatedVisibleSections = [...state.visibleSections];
                if (newData[section].length === 0 && !REQUIRED_SECTIONS.includes(section)) {
                    updatedVisibleSections = state.visibleSections.filter(s => s !== section);
                }

                const updatedStep = updatedVisibleSections.length > 0
                    ? Math.min(state.step, updatedVisibleSections.length - 1)
                    : 0;

                return {
                    ...state,
                    data: newData,
                    visibleSections: updatedVisibleSections,
                    step: updatedStep,
                };
            }

            return state;
        }

        default:
            return state;
    }
}