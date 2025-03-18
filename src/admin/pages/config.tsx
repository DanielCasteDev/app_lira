import React, { useState } from "react";
import Sidebar from "../components/sidebar"; // Importa el componente Sidebar

const ConfigPage: React.FC = () => {
  const [backupLocation, setBackupLocation] = useState(""); // Estado para la ubicación del respaldo

  // Función para manejar el respaldo de la base de datos
  const handleBackup = () => {
    if (backupLocation) {
      alert(`Respaldo realizado correctamente en: ${backupLocation}`);
    } else {
      alert("Por favor, selecciona una ubicación para el respaldo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Usa el componente Sidebar */}
      <Sidebar />

      {/* Contenido principal de la página de Configuración */}
      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

        {/* Sección de Respaldar Base de Datos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Respaldar Base de Datos</h3>
          <p className="text-gray-600 mb-4">
            Selecciona la ubicación donde deseas guardar el respaldo de la base de datos.
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={backupLocation}
              onChange={(e) => setBackupLocation(e.target.value)}
              placeholder="Selecciona una ubicación"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all"
              onClick={handleBackup}
            >
              Respaldar Ahora
            </button>
          </div>
        </div>

        {/* Sección de Ajustes de Notificaciones */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ajustes de Notificaciones</h3>
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
    </div>
  );
};

export default ConfigPage;