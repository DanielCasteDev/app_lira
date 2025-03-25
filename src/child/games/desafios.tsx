import React, { useState } from "react";
import { motion } from "framer-motion";

type ChallengeDifficulty = 'principiante' | 'aprendiz' | 'maestro';

interface Challenge {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  icon: string;
  difficulty: ChallengeDifficulty;
  points: number;
  completed: boolean;
  requirements: string[];
  reward: string;
  gameType: string;
}

const CHALLENGES: Challenge[] = [
  // Letras Mágicas Challenges
  {
    id: 1,
    title: "Palabras Escondidas",
    description: "Encuentra palabras ocultas",
    fullDescription: "Descubre 5 palabras escondidas en un conjunto de letras mezcladas. Demuestra tu ingenio para reorganizar letras y formar palabras.",
    icon: "🔠",
    gameType: "Letras Mágicas",
    difficulty: "principiante",
    points: 30,
    completed: false,
    requirements: [
      "Identificar palabras de 3-4 letras",
      "Usar todas las letras disponibles"
    ],
    reward: "Insignia de Detective de Palabras"
  },
  {
    id: 2,
    title: "Alfabeto Veloz",
    description: "Ordena letras rápidamente",
    fullDescription: "Ordena un conjunto de letras alfabéticamente en el menor tiempo posible. Pon a prueba tu velocidad mental.",
    icon: "🔤",
    gameType: "Letras Mágicas",
    difficulty: "aprendiz",
    points: 50,
    completed: false,
    requirements: [
      "Ordenar letras en menos de 2 minutos",
      "Sin errores"
    ],
    reward: "Medalla de Rapidez Alfabética"
  },
  
  // Forma Palabras Challenges
  {
    id: 3,
    title: "Constructor de Palabras",
    description: "Crea palabras complejas",
    fullDescription: "Forma palabras de 5 o más letras usando un conjunto de letras predefinido. Demuestra tu creatividad lingüística.",
    icon: "🧩",
    gameType: "Forma Palabras",
    difficulty: "maestro",
    points: 75,
    completed: false,
    requirements: [
      "Mínimo 5 letras por palabra",
      "Palabras con significado real",
      "Usar la mayoría de las letras disponibles"
    ],
    reward: "Insignia de Maestro Lingüístico"
  },
  {
    id: 4,
    title: "Rompecabezas de Palabras",
    description: "Desafío de combinaciones",
    fullDescription: "Crea el máximo número de palabras posibles con un conjunto limitado de letras en 5 minutos.",
    icon: "📝",
    gameType: "Forma Palabras",
    difficulty: "aprendiz",
    points: 60,
    completed: false,
    requirements: [
      "Máximo de palabras en 5 minutos",
      "Palabras únicas",
      "Mínimo 3 letras por palabra"
    ],
    reward: "Diploma de Ingenio Lingüístico"
  },
  
  // Cuentos Divertidos Challenges
  {
    id: 5,
    title: "Cuenta Cuentos Mágicos",
    description: "Crea una historia original",
    fullDescription: "Escribe un cuento corto de al menos 5 párrafos. Tu historia debe tener un inicio, nudo y desenlace. ¡Deja volar tu imaginación!",
    icon: "📖",
    gameType: "Cuentos Divertidos",
    difficulty: "aprendiz",
    points: 100,
    completed: false,
    requirements: [
      "Mínimo 5 párrafos",
      "Personajes definidos",
      "Un mensaje o moraleja"
    ],
    reward: "Diploma de Escritor Creativo"
  },
  {
    id: 6,
    title: "Narración Exprés",
    description: "Cuento en tiempo récord",
    fullDescription: "Crea una historia completa en menos de 10 minutos, usando 3 palabras aleatorias como inspiración.",
    icon: "✍️",
    gameType: "Cuentos Divertidos",
    difficulty: "maestro",
    points: 125,
    completed: false,
    requirements: [
      "Historia completa en 10 minutos",
      "Usar 3 palabras de inspiración",
      "Principio, desarrollo y conclusión"
    ],
    reward: "Insignia de Narrador Veloz"
  },
  
  // Desafíos Lira Challenges
  {
    id: 7,
    title: "Rompecabezas Lógico",
    description: "Resuelve acertijos mentales",
    fullDescription: "Soluciona 3 acertijos de lógica que pondrán a prueba tu ingenio y capacidad de razonamiento.",
    icon: "🧠",
    gameType: "Desafíos Lira",
    difficulty: "maestro",
    points: 150,
    completed: false,
    requirements: [
      "3 acertijos diferentes",
      "Solución explicada",
      "Tiempo límite: 15 minutos"
    ],
    reward: "Insignia de Maestro del Pensamiento"
  },
  {
    id: 8,
    title: "Desafío Matemático",
    description: "Operaciones veloces",
    fullDescription: "Completa 10 operaciones matemáticas avanzadas en menos de 5 minutos. ¡Desafía tu mente!",
    icon: "🧮",
    gameType: "Desafíos Lira",
    difficulty: "maestro",
    points: 175,
    completed: false,
    requirements: [
      "10 operaciones complejas",
      "Menos de 5 minutos",
      "Sin calculadora"
    ],
    reward: "Medalla de Genio Matemático"
  }
];

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

const DesafiosLira: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | 'todos'>('todos');

  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-100 text-green-800';
      case 'aprendiz': return 'bg-amber-100 text-amber-800';
      case 'maestro': return 'bg-red-100 text-red-800';
    }
  };

  const filteredChallenges = CHALLENGES.filter(challenge => 
    (selectedGame === null || challenge.gameType === selectedGame) &&
    (selectedDifficulty === 'todos' || challenge.difficulty === selectedDifficulty)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Desafíos Lira
          </h1>
          <div className="text-5xl">🏆</div>
        </div>

        {/* Juegos */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {juegos.map((juego, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedGame(selectedGame === juego.title ? null : juego.title)}
              className={`${juego.color} text-white rounded-2xl p-4 shadow-xl cursor-pointer text-center 
                ${selectedGame === juego.title ? 'ring-4 ring-white' : ''}`}
            >
              <div className="text-4xl mb-2">{juego.icon}</div>
              <h2 className="text-lg font-bold">{juego.title}</h2>
            </motion.div>
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <select 
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as ChallengeDifficulty | 'todos')}
            className="px-4 py-2 rounded-full bg-white shadow-md"
          >
            <option value="todos">Todas las Dificultades</option>
            <option value="principiante">Principiante</option>
            <option value="aprendiz">Aprendiz</option>
            <option value="maestro">Maestro</option>
          </select>
        </div>

        {/* Grid de Desafíos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <motion.div 
              key={challenge.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-amber-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-5xl mr-4">{challenge.icon}</div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="mt-1 text-sm font-medium text-gray-600">
                    {challenge.gameType}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-orange-600 mb-2">{challenge.title}</h3>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              <details className="mb-4">
                <summary className="text-blue-600 cursor-pointer">Ver detalles</summary>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{challenge.fullDescription}</p>
                  <div className="mt-2">
                    <strong>Requisitos:</strong>
                    <ul className="list-disc list-inside">
                      {challenge.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⭐</span>
                  <span className="font-bold text-amber-500">{challenge.points} pts</span>
                </div>
                <button 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all"
                >
                  Comenzar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredChallenges.length === 0 && (
          <div className="text-center mt-16">
            <div className="text-6xl mb-4">🌈</div>
            <h2 className="text-2xl font-bold text-orange-600">
              No hay desafíos para mostrar
            </h2>
            <p className="text-gray-600">Prueba cambiando los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesafiosLira;