import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-orange-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-orange-600 mb-6">¡Bienvenido PAPOI! </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">

        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-500">Selecciona tu Perfil</h2>
          <p className="text-gray-700 mt-2">Elige el niño que jugará hoy.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Ingresar a Perfil
          </button>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-500">Tu Progreso</h2>
          <p className="text-gray-700 mt-2">Has completado el 75% de tu aprendizaje.</p>
          <div className="w-full bg-gray-200 h-4 rounded-full mt-3">
            <div className="bg-orange-500 h-4 rounded-full w-3/4"></div>
          </div>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-500">Juegos Completados</h2>
          <p className="text-gray-700 mt-2">Has completado 5 juegos esta semana.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Ver Historial
          </button>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-500">Tareas Pendientes</h2>
          <p className="text-gray-700 mt-2">Te quedan 3 tareas por completar.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Ir a Tareas
          </button>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-500">Insignias</h2>
          <p className="text-gray-700 mt-2">Has ganado 3 nuevas insignias esta semana.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Ver Insignias
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;