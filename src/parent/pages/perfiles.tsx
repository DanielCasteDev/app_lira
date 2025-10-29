import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar_dad";
import Navbar from "../components/navbar_superior";
import { fetchChildren, fetchChildrenWithCacheInfo } from "../utils/data";
import { showCacheWarning } from "../../utils/parentCacheService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaBirthdayCake, FaIdBadge, 
  FaGamepad, FaTrophy, FaChartLine,
  FaStar, FaMedal, FaFire, FaSeedling
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import LoadingSpinner from '../../cargando';
import ProgressBar from "../components/progress-bar";

Chart.register(...registerables);

interface GameProgress {
  gameName: string;
  points: number;
  levelsCompleted: number;
  highestDifficulty: string;
  lastPlayed: string;
  icon?: string;
}
// Interfaz actualizada (solución recomendada)
interface Child {
    _id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    genero: string;
    username: string;
    avatar?: string;
    gameProgress?: GameProgress[];
    totalPoints: number; // Obligatorio
    level?: number;
  }
const difficultyColors = {
  "fácil": "bg-orange-100 text-orange-800",
  "medio": "bg-amber-200 text-amber-900",
  "difícil": "bg-orange-300 text-orange-900",
  "experto": "bg-orange-400 text-white"
};

const getDifficultyIcon = (difficulty: string) => {
  switch(difficulty) {
    case "fácil": return <FaSeedling className="mr-1" />;
    case "medio": return <FaChartLine className="mr-1" />;
    case "difícil": return <FaFire className="mr-1" />;
    default: return <FaMedal className="mr-1" />;
  }
};

const Progreso: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ fromCache: boolean; isStale: boolean; message: string } | null>(null);

  useEffect(() => {
    const getChildren = async () => {
      try {
        setLoading(true);
        
        // Intentar con caché primero
        try {
          const result = await fetchChildrenWithCacheInfo();
          
          const childrenWithLevels = result.data.map(child => ({
              ...child,
              totalPoints: child.totalPoints || 0,
              level: Math.floor((child.totalPoints || 0) / 500) + 1
            }));
            
          setChildren(childrenWithLevels);
          
          // Actualizar info del caché
          if (result.fromCache) {
            setCacheInfo({
              fromCache: true,
              isStale: result.isStale,
              message: showCacheWarning(result.isStale, result.cachedAt)
            });
          } else {
            setCacheInfo(null);
          }
          
          setError(null);
        } catch {
          // Si falla el caché, intentar método tradicional
          console.log('Intentando método tradicional...');
          const data = await fetchChildren();
          
          const childrenWithLevels = data.map(child => ({
              ...child,
              totalPoints: child.totalPoints || 0,
              level: Math.floor((child.totalPoints || 0) / 500) + 1
            }));
            
          setChildren(childrenWithLevels);
          setCacheInfo(null);
          setError(null);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getChildren();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  const prepareChartData = (child: Child) => {
    if (!child.gameProgress) return null;
    
    return {
      labels: child.gameProgress.map(game => game.gameName),
      datasets: [
        {
          label: 'Puntos',
          data: child.gameProgress.map(game => game.points),
          backgroundColor: [
            'rgba(249, 115, 22, 0.7)',
            'rgba(234, 88, 12, 0.7)',
            'rgba(251, 146, 60, 0.7)',
            'rgba(253, 186, 116, 0.7)'
          ],
          borderColor: [
            'rgba(249, 115, 22, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(253, 186, 116, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const prepareLevelsData = (child: Child) => {
    if (!child.gameProgress) return null;
    
    return {
      labels: child.gameProgress.map(game => game.gameName),
      datasets: [
        {
          label: 'Niveles Completados',
          data: child.gameProgress.map(game => game.levelsCompleted),
          backgroundColor: [
            'rgba(249, 115, 22, 0.5)',
            'rgba(253, 186, 116, 0.5)',
            'rgba(234, 88, 12, 0.5)',
            'rgba(251, 146, 60, 0.5)'
          ],
          borderColor: [
            'rgba(249, 115, 22, 1)',
            'rgba(253, 186, 116, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(251, 146, 60, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Navbar />
        <div className="p-4 md:p-6 mt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold  mb-2 md:mb-0">Progreso de los Niños</h1>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              Total niños: {children.length}
            </div>
          </div>

          {/* Banner de caché */}
          {cacheInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg border-l-4 ${
                cacheInfo.isStale 
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
                  : 'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{cacheInfo.isStale ? '⚠️' : '📦'}</span>
                  <span className="font-medium">{cacheInfo.message}</span>
                </div>
                {cacheInfo.isStale && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    🔄 Intentar actualizar
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay niños registrados</h3>
              <p className="mt-1 text-sm text-gray-500">Agrega a tus hijos para comenzar a ver su progreso.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {children.map((child, index) => (
                <motion.div
                  key={child._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover="hover"
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-r from-orange-400 to-amber-500 flex items-end justify-end p-3">
                      {child.level && (
                        <div className="bg-white rounded-full px-3 py-1 shadow-sm flex items-center">
                          <span className="text-sm font-bold text-orange-600">Nv. {child.level}</span>
                          <FaStar className="ml-1 text-amber-400 text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-10 left-4">
                      <div className="h-16 w-16 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden">
                        {child.avatar ? (
                          <img
                            src={child.avatar}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-orange-100 flex items-center justify-center text-orange-500">
                            <FaUser className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 px-4 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {child.nombre} {child.apellido}
                        </h2>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <FaIdBadge className="mr-1" /> @{child.username}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        child.genero === "Masculino" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {child.genero}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-medium text-gray-700 flex items-center">
                          <FaGamepad className="mr-1 text-orange-500" /> Progreso
                        </h3>
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {child.totalPoints} pts
                        </span>
                      </div>

                      {child.gameProgress && child.gameProgress.length > 0 ? (
                        <div className="space-y-2">
                          {child.gameProgress.slice(0, 2).map((game, i) => (
                            <div key={i} className="bg-gray-50 p-2 rounded-lg">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">{game.gameName}</h4>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  difficultyColors[game.highestDifficulty as keyof typeof difficultyColors] || "bg-gray-100 text-gray-800"
                                }`}>
                                  {getDifficultyIcon(game.highestDifficulty)}
                                  {game.highestDifficulty}
                                </span>
                              </div>
                              <div className="mt-1">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Puntos: {game.points}</span>
                                  <span>Niveles: {game.levelsCompleted}</span>
                                </div>
                                <ProgressBar 
                                  value={(game.points / 1000) * 100} 
                                  color="bg-gradient-to-r from-orange-300 to-amber-400"
                                  height="h-1.5"
                                />
                              </div>
                            </div>
                          ))}

                          {child.gameProgress.length > 2 && (
                            <button 
                              onClick={() => setSelectedChild(child)}
                              className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              Ver {child.gameProgress.length - 2} juegos más
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500">No hay datos de progreso aún</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <button 
                        onClick={() => setSelectedChild(child)}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        Ver detalles completos
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles con fondo RGB */}
      <AnimatePresence>
        {selectedChild && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <div className="h-40 bg-gradient-to-r from-orange-400 to-amber-500"></div>
                <div className="absolute -bottom-12 left-6">
                  <div className="h-24 w-24 rounded-full border-2 border-white bg-white shadow-md overflow-hidden">
                    {selectedChild.avatar ? (
                      <img
                        src={selectedChild.avatar}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-orange-100 flex items-center justify-center text-orange-500">
                        <FaUser className="text-4xl" />
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedChild(null)}
                  className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="pt-16 px-6 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedChild.nombre} {selectedChild.apellido}
                    </h2>
                    <div className="flex flex-wrap items-center mt-2 gap-2">
                      <span className="text-xs text-gray-600 flex items-center bg-gray-50 px-2 py-1 rounded">
                        <FaIdBadge className="mr-1" /> @{selectedChild.username}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center bg-gray-50 px-2 py-1 rounded">
                        <FaBirthdayCake className="mr-1" /> 
                        {new Date(selectedChild.fechaNacimiento).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedChild.genero === "Masculino" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {selectedChild.genero}
                      </span>
                    </div>
                  </div>
                  {selectedChild.level && (
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-full px-3 py-1 text-white font-bold flex items-center mt-3 md:mt-0">
                      <span className="text-sm">Nivel {selectedChild.level}</span>
                      <FaMedal className="ml-1 text-xs" />
                    </div>
                  )}
                </div>

                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-sm font-medium text-gray-900">Puntos Totales</h3>
                      <p className="text-xs text-gray-600">Progreso general en todos los juegos</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedChild.totalPoints}
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar 
                      value={(selectedChild.totalPoints / 5000) * 100} 
                      color="bg-gradient-to-r from-orange-400 to-amber-500"
                      height="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0 pts</span>
                      <span>5000 pts</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {prepareChartData(selectedChild) && (
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FaChartLine className="mr-1 text-orange-500" /> Puntos por Juego
                      </h3>
                      <div className="h-64">
                        <Bar 
                          data={prepareChartData(selectedChild)!}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {prepareLevelsData(selectedChild) && (
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <FaTrophy className="mr-1 text-amber-500" /> Niveles Completados
                      </h3>
                      <div className="h-64">
                        <Pie 
                          data={prepareLevelsData(selectedChild)!}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaGamepad className="mr-1 text-orange-500" /> Progreso Detallado
                </h3>

                {selectedChild.gameProgress && selectedChild.gameProgress.length > 0 ? (
                  <div className="space-y-3">
                    {selectedChild.gameProgress.map((game, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <h4 className="text-base font-medium">{game.gameName}</h4>
                          <div className="flex space-x-1 mt-1 md:mt-0">
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                              <FaTrophy className="mr-1" /> {game.points} pts
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              difficultyColors[game.highestDifficulty as keyof typeof difficultyColors] || "bg-gray-100 text-gray-800"
                            }`}>
                              {getDifficultyIcon(game.highestDifficulty)}
                              {game.highestDifficulty}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                          <div className="bg-white p-2 rounded shadow-xs">
                            <div className="text-xs text-gray-500 mb-1">Niveles Completados</div>
                            <div className="text-lg font-bold">{game.levelsCompleted}</div>
                          </div>
                          <div className="bg-white p-2 rounded shadow-xs">
                            <div className="text-xs text-gray-500 mb-1">Última Jugada</div>
                            <div className="text-sm font-medium">
                              {new Date(game.lastPlayed).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded shadow-xs">
                            <div className="text-xs text-gray-500 mb-1">Progreso</div>
                            <ProgressBar 
                              value={(game.points / 1000) * 100} 
                              color="bg-gradient-to-r from-orange-300 to-amber-400"
                              height="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de progreso</h3>
                    <p className="mt-1 text-xs text-gray-500">Este niño no ha jugado aún.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Progreso;