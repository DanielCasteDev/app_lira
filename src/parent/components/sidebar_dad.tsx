import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Users, History, LogOut, Home, PlusCircle, ClipboardList } from "lucide-react"; // Importa íconos
import { updateUserStatus } from "../../auth/utils/Data"; // Importa la función para actualizar el estado

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("id_usuario"); // Obtener id_usuario

      if (!userId) {
        throw new Error("ID de usuario no encontrado");
      }

      // Marcar como inactivo en el backend
      await updateUserStatus(userId, false); // false = inactivo

      // Borrar todo el localStorage
      localStorage.clear();

      // Redirigir al usuario a la página de login
      window.location.href = "/"; // Cambia "/" por la ruta correcta de tu aplicación
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* Sidebar para pantallas grandes */}
      <motion.aside
        className="hidden md:flex flex-col w-64 h-screen bg-white shadow-lg fixed z-50"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Papás</h1>
        </div>
        <nav className="flex-1 flex flex-col justify-between px-4 py-6">
          <ul className="space-y-2">
            {[
              { name: "Inicio", icon: <Home className="w-5 h-5 text-gray-700" />, path: "/parent" },
              { name: "Registrar Hijos", icon: <PlusCircle className="w-5 h-5 text-gray-700" />, path: "/Registrar_hijos" },
              { name: "Perfiles", icon: <Users className="w-5 h-5 text-gray-700" />, path: "/perfiles" },
              { name: "Historial", icon: <History className="w-5 h-5 text-gray-700" />, path: "/historial" },
              { name: "Tareas", icon: <ClipboardList className="w-5 h-5 text-gray-700" />, path: "/tareas" }, // Nueva opción
            ].map((item, index) => (
              <li key={index}>
                <a
                  href={item.path}
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all group"
                >
                  {React.cloneElement(item.icon, { className: "w-5 h-5 text-gray-700 group-hover:text-orange-600" })}
                  <span className="ml-3">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Separador y opción de Cerrar Sesión */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <ul>
              <li>
                <button
                  onClick={handleLogout} // Usamos onClick en lugar de href
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all w-full group"
                >
                  <LogOut className="w-5 h-5 text-gray-700 group-hover:text-orange-600" />
                  <span className="ml-3">Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </motion.aside>

      {/* Botón para abrir el menú en móviles */}
      <button
        className="md:hidden fixed top-6 left-4 p-2 bg-white rounded-lg shadow-lg z-50"
        onClick={toggleMobileMenu}
      >
        <Menu className="text-gray-700" />
      </button>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
          ></motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 pt-16"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800">Dashboard Papás</h1>
              <button
                className="absolute top-4 right-4 p-2"
                onClick={toggleMobileMenu}
              >
                <X className="text-gray-700" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-between px-4 py-6">
              <ul className="space-y-2">
                {[
                  { name: "Inicio", icon: <Home className="w-5 h-5 text-gray-700" />, path: "/parent" },
                  { name: "Registrar Hijos", icon: <PlusCircle className="w-5 h-5 text-gray-700" />, path: "/Registrar_hijos" },
                  { name: "Perfiles", icon: <Users className="w-5 h-5 text-gray-700" />, path: "/perfiles" },
                  { name: "Historial", icon: <History className="w-5 h-5 text-gray-700" />, path: "/historial" },
                  { name: "Tareas", icon: <ClipboardList className="w-5 h-5 text-gray-700" />, path: "/tareas" }, // Nueva opción
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.path}
                      className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all group"
                      onClick={toggleMobileMenu}
                    >
                      {React.cloneElement(item.icon, { className: "w-5 h-5 text-gray-700 group-hover:text-orange-600" })}
                      <span className="ml-3">{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Separador y opción de Cerrar Sesión */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <ul>
                  <li>
                    <button
                      onClick={handleLogout} // Usamos onClick en lugar de href
                      className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all w-full group"
                    >
                      <LogOut className="w-5 h-5 text-gray-700 group-hover:text-orange-600" />
                      <span className="ml-3">Cerrar Sesión</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;