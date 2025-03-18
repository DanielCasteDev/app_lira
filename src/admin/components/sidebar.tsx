import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Users, History, Activity, LogOut } from "lucide-react"; // Importa íconos

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
        </div>
        <nav className="flex-1 flex flex-col justify-between px-4 py-6">
          <ul className="space-y-2">
            {[
              { name: "Configuración", icon: <Settings className="w-5 h-5" />, path: "/config" },
              { name: "Usuarios", icon: <Users className="w-5 h-5" />, path: "/users" },
              { name: "Historial", icon: <History className="w-5 h-5" />, path: "#historial" },
              { name: "Actividades", icon: <Activity className="w-5 h-5" />, path: "#actividades" },
            ].map((item, index) => (
              <li key={index}>
                <a
                  href={item.path}
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all"
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Separador y opción de Cerrar Sesión */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <ul>
              <li>
                <a
                  href="#logout"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-3">Cerrar Sesión</span>
                </a>
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
        <Menu className="text-orange-600" />
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
              <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
              <button
                className="absolute top-4 right-4 p-2"
                onClick={toggleMobileMenu}
              >
                <X className="text-orange-600" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-between px-4 py-6">
              <ul className="space-y-2">
                {[
                  { name: "Configuración", icon: <Settings className="w-5 h-5" />, path: "/config" },
                  { name: "Usuarios", icon: <Users className="w-5 h-5" />, path: "/users" },
                  { name: "Historial", icon: <History className="w-5 h-5" />, path: "#historial" },
                  { name: "Actividades", icon: <Activity className="w-5 h-5" />, path: "#actividades" },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.path}
                      className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all"
                      onClick={toggleMobileMenu}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Separador y opción de Cerrar Sesión */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <ul>
                  <li>
                    <a
                      href="#logout"
                      className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all"
                      onClick={toggleMobileMenu}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="ml-3">Cerrar Sesión</span>
                    </a>
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