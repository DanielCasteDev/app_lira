import React from "react";


const actividades = [
  {
    id: 1,
    titulo: "Completar palabras",
    descripcion: "Selecciona la palabra correcta según la imagen.",
    progreso: 80,
    fechaInicio: "2025-03-10",
    imagen: "https://imgs.search.brave.com/pFaY2OKmmr1VdJiFksZaHI3StX2aNulHKZ2ouOln5IA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/anVlZ29zYXJjb2ly/aXMuY29tL0ltYWdl/cy9pY29ub3NHcmFu/ZGVzL2ZsZXRyYXNH/cmFuZGUucG5n",
  },
  {
    id: 2,
    titulo: "Ordenar letras",
    descripcion: "Ordena las letras para formar una palabra.",
    progreso: 60,
    fechaInicio: "2025-03-12",
    imagen: "https://imgs.search.brave.com/U-2_ZeMrcEv3Oy_zkghOrimOUooPZQTtXUw24Su8p74/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcHVu/dGVzZGVpbmdsZXMu/Y29tL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDE5LzA5L09yZGVu/YS1sYXMtbGV0cmFz/LXBhcmEtZm9ybWFy/LW5vbWJyZXMtZGUt/YW5pbWFsZXMtY29u/LXRyZXMtbGV0cmFz/LWVuLWluZ2xlcy5w/bmc",
  },
  {
    id: 3,
    titulo: "Emparejar palabras",
    descripcion: "Une palabras con imágenes correspondientes.",
    progreso: 90,
    fechaInicio: "2025-03-14",
    imagen: "https://imgs.search.brave.com/VkdS46_X10EzMANWPkj6OlwlwPGr0_lsjTwl2BFHtBQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y29raXRvcy5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDYvbGV0cmFzLXRl/Y2xhZG8uanBn",
  },
];

const Progreso: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-white text-gray-900">
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <div className="p-6 mt-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Progreso</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {actividades.map((actividad) => (
              <div key={actividad.id} className="bg-gray-100 p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <img src={actividad.imagen} alt={actividad.titulo} className="w-full h-32 object-cover rounded-md mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900">{actividad.titulo}</h2>
                <p className="text-gray-600 mt-2 text-center">{actividad.descripcion}</p>
                <p className="text-sm text-gray-500 mt-2">Fecha de inicio: {actividad.fechaInicio}</p>

                <div className="w-full bg-gray-200 h-4 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${actividad.progreso}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  Avance: {actividad.progreso}% - Restante: {100 - actividad.progreso}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progreso;