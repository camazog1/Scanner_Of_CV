//Allow empty input creation for each section with a '+' button
export function createEmptyTemplate(template) {
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

export const isNonEmpty = (value) => {
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.every(v => isNonEmpty(v));
    if (typeof value === 'object' && value !== null) return Object.values(value).every(isNonEmpty);
    return false;
};

export const validateVisibleSections = (data, visibleSections) => {
    for (const sectionName of visibleSections) {
        const sectionData = data[sectionName];

        if (Array.isArray(sectionData)) {
            const isValid = sectionData.every((item) =>
                Object.values(item).every(isNonEmpty)
            );

            if (!isValid) {
                return { valid: false, section: sectionName };
            }

        } else if (typeof sectionData === 'object' && sectionData !== null) {
            const isValid = Object.values(sectionData).every(isNonEmpty);

            if (!isValid) {
                return { valid: false, section: sectionName };
            }
        }
    }

    return { valid: true };
};
