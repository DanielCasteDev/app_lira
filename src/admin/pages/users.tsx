import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar"; // Importa el componente Sidebar
import { fetchUsers } from "../utils/Data"; // Importar la función fetchUsers
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa"; // Importar íconos de react-icons

interface User {
  _id: string;
  correo: string;
  role: string;
  contraseña: string;
  activo: boolean; // Nuevo campo para el estado de activo/inactivo
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); // Estado para almacenar la lista de usuarios
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(""); // Estado para manejar errores
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data); // Guardar la lista de usuarios en el estado
        setLoading(false); // Finalizar la carga
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message); // Acceder a la propiedad message solo si es un Error
        } else {
          setError("Ocurrió un error desconocido.");
        }
        setLoading(false); // Finalizar la carga
      }
    };

    getUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      console.log("Borrar usuario con ID:", userId);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error al borrar el usuario:", error);
    }
  };

  const handleEdit = (userId: string) => {
    console.log("Editar usuario con ID:", userId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Usuarios</h2>

        {loading && <p className="text-gray-600">Cargando usuarios...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-semibold text-gray-800">Correo</th>
                    <th className="text-left text-sm font-semibold text-gray-800 hidden md:table-cell">Rol</th>
                    <th className="text-left text-sm font-semibold text-gray-800">
                      Contraseña
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </th>
                    <th className="text-left text-sm font-semibold text-gray-800 hidden md:table-cell">Estado</th>
                    <th className="text-left text-sm font-semibold text-gray-800">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-200">
                      <td className="py-3 text-sm text-gray-700">{user.correo}</td>
                      <td className="py-3 text-sm text-gray-700 hidden md:table-cell">{user.role}</td>
                      <td className="py-3 text-sm text-gray-700">
                        {showPassword ? user.contraseña : "••••••••"}
                      </td>
                      <td className="py-3 text-sm text-gray-700 hidden md:table-cell">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-2 ${
                              user.activo ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {user.activo ? "Activo" : "Inactivo"}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;