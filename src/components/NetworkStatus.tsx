/**
 * Componente para mostrar el estado de conexión
 * y sincronización de datos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isOnline, syncPendingItems } from '../utils/syncService';
import { getSyncQueue } from '../utils/indexedDB';

const NetworkStatus: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [showStatus, setShowStatus] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Actualizar el estado de conexión
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isCurrentlyOnline = navigator.onLine;
      setOnline(isCurrentlyOnline);
      setShowStatus(true);

      // Ocultar después de 3 segundos
      setTimeout(() => setShowStatus(false), 3000);

      // Si volvemos online, sincronizar
      if (isCurrentlyOnline) {
        handleSync();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Actualizar contador de elementos pendientes
  useEffect(() => {
    const updatePendingCount = async () => {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [online]);

  // Manejar sincronización manual
  const handleSync = async () => {
    if (!online || isSyncing) return;

    setIsSyncing(true);
    try {
      await syncPendingItems();
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Indicador permanente en la esquina */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg ${
            online
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${online ? 'bg-white' : 'bg-white animate-pulse'}`} />
          <span className="text-sm font-medium">
            {online ? 'Online' : 'Offline'}
          </span>
          
          {pendingCount > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs">•</span>
              <span className="text-xs">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
              {online && !isSyncing && (
                <button
                  onClick={handleSync}
                  className="ml-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded"
                >
                  Sincronizar
                </button>
              )}
              {isSyncing && (
                <div className="ml-1 text-xs">
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Notificación de cambio de estado */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div
              className={`px-6 py-4 rounded-xl shadow-2xl ${
                online
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {online ? '🌐' : '📴'}
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {online ? '¡Conectado!' : 'Sin conexión'}
                  </p>
                  <p className="text-sm">
                    {online
                      ? 'Sincronizando datos...'
                      : 'Los cambios se guardarán localmente'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de progreso de sincronización */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 z-50"
            style={{ transformOrigin: 'left' }}
          >
            <motion.div
              className="h-full bg-white/30"
              animate={{ x: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NetworkStatus;

