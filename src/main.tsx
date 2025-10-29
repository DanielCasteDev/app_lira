import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupSyncListeners } from './utils/syncService'
import { initDB } from './utils/indexedDB'

// Inicializar IndexedDB
initDB().then(() => {
  console.log('✅ IndexedDB inicializado correctamente');
}).catch(error => {
  console.error('❌ Error al inicializar IndexedDB:', error);
});

// Configurar listeners de sincronización
setupSyncListeners();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar Service Worker con mejor manejo
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Escuchar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nueva versión del Service Worker disponible');
                // Opcional: Mostrar notificación al usuario para recargar
                if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });

        // Registrar sincronización periódica si está soportado
        if ('periodicSync' in registration) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodicSync = (registration as any).periodicSync;
          if (periodicSync) {
            periodicSync.register('sync-progress', {
              minInterval: 24 * 60 * 60 * 1000 // 24 horas
            }).then(() => {
              console.log('✅ Sincronización periódica registrada');
            }).catch((error: Error) => {
              console.warn('⚠️ No se pudo registrar sincronización periódica:', error);
            });
          }
        }

        // Registrar sincronización en background si está soportado
        if ('sync' in registration) {
          console.log('✅ Background Sync disponible');
        }
      })
      .catch(error => {
        console.error('❌ Error al registrar Service Worker:', error);
      });

    // Manejar cambios en el controlador del Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker actualizado, recargando...');
      window.location.reload();
    });
  });
}
