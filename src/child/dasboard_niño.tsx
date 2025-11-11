import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from '../api/api_service';
import ProfileBadge from './components/perfil';
import NotificationPrompt from '../components/NotificationPrompt';

// Definición de tipos mejorada
interface ChildProfile {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  avatar?: string;
  fechaNacimiento: string;
  genero: string;
  totalPoints: number;
  level: number;
  gameProgress?: {
    gameName: string;
    points: number;
    levelsCompleted: number;
    highestDifficulty: string;
    lastPlayed: string;
  }[];
}

// Animaciones mejoradas
const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 15
    } 
  },
};

const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  },
};

const GameCard: React.FC<{ 
  title: string; 
  index: number; 
  icon: string;
  color: string;
  route: string;
}> = ({ title, index, icon, color, route }) => (
  <motion.div 
    variants={cardVariants} 
    initial="hidden" 
    animate="visible" 
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    transition={{ delay: index * 0.1 }}
    className="h-full"
  >
    <motion.div animate={floatAnimation} className="h-full">
      <Link
        to={route}
        className={`block ${color} p-6 rounded-3xl shadow-xl h-full flex flex-col justify-center transition-all duration-200 hover:shadow-2xl`}
      >
        <div className="flex flex-col items-center">
          <div className="bg-white bg-opacity-90 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4 shadow-lg">
            <span className="text-4xl">{icon}</span>
          </div>
          <h2 className="text-xl font-bold text-white drop-shadow-md">{title}</h2>
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

  // Función para calcular el nivel basado en los puntos
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 500) + 1;
  };

  // Función para calcular el progreso hacia el siguiente nivel (0-100)
  const calculateLevelProgress = (points: number): number => {
    return (points % 500) / 5; // Convertir a porcentaje (500 puntos por nivel)
  };

  useEffect(() => {
    const fetchChildProfile = async () => {
      if (!childId) {
        setError("¡Oops! No encontramos tu perfil");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/child-profile/${childId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        });

        if (!response.ok) throw new Error("¡Ups! Algo salió mal");
        const data = await response.json();
        
        // Asegurar que el perfil tenga nivel y puntos calculados
        const profileData: ChildProfile = {
          ...data.childProfile,
          totalPoints: data.childProfile.totalPoints || 0,
          level: data.childProfile.level || calculateLevel(data.childProfile.totalPoints || 0)
        };
        
        setChildProfile(profileData);
      } catch (err) {
        setError("No podemos cargar tus datos ahora");
      } finally {
        setLoading(false);
      }
    };

    fetchChildProfile();
  }, [childId]);

  const juegos = [
    {
      title: "Letras Mágicas",
      icon: "🔠",
      color: "bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
      route: "/letras"
    },
    {
      title: "Forma Palabras",
      icon: "🧩",
      color: "bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600",
      route: "/palabras"
    },
    {
      title: "Cuentos Divertidos",
      icon: "📖",
      color: "bg-gradient-to-br from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
      route: "/cuentos"
    },
    {
      title: "Desafíos Lira",
      icon: "🏆",
      color: "bg-gradient-to-br from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600",
      route: "/desafios"
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center">
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2.5, 
          ease: "easeInOut" 
        }}
        className="text-7xl mb-6"
      >
        🌟
      </motion.div>
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="text-3xl text-orange-600 font-bold"
      >
        Preparando tu aventura...
      </motion.p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md border-4 border-orange-200">
        <div className="text-7xl mb-4">😮</div>
        <h2 className="text-2xl font-bold text-orange-600 mb-2">¡Vaya!</h2>
        <p className="text-lg text-gray-700 mb-6">{error}</p>
        <Link 
          to="/" 
          onClick={() => localStorage.clear()}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block"
        >
          ¡Mandar al inicio!
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center p-6 pb-16">
      <NotificationPrompt />
      {/* Header */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <span className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Lira
          </span>
        </motion.div>
        
        <ProfileBadge />
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-7xl grid lg:grid-cols-3 gap-8">
        {/* Columna izquierda - Perfil y logros */}
        <div className="lg:col-span-1 space-y-6">
          {childProfile && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white p-6 rounded-3xl shadow-xl border-4 border-amber-100"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {childProfile.avatar ? (
                    <img
                      src={childProfile.avatar}
                      alt="Tu avatar"
                      className="w-24 h-24 rounded-full border-4 border-amber-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-sm">
                      {childProfile.nombre.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-4">
  <h2 className="text-2xl font-bold text-orange-600">¡Hola, {childProfile.nombre}!</h2>
  <div className="mt-3">
    <div className="flex items-center">
      <span className="text-xl font-bold text-amber-600">Nivel {childProfile.level}</span>
      <div className="ml-3 bg-gray-200 rounded-full h-6 w-full max-w-xs shadow-inner overflow-hidden">
        <div 
          className="bg-gradient-to-r from-amber-400 to-orange-500 h-6 rounded-full flex items-center justify-end pr-3 relative"
          style={{ width: `${calculateLevelProgress(childProfile.totalPoints)}%` }}
        >
          <span className="text-xs font-bold text-white absolute right-2">
            {Math.round(calculateLevelProgress(childProfile.totalPoints))}%
          </span>
          <div className="absolute inset-0 bg-orange-300 bg-opacity-30"></div>
        </div>
      </div>
    </div>
    <div className="mt-2 text-sm text-gray-600 flex items-center">
      <span className="mr-2">🏅</span>
      <span>{childProfile.totalPoints} puntos totales</span>
      <span className="mx-2">•</span>
      <span>Próximo nivel en {500 - (childProfile.totalPoints % 500)} pts</span>
    </div>
  </div>
</div>
              </div>

              {/* Progreso en juegos */}
              {childProfile.gameProgress && childProfile.gameProgress.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">Tu progreso</h3>
                  <div className="space-y-3">
                    {childProfile.gameProgress.map((game, index) => (
                      <div key={index} className="bg-amber-50 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-orange-700">{game.gameName}</span>
                          <span className="text-sm font-bold text-amber-600">{game.points} pts</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full"
                            style={{ width: `${Math.min((game.points / 1000) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Banner de premios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-xl border-4 border-amber-100"
          >
            <h3 className="text-xl font-bold text-orange-600 mb-4 text-center">Tus Recompensas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-amber-50 rounded-2xl">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-sm text-gray-600 font-medium">Estrellas</div>
                <div className="text-xl font-bold text-amber-600">{Math.floor((childProfile?.totalPoints || 0) / 100)}</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-2xl">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-sm text-gray-600 font-medium">Libros</div>
                <div className="text-xl font-bold text-orange-600">{Math.floor((childProfile?.totalPoints || 0) / 250)}</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-2xl">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-sm text-gray-600 font-medium">Trofeos</div>
                <div className="text-xl font-bold text-red-500">{Math.floor((childProfile?.totalPoints || 0) / 500)}</div>
              </div>
            </div>
          </motion.div>

          {/* Logros */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-3xl shadow-xl border-4 border-amber-100"
          >
            <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center justify-center">
              <span className="mr-2">🎉</span> Tus Logros
            </h3>
            
            <div className="space-y-3">
            {childProfile && childProfile.level >= 2 && (
  <div className="flex items-center p-4 bg-amber-50 rounded-2xl">
    <span className="text-3xl mr-3">✨</span>
    <div>
      <p className="text-md font-bold text-orange-700">¡Nivel 2 alcanzado!</p>
      <p className="text-xs text-gray-500">¡Sigue así!</p>
    </div>
  </div>
)}
              
{childProfile && childProfile.totalPoints >= 50 && (
  <div className="flex items-center p-4 bg-amber-50 rounded-2xl">
    <span className="text-3xl mr-3">🔤</span>
    <div>
      <p className="text-md font-bold text-orange-700">Primeros 50 puntos</p>
      <p className="text-xs text-gray-500">¡Excelente trabajo!</p>
    </div>
  </div>
)}

              {childProfile?.gameProgress?.some(g => g.levelsCompleted >= 5) && (
                <div className="flex items-center p-4 bg-amber-50 rounded-2xl">
                  <span className="text-3xl mr-3">📖</span>
                  <div>
                    <p className="text-md font-bold text-orange-700">5 niveles completados</p>
                    <p className="text-xs text-gray-500">¡Eres un experto!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Columna derecha - Juegos */}
        <div className="lg:col-span-2">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-8 text-center lg:text-left"
          >
            ¡Elige tu juego favorito!
          </motion.h1>

          {/* Rejilla de juegos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {juegos.map((juego, index) => (
              <div key={index} className="h-full">
                <GameCard 
                  title={juego.title} 
                  index={index} 
                  icon={juego.icon}
                  color={juego.color}
                  route={juego.route}
                />
              </div>
            ))}

            {/* Juego adicional para llenar espacio en desktop */}
            <div className="hidden 2xl:block h-full">
              <motion.div 
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                whileHover={{ scale: 1.05 }}
                className="h-full"
              >
                <motion.div animate={floatAnimation} className="h-full">
                  <div className="block bg-gradient-to-br from-purple-400 to-indigo-500 p-6 rounded-3xl shadow-xl h-full flex-col justify-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-4xl">🔔</span>
                      </div>
                      <h2 className="text-xl font-bold text-white drop-shadow-md">Próximamente</h2>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Sección de progreso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-white p-8 rounded-3xl shadow-xl border-4 border-amber-100"
          >
            <h3 className="text-2xl font-bold text-orange-600 mb-6 text-center">Tu Progreso</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl mb-4">📅</div>
                <p className="font-medium text-orange-700">Nivel actual</p>
                <p className="text-3xl font-bold text-amber-500">{childProfile?.level}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">⏱️</div>
                <p className="font-medium text-orange-700">Puntos totales</p>
                <p className="text-3xl font-bold text-amber-500">{childProfile?.totalPoints}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💎</div>
                <p className="font-medium text-orange-700">Próximo nivel</p>
                <p className="text-3xl font-bold text-amber-500">
                  {childProfile ? 500 - (childProfile.totalPoints % 500) : 500} pts
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pie de página */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-center"
      >
        <div className="text-4xl mb-3">🦁</div>
        <p className="text-lg text-orange-500 font-bold">Lira • Aprender es una aventura</p>
        <p className="text-sm text-orange-400 mt-1">¡Diviértete mientras aprendes!</p>
      </motion.div>
    </div>
  );
};

export default Inicio;