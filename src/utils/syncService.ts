/**
 * Servicio de sincronización para manejar operaciones offline/online
 * Sincroniza automáticamente los datos cuando hay conexión
 */

import { API_BASE_URL } from '../api/api_service';
import {
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueRetry,
  addToSyncQueue,
  saveProgressLocal,
  getProgressLocal,
  saveProfileLocal,
  getProfileLocal,
  type ChildProgress
} from './indexedDB';

const MAX_RETRIES = 3;
let isSyncing = false;

// Tipos de respuesta
interface ProgressResponse {
  progress?: ChildProgress[];
  fromCache?: boolean;
}

interface ProfileResponse {
  childProfile?: {
    id?: string;
    nombre?: string;
    apellido?: string;
    fechaNacimiento?: string;
    [key: string]: unknown;
  };
  progress?: {
    CuentosDivertidos?: {
      completedStories?: number[];
    };
    [key: string]: unknown;
  };
  fromCache?: boolean;
}

/**
 * Detecta si hay conexión a internet
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Guarda el progreso del juego (online u offline)
 */
export const saveProgressWithSync = async (
  childId: string,
  gameData: {
    gameName: string;
    points: number;
    levelsCompleted?: number;
    completedStories?: number[];
    highestDifficulty?: string;
    lastPlayed: Date | string;
  },
  totalPoints: number
): Promise<{ success: boolean; offline: boolean }> => {
  const token = localStorage.getItem('Token');
  
  // Preparar datos
  const progressData: ChildProgress = {
    childId,
    gameName: gameData.gameName,
    points: gameData.points,
    levelsCompleted: gameData.levelsCompleted,
    completedStories: gameData.completedStories,
    highestDifficulty: gameData.highestDifficulty,
    lastPlayed: typeof gameData.lastPlayed === 'string' 
      ? gameData.lastPlayed 
      : gameData.lastPlayed.toISOString(),
    synced: false,
    updatedAt: new Date().toISOString()
  };

  // Guardar localmente primero
  try {
    await saveProgressLocal(progressData);
  } catch (error) {
    console.error('Error al guardar localmente:', error);
  }

  // Si hay conexión, intentar sincronizar inmediatamente
  if (isOnline() && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/child-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          childId,
          gameData: {
            gameName: gameData.gameName,
            points: gameData.points,
            levelsCompleted: gameData.levelsCompleted,
            completedStories: gameData.completedStories,
            highestDifficulty: gameData.highestDifficulty,
            lastPlayed: gameData.lastPlayed
          },
          totalPoints
        })
      });

      if (response.ok) {
        console.log('✅ Progreso sincronizado en tiempo real');
        return { success: true, offline: false };
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.warn('⚠️ No se pudo sincronizar ahora, se guardó en cola', error);
      
      // Agregar a la cola de sincronización
      await addToSyncQueue({
        url: `${API_BASE_URL}/child-progress`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: {
          childId,
          gameData: {
            gameName: gameData.gameName,
            points: gameData.points,
            levelsCompleted: gameData.levelsCompleted,
            completedStories: gameData.completedStories,
            highestDifficulty: gameData.highestDifficulty,
            lastPlayed: gameData.lastPlayed
          },
          totalPoints
        }
      });

      return { success: true, offline: true };
    }
  } else {
    console.log('📴 Modo offline - Datos guardados localmente');
    
    // Agregar a la cola de sincronización si tenemos token
    if (token) {
      await addToSyncQueue({
        url: `${API_BASE_URL}/child-progress`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: {
          childId,
          gameData: {
            gameName: gameData.gameName,
            points: gameData.points,
            levelsCompleted: gameData.levelsCompleted,
            completedStories: gameData.completedStories,
            highestDifficulty: gameData.highestDifficulty,
            lastPlayed: gameData.lastPlayed
          },
          totalPoints
        }
      });
    }

    return { success: true, offline: true };
  }
};

/**
 * Obtiene el progreso con fallback a caché local
 */
export const getProgressWithCache = async (childId: string): Promise<ProgressResponse> => {
  const token = localStorage.getItem('Token');

  // Intentar obtener de la API si hay conexión
  if (isOnline() && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/child-progress/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Progreso obtenido de la API');
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener de la API, usando caché local', error);
    }
  }

  // Fallback a caché local
  console.log('📦 Usando datos del caché local');
  const localProgress = await getProgressLocal(childId);
  return {
    progress: localProgress,
    fromCache: true
  };
};

/**
 * Obtiene el perfil con fallback a caché local
 */
export const getProfileWithCache = async (childId: string): Promise<ProfileResponse | null> => {
  const token = localStorage.getItem('Token');

  // Intentar obtener de la API si hay conexión
  if (isOnline() && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/child-profile/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar en caché local
        if (data.childProfile) {
          await saveProfileLocal({
            id: childId,
            ...data.childProfile,
            synced: true,
            updatedAt: new Date().toISOString()
          });
        }
        
        console.log('✅ Perfil obtenido de la API');
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener perfil de la API, usando caché local', error);
    }
  }

  // Fallback a caché local
  console.log('📦 Usando perfil del caché local');
  const localProfile = await getProfileLocal(childId);
  
  if (localProfile) {
    return {
      childProfile: {
        id: localProfile.id,
        nombre: localProfile.nombre,
        apellido: localProfile.apellido,
        fechaNacimiento: localProfile.fechaNacimiento
      },
      fromCache: true
    };
  }

  return null;
};

/**
 * Sincroniza todos los elementos pendientes en la cola
 */
export const syncPendingItems = async (): Promise<void> => {
  if (isSyncing) {
    console.log('⏳ Sincronización ya en progreso...');
    return;
  }

  if (!isOnline()) {
    console.log('📴 Sin conexión, sincronización pospuesta');
    return;
  }

  isSyncing = true;
  console.log('🔄 Iniciando sincronización...');

  try {
    const queue = await getSyncQueue();
    console.log(`📋 ${queue.length} elementos en la cola de sincronización`);

    for (const item of queue) {
      try {
        // Validar que no haya excedido el máximo de reintentos
        if (item.retries >= MAX_RETRIES) {
          console.warn(`❌ Elemento ${item.id} excedió reintentos máximos, eliminando de la cola`);
          await removeFromSyncQueue(item.id);
          continue;
        }

        // Intentar sincronizar
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body)
        });

        if (response.ok) {
          console.log(`✅ Elemento ${item.id} sincronizado correctamente`);
          await removeFromSyncQueue(item.id);
        } else {
          console.warn(`⚠️ Error al sincronizar ${item.id}, reintentando después`);
          await updateSyncQueueRetry(item.id);
        }
      } catch (error) {
        console.error(`❌ Error al procesar elemento ${item.id}:`, error);
        await updateSyncQueueRetry(item.id);
      }
    }

    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    isSyncing = false;
  }
};

/**
 * Configura listeners para detectar cambios en la conexión
 */
export const setupSyncListeners = (): void => {
  // Escuchar cambios en la conexión
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada, iniciando sincronización...');
    syncPendingItems();
  });

  window.addEventListener('offline', () => {
    console.log('📴 Sin conexión - Modo offline activado');
  });

  // Sincronizar periódicamente cada 5 minutos si hay conexión
  setInterval(() => {
    if (isOnline()) {
      syncPendingItems();
    }
  }, 5 * 60 * 1000);

  // Sincronizar al cargar la página si hay conexión
  if (isOnline()) {
    setTimeout(() => {
      syncPendingItems();
    }, 2000);
  }

  console.log('👂 Listeners de sincronización configurados');
};

/**
 * Notifica al usuario sobre el estado de sincronización
 */
export const showSyncStatus = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void => {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity`;
  notification.textContent = message;
  notification.style.opacity = '0';
  
  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Exportar funciones de utilidad
export default {
  isOnline,
  saveProgressWithSync,
  getProgressWithCache,
  getProfileWithCache,
  syncPendingItems,
  setupSyncListeners,
  showSyncStatus
};

