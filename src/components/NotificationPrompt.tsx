import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, checkNotificationPermission } from '../utils/notificationService';
import { toast } from 'react-hot-toast';

const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya tiene permisos o si ya se le ha mostrado el prompt
    const permission = checkNotificationPermission();
    const hasSeenPrompt = localStorage.getItem('notificationPromptShown');
    const userId = localStorage.getItem('id_usuario');

    console.log('🔔 [NotificationPrompt] Verificando estado de notificaciones:', {
      permission,
      hasSeenPrompt,
      userId,
      timestamp: new Date().toISOString()
    });

    // Mostrar el prompt solo si:
    // 1. El usuario no ha dado permisos
    // 2. No se le ha mostrado el prompt antes (o fue hace más de 7 días)
    if (permission === 'default' && !hasSeenPrompt) {
      console.log('🔔 [NotificationPrompt] Mostrando prompt en 3 segundos...');
      // Esperar un poco después de cargar la página para mostrar el prompt
      const timer = setTimeout(() => {
        console.log('🔔 [NotificationPrompt] Prompt visible ahora');
        setShowPrompt(true);
      }, 3000); // Mostrar después de 3 segundos

      return () => clearTimeout(timer);
    } else {
      console.log('🔔 [NotificationPrompt] No se mostrará el prompt:', {
        reason: permission !== 'default' ? 'Permisos ya otorgados/denegados' : 'Prompt ya mostrado',
        permission
      });
    }
  }, []);

  const handleEnableNotifications = async () => {
    const userId = localStorage.getItem('id_usuario');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('🔔 [NotificationPrompt] Usuario intentando activar notificaciones:', {
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    });

    try {
      setIsRequesting(true);
      console.log('🔔 [NotificationPrompt] Iniciando proceso de activación...');
      
      const success = await requestNotificationPermission();
      
      if (success) {
        console.log('✅ [NotificationPrompt] Notificaciones activadas exitosamente para usuario:', {
          userId,
          userEmail,
          timestamp: new Date().toISOString()
        });
        toast.success('Notificaciones activadas correctamente');
        setShowPrompt(false);
        localStorage.setItem('notificationPromptShown', 'true');
      } else {
        console.warn('⚠️ [NotificationPrompt] No se pudieron activar las notificaciones:', {
          userId,
          userEmail,
          timestamp: new Date().toISOString()
        });
        toast.error('No se pudieron activar las notificaciones');
      }
    } catch (error) {
      console.error('❌ [NotificationPrompt] Error al solicitar permisos de notificación:', {
        error,
        userId,
        userEmail,
        timestamp: new Date().toISOString()
      });
      toast.error('Error al activar las notificaciones');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Recordar que el usuario descartó el prompt por 7 días
    localStorage.setItem('notificationPromptShown', 'true');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('notificationPromptExpiry', expiryDate.toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="bg-orange-100 p-2 rounded-full">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">Activa las notificaciones</h3>
          <p className="text-sm text-gray-600 mb-3">
            Recibe notificaciones importantes sobre tu progreso y nuevas actividades.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
            >
              {isRequesting ? 'Activando...' : 'Activar'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;

