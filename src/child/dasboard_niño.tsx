import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Animaciones suaves
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const gentleFloatAnimation = {
  y: [0, -5, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  },
};

// Interfaz para el perfil del niño
interface ChildProfile {
  nombre: string;
  username: string;
  avatar?: string;
  nivel?: number;
  puntos?: number;
}

// Componente mejorado para las tarjetas de juego
const GameCard: React.FC<{ 
  title: string; 
  index: number; 
  icon: string;
}> = ({ title, index, icon }) => (
  <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}>
    <motion.div animate={gentleFloatAnimation}>
      <Link
        to={`/juego${index + 1}`}
        className="block bg-gradient-to-br from-amber-100 to-orange-200 hover:from-amber-200 hover:to-orange-300 p-6 rounded-2xl shadow-md text-center transition-all duration-300 transform hover:scale-102"
      >
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3 shadow-sm">
            <span className="text-3xl">{icon}</span>
          </div>
          <h2 className="text-xl font-bold text-orange-800">{title}</h2>
        </div>
      </Link>
    </motion.div>
  </motion.div>
);

const Inicio: React.FC = () => {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
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
        const response = await fetch(`https://api-lira.onrender.com/api/child-profile/${childId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        });

        if (!response.ok) throw new Error("Error al obtener el perfil infantil");
        const data = await response.json();
        setChildProfile(data.childProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el perfil infantil");
      } finally {
        setLoading(false);
      }
    };

    fetchChildProfile();
  }, [childId]);

  // Juegos con iconos relacionados con la lectura
  const juegos = [
    {
      title: "Letras y Sonidos",
      icon: "🔤"
    },
    {
      title: "Formar Palabras",
      icon: "📝"
    },
    {
      title: "Cuentos",
      icon: "📚"
    },
    {
      title: "Desafíos",
      icon: "🎯"
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <motion.div 
        animate={{ rotateY: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-4xl"
      >
        📖
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <p className="text-orange-800 text-center p-6 bg-white rounded-lg shadow-sm">
        {error}
        <br />
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
        >
          Intentar de nuevo
        </button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center p-6">
      {/* Header con logo */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          <span className="text-2xl font-semibold text-orange-700">Lira</span>
        </motion.div>
        
        {childProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            {childProfile.avatar ? (
              <img
                src={childProfile.avatar}
                alt="Perfil"
                className="w-10 h-10 rounded-full border border-orange-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center text-white text-lg font-medium">
                {childProfile.nombre.charAt(0)}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Perfil del niño */}
      {childProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-5 rounded-xl shadow-sm mb-8 w-full max-w-md"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {childProfile.avatar ? (
                <img
                  src={childProfile.avatar}
                  alt="Perfil"
                  className="w-16 h-16 rounded-full border-2 border-amber-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 flex items-center justify-center text-white text-xl font-medium">
                  {childProfile.nombre.charAt(0)}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-orange-700">¡Hola, {childProfile.nombre}!</h2>
              <div className="mt-1 flex items-center">
                <span className="text-amber-600 font-medium text-sm">Nivel {childProfile.nivel || 1}</span>
                <div className="ml-2 bg-gray-100 rounded-full h-1.5 w-20">
                  <div 
                    className="bg-amber-400 h-1.5 rounded-full" 
                    style={{ width: `${(childProfile.puntos || 0) % 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Banner de estrellas ganadas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-around w-full max-w-md bg-white rounded-xl shadow-sm p-4 mb-6"
      >
        <div className="text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-sm text-gray-600">Estrellas</div>
          <div className="text-lg font-medium text-amber-600">{(childProfile?.puntos || 0) / 10}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-sm text-gray-600">Libros</div>
          <div className="text-lg font-medium text-amber-600">{Math.floor((childProfile?.puntos || 0) / 50)}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-sm text-gray-600">Logros</div>
          <div className="text-lg font-medium text-amber-600">{Math.floor((childProfile?.puntos || 0) / 100)}</div>
        </div>
      </motion.div>

      {/* Título principal */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-2xl font-medium text-orange-700 mb-6 text-center"
      >
        Elige una actividad
      </motion.h1>

      {/* Rejilla de juegos */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {juegos.map((juego, index) => (
          <GameCard 
            key={index} 
            title={juego.title} 
            index={index} 
            icon={juego.icon}
          />
        ))}
      </div>

      {/* Sección de logros recientes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-white p-4 rounded-xl shadow-sm w-full max-w-md"
      >
        <h3 className="text-lg font-medium text-orange-700 mb-3">Logros recientes</h3>
        <div className="flex items-center mb-2 p-2 bg-amber-50 rounded-lg">
          <span className="text-2xl mr-3">🎯</span>
          <div>
            <p className="text-sm font-medium text-amber-800">¡Has completado 3 actividades seguidas!</p>
            <p className="text-xs text-gray-500">Hace 2 días</p>
          </div>
        </div>
        <div className="flex items-center p-2 bg-amber-50 rounded-lg">
          <span className="text-2xl mr-3">🔤</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Aprendiste todas las vocales</p>
            <p className="text-xs text-gray-500">Hace 5 días</p>
          </div>
        </div>
      </motion.div>

      {/* Pie de página */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <p>Lira • Aprendizaje divertido</p>
      </motion.div>
    </div>
  );
};

export default Inicio;