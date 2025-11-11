import React from "react";
import Sidebar from "./components/sidebar";
import NotificationPrompt from "../components/NotificationPrompt";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Sidebar />
      <NotificationPrompt />

      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bienvenido al Dashboard</h2>
        <p className="text-gray-600">
          Aquí puedes gestionar la configuración, usuarios, historial y actividades del sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900">Usuarios Activos</h2>
            <p className="text-gray-600 mt-2">Consulta la lista de usuarios activos en la plataforma.</p>
            <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
              Ver Usuarios
            </button>
          </div>

          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900">Cuentas Inactivas</h2>
            <p className="text-gray-600 mt-2">Lista de cuentas que no han iniciado sesión recientemente.</p>
            <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
              Ver Cuentas Inactivas
            </button>
          </div>

          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900">Cuentas con Racha</h2>
            <p className="text-gray-600 mt-2">Usuarios que han iniciado sesión de manera consecutiva.</p>
            <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
              Ver Rachas
            </button>
          </div>

          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900">Estadísticas de Usuarios</h2>
            <p className="text-gray-600 mt-2">Incremento o decremento de nuevos usuarios en la plataforma.</p>
            <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
              Ver Estadísticas
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
