import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { saveProgressWithSync, getProfileWithCache } from '../../utils/syncService';

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
  const [savingProgress, setSavingProgress] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sistema de puntuación mejorado
  const POINTS_BY_DIFFICULTY = {
    'fácil': 50,
    'medio': 100,
    'difícil': 150
  };
  const HINT_PENALTY = 20;
  const TIME_BONUS_MULTIPLIER = 5;
  const INITIAL_TIME = {
    'fácil': 60,
    'medio': 75,
    'difícil': 90
  };

  // Base de datos de palabras por dificultad
  const wordChallenges: WordChallenge[] = [
    // Nivel fácil (4 palabras)
    {
      word: "SOL",
      image: "https://png.pngtree.com/png-clipart/20230425/original/pngtree-sun-yellow-cartoon-png-image_9096447.png",
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
      image: "https://img.freepik.com/vector-gratis/lampara-luces-foco-composicion-realista-humo-paisaje-oscuro-lampara-colgante-rayos-particulas-ilustracion-vectorial_1284-75722.jpg?semt=ais_hybrid",
      letters: ["L", "U", "Z", "D", "A", "S"],
      hint: "Lo que enciendes cuando está oscuro",
      difficulty: "fácil"
    },
    {
      word: "MAR",
      image: "https://img.freepik.com/foto-gratis/mar-tropical-hermoso-mar-playa-cielo-azul-nube-blanca-copyspace_74190-8663.jpg",
      letters: ["M", "A", "R", "L", "T", "S"],
      hint: "Gran extensión de agua salada",
      difficulty: "fácil"
    },

    // Nivel medio (8 palabras)
    {
      word: "MESA",
      image: "https://img.freepik.com/vector-premium/dibujos-animados-mesa_119631-412.jpg",
      letters: ["M", "E", "S", "A", "L", "T", "O"],
      hint: "Mueble con patas donde comes o trabajas",
      difficulty: "medio"
    },
    {
      word: "FLOR",
      image: "https://img.freepik.com/foto-gratis/primer-disparo-flor-morada_181624-25863.jpg",
      letters: ["F", "L", "O", "R", "P", "D", "S"],
      hint: "Crece en el jardín y huele bien",
      difficulty: "medio"
    },
    {
      word: "GATO",
      image: "https://img.freepik.com/vector-gratis/personaje-dibujos-animados-gatito-ojos-dulces_1308-135596.jpg",
      letters: ["G", "A", "T", "O", "C", "M", "P"],
      hint: "Animal doméstico que maúlla",
      difficulty: "medio"
    },
    {
      word: "CASA",
      image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      letters: ["C", "A", "S", "A", "L", "M", "T"],
      hint: "Lugar donde vives con tu familia",
      difficulty: "medio"
    },
    {
      word: "RÍO",
      image: "https://media.istockphoto.com/id/1337232523/es/foto/vista-de-%C3%A1ngulo-alto-de-un-lago-y-un-bosque.jpg?s=612x612&w=0&k=20&c=qjJVeU0aGSTZnoeNB7EoJr7lmQhZPoez9kCuXMx3vr8=",
      letters: ["R", "Í", "O", "M", "N", "L"],
      hint: "Corriente de agua que fluye",
      difficulty: "medio"
    },
    {
      word: "SILLA",
      image: "https://reimse.mx/wp-content/uploads/2019/08/TMH67-2-800X800.jpg",
      letters: ["S", "I", "L", "L", "A", "M", "T"],
      hint: "Mueble con respaldo para sentarse",
      difficulty: "medio"
    },
    {
      word: "NUBE",
      image: "https://services.meteored.com/img/article/-por-que-las-nubes-no-se-caen--7332-1_1280.jpg",
      letters: ["N", "U", "B", "E", "C", "T", "R"],
      hint: "Flotan en el cielo y pueden traer lluvia",
      difficulty: "medio"
    },
    {
      word: "PATO",
      image: "https://media.istockphoto.com/id/464988959/es/foto/%C3%A1nade-real-con-trazado-de-recorte.jpg?s=612x612&w=0&k=20&c=PAIRHbQK8O5urZ33f94YIMegMvOHEPH0lhwgup57nCA=",
      letters: ["P", "A", "T", "O", "L", "M", "N"],
      hint: "Ave acuática que hace 'cuac'",
      difficulty: "medio"
    },

    // Nivel difícil (12 palabras)
    {
      word: "VENTANA",
      image: "https://static8.depositphotos.com/1041088/887/i/450/depositphotos_8877408-stock-photo-open-window-to-the-back.jpg",
      letters: ["V", "E", "N", "T", "A", "N", "A", "M"],
      hint: "Abertura en la pared para ver afuera",
      difficulty: "difícil"
    },
    {
      word: "JARDÍN",
      image: "https://collectionworld.net/modules/ph_simpleblog/covers/281.jpg",
      letters: ["J", "A", "R", "D", "Í", "N", "P", "L", "O"],
      hint: "Espacio con plantas y flores alrededor de una casa",
      difficulty: "difícil"
    },
    {
      word: "TIGRE",
      image: "https://media.istockphoto.com/id/1218694103/es/foto/tigre-real-aislado-en-el-trazado-de-recorte-de-fondo-blanco-incluido-el-tigre-est%C3%A1-mirando-a.jpg?s=612x612&w=0&k=20&c=1KEmnWLMs670FqXaSlB6PhGIIxgdCbuycRq3Qv1slvs=",
      letters: ["T", "I", "G", "R", "E", "A", "L", "O", "N"],
      hint: "Felino grande con rayas negras",
      difficulty: "difícil"
    },
    {
      word: "ESCUELA",
      image: "https://static6.depositphotos.com/1005738/610/v/450/depositphotos_6105444-stock-illustration-back-to-school-time.jpg",
      letters: ["E", "S", "C", "U", "E", "L", "A", "D", "O"],
      hint: "Lugar donde los niños van a aprender",
      difficulty: "difícil"
    },
    {
      word: "MONTAÑA",
      image: "https://cdn0.geoenciclopedia.com/es/posts/8/0/0/montanas_8_orig.jpg",
      letters: ["M", "O", "N", "T", "A", "Ñ", "A", "L"],
      hint: "Elevación natural del terreno",
      difficulty: "difícil"
    },
    {
      word: "AVIÓN",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Air_india_b747-400_vt-esn_arp.jpg",
      letters: ["A", "V", "I", "Ó", "N", "M", "P", "L", "T"],
      hint: "Vehículo que vuela por los aires",
      difficulty: "difícil"
    },
    {
      word: "PLANETA",
      image: "https://static.nationalgeographic.es/files/styles/image_3200/public/940.jpg?w=1900&h=1427",
      letters: ["P", "L", "A", "N", "E", "T", "A", "M"],
      hint: "Cuerpo celeste que gira alrededor de una estrella",
      difficulty: "difícil"
    },
    {
      word: "LIBRO",
      image: "https://cdn.pixabay.com/photo/2015/1https://resizer.glanacion.com/resizer/v2/credito-QS3KNYFVIFHPJLNBGX45PZCZSM.jpg?auth=50f38491ae3193337eeec020a127bcabf02e8cf5fade7ed15dd8923181e7d2a1&width=768&quality=70&smart=false",
      letters: ["L", "I", "B", "R", "O", "P", "A", "D"],
      hint: "Contiene páginas con historias o conocimientos",
      difficulty: "difícil"
    },
    {
      word: "CIELO",
      image: "https://www.shutterstock.com/image-photo/awesome-sunset-soft-pink-clouds-600nw-2537293181.jpg",
      letters: ["C", "I", "E", "L", "O", "N", "B", "T"],
      hint: "Lo que ves cuando miras hacia arriba en un día despejado",
      difficulty: "difícil"
    },
    {
      word: "ÁRBOL",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/03/Eiche_bei_Graditz.jpg",
      letters: ["Á", "R", "B", "O", "L", "M", "N", "S"],
      hint: "Planta grande con tronco y ramas",
      difficulty: "difícil"
    },
    {
      word: "FUEGO",
      image: "https://i.pinimg.com/736x/1c/ee/b6/1ceeb6c650802b171763c969bc3a9a79.jpg",
      letters: ["F", "U", "E", "G", "O", "P", "L", "T"],
      hint: "Produce calor y luz cuando algo se quema",
      difficulty: "difícil"
    },
    {
      word: "PUERTA",
      image: "https://cdn.finstral.com/images/content/1256588_53695_5_C_900_900_0_204734610/finstral-5.jpg",
      letters: ["P", "U", "E", "R", "T", "A", "L", "M"],
      hint: "Entrada o salida de una habitación o edificio",
      difficulty: "difícil"
    }
  ];

  // Función para guardar el progreso (con soporte offline)
  const saveProgress = async (newPoints: number, levelsCompleted: number) => {
    setSavingProgress(true);
    const childId = localStorage.getItem("id_niño");
    if (!childId) {
      setSavingProgress(false);
      return;
    }

    try {
      const result = await saveProgressWithSync(
        childId,
        {
          gameName: "FormaPalabras",
          points: newPoints,
          levelsCompleted,
          highestDifficulty: difficulty,
          lastPlayed: new Date().toISOString()
        },
        newPoints
      );

      if (result.offline) {
        console.log('📴 Progreso guardado localmente, se sincronizará cuando haya conexión');
      } else {
        console.log('✅ Progreso sincronizado en tiempo real');
      }
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    } finally {
      setSavingProgress(false);
    }
  };

  // Efecto para obtener la edad del niño (con soporte de caché offline)
  useEffect(() => {
    const fetchChildProfile = async () => {
      const childId = localStorage.getItem("id_niño");
      if (!childId) {
        setLoadingProfile(false);
        console.log("No se encontró ID de niño en localStorage");
        return;
      }

      try {
        const data = await getProfileWithCache(childId);
        
        if (!data || !data.childProfile?.fechaNacimiento) {
          throw new Error("No se encontró fecha de nacimiento en la respuesta");
        }

        if (data.fromCache) {
          console.log('📦 Perfil cargado desde caché local');
        } else {
          console.log('✅ Perfil obtenido de la API');
        }
        
        const fechaNacimiento = new Date(data.childProfile.fechaNacimiento);
        
        if (isNaN(fechaNacimiento.getTime())) {
          throw new Error("Fecha de nacimiento no válida");
        }
        
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
          edad--;
        }
        
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
        setDifficulty('fácil');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchChildProfile();
  }, []);

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
  
    const filteredDifficulties = childAge !== null 
      ? difficulties.filter(diff => childAge >= diff.minAge && childAge < diff.maxAge)
      : difficulties;
  
    const gridClass = filteredDifficulties.length === 1 
      ? 'flex justify-center' 
      : filteredDifficulties.length === 2 
        ? 'grid grid-cols-2 gap-6 max-w-2xl mx-auto'
        : 'grid grid-cols-1 md:grid-cols-3 gap-6';
  
    return (
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl shadow-xl p-8 mt-8 border-4 border-amber-200">
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
    const basePoints = POINTS_BY_DIFFICULTY[difficulty];
    const timeBonus = Math.floor(timeLeft / 5) * TIME_BONUS_MULTIPLIER;
    const totalPoints = basePoints + timeBonus;
    
    console.log(`Puntos base: ${basePoints}, Bonus de tiempo: ${timeBonus}, Total: ${totalPoints}`);
    
    return totalPoints;
  };

  useEffect(() => {
    if (gameStarted) {
      initializeGame();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentLevel, gameStarted, difficulty]);

  const initializeGame = () => {
    const shuffledLetters = [...currentChallenge.letters].sort(() => Math.random() - 0.5);
    setLetters(shuffledLetters);
    setSelectedLetters([]);
    setCompleted(false);
    setShowHint(false);
    setTimeLeft(INITIAL_TIME[difficulty]);
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

  const handleLetterClick = (letter: string, index: number) => {
    const newLetters = [...letters];
    newLetters.splice(index, 1);
    setLetters(newLetters);
    
    setSelectedLetters(prev => {
      const newSelected = [...prev, letter];
      checkCompletion(newSelected);
      return newSelected;
    });
  };

  const handleSelectedLetterClick = (index: number) => {
    const newSelected = [...selectedLetters];
    const [removedLetter] = newSelected.splice(index, 1);
    setSelectedLetters(newSelected);
    checkCompletion(newSelected);
    
    setLetters(prev => [...prev, removedLetter]);
  };

  const checkCompletion = (currentSelected: string[]) => {
    if (currentSelected.join("") === currentChallenge.word) {
      setCompleted(true);
      setShowConfetti(true);
      setTimeout(() => {
        setShowSuccess(true);
        setShowConfetti(false);
      }, 1500);
    }
  };

  const handleNextLevel = () => {
    const pointsEarned = calculatePoints();
    
    // Suma solo los puntos ganados en este nivel
    const newPoints = points + pointsEarned;
    const levelsCompleted = currentLevel + 1;
    
    // Guardamos el progreso con los puntos actualizados
    saveProgress(newPoints, levelsCompleted);
    
    // Actualizamos el estado de puntos 
    setPoints(newPoints);
  
    if (currentLevel < filteredWords.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setShowSuccess(false);
    } else {
      // Si completó todos los niveles, navegamos al menú
      navigate("/child");
      setGameStarted(false);
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    initializeGame();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleHint = () => {
    if (!showHint) {
      setShowHint(true);
      setPoints(prev => Math.max(0, prev - HINT_PENALTY));
    }
  };

  const exitToMenu = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    saveProgress(points, currentLevel);
    navigate("/child");
    setGameStarted(false);
    setGameOver(false);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-amber-700">Cargando tu perfil...</h2>
          <p className="text-amber-600">Preparando el juego para ti</p>
        </motion.div>
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
      {savingProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg font-semibold">Guardando progreso...</p>
          </div>
        </div>
      )}
      
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
              <p className="text-amber-400">Arrastra las letras aquí o haz clic en ellas</p>
            )}
            {selectedLetters.map((letter, index) => (
              <motion.div
                key={index}
                draggable
                onDragStart={() => handleDragStart(letters.length + index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('selectedLetters', index)}
                onClick={() => handleSelectedLetterClick(index)}
                className={`text-4xl font-bold m-2 w-16 h-16 flex items-center justify-center rounded-lg shadow-md cursor-pointer
                  ${completed && selectedLetters.join("") === currentChallenge.word 
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse" 
                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 border-2 border-amber-200"}`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
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
                onClick={() => handleLetterClick(letter, index)}
                className="text-4xl font-bold m-2 w-16 h-16 flex items-center justify-center bg-white text-orange-700 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-amber-200"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mb-8">
        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-amber-300 to-orange-400 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
        >
          Reiniciar
        </motion.button>
        <motion.button
          onClick={handleHint}
          disabled={showHint}
          whileHover={{ scale: showHint ? 1 : 1.05 }}
          whileTap={{ scale: showHint ? 1 : 0.95 }}
          className={`px-6 py-3 rounded-full font-bold shadow-md transition-all
            ${showHint 
              ? "bg-amber-200 text-amber-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg"}`}
        >
          Pista (-20 pts)
        </motion.button>
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
              <motion.button
                onClick={handleNextLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
              >
                {currentLevel < filteredWords.length - 1 ? "Siguiente palabra" : "¡Juego completado!"}
              </motion.button>
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
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -100, 
                  x: Math.random() * window.innerWidth - window.innerWidth / 2,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  x: Math.random() * 400 - 200,
                  rotate: Math.random() * 720,
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  ease: "linear"
                }}
                style={{
                  position: 'absolute',
                  fontSize: `${15 + Math.random() * 25}px`,
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
                <motion.button
                  onClick={() => {
                    setTimeLeft(INITIAL_TIME[difficulty]);
                    setGameOver(false);
                    setCurrentLevel(0);
                    setPoints(0);
                    initializeGame();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
                >
                  Jugar de nuevo
                </motion.button>
                <motion.button
                  onClick={exitToMenu}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-200 to-orange-300 text-orange-700 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl w-full"
                >
                  Volver al inicio
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormaPalabras;