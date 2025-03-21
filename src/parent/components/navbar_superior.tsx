import React from "react";
import { FaBell, FaUser } from "react-icons/fa"; // Importa los íconos de React Icons

const Navbar: React.FC = () => {
  return (
    <nav className="bg-transparent p-4 flex justify-end items-center fixed w-full md:w-[calc(100%-16rem)] z-40">
      {/* Íconos */}
      <div className="flex space-x-6"> {/* Aumentamos el espacio entre íconos */}
        {/* Ícono de notificaciones */}
        <a
          href="#"
          className="text-gray-700 hover:text-orange-600 transition-all"
        >
          <FaBell size={28} /> {/* Ícono más grande (28px) */}
        </a>

        {/* Ícono de perfil */}
        <a
          href="#"
          className="text-gray-700 hover:text-orange-600 transition-all"
        >
          <FaUser size={28} /> {/* Ícono más grande (28px) */}
        </a>
      </div>
    </nav>
  );
};

export default Navbar;