import axios from 'axios';
import { API_BASE_URL } from '../../api/api_service';
import { fetchChildrenWithCache, type CachedDataResponse } from '../../utils/parentCacheService';

export const registerChild = async (
    nombre: string,
    apellido: string,
    fechaNacimiento: string,
    genero: string,
    username: string,
    password: string,
    selectedImage: string | null,
    parentId: string
) => {
    const childData = {
        nombre,
        apellido,
        fechaNacimiento,
        genero,
        username,
        contraseña: password,
        avatar: selectedImage,
        parentId,
    };

    try {
        const response = await axios.post(`${API_BASE_URL}/registrar_hijo`, childData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('Token')}`,
            },
        });

        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        console.error('Error al registrar el hijo:', error);
        throw error;
    }
};

interface Child {
    _id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    genero: string;
    username: string;
    avatar?: string;
    totalPoints: number; // Obligatorio

}

export const fetchChildren = async (): Promise<Child[]> => {
    const parentId = localStorage.getItem("id");
    const token = localStorage.getItem("Token");

    if (!parentId) {
        throw new Error("No se encontró el ID del padre.");
    }

    if (!token) {
        throw new Error("No se encontró el token de autenticación.");
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/children/${parentId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data; // Asegúrate de que el servidor devuelva un array de objetos Child
        } else {
            throw new Error("Error al obtener los hijos");
        }
    } catch (error) {
        console.error('Error al obtener los hijos:', error);
        throw error;
    }
};

/**
 * Obtiene los hijos con soporte de caché offline
 * Retorna tanto los datos como información sobre el caché
 */
export const fetchChildrenWithCacheInfo = async (): Promise<CachedDataResponse<Child[]>> => {
    const parentId = localStorage.getItem("id");
    const token = localStorage.getItem("Token");

    if (!parentId) {
        throw new Error("No se encontró el ID del padre.");
    }

    if (!token) {
        throw new Error("No se encontró el token de autenticación.");
    }

    const result = await fetchChildrenWithCache(parentId, token, API_BASE_URL);
    
    return {
        ...result,
        data: result.data as Child[]
    };
};