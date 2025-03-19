// data.ts
import { API_BASE_URL } from '../../api/api_service';

/**
 * Función para obtener los usuarios.
 */
export const fetchUsers = async () => {
  const token = localStorage.getItem("Token"); // Obtener el token del localStorage

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Enviar el token en la cabecera
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los usuarios.");
  }

  return response.json();
};

/**
 * Función para generar un respaldo de la base de datos.
 */
export const generateBackup = async (collections: string[] = []) => {
  const token = localStorage.getItem("Token"); // Obtener el token del localStorage

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  const response = await fetch(`${API_BASE_URL}/backup?collections=${collections.join(',')}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Enviar el token en la cabecera
    },
  });

  if (!response.ok) {
    throw new Error("Error al generar el respaldo.");
  }

  // Convertir la respuesta a JSON
  const data = await response.json();

  // Crear un archivo JSON descargable
  const jsonData = JSON.stringify(data, null, 2); // Formatear el JSON
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);

  // Crear un enlace temporal para descargar el archivo
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-${new Date().toISOString()}.json`; // Nombre del archivo
  document.body.appendChild(a);
  a.click();

  // Limpiar el enlace temporal
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return { success: true, message: "Respaldo generado y descargado con éxito" };
};

export const getCollections = async () => {
  const token = localStorage.getItem("Token"); // Obtener el token del localStorage

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  const response = await fetch(`${API_BASE_URL}/collections`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Enviar el token en la cabecera
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las colecciones.");
  }

  // Convertir la respuesta a JSON
  const data = await response.json();
  return data.data; // Retornar la lista de colecciones
};