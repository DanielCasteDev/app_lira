// data.ts
import { API_BASE_URL } from '../../api/api_service';

export const loginUser = async (correo: string, contraseña: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contraseña }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al iniciar sesión");
  }

  return response.json();
};



export const registerParent = async (
  nombre: string,
  apellido: string,
  correo: string,
  telefono: string,
  contraseña: string
) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          nombre,
          apellido,
          correo,
          telefono,
          contraseña,
      }),
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar el padre");
  }

  return response.json();
};