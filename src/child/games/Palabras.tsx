import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from '../../api/api_service';

interface WordChallenge {
  word: string;
  image: string;
  letters: string[];
  hint: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
}

const FormaPalabras: React.FC = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'fácil' | 'medio' | 'difícil'>('fácil');
  const [childAge, setChildAge] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Efecto para obtener la edad del niño
  useEffect(() => {
    const fetchChildProfile = async () => {
      const childId = localStorage.getItem("id_niño");
      if (!childId) {
        setLoadingProfile(false);
        console.log("No se encontró ID de niño en localStorage");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/child-profile/${childId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("Token")}`
          }
        });
        
        if (!response.ok) throw new Error("Error al obtener perfil del niño");
        
        const data = await response.json();
        console.log("Respuesta completa de la API:", data);
        
        if (!data.childProfile?.fechaNacimiento) {
          throw new Error("No se encontró fecha de nacimiento en la respuesta");
        }
        
        const fechaNacimiento = new Date(data.childProfile.fechaNacimiento);
        console.log("Fecha de nacimiento parseada:", fechaNacimiento);
        
        if (isNaN(fechaNacimiento.getTime())) {
          throw new Error("Fecha de nacimiento no válida");
        }
        
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
          edad--;
        }
        
        console.log("Edad calculada:", edad);
        setChildAge(edad);
        
        // Establecer dificultad inicial basada en la edad
        if (edad < 6) {
          setDifficulty('fácil');
        } else if (edad < 9) {
          setDifficulty('medio');
        } else {
          setDifficulty('difícil');
        }
        
      } catch (err) {
        console.error("Error al obtener perfil del niño:", err);
        // Establecer dificultad por defecto si hay error
        setDifficulty('fácil');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchChildProfile();
  }, []);

  const wordChallenges: WordChallenge[] = [
    // Nivel fácil
    {
      word: "SOL",
      image: "https://cdn.pixabay.com/photo/2018/01/28/12/37/sun-3114068_640.jpg",
      letters: ["S", "O", "L", "N", "T", "R"],
      hint: "Nos da luz y calor durante el día",
      difficulty: "fácil"
    },
    {
      word: "PAN",
      image: "https://cdn.pixabay.com/photo/2014/07/22/09/59/bread-399286_640.jpg",
      letters: ["P", "A", "N", "M", "O", "L"],
      hint: "Alimento que se hornea y es básico en la dieta",
      difficulty: "fácil"
    },
    {
      word: "LUZ",
      image: "https://cdn.pixabay.com/photo/2017/01/28/02/24/bulb-2014158_640.jpg",
      letters: ["L", "U", "Z", "D", "A", "S"],
      hint: "Lo que enciendes cuando está oscuro",
      difficulty: "fácil"
    },
    // Nivel medio
    {
      word: "GATO",
      image: "https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_640.jpg",
      letters: ["G", "A", "T", "O", "C", "M", "P", "L"],
      hint: "Animal doméstico que maúlla",
      difficulty: "medio"
    },
    {
      word: "FLOR",
      image: "https://cdn.pixabay.com/photo/2018/01/29/07/11/flower-3115353_640.jpg",
      letters: ["F", "L", "O", "R", "P", "D", "S", "A"],
      hint: "Crece en el jardín y huele bien",
      difficulty: "medio"
    },
    {
      word: "CASA",
      image: "https://cdn.pixabay.com/photo/2016/06/24/10/47/house-1477041_640.jpg",
      letters: ["C", "A", "S", "A", "L", "M", "T", "O"],
      hint: "Lugar donde vives con tu familia",
      difficulty: "medio"
    },
    // Nivel difícil
    {
      word: "JARDIN",
      image: "https://cdn.pixabay.com/photo/2016/11/30/15/00/garden-1872997_640.jpg",
      letters: ["J", "A", "R", "D", "I", "N", "P", "L", "O", "S"],
      hint: "Espacio con plantas y flores alrededor de una casa",
      difficulty: "difícil"
    },
    {
      word: "TIGRE",
      image: "https://cdn.pixabay.com/photo/2017/07/24/19/57/tiger-2535888_640.jpg",
      letters: ["T", "I", "G", "R", "E", "A", "L", "O", "N", "D"],
      hint: "Felino grande con rayas negras",
      difficulty: "difícil"
    },
    {
      word: "ESCUELA",
      image: "https://cdn.pixabay.com/photo/2018/01/17/07/06/laptop-3087585_640.jpg",
      letters: ["E", "S", "C", "U", "E", "L", "A", "D", "O", "N", "M", "P"],
      hint: "Lugar donde los niños van a aprender",
      difficulty: "difícil"
    }
  ];

  const DifficultySelector: React.FC = () => {
    const difficulties = [
      {
        level: 'fácil',
        title: 'Fácil',
        description: 'Palabras de 3-4 letras',
        image: 'https://cdn.pixabay.com/photo/2017/01/16/15/17/hot-air-balloons-1984308_640.jpg',
        color: 'from-amber-200 to-amber-300',
        icon: '😊',
        minAge: 0,
        maxAge: 6
      },
      {
        level: 'medio',
        title: 'Medio',
        description: 'Palabras de 4-5 letras',
        image: 'https://cdn.pixabay.com/photo/2016/11/29/08/17/adventure-1868812_640.jpg',
        color: 'from-amber-300 to-amber-400',
        icon: '🤔',
        minAge: 6,
        maxAge: 9
      },
      {
        level: 'difícil',
        title: 'Difícil',
        description: 'Palabras de 5-7 letras',
        image: 'https://cdn.pixabay.com/photo/2016/11/22/19/25/adventure-1850172_640.jpg',
        color: 'from-amber-400 to-amber-500',
        icon: '🧠',
        minAge: 9,
        maxAge: 99
      }
    ];
  
    // Filtrar dificultades basadas en la edad del niño
    const filteredDifficulties = childAge !== null 
      ? difficulties.filter(diff => childAge >= diff.minAge && childAge < diff.maxAge)
      : difficulties;
  
    // Determinar el ancho de la grilla basado en el número de dificultades
    const gridClass = filteredDifficulties.length === 1 
      ? 'flex justify-center' 
      : filteredDifficulties.length === 2 
        ? 'grid grid-cols-2 gap-6 max-w-2xl mx-auto'
        : 'grid grid-cols-1 md:grid-cols-3 gap-6';
  
    return (
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl shadow-xl p-8 mt-8 border-4 border-amber-200">
        {/* Botón de retroceso añadido aquí */}
        <motion.button
          onClick={() => navigate("/child")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 left-4 bg-gradient-to-r from-amber-300 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center"
        >
          ← Atrás
        </motion.button>

        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
          Forma Palabras
        </h1>
        
        {/* Mostrar información de edad detectada */}
        {childAge !== null && (
          <div className="mb-6 bg-white p-4 rounded-xl shadow-md border-l-4 border-amber-400">
            <h2 className="text-xl font-bold text-amber-700 mb-1">
              ¡Hola! Detectamos que tienes {childAge} años
            </h2>
            <p className="text-amber-800">
              Estos son los niveles recomendados para ti:
            </p>
          </div>
        )}
        
        <p className="text-center text-amber-700 mb-8 text-lg">Selecciona el nivel de dificultad</p>
        
        <div className={`${gridClass} mb-10`}>
          {filteredDifficulties.map((diff) => (
            <motion.div
              key={diff.level}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer border-4 ${
                difficulty === diff.level ? 'border-amber-500 shadow-lg' : 'border-amber-300 shadow-md'
              }`}
              onClick={() => setDifficulty(diff.level as 'fácil' | 'medio' | 'difícil')}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${diff.color} opacity-80`} />
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: difficulty === diff.level ? 1.15 : 1 }}
                  className="text-6xl mb-4"
                >
                  {diff.icon}
                </motion.div>
                <h3 className="text-3xl font-bold mb-2 text-amber-800">
                  {diff.title}
                </h3>
                <p className="text-amber-700 text-center font-medium">
                  {diff.description}
                </p>
                {difficulty === diff.level && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 text-3xl text-amber-600"
                  >
                    ✓
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
  
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setGameStarted(true);
              setPoints(0);
              setCurrentLevel(0);
            }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl text-xl transition-all flex items-center"
          >
            <span className="text-2xl mr-3">🚀</span> Comenzar Juego
            <span className="text-2xl ml-3">🎮</span>
          </motion.button>
        </div>
  
        <div className="mt-8 text-center text-amber-700">
          <p className="flex items-center justify-center text-lg">
            <span className="text-3xl mr-2">⭐</span> Gana más puntos en niveles más difíciles
          </p>
        </div>
      </div>
    );
  };

  const filteredWords = wordChallenges.filter(word => word.difficulty === difficulty);
  const currentChallenge = filteredWords[currentLevel % filteredWords.length];

  const calculatePoints = () => {
    const basePoints = {
      'fácil': 50,
      'medio': 100,
      'difícil': 150
    };
    return basePoints[difficulty] + Math.floor(timeLeft / 5) * 10;
  };

  useEffect(() => {
    if (gameStarted) {
      initializeGame();
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentLevel, gameStarted, difficulty]);

  const initializeGame = () => {
    const shuffledLetters = [...currentChallenge.letters].sort(() => Math.random() - 0.5);
    setLetters(shuffledLetters);
    setSelectedLetters([]);
    setCompleted(false);
    setShowHint(false);
    setTimeLeft(60);
    setGameOver(false);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDrop = (targetArray: 'letters' | 'selectedLetters', index: number) => {
    if (dragItem.current === null) return;

    const sourceArray = dragItem.current >= letters.length ? 'selectedLetters' : 'letters';
    const sourceIndex = dragItem.current >= letters.length 
      ? dragItem.current - letters.length 
      : dragItem.current;

    if (sourceArray === targetArray) {
      const array = [...(sourceArray === 'letters' ? letters : selectedLetters)];
      const [removed] = array.splice(sourceIndex, 1);
      array.splice(index, 0, removed);
      
      if (sourceArray === 'letters') {
        setLetters(array);
      } else {
        setSelectedLetters(array);
        checkCompletion(array);
      }
    } else {
      const sourceArr = [...(sourceArray === 'letters' ? letters : selectedLetters)];
      const targetArr = [...(targetArray === 'letters' ? letters : selectedLetters)];
      const [removed] = sourceArr.splice(sourceIndex, 1);
      targetArr.splice(index, 0, removed);

      if (sourceArray === 'letters') {
        setLetters(sourceArr);
        setSelectedLetters(targetArr);
        checkCompletion(targetArr);
      } else {
        setSelectedLetters(sourceArr);
        setLetters(targetArr);
        checkCompletion(sourceArr);
      }
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const checkCompletion = (currentSelected: string[]) => {
    if (currentSelected.join("") === currentChallenge.word) {
      setCompleted(true);
      setShowConfetti(true);
      setPoints(points + calculatePoints());
      setTimeout(() => {
        setShowSuccess(true);
        setShowConfetti(false);
      }, 1500);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < filteredWords.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setShowSuccess(false);
    } else {
      navigate("/child");
      setGameStarted(false);
    }
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleHint = () => {
    setShowHint(true);
    setPoints(Math.max(0, points - 20));
  };

  const exitToMenu = () => {
    navigate("/child");
    setGameStarted(false);
    setGameOver(false);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-amber-700">Cargando tu perfil...</h2>
          <p className="text-amber-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center p-4">
        <DifficultySelector />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center p-4">
      {/* Barra superior */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button 
          onClick={exitToMenu}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:from-amber-500 hover:to-orange-600"
        >
          ← Menú
        </button>
        
        <div className="flex items-center space-x-6">
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center border-2 border-amber-200">
            <span className="text-yellow-500 text-xl mr-1">⭐</span>
            <span className="font-bold text-amber-700">{points}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center border-2 border-amber-200">
            <span className="text-red-500 text-xl mr-1">⏱️</span>
            <span className={`font-bold ${timeLeft < 10 ? "text-red-500" : "text-amber-700"}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center border-2 border-amber-200">
            <span className="text-blue-500 text-xl mr-1">📊</span>
            <span className="font-bold text-amber-700">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 mb-6 border-4 border-amber-100">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
          Forma Palabras
        </h1>
        <p className="text-center text-amber-700 mb-6">Nivel {currentLevel + 1} - {difficulty}</p>
        
        {/* Imagen de pista */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img 
              src={currentChallenge.image} 
              alt="Pista" 
              className="w-48 h-48 object-cover rounded-2xl shadow-md border-4 border-amber-200"
            />
            {showHint && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-b-lg text-center">
                {currentChallenge.hint}
              </div>
            )}
          </div>
        </div>

        {/* Área de letras seleccionadas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Tu palabra:</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop('selectedLetters', selectedLetters.length)}
            className="min-h-20 bg-amber-50 rounded-xl p-4 flex flex-wrap justify-center items-center border-2 border-dashed border-amber-200"
          >
            {selectedLetters.length === 0 && (
              <p className="text-amber-400">Arrastra las letras aquí</p>
            )}
            {selectedLetters.map((letter, index) => (
              <motion.div
                key={index}
                draggable
                onDragStart={() => handleDragStart(letters.length + index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('selectedLetters', index)}
                className={`text-4xl font-bold m-2 w-16 h-16 flex items-center justify-center rounded-lg shadow-md cursor-grab
                  ${completed && selectedLetters.join("") === currentChallenge.word 
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" 
                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 border-2 border-amber-200"}`}
                whileTap={{ scale: 0.9 }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Letras disponibles */}
        <div>
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Letras disponibles:</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop('letters', letters.length)}
            className="bg-white rounded-xl p-4 flex flex-wrap justify-center items-center border-2 border-amber-100"
          >
            {letters.map((letter, index) => (
              <motion.div
                key={`letter-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('letters', index)}
                className="text-4xl font-bold m-2 w-16 h-16 flex items-center justify-center bg-white text-orange-700 rounded-lg shadow-md hover:shadow-lg transition-all cursor-grab border-2 border-amber-200"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={handleReset}
          className="bg-gradient-to-r from-amber-300 to-orange-400 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:from-amber-400 hover:to-orange-500"
        >
          Reiniciar
        </button>
        <button 
          onClick={handleHint}
          disabled={showHint}
          className={`px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all
            ${showHint 
              ? "bg-amber-200 text-amber-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"}`}
        >
          Pista (-20 pts)
        </button>
      </div>

      {/* Modal de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border-4 border-amber-200"
            >
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-orange-600 mb-2">¡Correcto!</h2>
              <p className="text-xl mb-4">Formaste la palabra: <span className="font-bold text-amber-700">{currentChallenge.word}</span></p>
              <p className="text-lg text-orange-600 mb-2">+{calculatePoints()} puntos</p>
              <p className="text-md text-amber-700 mb-6">Dificultad: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              <button 
                onClick={handleNextLevel}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
              >
                {currentLevel < filteredWords.length - 1 ? "Siguiente palabra" : "¡Juego completado!"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confeti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40 flex justify-center items-start overflow-hidden"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * window.innerWidth - window.innerWidth / 2 }}
                animate={{ 
                  y: window.innerHeight,
                  x: Math.random() * 200 - 100,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 5
                }}
                style={{
                  position: 'absolute',
                  fontSize: `${10 + Math.random() * 20}px`,
                  color: ['#f97316', '#f59e0b', '#ea580c', '#d97706', '#b45309'][Math.floor(Math.random() * 5)]
                }}
              >
                {['🎉', '✨', '🌟', '🎊', '🥳'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border-4 border-amber-200"
            >
              <div className="text-7xl mb-4">⏱️</div>
              <h2 className="text-3xl font-bold text-orange-600 mb-2">¡Tiempo terminado!</h2>
              <p className="text-xl mb-4">Puntuación final: <span className="font-bold text-amber-700">{points} puntos</span></p>
              <p className="text-md text-amber-700 mb-6">Dificultad: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setTimeLeft(60);
                    setGameOver(false);
                    setCurrentLevel(0);
                    setPoints(0);
                    initializeGame();
                  }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
                >
                  Jugar de nuevo
                </button>
                <button 
                  onClick={exitToMenu}
                  className="bg-gradient-to-r from-amber-200 to-orange-300 text-orange-700 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
                >
                  Volver al inicio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormaPalabras;