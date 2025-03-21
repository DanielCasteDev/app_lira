import React from "react";
import { motion } from "framer-motion"; // Importa Framer Motion
import Sidebar from "./components/sidebar_dad"; // Importa el componente Sidebar
import Navbar from "./components/navbar_superior"; // Importa el componente Navbar
import { FaBook, FaTasks, FaGamepad, FaChartLine } from "react-icons/fa"; // Importa iconos

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
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a LIRA, {nombreUsuario}!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              LIRA es una plataforma diseñada para superar los desafíos del aprendizaje de la lectura en niños, ofreciendo interactividad, personalización y seguimiento del progreso.
            </p>
          </motion.div>

          {/* Explicación del Panel en Cards con Iconos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Interactividad */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <FaGamepad className="text-4xl text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Interactividad
              </h2>
              <p className="text-gray-600">
                Actividades dinámicas que captan la atención de los niños.
              </p>
            </motion.div>

            {/* Card 2: Personalización */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <FaBook className="text-4xl text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Personalización
              </h2>
              <p className="text-gray-600">
                Contenidos adaptados a cada estilo de aprendizaje.
              </p>
            </motion.div>

            {/* Card 3: Progreso */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <FaChartLine className="text-4xl text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Progreso
              </h2>
              <p className="text-gray-600">
                Seguimiento detallado del avance de cada niño.
              </p>
            </motion.div>

            {/* Card 4: Gamificación */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <FaTasks className="text-4xl text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Gamificación
              </h2>
              <p className="text-gray-600">
                Juegos educativos que refuerzan el aprendizaje.
              </p>
            </motion.div>
          </div>

          {/* Mensaje adicional */}
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              ¿Cómo aborda LIRA los desafíos del aprendizaje?
            </h2>
            <p className="text-gray-600">
              LIRA combina <strong>interactividad</strong>, <strong>personalización</strong> y <strong>gamificación</strong> para superar las limitaciones de los métodos tradicionales, ofreciendo una experiencia educativa más efectiva y atractiva para los niños.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;