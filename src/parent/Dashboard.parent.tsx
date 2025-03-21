import React from "react";
import { motion } from "framer-motion"; // Importa Framer Motion
import Sidebar from "./components/sidebar_dad"; // Importa el componente Sidebar
import Navbar from "./components/navbar_superior"; // Importa el componente Navbar

const Dashboard: React.FC = () => {
  // Recuperar el nombre del usuario desde el localStorage
  const nombreUsuario = localStorage.getItem("userNombre");

  // Animaciones
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Contenido del Dashboard */}
        <div className="p-6 mt-10">
          {/* Título y espacio adicional para el botón del menú en móviles */}
          <motion.div
            className="mt-16 md:mt-0"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              ¡Bienvenido, {nombreUsuario}!
            </h1>
          </motion.div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Tarjeta 1: Selecciona tu Perfil */}
            <motion.div
              className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Selecciona tu Perfil
              </h2>
              <p className="text-gray-600 mt-2">Elige el niño que jugará hoy.</p>
              <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
                Ingresar a Perfil
              </button>
            </motion.div>

            {/* Tarjeta 2: Tu Progreso */}
            <motion.div
              className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Tu Progreso
              </h2>
              <p className="text-gray-600 mt-2">
                Has completado el 75% de tu aprendizaje.
              </p>
              <div className="w-full bg-gray-200 h-4 rounded-full mt-3">
                <div className="bg-gray-400 h-4 rounded-full w-3/4"></div>
              </div>
            </motion.div>

            {/* Tarjeta 3: Juegos Completados */}
            <motion.div
              className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Juegos Completados
              </h2>
              <p className="text-gray-600 mt-2">
                Has completado 5 juegos esta semana.
              </p>
              <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
                Ver Historial
              </button>
            </motion.div>

            {/* Tarjeta 4: Tareas Pendientes */}
            <motion.div
              className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Tareas Pendientes
              </h2>
              <p className="text-gray-600 mt-2">
                Te quedan 3 tareas por completar.
              </p>
              <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
                Ir a Tareas
              </button>
            </motion.div>

            {/* Tarjeta 5: Insignias */}
            <motion.div
              className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Insignias
              </h2>
              <p className="text-gray-600 mt-2">
                Has ganado 3 nuevas insignias esta semana.
              </p>
              <button className="mt-4 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400">
                Ver Insignias
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;