import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Animal {
  nombre: string;
  imagen: string;
  vocal: string;
}

const VocalesAnimales: React.FC = () => {
  const navigate = useNavigate();
  const [animalActual, setAnimalActual] = useState<Animal | null>(null);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(0);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [contadorPreguntas, setContadorPreguntas] = useState(0);

  const animales: Animal[] = [
    { nombre: "Águila", imagen: "🦅", vocal: "A" },
    { nombre: "Elefante", imagen: "🐘", vocal: "E" },
    { nombre: "Iguana", imagen: "🦎", vocal: "I" },
    { nombre: "Oso", imagen: "🐻", vocal: "O" },
    { nombre: "Urraca", imagen: "🐦", vocal: "U" },
    { nombre: "Abeja", imagen: "🐝", vocal: "A" },
    { nombre: "Erizo", imagen: "🦔", vocal: "E" },
    { nombre: "Impala", imagen: "🦌", vocal: "I" },
    { nombre: "Oveja", imagen: "🐑", vocal: "O" },
    { nombre: "Unau", imagen: "🦥", vocal: "U" }
  ];

  const iniciarPregunta = () => {
    if (contadorPreguntas >= 5) {
      setJuegoTerminado(true);
      return;
    }

    const animalAleatorio = animales[Math.floor(Math.random() * animales.length)];
    setAnimalActual(animalAleatorio);

    const vocales = ["A", "E", "I", "O", "U"].filter(v => v !== animalAleatorio.vocal);
    const opcionesMezcladas = [
      animalAleatorio.vocal,
      vocales[Math.floor(Math.random() * 4)],
      vocales[Math.floor(Math.random() * 4)],
      vocales[Math.floor(Math.random() * 4)]
    ].sort(() => Math.random() - 0.5);

    setOpciones(opcionesMezcladas);
    setRespuestaSeleccionada(null);
    setMostrarFeedback(false);
    setContadorPreguntas(contadorPreguntas + 1);
  };

  useEffect(() => {
    iniciarPregunta();
  }, []);

  const verificarRespuesta = (vocal: string) => {
    setRespuestaSeleccionada(vocal);
    setMostrarFeedback(true);

    if (vocal === animalActual?.vocal) {
      setPuntos(puntos + 20);
    }

    setTimeout(() => {
      iniciarPregunta();
    }, 1500);
  };

  const reiniciarJuego = () => {
    setPuntos(0);
    setContadorPreguntas(0);
    setJuegoTerminado(false);
    iniciarPregunta();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center p-4">
      {/* Barra superior */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate("/child")}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-md"
        >
          ← Volver
        </button>
        <div className="text-xl font-bold text-orange-600">
          Puntos: ⭐ {puntos}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-6">
          ¿Con qué vocal empieza?
        </h1>

        {animalActual && (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-amber-300"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">{animalActual.imagen}</div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {animalActual.nombre}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {opciones.map((vocal, index) => (
                <motion.button
                  key={index}
                  onClick={() => !mostrarFeedback && verificarRespuesta(vocal)}
                  className={`text-4xl font-bold py-4 rounded-xl shadow-md ${
                    respuestaSeleccionada === vocal
                      ? vocal === animalActual.vocal
                        ? "bg-green-400 text-white"
                        : "bg-red-400 text-white"
                      : "bg-gradient-to-r from-amber-100  to-orange-100 hover:bg-gradient-to-r text-orange-700"
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
                  {respuestaSeleccionada === animalActual.vocal ? (
                    <p className="text-green-600">¡Correcto! +20 puntos</p>
                  ) : (
                    <p className="text-red-500">
                      Empieza con: <span className="text-2xl">{animalActual.vocal}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Efectos de celebración */}
        <AnimatePresence>
          {mostrarFeedback && respuestaSeleccionada === animalActual?.vocal && (
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

      {/* Pantalla final */}
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
                {puntos >= 80 ? "¡Eres un experto en vocales!" : "¡Sigue practicando!"}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={reiniciarJuego}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  Jugar otra vez
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

export default VocalesAnimales;
