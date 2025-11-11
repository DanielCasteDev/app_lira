/**
 * Componente para mostrar el estado de conexión
 * y sincronización de datos - Versión mejorada y elegante
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isOnline, syncPendingItems } from '../utils/syncService';
import { getSyncQueue } from '../utils/indexedDB';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [showStatus, setShowStatus] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Manejar sincronización manual
  const handleSync = useCallback(async () => {
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
  }, [online, isSyncing]);

  // Actualizar el estado de conexión
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isCurrentlyOnline = navigator.onLine;
      setOnline(isCurrentlyOnline);
      setShowStatus(true);

      // Ocultar después de 4 segundos
      setTimeout(() => setShowStatus(false), 4000);

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
  }, [handleSync]);

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

  // Solo mostrar el indicador si está offline o hay pendientes
  const shouldShowIndicator = !online || pendingCount > 0;

  return (
    <>
      {/* Indicador compacto integrado en el navbar */}
      {shouldShowIndicator && (
        <div className="fixed top-4 right-28 md:right-32 z-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative"
          >
            <button
              onClick={online && !isSyncing ? handleSync : undefined}
              disabled={!online || isSyncing}
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all ${
                online
                  ? pendingCount > 0
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-red-500 text-white animate-pulse'
              } ${online && !isSyncing && pendingCount > 0 ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : online ? (
                pendingCount > 0 ? (
                  <RefreshCw className="w-5 h-5" />
                ) : (
                  <Wifi className="w-5 h-5" />
                )
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
              
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-orange-500">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {/* Tooltip informativo */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 z-50"
                >
                  <div className="flex items-start space-x-2">
                    {online ? (
                      pendingCount > 0 ? (
                        <>
                          <RefreshCw className="w-4 h-4 mt-0.5 text-orange-400" />
                          <div>
                            <p className="font-semibold">Sincronización pendiente</p>
                            <p className="text-xs text-gray-300 mt-1">
                              {pendingCount} elemento{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
                            </p>
                            {!isSyncing && (
                              <p className="text-xs text-orange-300 mt-1">Haz clic para sincronizar</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400" />
                          <div>
                            <p className="font-semibold">Conectado</p>
                            <p className="text-xs text-gray-300 mt-1">Todo sincronizado</p>
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 mt-0.5 text-red-400" />
                        <div>
                          <p className="font-semibold">Sin conexión</p>
                          <p className="text-xs text-gray-300 mt-1">
                            Los cambios se guardarán localmente
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Notificación toast de cambio de estado */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-50"
          >
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-sm ${
                online
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              {online ? (
                <Wifi className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {online ? '¡Conectado!' : 'Sin conexión'}
                </p>
                <p className="text-xs opacity-90">
                  {online
                    ? 'Sincronizando datos...'
                    : 'Modo offline activado'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de progreso de sincronización en la parte superior */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 z-50"
            style={{ transformOrigin: 'left' }}
          >
            <motion.div
              className="h-full bg-white/40"
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

