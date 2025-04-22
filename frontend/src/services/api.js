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
    
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    
    // Agregar los datos del usuario al FormData
    formData.append('name', userData.name || '');
    formData.append('email', userData.email || '');
    formData.append('phone', userData.phone || '');
  
    // Si el archivo es una cadena (base64 de la imagen capturada)
    if (typeof file === 'string') {
      try {
        // Convertir la cadena base64 a un Blob
        const base64Response = await fetch(file);
        const blob = await base64Response.blob();
        
        // Crear un archivo a partir del blob
        const fileFromBlob = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        formData.append('file', fileFromBlob);
      } catch (error) {
        console.error('Error al convertir imagen base64:', error);
        throw new Error('Error al procesar la imagen capturada');
      }
    } else {
      // Si es un archivo normal, agregarlo directamente
      formData.append('file', file);
    }
  
    try {
      console.log('Enviando datos a la API:', API_URL);
      
      // Realizar la petición a la API
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        // No incluimos el modo 'no-cors' porque hemos configurado CORS en el backend
      });
  
      // Mostrar información detallada de la respuesta
      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers])
      });
  
      if (!response.ok) {
        // Intentar obtener el mensaje de error del cuerpo de la respuesta
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || `Error ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
  
      // Devolver los datos procesados
      const responseData = await response.json();
      console.log('Datos procesados recibidos:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error al enviar el archivo a la API:', error);
      throw error;
    }
};  