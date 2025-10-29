/**
 * Sistema de IndexedDB para almacenamiento local
 * Permite que la app funcione offline y sincronice datos automáticamente
 */

const DB_NAME = 'LiraDB';
const DB_VERSION = 2; // Incrementado para agregar parentCache store

// Nombres de los stores
export const STORES = {
  PROGRESS: 'childProgress',
  PROFILES: 'childProfiles',
  SYNC_QUEUE: 'syncQueue',
  STORIES: 'stories',
  GAME_DATA: 'gameData',
  PARENT_CACHE: 'parentCache'
};

export interface ChildProgress {
  childId: string;
  gameName: string;
  points: number;
  levelsCompleted?: number;
  completedStories?: number[];
  highestDifficulty?: string;
  lastPlayed: string;
  synced: boolean;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  edad?: number;
  synced: boolean;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  url: string;
  method: string;
  body: Record<string, unknown>;
  headers: Record<string, string>;
  timestamp: string;
  retries: number;
}

export interface StoryData {
  id: number;
  title: string;
  content: string[];
  questions: Array<{
    id: number;
    text: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }>;
  image: string;
  level: number;
  ageGroup: number;
  cachedAt: string;
}

/**
 * Inicializa la base de datos IndexedDB
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error al abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para progreso de niños
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, {
          keyPath: 'id',
          autoIncrement: true
        });
        progressStore.createIndex('childId', 'childId', { unique: false });
        progressStore.createIndex('gameName', 'gameName', { unique: false });
        progressStore.createIndex('synced', 'synced', { unique: false });
      }

      // Store para perfiles de niños
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profilesStore = db.createObjectStore(STORES.PROFILES, {
          keyPath: 'id'
        });
        profilesStore.createIndex('synced', 'synced', { unique: false });
      }

      // Store para cola de sincronización
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id'
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store para cuentos en caché
      if (!db.objectStoreNames.contains(STORES.STORIES)) {
        const storiesStore = db.createObjectStore(STORES.STORIES, {
          keyPath: 'id'
        });
        storiesStore.createIndex('ageGroup', 'ageGroup', { unique: false });
      }

      // Store para datos generales de juegos
      if (!db.objectStoreNames.contains(STORES.GAME_DATA)) {
        db.createObjectStore(STORES.GAME_DATA, {
          keyPath: 'key'
        });
      }

      // Store para caché del padre
      if (!db.objectStoreNames.contains(STORES.PARENT_CACHE)) {
        const parentStore = db.createObjectStore(STORES.PARENT_CACHE, {
          keyPath: 'key'
        });
        parentStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      console.log('Base de datos IndexedDB creada/actualizada correctamente');
    };
  });
};

/**
 * Obtiene una transacción de la base de datos
 */
const getTransaction = async (
  storeName: string,
  mode: IDBTransactionMode = 'readonly'
): Promise<IDBObjectStore> => {
  const db = await initDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

/**
 * Guarda el progreso de un niño en IndexedDB
 */
export const saveProgressLocal = async (progress: ChildProgress): Promise<void> => {
  try {
    const store = await getTransaction(STORES.PROGRESS, 'readwrite');
    progress.updatedAt = new Date().toISOString();
    progress.synced = false;

    await new Promise<void>((resolve, reject) => {
      const request = store.add(progress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Progreso guardado localmente:', progress);
  } catch (error) {
    console.error('Error al guardar progreso local:', error);
    throw error;
  }
};

/**
 * Obtiene el progreso de un niño desde IndexedDB
 */
export const getProgressLocal = async (childId: string): Promise<ChildProgress[]> => {
  try {
    const store = await getTransaction(STORES.PROGRESS, 'readonly');
    const index = store.index('childId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(childId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener progreso local:', error);
    return [];
  }
};

/**
 * Guarda el perfil de un niño en IndexedDB
 */
export const saveProfileLocal = async (profile: ChildProfile): Promise<void> => {
  try {
    const store = await getTransaction(STORES.PROFILES, 'readwrite');
    profile.updatedAt = new Date().toISOString();
    profile.synced = false;

    await new Promise<void>((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Perfil guardado localmente:', profile);
  } catch (error) {
    console.error('Error al guardar perfil local:', error);
    throw error;
  }
};

/**
 * Obtiene el perfil de un niño desde IndexedDB
 */
export const getProfileLocal = async (childId: string): Promise<ChildProfile | null> => {
  try {
    const store = await getTransaction(STORES.PROFILES, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(childId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener perfil local:', error);
    return null;
  }
};

/**
 * Agrega un elemento a la cola de sincronización
 */
export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> => {
  try {
    const store = await getTransaction(STORES.SYNC_QUEUE, 'readwrite');
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Elemento agregado a la cola de sincronización:', queueItem);
  } catch (error) {
    console.error('Error al agregar a cola de sincronización:', error);
    throw error;
  }
};

/**
 * Obtiene todos los elementos de la cola de sincronización
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const store = await getTransaction(STORES.SYNC_QUEUE, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener cola de sincronización:', error);
    return [];
  }
};

/**
 * Elimina un elemento de la cola de sincronización
 */
export const removeFromSyncQueue = async (id: string): Promise<void> => {
  try {
    const store = await getTransaction(STORES.SYNC_QUEUE, 'readwrite');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Elemento eliminado de la cola de sincronización:', id);
  } catch (error) {
    console.error('Error al eliminar de cola de sincronización:', error);
    throw error;
  }
};

/**
 * Actualiza el contador de reintentos de un elemento en la cola
 */
export const updateSyncQueueRetry = async (id: string): Promise<void> => {
  try {
    const store = await getTransaction(STORES.SYNC_QUEUE, 'readwrite');
    
    const getRequest = store.get(id);
    
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries += 1;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error al actualizar reintentos:', error);
    throw error;
  }
};

/**
 * Guarda un cuento en caché
 */
export const cacheStory = async (story: StoryData): Promise<void> => {
  try {
    const store = await getTransaction(STORES.STORIES, 'readwrite');
    story.cachedAt = new Date().toISOString();

    await new Promise<void>((resolve, reject) => {
      const request = store.put(story);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Cuento guardado en caché:', story.title);
  } catch (error) {
    console.error('Error al guardar cuento en caché:', error);
    throw error;
  }
};

/**
 * Obtiene todos los cuentos en caché
 */
export const getCachedStories = async (): Promise<StoryData[]> => {
  try {
    const store = await getTransaction(STORES.STORIES, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener cuentos en caché:', error);
    return [];
  }
};

/**
 * Guarda datos generales de juego
 */
export const saveGameData = async (key: string, data: unknown): Promise<void> => {
  try {
    const store = await getTransaction(STORES.GAME_DATA, 'readwrite');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key, data, updatedAt: new Date().toISOString() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Datos de juego guardados:', key);
  } catch (error) {
    console.error('Error al guardar datos de juego:', error);
    throw error;
  }
};

/**
 * Obtiene datos generales de juego
 */
export const getGameData = async (key: string): Promise<unknown> => {
  try {
    const store = await getTransaction(STORES.GAME_DATA, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener datos de juego:', error);
    return null;
  }
};

/**
 * Marca el progreso como sincronizado
 */
export const markProgressAsSynced = async (id: number): Promise<void> => {
  try {
    const store = await getTransaction(STORES.PROGRESS, 'readwrite');
    
    const getRequest = store.get(id);
    
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error al marcar progreso como sincronizado:', error);
    throw error;
  }
};

/**
 * Guarda datos del padre en caché (hijos y su progreso)
 */
export const saveParentCache = async (key: string, data: unknown): Promise<void> => {
  try {
    const store = await getTransaction(STORES.PARENT_CACHE, 'readwrite');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ 
        key, 
        data, 
        timestamp: new Date().toISOString() 
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('📦 Datos del padre guardados en caché:', key);
  } catch (error) {
    console.error('Error al guardar caché del padre:', error);
    throw error;
  }
};

/**
 * Obtiene datos del padre desde caché
 */
export const getParentCache = async (key: string): Promise<{ data: unknown; timestamp: string } | null> => {
  try {
    const store = await getTransaction(STORES.PARENT_CACHE, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({ data: result.data, timestamp: result.timestamp });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error al obtener caché del padre:', error);
    return null;
  }
};

/**
 * Verifica si el caché del padre está desactualizado (más de 5 minutos)
 */
export const isParentCacheStale = (timestamp: string): boolean => {
  const cacheTime = new Date(timestamp).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - cacheTime) > fiveMinutes;
};

/**
 * Limpia datos antiguos (más de 30 días)
 */
export const cleanOldData = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Limpiar cuentos antiguos
    const storiesStore = await getTransaction(STORES.STORIES, 'readwrite');
    const storiesRequest = storiesStore.getAll();

    storiesRequest.onsuccess = () => {
      const stories = storiesRequest.result as StoryData[];
      stories.forEach(story => {
        if (new Date(story.cachedAt) < thirtyDaysAgo) {
          storiesStore.delete(story.id);
        }
      });
    };

    console.log('Limpieza de datos antiguos completada');
  } catch (error) {
    console.error('Error al limpiar datos antiguos:', error);
  }
};

// Inicializar la base de datos al cargar el módulo
initDB().catch(error => {
  console.error('Error al inicializar IndexedDB:', error);
});

