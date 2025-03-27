import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from '../../api/api_service';

// Definición de tipos
type TipoItem = "animal" | "objeto";
type NivelDificultad = 1 | 2 | 3;

interface Item {
  nombre: string;
  imagen: string;
  vocal: string;
  tipo: TipoItem;
  dificultad: NivelDificultad;
}

const VocalesJuego: React.FC = () => {
  const navigate = useNavigate();
  const [itemActual, setItemActual] = useState<Item | null>(null);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(0);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [contadorPreguntas, setContadorPreguntas] = useState(0);
  const [dificultad, setDificultad] = useState<NivelDificultad | null>(null);
  const [itemsUsados, setItemsUsados] = useState<string[]>([]);
  const [childAge, setChildAge] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [mostrarSeleccionDificultad, setMostrarSeleccionDificultad] = useState(true);

  // Items organizados por dificultad con tipo seguro
  const itemsPorDificultad: Record<NivelDificultad, Item[]> = {
    1: [
      { nombre: "Águila", imagen: "🦅", vocal: "A", tipo: "animal", dificultad: 1 },
      { nombre: "Abeja", imagen: "🐝", vocal: "A", tipo: "animal", dificultad: 1 },
      { nombre: "Elefante", imagen: "🐘", vocal: "E", tipo: "animal", dificultad: 1 },
      { nombre: "Estrella", imagen: "⭐", vocal: "E", tipo: "objeto", dificultad: 1 },
      { nombre: "Iguana", imagen: "🦎", vocal: "I", tipo: "animal", dificultad: 1 },
      { nombre: "Oso", imagen: "🐻", vocal: "O", tipo: "animal", dificultad: 1 },
      { nombre: "Avión", imagen: "✈️", vocal: "A", tipo: "objeto", dificultad: 1 }
    ],
    2: [
      { nombre: "Armadillo", imagen: "🦫", vocal: "A", tipo: "animal", dificultad: 2 },
      { nombre: "Arcoíris", imagen: "🌈", vocal: "A", tipo: "objeto", dificultad: 2 },
      { nombre: "Erizo", imagen: "🦔", vocal: "E", tipo: "animal", dificultad: 2 },
      { nombre: "Impala", imagen: "🦌", vocal: "I", tipo: "animal", dificultad: 2 },
      { nombre: "Ornitorrinco", imagen: "🦫", vocal: "O", tipo: "animal", dificultad: 2 },
      { nombre: "Unicornio", imagen: "🦄", vocal: "U", tipo: "animal", dificultad: 2 },
      { nombre: "Ancla", imagen: "⚓", vocal: "A", tipo: "objeto", dificultad: 2 }
    ],
    3: [
      { nombre: "Aguacate", imagen: "🥑", vocal: "A", tipo: "objeto", dificultad: 3 },
      { nombre: "Escorpión", imagen: "🦂", vocal: "E", tipo: "animal", dificultad: 3 },
      { nombre: "Instrumento", imagen: "🎺", vocal: "I", tipo: "objeto", dificultad: 3 },
      { nombre: "Obelisco", imagen: "🏛️", vocal: "O", tipo: "objeto", dificultad: 3 },
      { nombre: "Urogallo", imagen: "🐦", vocal: "U", tipo: "animal", dificultad: 3 },
      { nombre: "Árbitro", imagen: "🤽", vocal: "A", tipo: "objeto", dificultad: 3 },
      { nombre: "Énfasis", imagen: "❗", vocal: "E", tipo: "objeto", dificultad: 3 }
    ]
  };

  // Función para guardar el progreso
  const saveProgress = async (newPoints: number, levelsCompleted: number) => {
    setSavingProgress(true);
    try {
      const childId = localStorage.getItem("id_niño");
      const token = localStorage.getItem("Token");
  
      if (!childId || !token || !dificultad) {
        throw new Error("Faltan credenciales de usuario o dificultad no definida");
      }
  
      const response = await fetch(`${API_BASE_URL}/child-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          childId,
          gameData: {
            gameName: "VocalesJuego",
            points: newPoints,
            levelsCompleted,
            highestDifficulty: dificultad === 1 ? 'fácil' : dificultad === 2 ? 'medio' : 'difícil',
            lastPlayed: new Date().toISOString()
          },
          totalPoints: newPoints
        })
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar progreso");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      throw error;
    } finally {
      setSavingProgress(false);
    }
  };

  // Obtener perfil del niño
  useEffect(() => {
    const fetchChildProfile = async () => {
      const childId = localStorage.getItem("id_niño");
      if (!childId) {
        setLoadingProfile(false);
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
        
        if (!data.childProfile?.fechaNacimiento) {
          throw new Error("No se encontró fecha de nacimiento");
        }
        
        const fechaNacimiento = new Date(data.childProfile.fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
          edad--;
        }
        
        setChildAge(edad);
      } catch (err) {
        console.error("Error al obtener perfil del niño:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchChildProfile();
  }, []);

  // Text-to-Speech
  const hablarNombre = (nombre: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(nombre);
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  const iniciarPregunta = () => {
    if (!dificultad) return;
    
    const preguntasPorNivel: Record<NivelDificultad, number> = {
      1: 5,
      2: 7,
      3: 10
    };

    if (contadorPreguntas >= preguntasPorNivel[dificultad]) {
      setJuegoTerminado(true);
      saveProgress(puntos, preguntasPorNivel[dificultad]);
      return;
    }

    const itemsDisponibles = itemsPorDificultad[dificultad]
      .filter((item: Item) => !itemsUsados.includes(item.nombre));

    if (itemsDisponibles.length === 0) {
      setItemsUsados([]);
      return iniciarPregunta();
    }

    const itemAleatorio = itemsDisponibles[Math.floor(Math.random() * itemsDisponibles.length)];
    setItemActual(itemAleatorio);
    setItemsUsados([...itemsUsados, itemAleatorio.nombre]);
    hablarNombre(itemAleatorio.nombre);

    // Generar opciones basadas en la dificultad
    let vocalesDisponibles = ["A", "E", "I", "O"];
    if (dificultad >= 2) vocalesDisponibles.push("U");
    
    const vocalesIncorrectas = vocalesDisponibles.filter(v => v !== itemAleatorio.vocal);
    const opcionesMezcladas = [
      itemAleatorio.vocal,
      vocalesIncorrectas[Math.floor(Math.random() * vocalesIncorrectas.length)],
      vocalesIncorrectas[Math.floor(Math.random() * vocalesIncorrectas.length)],
      vocalesIncorrectas[Math.floor(Math.random() * vocalesIncorrectas.length)]
    ].sort(() => Math.random() - 0.5);

    setOpciones(opcionesMezcladas);
    setRespuestaSeleccionada(null);
    setMostrarFeedback(false);
    setContadorPreguntas(contadorPreguntas + 1);
  };

  useEffect(() => {
    if (dificultad !== null && !loadingProfile) {
      iniciarPregunta();
    }
  }, [dificultad, loadingProfile]);

  const verificarRespuesta = (vocal: string) => {
    if (!itemActual || !dificultad) return;
    
    setRespuestaSeleccionada(vocal);
    setMostrarFeedback(true);

    if (vocal === itemActual.vocal) {
      const nuevosPuntos = puntos + (dificultad * 20);
      setPuntos(nuevosPuntos);
      saveProgress(nuevosPuntos, contadorPreguntas + 1);
    }

    setTimeout(() => {
      iniciarPregunta();
    }, 1500);
  };

  const reiniciarJuego = () => {
    setPuntos(0);
    setContadorPreguntas(0);
    setJuegoTerminado(false);
    setItemsUsados([]);
    iniciarPregunta();
  };

  const seleccionarDificultad = (nivel: NivelDificultad) => {
    setDificultad(nivel);
    setMostrarSeleccionDificultad(false);
    setPuntos(0);
    setContadorPreguntas(0);
    setItemsUsados([]);
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
        </motion.div>
      </div>
    );
  }

  if (mostrarSeleccionDificultad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-4 border-amber-300"
        >
          <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">
            Selecciona la Dificultad
          </h1>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => seleccionarDificultad(1)}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-4 rounded-xl text-xl font-bold shadow-md"
            >
              <div className="text-3xl mb-1">🐻</div>
              Fácil
              <p className="text-sm font-normal mt-1">Vocales básicas y palabras cortas</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => seleccionarDificultad(2)}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-4 rounded-xl text-xl font-bold shadow-md"
            >
              <div className="text-3xl mb-1">🦄</div>
              Medio
              <p className="text-sm font-normal mt-1">Incluye la U y palabras más largas</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => seleccionarDificultad(3)}
              className="w-full bg-gradient-to-r from-red-400 to-red-500 text-white py-4 rounded-xl text-xl font-bold shadow-md"
            >
              <div className="text-3xl mb-1">🏛️</div>
              Difícil
              <p className="text-sm font-normal mt-1">Palabras complejas y menos comunes</p>
            </motion.button>
          </div>
          
          {childAge && (
            <p className="text-center text-gray-500 mt-6">
              Según tu edad ({childAge} años), te recomendamos: 
              <button 
                onClick={() => seleccionarDificultad(childAge < 5 ? 1 : childAge < 8 ? 2 : 3)}
                className="ml-2 text-orange-600 font-semibold underline"
              >
                {childAge < 5 ? "Fácil" : childAge < 8 ? "Medio" : "Difícil"}
              </button>
            </p>
          )}
        </motion.div>
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
      
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate("/child")}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-md"
        >
          ← Volver
        </button>
        <div className="text-xl font-bold text-orange-600">
          Puntos: ⭐ {puntos} | Nivel: {dificultad === 1 ? "Fácil" : dificultad === 2 ? "Medio" : "Difícil"}
        </div>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-6">
          ¿Con qué vocal empieza?
        </h1>

        {itemActual && (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-amber-300"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="text-center mb-6">
              <div 
                className="text-8xl mb-4 cursor-pointer"
                onClick={() => hablarNombre(itemActual.nombre)}
              >
                {itemActual.imagen}
              </div>
              {dificultad === 3 && (
                <p className="text-lg text-gray-600">{itemActual.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {opciones.map((vocal, index) => (
                <motion.button
                  key={index}
                  onClick={() => !mostrarFeedback && verificarRespuesta(vocal)}
                  className={`text-4xl font-bold py-4 rounded-xl shadow-md ${
                    respuestaSeleccionada === vocal
                      ? vocal === itemActual.vocal
                        ? "bg-green-400 text-white"
                        : "bg-red-400 text-white"
                      : "bg-gradient-to-r from-amber-100 to-orange-100 hover:bg-gradient-to-r text-orange-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={mostrarFeedback}
                >
                  {vocal}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {mostrarFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-xl font-bold"
                >
                  {respuestaSeleccionada === itemActual.vocal ? (
                    <p className="text-green-600">¡Correcto! +{dificultad! * 20} puntos</p>
                  ) : (
                    <p className="text-red-500">
                      Empieza con: <span className="text-2xl">{itemActual.vocal}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <AnimatePresence>
          {mostrarFeedback && respuestaSeleccionada === itemActual?.vocal && (
            <div className="fixed inset-0 pointer-events-none flex justify-center">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    y: [0, -100],
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                >
                  {["✨", "🌟", "⭐", "🎉"][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {juegoTerminado && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center border-4 border-amber-300 shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <h2 className="text-3xl font-bold text-orange-600 mb-4">
                ¡Juego Completado!
              </h2>
              <div className="text-7xl mb-4">🏆</div>
              <p className="text-xl text-gray-700 mb-2">
                Puntuación: <span className="font-bold">{puntos}</span> puntos
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {puntos >= (dificultad === 1 ? 80 : dificultad === 2 ? 120 : 180) 
                  ? "¡Eres un experto en vocales!" 
                  : "¡Sigue practicando!"}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={reiniciarJuego}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  Jugar otra vez
                </button>
                <button
                  onClick={() => setMostrarSeleccionDificultad(true)}
                  className="w-full bg-gradient-to-r from-amber-300 to-orange-400 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  Cambiar dificultad
                </button>
                <button
                  onClick={() => navigate("/child")}
                  className="w-full bg-gradient-to-r from-amber-200 to-orange-300 text-orange-700 py-3 rounded-lg font-bold shadow-lg"
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

export default VocalesJuego;