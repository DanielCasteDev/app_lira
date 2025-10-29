/**
 * Servicio de caché para el dashboard del padre
 * Sistema simple de caché con indicadores visuales
 */

import { isOnline } from './syncService';
import { saveParentCache, getParentCache, isParentCacheStale } from './indexedDB';

export interface CachedDataResponse<T> {
  data: T;
  fromCache: boolean;
  isStale: boolean;
  cachedAt?: string;
}

/**
 * Obtiene los hijos del padre con fallback a caché
 */
export const fetchChildrenWithCache = async (
  parentId: string,
  token: string,
  apiUrl: string
): Promise<CachedDataResponse<unknown[]>> => {
  const cacheKey = `children_${parentId}`;

  // Intentar obtener de la API si hay conexión
  if (isOnline()) {
    try {
      const response = await fetch(`${apiUrl}/children/${parentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar en caché
        await saveParentCache(cacheKey, data);
        
        console.log('✅ Hijos obtenidos de la API');
        return {
          data,
          fromCache: false,
          isStale: false
        };
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener de la API, usando caché', error);
    }
  }

  // Fallback a caché
  console.log('📦 Cargando hijos desde caché local');
  const cached = await getParentCache(cacheKey);
  
  if (cached) {
    return {
      data: cached.data as unknown[],
      fromCache: true,
      isStale: isParentCacheStale(cached.timestamp),
      cachedAt: cached.timestamp
    };
  }

  // Sin datos disponibles
  throw new Error('No hay datos disponibles. Necesitas conexión a internet.');
};

/**
 * Muestra un banner de advertencia cuando los datos están en caché
 */
export const showCacheWarning = (isStale: boolean, cachedAt?: string): string => {
  if (!isStale && cachedAt) {
    const timeAgo = getTimeAgo(cachedAt);
    return `📦 Mostrando datos en caché (actualizados hace ${timeAgo})`;
  }
  
  if (isStale && cachedAt) {
    const timeAgo = getTimeAgo(cachedAt);
    return `⚠️ Datos desactualizados (última actualización hace ${timeAgo}). Conéctate para actualizar.`;
  }

  return '📴 Sin conexión. Mostrando datos guardados.';
};

/**
 * Calcula cuánto tiempo hace que se cachearon los datos
 */
const getTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'unos segundos';
};

/**
 * Limpia el caché del padre manualmente
 */
export const clearParentCache = async (parentId: string): Promise<void> => {
  const cacheKey = `children_${parentId}`;
  await saveParentCache(cacheKey, []);
  console.log('🗑️ Caché del padre limpiado');
};

export default {
  fetchChildrenWithCache,
  showCacheWarning,
  clearParentCache
};

