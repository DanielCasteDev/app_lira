// data.ts
import { API_BASE_URL } from '../../api/api_service';

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