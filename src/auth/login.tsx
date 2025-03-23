import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/lira.png";
import fondo from "../assets/image.jpg";
import { useState, useEffect } from "react"; // Importa useEffect
import { loginUser } from "../auth/utils/Data";
import { toast, Toaster } from "react-hot-toast";
import LoadingSpinner from "../cargando";

const LoginPage = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Efecto para verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem("Token");
    const userRole = localStorage.getItem("userRole");

    if (token && userRole) {
      setLoading(true); // Activar el estado de carga

      // Redirigir según el rol
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "parent") {
          navigate("/parent");
        } else if (userRole === "child") {
          navigate("/child");
        } else {
          toast.error("Rol no reconocido");
        }
        setLoading(false); // Desactivar el icono de carga
      }, 1500); // Esperar 1.5 segundos antes de redirigir
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Activar el estado de carga

    try {
      const data = await loginUser(correo, contraseña);

      console.log("Datos recibidos del servidor:", data);

      // Guardar datos en localStorage
      localStorage.setItem("userEmail", correo);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("Token", data.token);
      localStorage.setItem("userNombre", data.user.nombre);
      localStorage.setItem("id", data.user._id);
      localStorage.setItem("id_niño", data.user.id_niño);

      // Mostrar notificación de éxito
      toast.success("Inicio de sesión exitoso");

      // Redirigir según el rol
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "parent") {
          navigate("/parent");
        } else if (data.user.role === "child") {
          navigate("/child");
        } else {
          toast.error("Rol no reconocido");
        }
        setLoading(false); // Desactivar el icono de carga
      }, 1500); // Esperar 1.5 segundos antes de redirigir

      console.log("Datos del usuario:", data);
    } catch (error) {
      setLoading(false); // Desactivar el icono de carga en caso de error
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error desconocido");
      }
    }
  };

  const loginVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Toaster position="top-right" reverseOrder={false} />

      <a
        href="https://educacion-lira.vercel.app/"
        className="absolute top-4 right-6 flex items-center text-gray-500 hover:text-gray-700 transition-all duration-200"
      >
        <FaArrowLeft className="w-5 h-5 mr-2" />
        <span>Regresar</span>
      </a>

      {loading && <LoadingSpinner />}

      <div className="h-screen flex flex-col lg:flex-row">
        <div
          className="hidden lg:block lg:w-1/2 h-full relative items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: `url(${fondo})`,
          }}
        >
          <motion.div
            className="relative z-20 text-center px-8 py-6 bg-black/50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">¡Bienvenido!</h1>
            <p className="text-xl text-white">
              Transformamos la lectura en una experiencia dinámica y atractiva para los niños.
            </p>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6">
          <motion.div
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-100"
            variants={loginVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Logo" className="h-16" />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
              Iniciar Sesión
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  id="correo"
                  className="block w-full px-4 py-2 border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 peer"
                  placeholder=" "
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <label
                  htmlFor="usuario"
                  className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-500"
                >
                  Usuario
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="contraseña"
                  className="block w-full px-4 py-2 border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 peer"
                  placeholder=" "
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
                <label
                  htmlFor="contraseña"
                  className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-500"
                >
                  Contraseña
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="olvidaste"
                className="text-sm text-orange-500 hover:text-orange-600 focus:outline-none transition-all duration-200"
              >
                ¿Olvidaste tu contraseña?
              </a>
              <p className="mt-2 text-sm text-gray-600">
                ¿Aún no tienes una cuenta?{" "}
                <a
                  href="/registro"
                  className="text-orange-500 hover:text-orange-600 focus:outline-none transition-all duration-200"
                >
                  Crea una gratis
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;