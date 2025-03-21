import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar"; // Importa el componente Sidebar
import { generateBackup, getCollections } from "../utils/Data"; // Importa las funciones
import { toast, Toaster } from "react-hot-toast"; // Importa Toaster
import LoadingSpinner from "../../cargando"; // Importa el componente LoadingSpinner
import { FiCheck } from "react-icons/fi"; // Importa el ícono de checkmark

const ConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]); // Estado para manejar las colecciones seleccionadas
  const [collections, setCollections] = useState<string[]>([]); // Estado para almacenar las colecciones de la base de datos
  const [selectAll, setSelectAll] = useState(false); // Estado para manejar la selección de todas las colecciones

  // Obtener las colecciones al cargar el componente
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collections = await getCollections();
        setCollections(collections);
      } catch (error) {
        console.error("Error al obtener las colecciones:", error);
        toast.error("Hubo un error al obtener las colecciones.");
      }
    };

    fetchCollections();
  }, []);

  // Función para manejar la selección de todas las colecciones
  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedCollections(collections); // Seleccionar todas las colecciones
    } else {
      setSelectedCollections([]); // Deseleccionar todas las colecciones
    }
    setSelectAll(!selectAll); // Cambiar el estado de "Seleccionar todas"
  };

  // Función para manejar la selección individual de colecciones
  const handleCollectionSelection = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName)
        ? prev.filter((name) => name !== collectionName)
        : [...prev, collectionName]
    );

    // Si se deselecciona una colección individualmente, desmarcar "Seleccionar todas"
    if (selectAll && !selectedCollections.includes(collectionName)) {
      setSelectAll(false);
    }
  };

  // Función para manejar la solicitud de respaldo
  const handleBackup = async () => {
    setIsLoading(true); // Activar el loading
    try {
      const result = await generateBackup(selectedCollections);
      toast.success(result.message); // Mostrar mensaje de éxito con react-hot-toast
    } catch (error) {
      console.error("Error al generar el respaldo:", error);
      toast.error("Hubo un error al generar el respaldo. Por favor, intenta de nuevo."); // Mostrar mensaje de error
    } finally {
      setIsLoading(false); // Desactivar el loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Usa el componente Sidebar */}
      <Sidebar />

      {/* Contenido principal de la página de Configuración */}
      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

        {/* Sección de Respaldo de Base de Datos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Respaldo de Base de Datos
          </h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Selecciona las colecciones:
            </label>
            <div className="flex flex-col space-y-2">
              {/* Checkbox para "Todas las colecciones" */}
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="sr-only" // Oculta el checkbox nativo
                    />
                    <div
                      className={`w-5 h-5 flex items-center justify-center border-2 rounded transition-colors duration-200 ${
                        selectAll
                          ? "bg-orange-500 border-orange-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {selectAll && (
                        <FiCheck className="w-4 h-4 text-white" /> // Ícono de checkmark
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">Todas las colecciones</span>
                </label>
              </div>

              {/* Checkboxes para cada colección */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <div key={collection} className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={collection}
                          checked={selectedCollections.includes(collection)}
                          onChange={() => handleCollectionSelection(collection)}
                          className="sr-only" // Oculta el checkbox nativo
                        />
                        <div
                          className={`w-5 h-5 flex items-center justify-center border-2 rounded transition-colors duration-200 ${
                            selectedCollections.includes(collection)
                              ? "bg-orange-500 border-orange-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {selectedCollections.includes(collection) && (
                            <FiCheck className="w-4 h-4 text-white" /> // Ícono de checkmark
                          )}
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-gray-700">{collection}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleBackup}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            disabled={isLoading || selectedCollections.length === 0} // Deshabilitar si no hay selecciones o está cargando
          >
            {isLoading ? "Generando respaldo..." : "Generar Respaldo"}
          </button>
        </div>

        {/* Sección de Ajustes de Notificaciones */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Ajustes de Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    className="sr-only" // Oculta el checkbox nativo
                  />
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors duration-200">
                    <FiCheck className="w-4 h-4 text-white opacity-0" /> 
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-700">
                  Recibir notificaciones por correo electrónico
                </span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="push-notifications"
                    className="sr-only" // Oculta el checkbox nativo
                  />
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors duration-200">
                    <FiCheck className="w-4 h-4 text-white opacity-0" /> 
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-700">
                  Recibir notificaciones push
                </span>
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* Componente Toaster para mostrar las alertas */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000, // Duración de las notificaciones de éxito
          },
          error: {
            duration: 5000, // Duración de las notificaciones de error
          },
        }}
      />

      {/* Mostrar el LoadingSpinner si isLoading es true */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default ConfigPage;