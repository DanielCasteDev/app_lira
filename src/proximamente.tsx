import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ComingSoonPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  // Función definitiva para el contador
  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    let targetDate = new Date(now.getFullYear(), 4, 24); // 24 de mayo (mes 4)
    
    // Si ya pasó la fecha este año, calcular para el próximo año
    if (now > targetDate) {
      targetDate = new Date(now.getFullYear() + 1, 4, 24);
    }

    const difference = targetDate.getTime() - now.getTime();

    return {
      days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((difference / (1000 * 60)) % 60)),
      seconds: Math.max(0, Math.floor((difference / 1000) % 60))
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const neonVariants = {
    initial: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Efectos de fondo animados */}
      <motion.div 
        initial="initial"
        animate="animate"
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          variants={neonVariants}
          className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-blue-600 opacity-20 blur-[100px]"
        />
        <motion.div
          variants={neonVariants}
          transition={{ delay: 0.5 }}
          className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-purple-600 opacity-20 blur-[100px]"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      </motion.div>

      {/* Contenido principal */}
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-screen text-center"
      >
        {/* Badge de estado */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/50 text-blue-300 text-sm font-medium"
        >
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mr-2 w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </motion.svg>
          LANZAMIENTO 24 DE MAYO
        </motion.div>

        {/* Título con gradiente animado */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-6"
        >
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-300 to-blue-500"
          >
            PRÓXIMAMENTE
          </motion.span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-blue-100 max-w-2xl mb-8 leading-relaxed"
        >
          Estamos preparando algo extraordinario para ti
        </motion.p>

        {/* Contador definitivamente funcional */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-300">
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
            <div className="text-sm text-gray-400 mt-1">Días</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-300">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <div className="text-sm text-gray-400 mt-1">Horas</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-300">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <div className="text-sm text-gray-400 mt-1">Minutos</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-300">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
            <div className="text-sm text-gray-400 mt-1">Segundos</div>
          </div>
        </motion.div>

        {/* Botón con animaciones */}
        <motion.button
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" 
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Volver atrás
        </motion.button>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1 } }}
          className="mt-12 text-sm text-gray-500"
        >
          &copy; {new Date().getFullYear()} LIRA. Todos los derechos reservados.
        </motion.footer>
      </motion.main>
    </div>
  );
}