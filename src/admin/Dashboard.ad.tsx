import React from "react";
import Sidebar from "./components/sidebar"; // Importa el componente Sidebar

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Usa el componente Sidebar */}
      <Sidebar />

      {/* Contenido principal del Dashboard */}
      <main className="md:ml-64 p-6 pt-20 md:pt-6"> {/* Añade pt-20 para móviles */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido al Dashboard</h2>
        <p className="text-gray-600">
          Aquí puedes gestionar la configuración, usuarios, historial y actividades del sistema.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;