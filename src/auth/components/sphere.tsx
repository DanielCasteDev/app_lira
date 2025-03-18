// components/Sphere.tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface SphereProps {
  size: number;       // Tamaño de la esfera
  color: string;      // Color de la esfera
}

const Sphere: React.FC<SphereProps> = ({ size, color }) => {
  const controls = useAnimation();

  // Función para generar movimiento aleatorio continuo
  const randomMovement = async () => {
    while (true) {
      // Generar nuevas coordenadas aleatorias dentro de la pantalla
      const newX = Math.random() * (window.innerWidth - size);
      const newY = Math.random() * (window.innerHeight - size);

      // Mover la esfera a las nuevas coordenadas
      await controls.start({
        x: newX,
        y: newY,
        transition: { duration: Math.random() * 5 + 5, ease: "linear" }, // Movimiento más lento
      });
    }
  };

  // Iniciar el movimiento aleatorio al montar el componente
  useEffect(() => {
    // Posición inicial aleatoria dentro de la pantalla
    const initialX = Math.random() * (window.innerWidth - size);
    const initialY = Math.random() * (window.innerHeight - size);

    // Animación inicial para mover la esfera desde su posición inicial
    controls.set({ x: initialX, y: initialY });
    randomMovement();
  }, []);

  return (
    <motion.div
      animate={controls} // Animación controlada por `controls`
      style={{
        width: size,         // Tamaño de la esfera
        height: size,        // Tamaño de la esfera
        borderRadius: "50%", // Forma circular
        backgroundColor: color, // Color de la esfera
        position: "absolute", // Posición absoluta para moverla libremente
      }}
    />
  );
};

export default Sphere;