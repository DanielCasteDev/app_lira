import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar_dad";
import Navbar from "../components/navbar_superior";
import { fetchChildren } from "../utils/data"; // Asegúrate de que la ruta sea correcta
import { motion } from "framer-motion"; // Para animaciones
import { FaUser, FaBirthdayCake, FaVenusMars, FaIdBadge } from "react-icons/fa"; // Iconos

interface Child {
    _id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    genero: string;
    username: string;
    avatar?: string;
}

const Progreso: React.FC = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getChildren = async () => {
            try {
                const data = await fetchChildren();
                setChildren(data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        getChildren();
    }, []);

    // Animación para las tarjetas
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen flex bg-white text-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-0 md:ml-64">
                <Navbar />
                <div className="p-6 mt-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Perfiles de Hijos</h1>

                    {error && <p className="text-red-500">{error}</p>}

                    {!error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                            {children.map((child, index) => (
                                <motion.div
                                    key={child._id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.2, duration: 0.5 }}
                                    className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                                >
                                    {child.avatar ? (
                                        <img
                                            src={child.avatar}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-blue-500 flex items-center justify-center text-white text-4xl shadow-md">
                                            <FaUser />
                                        </div>
                                    )}
                                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                                        {child.nombre} {child.apellido}
                                    </h2>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FaIdBadge className="mr-2" />
                                        <p>{child.username}</p>
                                    </div>
                                    <div className="flex items-center text-gray-500 mb-2">
                                        <FaVenusMars className="mr-2" />
                                        <p>Género: {child.genero}</p>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <FaBirthdayCake className="mr-2" />
                                        <p>Fecha de Nacimiento: {new Date(child.fechaNacimiento).toLocaleDateString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progreso;