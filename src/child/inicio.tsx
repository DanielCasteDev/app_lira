import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProfileAndGames: React.FC = () => {
  const [childProfile, setChildProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const childId = localStorage.getItem("id_niño");

  useEffect(() => {
    const fetchChildProfile = async () => {
      if (!childId) {
        setError("No se encontró el ID del niño en el localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:4000/api/child-profile/${childId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener el perfil infantil");
        const data = await response.json();
        setChildProfile(data.childProfile);
      } catch (error) {
        setError("Error al cargar el perfil infantil");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildProfile();
  }, [childId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      {loading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && childProfile && (
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
        >
          <img src={childProfile.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white mb-4" />
          <h1 className="text-3xl font-bold">{childProfile.realUsername}</h1> {/* Aquí se muestra el nombre real */}
          <p className="text-lg">{childProfile.username}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {["juego1", "juego2", "juego3", "juego4"].map((juego, index) => (
          <motion.div
            key={juego}
            className="bg-blue-600 hover:bg-blue-700 p-6 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, delay: index * 0.2 } }}
          >
            <Link to={`/${juego}`} className="block">
              <img src={`/${juego}.png`} alt={`Juego ${index + 1}`} className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Juego {index + 1}</h2>
              <p className="text-white">Descripción breve del juego.</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileAndGames;
