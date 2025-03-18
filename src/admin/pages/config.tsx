import React, { useState } from "react";
import Sidebar from "../components/sidebar"; // Importa el componente Sidebar
import { generateBackup } from "../utils/Data"; // Importa la función generateBackup
import { toast, Toaster } from "react-hot-toast"; // Importa Toaster
import LoadingSpinner from "../../cargando"; // Importa el componente LoadingSpinner

const ConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading

  // Función para manejar la solicitud de respaldo
  const handleBackup = async () => {
    setIsLoading(true); // Activar el loading
    try {
      const result = await generateBackup();
      toast.success(result.message); // Mostrar mensaje de éxito con react-hot-toast
    } catch (error) {
      console.error("Error al generar el respaldo:", error);
      toast.error("Hubo un error al generar el respaldo. Por favor, intenta de nuevo."); // Mostrar mensaje de error
    } finally {
      setIsLoading(false); // Desactivar el loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Usa el componente Sidebar */}
      <Sidebar />

      {/* Contenido principal de la página de Configuración */}
      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

        {/* Sección de Respaldo de Base de Datos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Respaldo de Base de Datos
          </h3>
          <button
            onClick={handleBackup}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            disabled={isLoading} // Deshabilitar el botón mientras carga
          >
            {isLoading ? "Generando respaldo..." : "Generar Respaldo"}
          </button>
        </div>

        {/* Sección de Ajustes de Notificaciones */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Ajustes de Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700">
                Recibir notificaciones por correo electrónico
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="push-notifications"
                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="push-notifications" className="ml-2 text-sm text-gray-700">
                Recibir notificaciones push
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* Componente Toaster para mostrar las alertas */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000, // Duración de las notificaciones de éxito
          },
          error: {
            duration: 5000, // Duración de las notificaciones de error
          },
        }}
      />

      {/* Mostrar el LoadingSpinner si isLoading es true */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default ConfigPage;