// ProfileBadge.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from '../../api/api_service';
import { updateUserStatus } from "../../auth/utils/Data"; // Importa la función para actualizar el estado

interface ChildProfile {
  nombre: string;
  username: string;
  avatar?: string;
  nivel?: number;
  puntos?: number;
}

const ProfileBadge: React.FC = () => {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const childId = localStorage.getItem("id_niño");

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

  useEffect(() => {
    const fetchChildProfile = async () => {
      if (!childId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/child-profile/${childId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        });

        if (response.ok) {
          const data = await response.json();
          setChildProfile(data.childProfile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildProfile();
  }, [childId]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (loading) return (
    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
  );

  if (!childProfile) return (
    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
      ?
    </div>
  );

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="flex items-center focus:outline-none"
      >
        {childProfile.avatar ? (
          <img
            src={childProfile.avatar}
            alt="Perfil"
            className="w-14 h-14 rounded-full border-4 border-orange-200 shadow-md hover:border-orange-300 transition-all cursor-pointer"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md hover:from-amber-500 hover:to-orange-600 transition-all cursor-pointer">
            {childProfile.nombre.charAt(0)}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-orange-100"
          >
            <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center">
                {childProfile.avatar ? (
                  <img
                    src={childProfile.avatar}
                    alt="Perfil"
                    className="w-12 h-12 rounded-full border-2 border-orange-200 mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold mr-3">
                    {childProfile.nombre.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-orange-800">{childProfile.nombre}</p>
                  <p className="text-sm text-orange-600">Nivel {childProfile.nivel || 1}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button className="w-full text-left px-4 py-3 text-orange-700 hover:bg-orange-50 rounded-lg flex items-center">
                <span className="mr-3">👤</span> Mi perfil
              </button>
              <button className="w-full text-left px-4 py-3 text-orange-700 hover:bg-orange-50 rounded-lg flex items-center">
                <span className="mr-3">🏆</span> Mis logros
              </button>
            </div>

            <div className="p-2 border-t border-orange-100">
              <button 
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center"
                onClick={handleLogout}
              >
                <span className="mr-3">🚪</span> Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default ProfileBadge;