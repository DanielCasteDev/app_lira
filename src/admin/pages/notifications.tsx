import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import {
  sendNotificationToUser,
  sendNotificationToMany,
  getUsersWithSubscriptions,
  getAllUsers,
} from "../../utils/notificationService";
import { Bell, Send, Users, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface User {
  _id: string;
  correo: string;
  nombre: string;
  role: string;
  subscriptionCount?: number;
}

// Notificaciones predeterminadas
const DEFAULT_NOTIFICATIONS = [
  {
    id: "welcome",
    title: "¡Bienvenido a LIRA!",
    body: "Gracias por unirte a nuestra plataforma educativa. ¡Comienza a aprender ahora!",
  },
  {
    id: "achievement",
    title: "¡Logro Desbloqueado!",
    body: "Has completado un nuevo desafío. ¡Sigue así!",
  },
  {
    id: "reminder",
    title: "Recordatorio de Estudio",
    body: "No olvides practicar hoy. ¡Tu progreso te espera!",
  },
  {
    id: "update",
    title: "Nueva Actualización",
    body: "Tenemos nuevas funciones y mejoras para ti. ¡Échales un vistazo!",
  },
  {
    id: "reward",
    title: "¡Recompensa Ganada!",
    body: "Has ganado una nueva recompensa por tu dedicación.",
  },
  {
    id: "challenge",
    title: "Nuevo Desafío Disponible",
    body: "Hay un nuevo desafío esperándote. ¡Atrévete a completarlo!",
  },
];

const NotificationsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [notificationType, setNotificationType] = useState<"single" | "multiple">("single");
  const [selectedNotification, setSelectedNotification] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [useCustom, setUseCustom] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setMessage({ type: "error", text: "Error al cargar usuarios" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    if (notificationType === "single") {
      setSelectedUserId(userId);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      setMessage(null);

      let title = customTitle;
      let body = customBody;

      // Si no se usa notificación personalizada, usar la predeterminada
      if (!useCustom && selectedNotification) {
        const notification = DEFAULT_NOTIFICATIONS.find((n) => n.id === selectedNotification);
        if (notification) {
          title = notification.title;
          body = notification.body;
        }
      }

      if (!title || !body) {
        setMessage({ type: "error", text: "Por favor, completa el título y el mensaje" });
        setLoading(false);
        return;
      }

      if (notificationType === "single") {
        if (!selectedUserId) {
          setMessage({ type: "error", text: "Por favor, selecciona un usuario" });
          setLoading(false);
          return;
        }

        const result = await sendNotificationToUser(selectedUserId, title, body);
        setMessage({
          type: "success",
          text: `Notificación enviada a ${result.results?.filter((r: any) => r.success).length || 0} dispositivo(s)`,
        });
        setSelectedUserId("");
      } else {
        if (selectedUsers.length === 0) {
          setMessage({ type: "error", text: "Por favor, selecciona al menos un usuario" });
          setLoading(false);
          return;
        }

        const result = await sendNotificationToMany(selectedUsers, title, body);
        setMessage({
          type: "success",
          text: `Notificaciones enviadas a ${result.results?.filter((r: any) => r.success).length || 0} dispositivo(s) de ${selectedUsers.length} usuario(s)`,
        });
        setSelectedUsers([]);
      }

      // Limpiar formulario
      setCustomTitle("");
      setCustomBody("");
      setSelectedNotification("");
      setUseCustom(false);
    } catch (error: any) {
      console.error("Error al enviar notificación:", error);
      setMessage({
        type: "error",
        text: error.message || "Error al enviar la notificación",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotification(notificationId);
    const notification = DEFAULT_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notification) {
      setCustomTitle(notification.title);
      setCustomBody(notification.body);
      setUseCustom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Notificaciones</h2>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuración */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tipo de notificación */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tipo de Envío</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setNotificationType("single");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    notificationType === "single"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Un Usuario
                </button>
                <button
                  onClick={() => {
                    setNotificationType("multiple");
                    setSelectedUserId("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    notificationType === "multiple"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Múltiples Usuarios
                </button>
              </div>
            </div>

            {/* Notificaciones predeterminadas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notificaciones Predeterminadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_NOTIFICATIONS.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationSelect(notification.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      selectedNotification === notification.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{notification.title}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.body}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setUseCustom(true);
                  setSelectedNotification("");
                  if (!customTitle && !customBody) {
                    setCustomTitle("");
                    setCustomBody("");
                  }
                }}
                className={`mt-4 w-full px-4 py-2 rounded-lg transition-all ${
                  useCustom
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {useCustom ? "Editando Notificación Personalizada" : "Usar Notificación Personalizada"}
              </button>
            </div>

            {/* Formulario de notificación */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contenido de la Notificación</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value);
                      setUseCustom(true);
                    }}
                    placeholder="Título de la notificación"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    value={customBody}
                    onChange={(e) => {
                      setCustomBody(e.target.value);
                      setUseCustom(true);
                    }}
                    placeholder="Mensaje de la notificación"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  onClick={handleSendNotification}
                  disabled={loading || !customTitle || !customBody}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Notificación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Panel de selección de usuarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                {notificationType === "single" ? "Seleccionar Usuario" : "Seleccionar Usuarios"}
              </h3>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-orange-600" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {users.map((user) => {
                  const isSelected =
                    notificationType === "single"
                      ? selectedUserId === user._id
                      : selectedUsers.includes(user._id);

                  return (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{user.correo}</div>
                      <div className="text-sm text-gray-600">{user.nombre}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.role} {user.subscriptionCount ? `• ${user.subscriptionCount} dispositivo(s)` : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {notificationType === "multiple" && selectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-semibold text-orange-800">
                  {selectedUsers.length} usuario(s) seleccionado(s)
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;

