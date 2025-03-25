import { motion } from "framer-motion";
import { EnvelopeIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useState, FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "../cargando";
import { forgotPassword } from './utils/Data';

export default function RestablecerContrasena() {
  const [correo, setCorreo] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

// Update the handleSubmit function in RestablecerContrasena.tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const data = await forgotPassword(correo);

    toast.success(data.message || 'Correo de restablecimiento enviado', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#4BB543',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      icon: '✉️',
    });

    setIsSubmitted(true);
  } catch (error: any) {
    console.error("Error:", error);
    toast.error(error.message || 'Error al enviar el enlace', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#FF3333',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px'
      },
      icon: '❌',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Toaster />
      {isLoading && <LoadingSpinner />}

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.a
          href="/"
          className="flex items-center text-orange-600 hover:text-orange-800 font-medium text-sm mb-6 w-fit"
          whileHover={{ x: -2 }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Volver al inicio
        </motion.a>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <EnvelopeIcon className="h-12 w-12 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Restablece tu contraseña</h1>
          </div>

          <div className="p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">¡Correo enviado!</h2>
                <p className="text-gray-600 mb-6">
                  Hemos enviado un enlace a <span className="font-semibold text-orange-600">{correo}</span> para restablecer tu contraseña.
                </p>
                <p className="text-sm text-gray-500">
                  El enlace expirará en 1 hora. Si no lo ves, revisa tu carpeta de spam.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-gray-600 mb-6 text-center">
                  Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200"
                      required
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-medium transition-colors duration-300 ${isLoading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'}`}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    Enviar enlace de recuperación
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}