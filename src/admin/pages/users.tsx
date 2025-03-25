import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar"; // Importa el componente Sidebar
import { fetchUsers, fetchUserStatus } from "../utils/Data"; // Importar las funciones fetchUsers y fetchUserStatus
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa"; // Importar íconos de react-icons

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
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all"); // Estado para filtrar por estado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [usersPerPage] = useState(5); // Número de usuarios por página

  // Obtener la lista de usuarios al cargar el componente
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

  interface UserStatus {
    correo: string;
    activo: boolean;
  }

  // Actualizar el estado de los usuarios cada 5 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const userStatus: UserStatus[] = await fetchUserStatus();

        // Actualizar el estado de los usuarios en la lista
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            const updatedUser = userStatus.find((u: UserStatus) => u.correo === user.correo);
            return updatedUser ? { ...user, activo: updatedUser.activo } : user;
          })
        );
      } catch (error) {
        console.error("Error al actualizar el estado de los usuarios:", error);
      }
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  // Filtrar usuarios en función del término de búsqueda y el estado
  const filteredUsers = users.filter((user) => {
    const matchesSearchTerm = user.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.activo) ||
      (statusFilter === "inactive" && !user.activo);
    return matchesSearchTerm && matchesStatus;
  });

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

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

        {/* Filtros de búsqueda */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buscador por correo */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading && <p className="text-gray-600">Cargando usuarios...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tabla de usuarios */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contraseña
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.correo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {showPassword ? user.contraseña : "••••••••"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.activo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
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
                      <td className="px-6 py-4 text-sm text-gray-700">
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

            {/* Paginador */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 transition-all"
                  }`}
                >
                  <FaChevronLeft className="mr-2" />
                  Anterior
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === Math.ceil(filteredUsers.length / usersPerPage)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 transition-all"
                  }`}
                >
                  Siguiente
                  <FaChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;