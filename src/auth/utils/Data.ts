// data.ts
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../../api/api_service';

interface TokenResponse {
  valid: boolean;
  message?: string;
}

interface ResetResponse {
  message: string;
}

// Solicitar restablecimiento de contraseña
export const forgotPassword = async (correo: string): Promise<ResetResponse> => {
  try {
    const response = await axios.post<ResetResponse>(
      `${API_BASE_URL}/forgot-password`,
      { correo }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ResetResponse>;
    throw new Error(axiosError.response?.data?.message || 'Error al solicitar restablecimiento');
  }
};

// Verificar token de restablecimiento
export const verifyResetToken = async (token: string): Promise<TokenResponse> => {
  try {
    const response = await axios.get<TokenResponse>(`${API_BASE_URL}/verify-token/${token}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<TokenResponse>;
    throw new Error(axiosError.response?.data?.message || 'Error al verificar el token');
  }
};

// Restablecer contraseña
export const resetPassword = async (token: string, newPassword: string): Promise<ResetResponse> => {
  try {
    const response = await axios.post<ResetResponse>(
      `${API_BASE_URL}/reset-password/${token}`,
      { nuevaContraseña: newPassword }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ResetResponse>;
    throw new Error(axiosError.response?.data?.message || 'Error al restablecer la contraseña');
  }
};

// Las otras funciones que ya tenías...
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

export const updateUserStatus = async (userId: string, newStatus: boolean) => {
  const endpoint = newStatus ? "activate" : "deactivate";
  const response = await fetch(`${API_BASE_URL}/${userId}/${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar el estado del usuario");
  }

  return response.json();
};