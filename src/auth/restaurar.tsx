// src/auth/ResetPassword.tsx
import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../cargando';
import { verifyResetToken, resetPassword } from './utils/Data';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  // Configuración común para los toasts
  const toastConfig = {
    position: 'top-center' as const,
    duration: 4000,
  };

  // Verificar token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        const response = await verifyResetToken(token || '');
        
        setIsTokenValid(true);
        toast.success(response.message || 'Token válido. Puedes restablecer tu contraseña', {
          ...toastConfig,
          style: {
            background: '#E8F5E9',
            color: '#2E7D32',
            border: '1px solid #A5D6A7'
          },
          icon: <ShieldCheckIcon className="h-5 w-5 text-green-600" />
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token inválido o expirado';
        toast.error(errorMessage, {
          ...toastConfig,
          style: {
            background: '#FFEBEE',
            color: '#D32F2F',
            border: '1px solid #EF9A9A'
          }
        });
        setTimeout(() => navigate('/olvidaste'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isTokenValid) return;

    // Validaciones
    if (!password || !confirmPassword) {
      showErrorToast('Ambos campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      showErrorToast('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      const response = await resetPassword(token || '', password);

      toast.success(response.message || 'Contraseña restablecida con éxito', {
        ...toastConfig,
        style: {
          background: '#E8F5E9',
          color: '#2E7D32',
          border: '1px solid #A5D6A7'
        },
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />
      });

      setIsSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al restablecer la contraseña';
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar toast de error
  const showErrorToast = (message: string) => {
    toast.error(message, {
      ...toastConfig,
      style: {
        background: '#FFEBEE',
        color: '#D32F2F',
        border: '1px solid #EF9A9A'
      }
    });
  };

  if (!isTokenValid && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldCheckIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Token inválido</h2>
          <p className="text-gray-600">Redirigiendo a la página de recuperación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
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
          className="flex items-center text-amber-700 hover:text-amber-900 font-medium text-sm mb-6 w-fit"
          whileHover={{ x: -2 }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Volver al inicio
        </motion.a>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <LockClosedIcon className="h-12 w-12 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Nueva Contraseña</h1>
          </div>

          <div className="p-8">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="mb-4">
                  <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">¡Contraseña actualizada!</h2>
                <p className="text-gray-600 mb-6">
                  Tu contraseña ha sido restablecida correctamente.
                </p>
                <p className="text-sm text-gray-500">
                  Serás redirigido automáticamente a la página de inicio.
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-gray-600 mb-6 text-center">
                  Ingresa y confirma tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                </p>

                <form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition duration-200"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition duration-200"
                      placeholder="Repite tu nueva contraseña"
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-300 ${
                      isLoading ? 'bg-amber-400' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    }`}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      'Restablecer Contraseña'
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-amber-800">
          <p>&copy; {new Date().getFullYear()} Lira. Todos los derechos reservados.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;