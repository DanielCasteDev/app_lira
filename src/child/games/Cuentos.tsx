import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { saveProgressWithSync, getProfileWithCache } from '../../utils/syncService';
import { cacheStory, getCachedStories } from '../../utils/indexedDB';

interface Story {
  id: number;
  title: string;
  content: string[];
  questions: Question[];
  image: string;
  level: number;
  ageGroup: number; // 1: 3-5 años, 2: 6-8 años, 3: 9-12 años
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

const CuentosDivertidos: React.FC = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [childAge, setChildAge] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [completedStories, setCompletedStories] = useState<number[]>([]);
  const [, setProgressData] = useState<{progress?: {CuentosDivertidos?: {completedStories?: number[]}}} | null>(null);

  // Función para cargar el progreso guardado (con soporte offline)
  const loadProgress = async () => {
    const childId = localStorage.getItem("id_niño");
    if (!childId) return;

    try {
      // Intentar cargar desde caché primero si estamos offline
      const data = await getProfileWithCache(childId);
      
      if (data) {
        setProgressData(data);
        
        // Marcar cuentos completados
        if (data.progress?.CuentosDivertidos?.completedStories) {
          setCompletedStories(data.progress.CuentosDivertidos.completedStories);
        }

        if (data.fromCache) {
          console.log('📦 Progreso cargado desde caché local');
        }
      }
    } catch (error) {
      console.error("Error al cargar progreso:", error);
    }
  };

  // Función para guardar el progreso (con soporte offline)
  const saveProgress = async (newPoints: number, storyId: number) => {
    setSavingProgress(true);
    const childId = localStorage.getItem("id_niño");
    if (!childId) {
      setSavingProgress(false);
      return;
    }

    try {
      // Actualizar la lista de cuentos completados
      const updatedCompletedStories = completedStories.includes(storyId) 
        ? completedStories 
        : [...completedStories, storyId];

      setCompletedStories(updatedCompletedStories);

      const result = await saveProgressWithSync(
        childId,
        {
          gameName: "CuentosDivertidos",
          points: newPoints,
          completedStories: updatedCompletedStories,
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

  // Obtener la edad del niño (con soporte de caché offline)
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
        
        console.log("Edad calculada:", edad);
        setChildAge(edad);
        
      } catch (err) {
        console.error("Error al obtener perfil del niño:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchChildProfile();
    loadProgress();
  }, []);

  // Cargar los cuentos con puntos aumentados (con soporte de caché)
  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Intentar cargar desde caché primero
        const cachedStories = await getCachedStories();
        
        if (cachedStories.length > 0) {
          console.log('📦 Cuentos cargados desde caché local');
          const typedStories = cachedStories as unknown as Story[];
          setStories(typedStories);
          
          if (childAge !== null) {
            let ageGroup = 1;
            if (childAge >= 6 && childAge <= 8) ageGroup = 2;
            else if (childAge >= 9) ageGroup = 3;
            
            setFilteredStories(typedStories.filter(story => story.ageGroup === ageGroup));
          } else {
            setFilteredStories(typedStories);
          }
          
          setLoading(false);
          return;
        }

        // Si no hay caché, crear los datos mock y guardarlos
        setTimeout(async () => {
          const mockStories: Story[] = [
            {
              id: 1,
              title: "El León y el Ratón",
              content: [
                "Un día, un león dormía plácidamente en la selva cuando un pequeño ratón comenzó a correr por su cuerpo.",
                "El león despertó y atrapó al ratón con sus enormes garras. El ratón, temblando de miedo, le suplicó:",
                "'¡Por favor, señor león, no me comas! Algún día podré ayudarte.' El león se rió pero decidió dejarlo ir.",
                "Días después, el león quedó atrapado en una red de cazadores. El ratón, al oír sus rugidos, corrió a ayudarlo.",
                "Con sus pequeños dientes, el ratón roía las cuerdas hasta que el león quedó libre. Así, el pequeño ratón salvó al gran león."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Quién despertó al león?",
                  options: ["Un elefante", "Un ratón", "Un pájaro", "Un mono"],
                  correctAnswer: "Un ratón",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué prometió el ratón al león?",
                  options: ["Que sería su amigo", "Que lo ayudaría algún día", "Que le traería comida", "Que se iría lejos"],
                  correctAnswer: "Que lo ayudaría algún día",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Cómo ayudó el ratón al león después?",
                  options: ["Llamando a otros animales", "Mordiendo la red", "Buscando al cazador", "Dando agua al león"],
                  correctAnswer: "Mordiendo la red",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/ilustracion-dibujos-animados-leon-raton_1308-51869.jpg",
              level: 1,
              ageGroup: 1
            },
            {
              id: 2,
              title: "La Tortuga y la Liebre",
              content: [
                "Una liebre muy veloz se burlaba de una tortuga por su lentitud. '¡Eres tan lenta que nunca llegarás a ningún lado!' decía.",
                "La tortuga, cansada de las burlas, desafió a la liebre a una carrera. La liebre aceptó, segura de su victoria.",
                "Al comenzar la carrera, la liebre salió disparada y pronto dejó atrás a la tortuga. Tan confiada estaba que decidió tomar una siesta.",
                "Mientras la liebre dormía, la tortuga siguió avanzando paso a paso, sin detenerse.",
                "Cuando la liebre despertó, vio con asombro que la tortuga estaba a punto de cruzar la meta. Corrió con todas sus fuerzas, pero era demasiado tarde."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Por qué se burlaba la liebre de la tortuga?",
                  options: ["Por su caparazón", "Por su lentitud", "Por su edad", "Por su color"],
                  correctAnswer: "Por su lentitud",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué hizo la liebre durante la carrera?",
                  options: ["Se detuvo a comer", "Tomó una siesta", "Se perdió", "Ayudó a la tortuga"],
                  correctAnswer: "Tomó una siesta",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué enseñanza nos deja esta historia?",
                  options: ["La constancia vence a la velocidad", "Las liebres son perezosas", "Las carreras son malas", "Todos deben ser rápidos"],
                  correctAnswer: "La constancia vence a la velocidad",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/ilustracion-dibujos-animados-liebre-tortuga_1308-51866.jpg",
              level: 2,
              ageGroup: 2
            },
            {
              id: 3,
              title: "El Zorro y las Uvas",
              content: [
                "Un caluroso día de verano, un zorro caminaba por el bosque cuando vio un racimo de uvas maduras colgando de una parra alta.",
                "'¡Qué deliciosas se ven esas uvas!', pensó el zorro. Se paró sobre sus patas traseras y estiró el cuello, pero no pudo alcanzarlas.",
                "El zorro tomó impulso y saltó con todas sus fuerzas, pero nuevamente falló. Lo intentó una y otra vez sin éxito.",
                "Finalmente, cansado y frustrado, el zorro se alejó diciendo: '¡Bah! Esas uvas seguro están agrias. No las quiero de todos modos.'",
                "Desde entonces, cuando alguien quiere algo pero no lo puede obtener y luego dice que no lo quería, decimos que es como 'el zorro y las uvas'."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué vio el zorro en el bosque?",
                  options: ["Un manzano", "Un racimo de uvas", "Un arroyo", "Un conejo"],
                  correctAnswer: "Un racimo de uvas",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Por qué el zorro no pudo alcanzar las uvas?",
                  options: ["Estaban muy altas", "Eran muy pequeñas", "Había un perro", "No tenía hambre"],
                  correctAnswer: "Estaban muy altas",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué dijo el zorro al final?",
                  options: ["Volveré mañana", "Las uvas están agrias", "Necesito ayuda", "Qué uvas más ricas"],
                  correctAnswer: "Las uvas están agrias",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/zorro-intentando-alcanzar-uvas-arbol_1308-51868.jpg",
              level: 2,
              ageGroup: 2
            },
            {
              id: 4,
              title: "La Cigarra y la Hormiga",
              content: [
                "Durante todo el verano, la cigarra cantaba y bailaba bajo el sol, mientras la hormiga trabajaba sin descanso almacenando comida.",
                "'¿Por qué trabajas tanto?', le preguntaba la cigarra. 'Ven a cantar conmigo y disfruta del buen tiempo.'",
                "La hormiga respondía: 'Debo prepararme para el invierno cuando no habrá comida. Tú deberías hacer lo mismo.'",
                "La cigarra se reía y seguía cantando. Pero cuando llegó el invierno, la cigarra no tenía nada para comer y moría de hambre.",
                "Mientras tanto, la hormiga y su familia estaban calientes y bien alimentadas en su hormiguero, gracias a su trabajo y previsión."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué hacía la cigarra en verano?",
                  options: ["Trabajaba", "Cantaba y bailaba", "Almacenaba comida", "Dormía"],
                  correctAnswer: "Cantaba y bailaba",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué hacía la hormiga mientras la cigarra cantaba?",
                  options: ["Almacenaba comida", "Cantaba también", "Dormía", "Se iba de viaje"],
                  correctAnswer: "Almacenaba comida",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué le pasó a la cigarra en invierno?",
                  options: ["Tenía mucha comida", "No tenía qué comer", "Se fue al sur", "Ayudó a la hormiga"],
                  correctAnswer: "No tenía qué comer",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/cigarra-hormiga-dibujos-animados_1308-51870.jpg",
              level: 3,
              ageGroup: 3
            },
            {
              id: 5,
              title: "El Pastor Mentiroso",
              content: [
                "Había una vez un pastorcito que cuidaba las ovejas de su aldea. Para divertirse, un día comenzó a gritar: '¡Que viene el lobo! ¡Que viene el lobo!'",
                "Los aldeanos corrieron a ayudarlo, pero cuando llegaron, no había ningún lobo. El pastor se reía de su broma.",
                "Al día siguiente, el pastor volvió a gritar: '¡Que viene el lobo!' y nuevamente los aldeanos corrieron en vano.",
                "Pero al tercer día, un lobo de verdad atacó el rebaño. El pastor gritó con todas sus fuerzas: '¡Que viene el lobo! ¡De verdad esta vez!'",
                "Nadie acudió en su ayuda, pues pensaron que era otra de sus bromas. El lobo se comió varias ovejas y el pastor aprendió una valiosa lección."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué hacía el pastor para divertirse?",
                  options: ["Gritar que venía el lobo", "Contar chistes", "Jugar con las ovejas", "Cantar canciones"],
                  correctAnswer: "Gritar que venía el lobo",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Cuántas veces mintió el pastor?",
                  options: ["Una", "Dos", "Tres", "Ninguna"],
                  correctAnswer: "Dos",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué lección aprendió el pastor?",
                  options: ["Los lobos son peligrosos", "No se debe mentir", "Las ovejas son tontas", "Los aldeanos son amables"],
                  correctAnswer: "No se debe mentir",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/pastor-nino-ovejas-dibujos-animados_1308-51871.jpg",
              level: 1,
              ageGroup: 1
            },
            {
              id: 6,
              title: "El Pájaro y la Hormiga",
              content: [
                "Una hormiga sedienta se acercó al río para beber agua, pero una fuerte corriente la arrastró.",
                "Un pájaro que observaba desde un árbol cercano arrancó una hoja y la dejó caer cerca de la hormiga.",
                "La hormiga subió a la hoja y flotó hasta la orilla, salvando así su vida.",
                "Días después, el pájaro estaba descansando cuando un cazador se acercó sigilosamente para atraparlo.",
                "La hormiga, al ver el peligro, picó el pie del cazador haciendo que soltara su red, permitiendo que el pájaro escapara."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué le pasó a la hormiga en el río?",
                  options: ["Se quedó dormida", "La arrastró la corriente", "Encontró comida", "Vio un pez"],
                  correctAnswer: "La arrastró la corriente",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Cómo ayudó el pájaro a la hormiga?",
                  options: ["Le dio de comer", "La llevó en su pico", "Dejó caer una hoja", "Cantó para calmarla"],
                  correctAnswer: "Dejó caer una hoja",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué enseñanza nos deja esta historia?",
                  options: ["Los pájaros son inteligentes", "Hay que ayudar a los demás", "Las hormigas son valientes", "El bien se devuelve"],
                  correctAnswer: "El bien se devuelve",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/pajaro-hormiga-dibujos-animados_1308-51872.jpg",
              level: 2,
              ageGroup: 2
            },
            {
              id: 7,
              title: "El Perro y su Reflejo",
              content: [
                "Un perro que llevaba un jugoso hueso en su boca cruzaba un puente sobre un río tranquilo.",
                "Al mirar hacia abajo, vio su reflejo en el agua y pensó que era otro perro con un hueso más grande.",
                "Codicioso, el perro decidió quitarle el hueso al otro perro y comenzó a ladrar fuertemente.",
                "Al abrir la boca para ladrar, su propio hueso cayó al río y se lo llevó la corriente.",
                "El perro se quedó sin nada y comprendió demasiado tarde que había sido tonto por su codicia."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué llevaba el perro en su boca?",
                  options: ["Un juguete", "Un hueso", "Un palo", "Una piedra"],
                  correctAnswer: "Un hueso",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué vio el perro en el agua?",
                  options: ["Un pez", "Su reflejo", "Otro perro", "Un pájaro"],
                  correctAnswer: "Su reflejo",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué lección aprendió el perro?",
                  options: ["No ser codicioso", "Los puentes son peligrosos", "No ladrar mucho", "Los huesos son pesados"],
                  correctAnswer: "No ser codicioso",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/perro-reflejo-agua-dibujos-animados_1308-51873.jpg",
              level: 1,
              ageGroup: 1
            },
            {
              id: 8,
              title: "El Viento y el Sol",
              content: [
                "El Viento y el Sol discutían sobre quién era más fuerte. Decidieron hacer una competencia.",
                "Verían quién podía hacer que un viajero se quitara su abrigo primero. El Viento comenzó.",
                "Sopló con todas sus fuerzas, pero cuanto más soplaba, más el viajero se abrigaba.",
                "Luego llegó el turno del Sol, que brilló con calor suave y constante.",
                "Pronto el viajero, acalorado, se quitó el abrigo. El Sol había ganado con amabilidad en lugar de fuerza."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Qué discutían el Viento y el Sol?",
                  options: ["Quién era más rápido", "Quién era más fuerte", "Quién era más brillante", "Quién era más viejo"],
                  correctAnswer: "Quién era más fuerte",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué hizo el Viento para ganar?",
                  options: ["Sopló fuerte", "Hizo frío", "Creó una tormenta", "Se calmó"],
                  correctAnswer: "Sopló fuerte",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué enseñanza nos deja esta fábula?",
                  options: ["La fuerza no lo es todo", "El sol siempre gana", "Los abrigos son importantes", "Hay que discutir menos"],
                  correctAnswer: "La fuerza no lo es todo",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/viento-sol-dibujos-animados_1308-51874.jpg",
              level: 3,
              ageGroup: 3
            },
            {
              id: 11,
              title: "Los Dos Cabritos",
              content: [
                "Dos cabritos se encontraron en un puente estrecho. El puente solo tenía espacio para uno a la vez.",
                "El primer cabrito dijo: '¡Yo pasaré primero!'. El segundo respondió: '¡No, yo pasaré primero!'.",
                "Ninguno quiso ceder. Comenzaron a empujarse y, en la pelea, cayeron al río.",
                "Otro día, dos cabritos diferentes se encontraron en el mismo puente. Ambos pensaron: 'Si peleamos, caeremos al agua'.",
                "Uno se acostó mientras el otro pasaba por encima. Así, ambos cruzaron sin problemas."
              ],
              questions: [
                {
                  id: 1,
                  text: "¿Por qué los primeros cabritos cayeron al río?",
                  options: ["El puente se rompió", "No supieron ceder", "Tenían miedo", "Eran pequeños"],
                  correctAnswer: "No supieron ceder",
                  points: 20
                },
                {
                  id: 2,
                  text: "¿Qué hicieron los cabritos inteligentes?",
                  options: ["Uno dejó pasar al otro", "Saltaron al agua", "Llamaron a ayuda", "Pelearon más fuerte"],
                  correctAnswer: "Uno dejó pasar al otro",
                  points: 30
                },
                {
                  id: 3,
                  text: "¿Qué moraleja tiene este cuento?",
                  options: ["La cooperación es mejor que el conflicto", "Los puentes son peligrosos", "Los cabritos son tercos", "Hay que ser rápido"],
                  correctAnswer: "La cooperación es mejor que el conflicto",
                  points: 50
                }
              ],
              image: "https://img.freepik.com/vector-gratis/dos-cabritos-puente-dibujos-animados_1308-51877.jpg",
              level: 3,
              ageGroup: 3
            }
          ];
          setStories(mockStories);
          
          // Guardar cuentos en caché
          for (const story of mockStories) {
            await cacheStory({
              ...story,
              cachedAt: new Date().toISOString()
            });
          }
          console.log('✅ Cuentos guardados en caché local');
          
          if (childAge !== null) {
            let ageGroup = 1;
            if (childAge >= 6 && childAge <= 8) ageGroup = 2;
            else if (childAge >= 9) ageGroup = 3;
            
            setFilteredStories(mockStories.filter(story => story.ageGroup === ageGroup));
          } else {
            setFilteredStories(mockStories);
          }
          
          setLoading(false);
        }, 1500);
      } catch {
        setError("Error al cargar los cuentos. Por favor intenta más tarde.");
        setLoading(false);
      }
    };

    fetchStories();
  }, [childAge]);

  useEffect(() => {
    if (selectedStory) {
      setTotalPoints(selectedStory.questions.reduce((acc, q) => acc + q.points, 0));
    }
  }, [selectedStory]);

  useEffect(() => {
    if (showQuestions && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameCompleted) {
      finishGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showQuestions, gameCompleted]);

  const selectStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setShowQuestions(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTimeLeft(60);
    setGameCompleted(false);
  };

  const nextPage = () => {
    if (selectedStory && currentPage < selectedStory.content.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setShowQuestions(true);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const selectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!selectedStory || selectedAnswer === null) return;

    const question = selectedStory.questions[currentQuestion];
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + question.points);
    }

    if (currentQuestion < selectedStory.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    if (!selectedStory) return;
    
    setShowResult(true);
    setGameCompleted(true);
    
    const totalPossiblePoints = selectedStory.questions.reduce((acc, q) => acc + q.points, 0);
    if (score >= totalPossiblePoints * 0.7) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    saveProgress(score, selectedStory.id);
  };

  const resetGame = () => {
    setSelectedStory(null);
    setShowQuestions(false);
    setShowResult(false);
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-6xl text-amber-500"
        >
          📖
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border-4 border-amber-200">
          <div className="text-6xl mb-4 text-amber-500">😞</div>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">¡Vaya!</h2>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/child")}
              className="flex items-center text-xl font-bold text-amber-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Atrás
            </motion.button>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-amber-700"
            >
              Cuentos Divertidos
            </motion.h1>
            <div className="w-10"></div>
          </header>

          {childAge !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-white p-4 rounded-xl shadow-md border-l-4 border-amber-400"
            >
              <h2 className="text-xl font-bold text-amber-700 mb-2">
                {childAge < 6 ? "¡Cuentos para pequeños lectores!" : 
                 childAge < 9 ? "¡Aventuras para jóvenes exploradores!" : 
                 "¡Historias desafiantes para mentes curiosas!"}
              </h2>
              <p className="text-amber-800">
                Hemos seleccionado estos cuentos especialmente para {childAge < 6 ? "niños de 3 a 5 años" : 
                childAge < 9 ? "niños de 6 a 8 años" : "niños de 9 a 12 años"}.
              </p>
            </motion.div>
          )}

          {childAge === null && (
            <>
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-100 px-4 py-2 rounded-full">
                    <h2 className="text-xl font-bold text-amber-800">Para 3-5 años</h2>
                  </div>
                  <div className="flex-1 border-t-2 border-amber-200 ml-4"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.filter(story => story.ageGroup === 1).map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      selectStory={selectStory} 
                      completed={completedStories.includes(story.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 px-4 py-2 rounded-full">
                    <h2 className="text-xl font-bold text-orange-800">Para 6-8 años</h2>
                  </div>
                  <div className="flex-1 border-t-2 border-orange-200 ml-4"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.filter(story => story.ageGroup === 2).map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      selectStory={selectStory} 
                      completed={completedStories.includes(story.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 px-4 py-2 rounded-full">
                    <h2 className="text-xl font-bold text-red-800">Para 9-12 años</h2>
                  </div>
                  <div className="flex-1 border-t-2 border-red-200 ml-4"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.filter(story => story.ageGroup === 3).map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      selectStory={selectStory} 
                      completed={completedStories.includes(story.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {childAge !== null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  selectStory={selectStory} 
                  completed={completedStories.includes(story.id)}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-amber-600 font-bold">¡Elige un cuento y comienza a leer!</p>
            <div className="text-4xl mt-2 text-amber-500">📚</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-6 relative overflow-hidden">
      {savingProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg font-semibold">Guardando progreso...</p>
          </div>
        </div>
      )}
      
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} colors={['#F59E0B', '#F97316', '#EF4444', '#FBBF24']} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Barra superior con puntos y tiempo */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
          <button 
            onClick={resetGame}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:from-amber-500 hover:to-orange-600"
          >
            ← Menú
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center border-2 border-amber-200">
              <span className="text-yellow-500 text-xl mr-1">⭐</span>
              <span className="font-bold text-amber-700">{score}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center border-2 border-amber-200">
              <span className="text-red-500 text-xl mr-1">⏱️</span>
              <span className={`font-bold ${timeLeft < 10 ? "text-red-500" : "text-amber-700"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Encabezado mejorado */}
        <header className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-amber-200">
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="flex items-center text-amber-700 font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </motion.button>
            
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-amber-800">{selectedStory.title}</h1>
              {!showResult && (
                <div className="flex items-center justify-center mt-1 space-x-2">
                  <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    Página {currentPage + 1} de {selectedStory.content.length}
                  </span>
                  {showQuestions && (
                    <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                      Pregunta {currentQuestion + 1} de {selectedStory.questions.length}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                <span className="text-amber-800 font-bold mr-1">🏆</span>
                <span className="text-sm font-bold text-amber-800">
                  {score}/{totalPoints} pts
                </span>
              </div>
              
              {!showResult && (
                <div className={`flex items-center px-3 py-1 rounded-full ${
                  timeLeft < 15 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>
                  <span className="font-bold mr-1">⏱️</span>
                  <span className="text-sm font-bold">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>
          
          {!showResult && (
            <div className="mt-3 w-full bg-amber-100 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full" 
                style={{ 
                  width: `${showQuestions 
                    ? ((currentQuestion + 1) / selectedStory.questions.length * 100) 
                    : ((currentPage + 1) / selectedStory.content.length * 100)
                  }%` 
                }}
              ></div>
            </div>
          )}
        </header>

        {!showQuestions && !showResult && (
          <motion.div
            key={`page-${currentPage}`}
            initial={{ opacity: 0, x: currentPage > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-4 border-amber-200"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex-shrink-0">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  className="w-full h-auto rounded-2xl shadow-md border-2 border-amber-100"
                />
              </div>
              <div className="md:w-2/3">
                <p className="text-lg leading-relaxed text-gray-700">
                  {selectedStory.content[currentPage]}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showQuestions && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-4 border-amber-200"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-amber-800">
                  {selectedStory.questions[currentQuestion].text}
                </h2>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                  {selectedStory.questions[currentQuestion].points} pts
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStory.questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectAnswer(option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAnswer === option
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        selectedAnswer === option
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-4 border-amber-200 text-center"
          >
            <div className="text-7xl mb-4">
              {score >= selectedStory.questions.reduce((acc, q) => acc + q.points, 0) * 0.7 ? "🎉" : "👍"}
            </div>
            <h2 className="text-2xl font-bold text-amber-700 mb-2">
              {score >= selectedStory.questions.reduce((acc, q) => acc + q.points, 0) * 0.7
                ? "¡Excelente trabajo!"
                : "¡Buen intento!"}
            </h2>
            <p className="text-lg mb-6 text-gray-700">
              Obtuviste {score} de {selectedStory.questions.reduce((acc, q) => acc + q.points, 0)} puntos.
            </p>
            
            {completedStories.includes(selectedStory.id) && (
              <div className="mb-6 bg-green-100 text-green-800 p-3 rounded-lg inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ¡Ya completaste este cuento anteriormente!
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Elegir otro cuento
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  selectStory(selectedStory);
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Jugar de nuevo
              </motion.button>
            </div>
          </motion.div>
        )}

        {!showResult && (
          <div className="flex justify-between">
            {!showQuestions ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
                    currentPage === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-amber-100 text-amber-700 hover:shadow-xl"
                  }`}
                >
                  Anterior
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextPage}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {currentPage < selectedStory.content.length - 1 ? "Siguiente" : "Contestar Preguntas"}
                </motion.button>
              </>
            ) : (
              <>
                <div></div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkAnswer}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
                    selectedAnswer === null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl"
                  }`}
                >
                  {currentQuestion < selectedStory.questions.length - 1 ? "Siguiente Pregunta" : "Ver Resultados"}
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StoryCardProps {
  story: Story;
  selectStory: (story: Story) => void;
  completed?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, selectStory, completed = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectStory(story)}
      className="bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer border-4 border-amber-200 hover:border-amber-300 transition-all relative"
    >
      {completed && (
        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <img
        src={story.image}
        alt={story.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-amber-800">{story.title}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            story.level === 1 ? "bg-amber-100 text-amber-800" :
            story.level === 2 ? "bg-orange-100 text-orange-800" :
            "bg-red-100 text-red-800"
          }`}>
            Nivel {story.level}
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          {story.content[0].substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-amber-600 font-medium">
            {story.questions.length} preguntas • {story.questions.reduce((acc, q) => acc + q.points, 0)} pts
          </span>
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow hover:shadow-md transition-all">
            Jugar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CuentosDivertidos;