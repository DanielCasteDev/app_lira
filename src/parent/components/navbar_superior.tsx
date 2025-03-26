import React, { useState, useEffect } from "react";
import { 
  FaBell, FaUser, FaUserShield, FaEnvelope, FaIdCard, 
  FaTimes, FaChild, FaPowerOff, FaTrash 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { API_BASE_URL } from "../../api/api_service";

interface ChildStatus {
  id: string;
  nombre: string;
  activo: boolean;
  lastActive?: Date;
}

interface Notification {
  id: string;
  text: string;
  time: string; // Cambiado a string para localStorage
  read: boolean;
  type: "connection" | "disconnection";
  childId: string;
}

const Navbar: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<Record<string, boolean>>({});
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  
  // Cargar notificaciones guardadas al iniciar
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  // Datos del usuario
  const userData = {
    id: localStorage.getItem("id") || "",
    id_usuario: localStorage.getItem("id_usuario") || "",
    userEmail: localStorage.getItem("userEmail") || "",
    userNombre: localStorage.getItem("userNombre") || "",
    userRole: localStorage.getItem("userRole") || ""
  };

  // Guardar notificaciones en localStorage
  const saveNotificationsToLocalStorage = (notis: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(notis));
  };

  // Función para agregar nuevas notificaciones
  const addNotifications = (newNotis: Notification[]) => {
    setNotifications(prev => {
      const updated = [...newNotis, ...prev];
      saveNotificationsToLocalStorage(updated);
      return updated;
    });
  };

  const formatRole = (role: string) => {
    switch(role) {
      case 'parent': return 'Padre/Madre';
      case 'teacher': return 'Profesor';
      case 'admin': return 'Administrador';
      default: return role;
    }
  };

  // Obtener estado de los hijos
  const fetchChildrenStatus = async () => {
    try {
      const now = Date.now();
      if (now - lastCheckTime < 10000) return;
      
      setLastCheckTime(now);
      
      const response = await axios.get(`${API_BASE_URL}/parent/${userData.id}/children/status`);
      const currentStatus: Record<string, boolean> = {};
      const newNotifications: Notification[] = [];
      
      response.data.forEach((child: ChildStatus) => {
        currentStatus[child.id] = child.activo;
        
        if (previousStatus[child.id] !== undefined && 
            previousStatus[child.id] !== child.activo) {
          
          const hasRecentNotification = notifications.some(
            n => n.childId === child.id && 
                 n.type === (child.activo ? 'connection' : 'disconnection') &&
                 now - new Date(n.time).getTime() < 30000
          );
          
          if (!hasRecentNotification) {
            newNotifications.push({
              id: `noti-${child.id}-${now}`,
              text: child.activo 
                ? `${child.nombre} se ha conectado` 
                : `${child.nombre} se ha desconectado`,
              time: new Date(now).toISOString(),
              read: false,
              type: child.activo ? 'connection' : 'disconnection',
              childId: child.id
            });
          }
        }
      });
      
      if (newNotifications.length > 0) {
        addNotifications(newNotifications);
      }
      
      setPreviousStatus(currentStatus);
    } catch (error) {
      console.error("Error al obtener estado de los hijos:", error);
    }
  };

  // Polling cada 10 segundos
  useEffect(() => {
    if (userData.userRole === 'parent') {
      fetchChildrenStatus();
      const interval = setInterval(fetchChildrenStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [previousStatus, notifications, lastCheckTime]);

  // Marcar notificaciones como leídas
  const markAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotificationsToLocalStorage(updated);
      return updated;
    });
  };

  // Limpiar todas las notificaciones
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  // Alternar modales
  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
    if (isNotificationsModalOpen) setIsNotificationsModalOpen(false);
  };

  const toggleNotificationsModal = () => {
    setIsNotificationsModalOpen(!isNotificationsModalOpen);
    if (isProfileModalOpen) setIsProfileModalOpen(false);
    if (!isNotificationsModalOpen) markAsRead();
  };

  // Animaciones
  const modalVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <nav className="bg-transparent p-4 flex justify-end items-center fixed w-full md:w-[calc(100%-16rem)] z-40">
      <div className="flex space-x-6">
        {/* Botón de Notificaciones */}
        <div className="relative">
          <button
            onClick={toggleNotificationsModal}
            className="text-gray-700 hover:text-orange-600 transition-all relative"
          >
            <FaBell size={24} />
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsModalOpen && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={modalVariants}
                transition={{ duration: 0.25 }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Notificaciones</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={clearNotifications}
                        className="text-gray-500 hover:text-orange-600"
                        title="Limpiar todas"
                      >
                        <FaTrash />
                      </button>
                      <button 
                        onClick={toggleNotificationsModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg flex items-start ${
                            notification.read ? 'bg-gray-50' : 'bg-orange-50'
                          }`}
                        >
                          <div className={`mt-1 mr-3 ${
                            notification.type === 'connection' 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {notification.type === 'connection' ? <FaChild /> : <FaPowerOff />}
                          </div>
                          <div>
                            <p className="text-sm">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.time), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4 text-center">No hay notificaciones</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botón de Perfil */}
        <div className="relative">
          <button
            onClick={toggleProfileModal}
            className="text-gray-700 hover:text-orange-600 transition-all"
          >
            <FaUser size={24} />
          </button>

          <AnimatePresence>
            {isProfileModalOpen && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={modalVariants}
                transition={{ duration: 0.25 }}
              >
                <div className="p-4">
                  {userData.userNombre || userData.userEmail ? (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <FaUser className="text-orange-600 text-xl" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {userData.userNombre}
                          </h4>
                          {userData.userRole && (
                            <p className="text-gray-500 text-sm flex items-center">
                              <FaUserShield className="mr-1" />
                              {formatRole(userData.userRole)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {userData.userEmail && (
                          <div className="flex items-center">
                            <FaEnvelope className="text-gray-400 mr-2" />
                            <span>{userData.userEmail}</span>
                          </div>
                        )}
                        
                        {userData.id_usuario && (
                          <div className="flex items-center">
                            <FaIdCard className="text-gray-400 mr-2" />
                            <span>ID: {userData.id_usuario}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 py-2">No hay datos de usuario</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;