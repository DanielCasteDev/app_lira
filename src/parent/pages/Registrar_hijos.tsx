import React, { useState } from 'react';
import Sidebar from '../components/sidebar_dad';
import Navbar from '../components/navbar_superior';
import { Save } from 'lucide-react';
import { registerChild } from '../utils/data'; // Importa la función desde data.ts
import { Toaster, toast } from 'react-hot-toast'; // Importa Toaster y toast
import LoadingSpinner from '../../cargando'; // Importa el componente de carga
import imageCompression from 'browser-image-compression'; // Importa la librería de compresión
import { motion } from 'framer-motion'; // Para animaciones

const RegistrarHijos: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [nombre, setNombre] = useState<string>('');
    const [apellido, setApellido] = useState<string>('');
    const [fechaNacimiento, setFechaNacimiento] = useState<string>('');
    const [genero, setGenero] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState(false); // Estado para el icono de carga

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    
        // Validar que el archivo sea una imagen
        if (file && file.type.startsWith('image/')) {
            try {
                // Opciones de compresión
                const options = {
                    maxSizeMB: 1, // Tamaño máximo en MB (1 MB)
                    maxWidthOrHeight: 3800, // Mantenemos una resolución alta (3500px)
                    useWebWorker: true, // Usar WebWorker para mejorar el rendimiento
                    initialQuality: 0.3, // Calidad inicial (50%) para equilibrar tamaño y resolución
                };
    
                // Comprimir la imagen
                const compressedFile = await imageCompression(file, options);
    
                // Verificar el tamaño del archivo comprimido
                if (compressedFile.size > 1 * 1024 * 1024) { // 1 MB en bytes
                    toast.error('La imagen comprimida sigue siendo demasiado grande. Por favor, selecciona una imagen más pequeña.');
                    return;
                }
    
                // Convertir la imagen comprimida a base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedImage(reader.result as string);
                };
                reader.onerror = () => {
                    throw new Error('Error al leer el archivo comprimido.');
                };
                reader.readAsDataURL(compressedFile);
    
                // Feedback al usuario
                toast.success('Imagen comprimida y lista para subir.');
            } catch (error) {
                console.error('Error al comprimir la imagen:', error);
                toast.error('Error al comprimir la imagen. Por favor, intenta con otra imagen.');
            }
        } else {
            toast.error('Por favor, selecciona un archivo de imagen válido.');
        }
    };
    

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const parentId = localStorage.getItem('id')!; // Usar el operador ! para asegurar que no es null

        setLoading(true); // Activar el estado de carga

        try {
            await registerChild(
                nombre,
                apellido,
                fechaNacimiento,
                genero,
                username,
                password,
                selectedImage,
                parentId
            );

            // Mostrar notificación de éxito
            toast.success('Perfil infantil creado exitosamente');

            // Limpiar el formulario después de guardar
            setNombre('');
            setApellido('');
            setFechaNacimiento('');
            setGenero('');
            setUsername('');
            setPassword('');
            setSelectedImage(null);
        } catch (error) {
            console.error('Error al crear el perfil infantil:', error);
            // Mostrar notificación de error
            toast.error('Error al crear el perfil infantil');
        } finally {
            setLoading(false); // Desactivar el estado de carga
        }
    };

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Renderiza Toaster aquí para que los toasts funcionen */}
            <Toaster position="top-right" reverseOrder={false} />

            {/* Mostrar el spinner de carga si loading es true */}
            {loading && <LoadingSpinner />}

            {/* Sidebar */}
            <Sidebar />

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col ml-0 md:ml-64">
                {/* Navbar */}
                <Navbar />

                {/* Encabezado y Formulario */}
                <div className="p-6 mt-10">
                    {/* Formulario de Crear Perfil Infantil */}
                    <motion.div
                        className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h2
                            className="text-3xl font-bold text-gray-800 mb-8 text-center"
                            variants={itemVariants}
                        >
                            Crear perfil infantil
                        </motion.h2>

                        {/* Diseño horizontal con dos columnas y líneas divisorias */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8">
                            {/* Columna 1: Avatar y datos básicos */}
                            <motion.div className="space-y-6" variants={containerVariants}>
                                {/* Selección de Avatar */}
                                <motion.div
                                    className="flex flex-col items-center"
                                    variants={itemVariants}
                                >
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Selecciona el avatar
                                    </label>
                                    <motion.div
                                        className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 overflow-hidden relative shadow-md hover:scale-105 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {selectedImage ? (
                                            <img
                                                src={selectedImage}
                                                alt="Avatar seleccionado"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl text-gray-400">+</span>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            id="avatar-input"
                                        />
                                        <label htmlFor="avatar-input" className="absolute w-40 h-40 rounded-full cursor-pointer"></label>
                                    </motion.div>
                                </motion.div>

                                {/* Datos básicos */}
                                <motion.div className="space-y-4" variants={containerVariants}>
                                    {[
                                        { label: 'Nombres', value: nombre, setter: setNombre, placeholder: 'Ingresa los nombres' },
                                        { label: 'Apellidos', value: apellido, setter: setApellido, placeholder: 'Ingresa los apellidos' },
                                        { label: 'Fecha de Nacimiento', value: fechaNacimiento, setter: setFechaNacimiento, type: 'date' },
                                        {
                                            label: 'Género',
                                            value: genero,
                                            setter: setGenero,
                                            type: 'select',
                                            options: ['', 'Masculino', 'Femenino', ],
                                        },
                                    ].map((field, index) => (
                                        <motion.div key={index} variants={itemVariants}>
                                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                                                    value={field.value}
                                                    onChange={(e) => field.setter(e.target.value)}
                                                >
                                                    {field.options?.map((option, i) => (
                                                        <option key={i} value={option}>
                                                            {option || 'Selecciona el género'}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type || 'text'}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                                                    placeholder={field.placeholder}
                                                    value={field.value}
                                                    onChange={(e) => field.setter(e.target.value)}
                                                />
                                            )}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* Línea divisoria vertical (solo en pantallas grandes) */}
                            <motion.div
                                className="hidden md:block border-l-2 border-gray-300 h-auto mx-4"
                                variants={itemVariants}
                            />

                            {/* Línea divisoria horizontal (solo en pantallas pequeñas) */}
                            <motion.hr
                                className="md:hidden border-t-2 border-gray-300 my-6"
                                variants={itemVariants}
                            />

                            {/* Columna 2: Usuario, contraseña y texto explicativo */}
                            <motion.div className="space-y-6" variants={containerVariants}>
                                {/* Nombre de Usuario y Contraseña */}
                                <motion.div className="space-y-4" variants={containerVariants}>
                                    {[
                                        { label: 'Correo de Usuario', value: username, setter: setUsername, placeholder: 'Crea un correo de usuario' },
                                        { label: 'Contraseña', value: password, setter: setPassword, placeholder: 'Crea una contraseña', type: 'password' },
                                    ].map((field, index) => (
                                        <motion.div key={index} variants={itemVariants}>
                                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type || 'text'}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                                                placeholder={field.placeholder}
                                                value={field.value}
                                                onChange={(e) => field.setter(e.target.value)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Texto Explicativo */}
                                <motion.div
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                    variants={itemVariants}
                                >
                                    <p className="text-sm text-gray-700">
                                        El nombre de usuario y la contraseña que ingreses aquí serán utilizados por tu hijo para acceder a su perfil. Asegúrate de elegir un nombre de usuario único y una contraseña segura que pueda recordar fácilmente.
                                    </p>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Botón de Guardar */}
                        <motion.div
                            className="mt-8 flex justify-center"
                            variants={itemVariants}
                        >
                            <motion.button
                                className="bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                                onClick={handleSubmit}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Save className="mr-2" /> Guardar
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RegistrarHijos;