import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Sphere from "./components/sphere";
import LoadingSpinner from "../cargando"; // Importa el componente de carga
import { registerParent } from './utils/Data'; // Importa la función de registro

// Datos de países con LADA y banderas
const paises = [
    { codigo: "MX", lada: "+52", bandera: "🇲🇽" }, // México
    { codigo: "US", lada: "+1", bandera: "🇺🇸" },  // Estados Unidos
    { codigo: "ES", lada: "+34", bandera: "🇪🇸" }, // España
];

const Admin: React.FC = () => {
    const [step, setStep] = useState(0);
    const [parentData, setParentData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        pais: paises[0], // País por defecto (México)
        telefono: '',
        contraseña: '',
        confirmarContraseña: '',
    });
    const [loading, setLoading] = useState(false); // Estado para el icono de carga

    const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParentData({ ...parentData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        // Validaciones antes de avanzar
        if (step === 0) {
            // No hay validaciones en la introducción
        } else if (step === 1 && !parentData.nombre.trim()) {
            toast.error("Por favor, ingresa tu nombre.", { position: 'top-center' });
            return;
        } else if (step === 2 && !parentData.apellido.trim()) {
            toast.error("Por favor, ingresa tu apellido.", { position: 'top-center' });
            return;
        } else if (step === 3 && !parentData.correo.trim()) {
            toast.error("Por favor, ingresa tu correo.", { position: 'top-center' });
            return;
        } else if (step === 4 && !parentData.telefono.trim()) {
            toast.error("Por favor, ingresa tu número de teléfono.", { position: 'top-center' });
            return;
        } else if (step === 5 && (!parentData.contraseña.trim() || !parentData.confirmarContraseña.trim())) {
            toast.error("Por favor, ingresa y confirma tu contraseña.", { position: 'top-center' });
            return;
        } else if (step === 5 && parentData.contraseña !== parentData.confirmarContraseña) {
            toast.error("Las contraseñas no coinciden.", { position: 'top-center' });
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const submitForm = async () => {
        setLoading(true); // Activar el icono de carga
    
        try {
            // Llamar a la función registerParent sin almacenar la respuesta
            await registerParent(
                parentData.nombre,
                parentData.apellido,
                parentData.correo,
                `${parentData.pais.lada.replace('+', '')}${parentData.telefono}`,
                parentData.contraseña
            );
    
            // Guardar datos en localStorage
            localStorage.setItem('userEmail', parentData.correo);
            localStorage.setItem('userPassword', parentData.contraseña);
            localStorage.setItem('userRole', 'parent');
    
            toast.success('¡Registro exitoso!', {
                position: 'top-center',
                duration: 3000,
            });
    
            // Aquí puedes redirigir al usuario a otra página o realizar otras acciones después del registro exitoso
        } catch (error) {
            // Manejo de errores
            let errorMessage = "Error al registrar el usuario";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage, {
                position: 'top-center',
                duration: 3000,
            });
        } finally {
            setLoading(false); // Desactivar el icono de carga
        }
    };
    const variants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen font-sans">
            {/* Fondo con gradiente y esferas */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-80 to-yellow-50 opacity-70"></div>
          
            {/* Esferas animadas en el fondo */}
            <div className="absolute inset-0 -z-20">
                {[50, 70, 40, 60, 80, 90, 30, 100, 55, 65, 80, 70, 50, 30, 110].map((size, index) => (
                    <Sphere
                        key={index}
                        size={size}
                        color={`rgba(255, 165, 0, ${0.4 + index * 0.05})`}
                    />
                ))}
            </div>

            {loading && <LoadingSpinner />}

            {/* React Hot Toast */}
            <Toaster />

            {/* Sección de Introducción */}
            {step === 0 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        ¡Bienvenido al Registro de LIRA!
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Este proceso es muy fácil. Primero, registrarás tu cuenta como administrador (el 'papá'). Después de eso, podrás registrar a los hijos en el sistema, asociándolos a tu cuenta. Completa estos pasos y serás parte de nuestra plataforma en minutos."
                    </p>
                    <p className="text-gray-600 text-center mb-6">
                        "Solo sigue los pasos que te mostramos, primero registrando tus datos, luego podrás registrar los datos de los hijos, y podrás administrarlos desde tu cuenta."
                    </p>
                    <button
                        onClick={nextStep}
                        className="w-full bg-yellow-100 text-black py-3 px-6 rounded-lg mt-6 hover:bg-orange-100 transition-colors flex items-center justify-center"
                    >
                        Comenzar <FaArrowRight className="ml-2" />
                    </button>
                </motion.div>
            )}

            {/* Sección 1: Registro del Padre */}
            {step === 1 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        <FaUser className="mr-2" /> ¡Hola! Empecemos con tu nombre
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Este es el primer paso para tu perfil de administrador. ¡Vamos a hacerlo increíble!"
                    </p>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3">
                        <FaUser className="text-orange-500 mr-2" />
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Tu nombre"
                            value={parentData.nombre}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            pattern="[A-Za-z\s]+"
                            title="Solo letras y espacios"
                            required
                        />
                    </div>
                    <button
                        onClick={nextStep}
                        className="w-full bg-yellow-100 text-black py-3 px-6 rounded-lg mt-6 hover:bg-orange-100 transition-colors flex items-center justify-center"
                    >
                        Siguiente <FaArrowRight className="ml-2" />
                    </button>
                </motion.div>
            )}

            {/* Sección 2: Apellido */}
            {step === 2 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        <FaUser className="mr-2" /> ¿Cuál es tu apellido?
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Solo necesitamos tu apellido para completar tu perfil."
                    </p>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3">
                        <FaUser className="text-orange-500 mr-2" />
                        <input
                            type="text"
                            name="apellido"
                            placeholder="Tu apellido"
                            value={parentData.apellido}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            pattern="[A-Za-z\s]+"
                            title="Solo letras y espacios"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={prevStep}
                            className="w-1/2 bg-gray-400 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <button
                            onClick={nextStep}
                            className="w-1/2 bg-yellow-100 text-black py-3 px-6 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Sección 3: Correo */}
            {step === 3 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        <FaEnvelope className="mr-2" /> ¡Casi listo! Tu correo, por favor
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Tu correo nos permitirá enviarte toda la información importante."
                    </p>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3">
                        <FaEnvelope className="text-orange-500 mr-2" />
                        <input
                            type="email"
                            name="correo"
                            placeholder="Tu correo"
                            value={parentData.correo}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={prevStep}
                            className="w-1/2 bg-gray-400 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <button
                            onClick={nextStep}
                            className="w-1/2 bg-yellow-100 text-black py-3 px-6 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Sección 4: Teléfono */}
            {step === 4 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        <FaPhone className="mr-2" /> ¿Tu número de teléfono?
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "¡Lo necesitamos para ponernos en contacto contigo!"
                    </p>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3 mb-4">
                        <select
                            name="pais"
                            value={parentData.pais.codigo}
                            onChange={(e) => {
                                const paisSeleccionado = paises.find(p => p.codigo === e.target.value);
                                setParentData({ ...parentData, pais: paisSeleccionado || paises[0] });
                            }}
                            className="bg-transparent focus:outline-none"
                        >
                            {paises.map((pais) => (
                                <option key={pais.codigo} value={pais.codigo}>
                                    {pais.bandera} {pais.lada}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="telefono"
                            placeholder="Tu número de teléfono"
                            value={parentData.telefono}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            pattern="[0-9]{10,}"
                            title="Mínimo 10 dígitos"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={prevStep}
                            className="w-1/2 bg-gray-400 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <button
                            onClick={nextStep}
                            className="w-1/2 bg-yellow-100 text-black py-3 px-6 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Sección 5: Contraseña y Confirmación de Contraseña */}
            {step === 5 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        <FaLock className="mr-2" /> ¡Hora de tu contraseña!
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Por seguridad, necesitamos que establezcas una contraseña y la confirmes."
                    </p>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3 mb-4">
                        <FaLock className="text-orange-500 mr-2" />
                        <input
                            type="password"
                            name="contraseña"
                            placeholder="Contraseña"
                            value={parentData.contraseña}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$"
                            title="Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
                            required
                        />
                    </div>
                    <div className="flex items-center border-2 border-orange-300 rounded-lg p-3">
                        <FaLock className="text-orange-500 mr-2" />
                        <input
                            type="password"
                            name="confirmarContraseña"
                            placeholder="Confirmar contraseña"
                            value={parentData.confirmarContraseña}
                            onChange={handleParentChange}
                            className="w-full focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={prevStep}
                            className="w-1/2 bg-gray-400 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <button
                            onClick={nextStep}
                            className="w-1/2 bg-yellow-100 text-black py-3 px-6 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                            Siguiente <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Sección 6: Confirmación de Datos y Bienvenida */}
            {step === 6 && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl mx-4"
                >
                    <h2 className="text-4xl font-bold text-orange-600 mb-6 flex items-center justify-center">
                        ¡Bienvenido a LIRA!
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        "Por favor, revisa tus datos antes de continuar:"
                    </p>
                    <div className="text-left mb-6">
                        <p><strong>Nombre:</strong> {parentData.nombre}</p>
                        <p><strong>Apellido:</strong> {parentData.apellido}</p>
                        <p><strong>Correo:</strong> {parentData.correo}</p>
                        <p><strong>Teléfono:</strong> {parentData.pais.lada.replace('+', '')}{parentData.telefono}</p>
                        <p><strong>Contraseña:</strong> ********</p>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={prevStep}
                            className="w-1/2 bg-gray-400 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                            <FaArrowLeft className="mr-2" /> Anterior
                        </button>
                        <button
                            onClick={submitForm}
                            className="w-1/2 bg-yellow-100 text-black py-3 px-6 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center"
                        >
                            Enviar <FaArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Admin;