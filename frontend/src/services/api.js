// frontend/src/services/api.js

/**
 * Envía un archivo a la API para procesar un CV
 * @param {File|String} file - El archivo a enviar (puede ser un objeto File o una cadena base64)
 * @param {Object} userData - Datos del usuario (nombre, email, teléfono)
 * @returns {Promise} - Promise con el resultado de la API
 */
export const uploadCV = async (file, userData) => {
  // URL de la API
  const API_URL = "http://localhost:8000/CV_Extraction/";

  // Validar datos
  if (!userData.name || !userData.email || !userData.phone) {
    throw new Error("Todos los campos son obligatorios");
  }

  // Preparar el archivo
  let fileToUpload = null;

  // Si el archivo es una cadena (base64 de la imagen capturada)
  if (typeof file === "string") {
    try {
      const base64Response = await fetch(file);
      const blob = await base64Response.blob();
      fileToUpload = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });
    } catch (error) {
      console.error("Error al convertir imagen base64:", error);
      throw new Error("Error al procesar la imagen capturada");
    }
  } else {
    fileToUpload = file;
  }

  // Crear parámetros de consulta
  const queryParams = new URLSearchParams({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  });

  // URL completa con parámetros
  const url = `${API_URL}?${queryParams}`;

  // Crear FormData solo con el archivo
  const formData = new FormData();
  formData.append("file", fileToUpload);

  try {
    console.log("Enviando datos a la API:", url);
    console.log("Archivo:", {
      name: fileToUpload.name,
      type: fileToUpload.type,
      size: `${(fileToUpload.size / 1024).toFixed(2)} KB`,
    });

    // Realizar la petición a la API
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // Agregar timeout para evitar que la petición quede colgada
      signal: AbortSignal.timeout(60000), // 60 segundos de timeout
    });

    // Mostrar información detallada de la respuesta
    console.log("Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers]),
    });

    // Obtener el cuerpo de la respuesta (como texto primero)
    const responseText = await response.text();
    console.log("Respuesta del servidor (texto):", responseText);

    // Si la respuesta no es exitosa
    if (!response.ok) {
      let errorDetail = "Error desconocido";

      if (response.status === 500) {
        errorDetail =
          "Error interno del servidor. Posibles causas:\n" +
          "- El archivo podría ser demasiado grande o tener un formato no compatible\n" +
          "- El servidor podría estar experimentando problemas\n\n" +
          "Detalles técnicos: " +
          responseText;
      } else {
        // Intentar parsear el texto como JSON
        try {
          const errorJson = JSON.parse(responseText);
          errorDetail =
            errorJson.error ||
            errorJson.detail ||
            `Error ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorDetail =
            responseText || `Error ${response.status}: ${response.statusText}`;
        }
      }

      throw new Error(errorDetail);
    }

    // Si la respuesta está vacía, devolver un mensaje informativo
    if (!responseText || responseText.trim() === "") {
      console.warn("La respuesta del servidor está vacía");
      return {
        message: "El archivo fue procesado, pero el servidor no devolvió datos",
        basics: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        },
      };
    }

    // Convertir la respuesta a JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(
        "Error al parsear la respuesta como JSON:",
        e,
        "Texto recibido:",
        responseText,
      );
      throw new Error(
        "La respuesta del servidor no es un JSON válido: " +
          responseText.substring(0, 100),
      );
    }

    console.log("Datos procesados recibidos:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error al enviar el archivo a la API:", error);

    // Mejorar el manejo de errores para ser más específicos
    if (error.name === "AbortError") {
      throw new Error(
        "La solicitud ha excedido el tiempo máximo de espera (60 segundos)",
      );
    } else if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      );
    } else {
      throw error;
    }
  }
};
