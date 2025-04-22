// frontend/src/services/api.js

/**
 * Envía un archivo a la API para procesar un CV
 * @param {File|String} file - El archivo a enviar (puede ser un objeto File o una cadena base64)
 * @param {Object} userData - Datos del usuario (nombre, email, teléfono)
 * @returns {Promise} - Promise con el resultado de la API
 */
export const uploadCV = async (file, userData) => {
    // URL de la API
    const API_URL = 'http://localhost:8000/CV_Extraction/';
    
    // Validar datos
    if (!userData.name || !userData.email || !userData.phone) {
        throw new Error("Todos los campos son obligatorios");
    }
    
    // Preparar el archivo
    let fileToUpload = null;
    
    // Si el archivo es una cadena (base64 de la imagen capturada)
    if (typeof file === 'string') {
        try {
            const base64Response = await fetch(file);
            const blob = await base64Response.blob();
            fileToUpload = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        } catch (error) {
            console.error('Error al convertir imagen base64:', error);
            throw new Error('Error al procesar la imagen capturada');
        }
    } else {
        fileToUpload = file;
    }
    
    // Crear parámetros de consulta
    const queryParams = new URLSearchParams({
        name: userData.name,
        email: userData.email,
        phone: userData.phone
    });
    
    // URL completa con parámetros
    const url = `${API_URL}?${queryParams}`;
    
    // Crear FormData solo con el archivo
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
        console.log('Enviando datos a la API:', url);
        console.log('Archivo:', fileToUpload.name);
        
        // Realizar la petición a la API
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        // Mostrar información detallada de la respuesta
        console.log('Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText
        });
        
        // Obtener el cuerpo de la respuesta (como texto primero)
        const responseText = await response.text();
        console.log('Respuesta del servidor (texto):', responseText);
        
        // Si la respuesta no es exitosa
        if (!response.ok) {
            let errorDetail = "Error desconocido";
            
            // Intentar parsear el texto como JSON
            try {
                const errorJson = JSON.parse(responseText);
                errorDetail = errorJson.error || errorJson.detail || `Error ${response.status}: ${response.statusText}`;
            } catch (e) {
                errorDetail = responseText || `Error ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(errorDetail);
        }
        
        // Convertir la respuesta a JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Error al parsear la respuesta como JSON:', e);
            throw new Error('La respuesta del servidor no es un JSON válido');
        }
        
        console.log('Datos procesados recibidos:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error al enviar el archivo a la API:', error);
        throw error;
    }
};