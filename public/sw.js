/**
 * Service Worker mejorado para LIRA
 * Estrategias de caché inteligentes y sincronización en background
 */

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  STATIC: `lira-static-${CACHE_VERSION}`,
  DYNAMIC: `lira-dynamic-${CACHE_VERSION}`,
  API: `lira-api-${CACHE_VERSION}`,
  IMAGES: `lira-images-${CACHE_VERSION}`
};

// Recursos estáticos que siempre se deben cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg',
  '/lira.png',
  '/Lira.ico'
];

// Límites de caché
const CACHE_LIMITS = {
  DYNAMIC: 50,
  API: 30,
  IMAGES: 60
};

// Tiempo de vida de caché (en milisegundos)
const CACHE_EXPIRATION = {
  API: 5 * 60 * 1000,      // 5 minutos
  IMAGES: 7 * 24 * 60 * 60 * 1000,  // 7 días
  DYNAMIC: 24 * 60 * 60 * 1000     // 24 horas
};

/**
 * Evento de instalación - Cachea recursos estáticos
 */
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then(cache => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(error => console.error('[SW] Error al cachear recursos estáticos:', error))
  );
});

/**
 * Evento de activación - Limpia cachés antiguos
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // Eliminar cachés que no son de la versión actual
              return !Object.values(CACHE_NAMES).includes(name);
            })
            .map(name => {
              console.log('[SW] Eliminando caché antiguo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(error => console.error('[SW] Error al limpiar cachés:', error))
  );
});

/**
 * Limita el tamaño de un caché específico
 */
const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
      }
    });
  });
};

/**
 * Verifica si un recurso en caché ha expirado
 */
const isCacheExpired = (cachedResponse, maxAge) => {
  if (!cachedResponse) return true;
  
  const cachedDate = cachedResponse.headers.get('sw-cache-date');
  if (!cachedDate) return true;
  
  const cacheTime = new Date(cachedDate).getTime();
  const now = Date.now();
  
  return (now - cacheTime) > maxAge;
};

/**
 * Añade metadatos de fecha al caché
 */
const addCacheDate = (response) => {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.append('sw-cache-date', new Date().toISOString());
  
  return new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers
  });
};

/**
 * Estrategia: Cache First (para recursos estáticos)
 */
const cacheFirst = async (request, cacheName) => {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = addCacheDate(response);
      cache.put(request, responseToCache);
      limitCacheSize(cacheName, CACHE_LIMITS.DYNAMIC);
    }
    return response;
  } catch (error) {
    console.error('[SW] Error en Cache First:', error);
    return cached || new Response('Offline', { status: 503 });
  }
};

/**
 * Estrategia: Network First (para API calls)
 */
const networkFirst = async (request, cacheName, maxAge) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = addCacheDate(response);
      cache.put(request, responseToCache);
      limitCacheSize(cacheName, CACHE_LIMITS.API);
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cached = await caches.match(request);
    
    if (cached && !isCacheExpired(cached, maxAge)) {
      console.log('[SW] Returning valid cached response');
      return cached;
    }
    
    if (cached) {
      console.log('[SW] Cache expired, but returning anyway (offline mode)');
      return cached;
    }
    
    return new Response(JSON.stringify({ error: 'Offline', fromCache: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Estrategia: Stale While Revalidate (para imágenes)
 */
const staleWhileRevalidate = async (request, cacheName) => {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => {
        const responseToCache = addCacheDate(response);
        c.put(request, responseToCache);
        limitCacheSize(cacheName, CACHE_LIMITS.IMAGES);
      });
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
};

/**
 * Evento de fetch - Maneja todas las peticiones
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar peticiones GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar extensiones del navegador
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // Estrategia para recursos estáticos
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.STATIC));
    return;
  }
  
  // Estrategia para API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.API, CACHE_EXPIRATION.API));
    return;
  }
  
  // Estrategia para imágenes
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.IMAGES));
    return;
  }
  
  // Estrategia por defecto para otros recursos dinámicos
  event.respondWith(cacheFirst(request, CACHE_NAMES.DYNAMIC));
});

/**
 * Background Sync - Sincroniza datos cuando hay conexión
 */
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

/**
 * Sincroniza el progreso pendiente
 */
const syncProgressData = async () => {
  try {
    console.log('[SW] Sincronizando progreso...');
    
    // Obtener elementos de la cola de sincronización desde IndexedDB
    const db = await openIndexedDB();
    const queue = await getSyncQueueFromDB(db);
    
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body)
        });
        
        if (response.ok) {
          await removeFromSyncQueueDB(db, item.id);
          console.log('[SW] Item sincronizado:', item.id);
        }
      } catch (error) {
        console.error('[SW] Error al sincronizar item:', error);
      }
    }
    
    console.log('[SW] Sincronización completada');
  } catch (error) {
    console.error('[SW] Error en syncProgressData:', error);
  }
};

/**
 * Abre la base de datos IndexedDB
 */
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LiraDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Obtiene la cola de sincronización de IndexedDB
 */
const getSyncQueueFromDB = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Elimina un item de la cola de sincronización
 */
const removeFromSyncQueueDB = (db, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Manejo de mensajes desde la aplicación
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker cargado');


