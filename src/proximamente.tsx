export default function ComingSoonPage() {
  const handleGoHome = () => {
    // Limpiar localStorage sin mostrar alerta
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-4 sm:px-6 text-center">
      {/* Título principal */}
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-wider sm:tracking-widest text-blue-500 drop-shadow-lg animate-pulse">
        PRÓXIMAMENTE
      </h1>
      
      {/* Subtítulo */}
      <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-4 sm:mt-6 text-gray-200">
        ¡Contenido en desarrollo!
      </p>
      
      {/* Descripción */}
      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400 max-w-md sm:max-w-lg md:max-w-xl">
        Esta sección está en desarrollo. Estamos preparando contenido especial para ti. Vuelve pronto.
      </p>
      
      {/* Botón simplificado */}
      <button
        onClick={handleGoHome}
        className="mt-5 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Volver al inicio
      </button>
      
      {/* Footer */}
      <div className="absolute bottom-6 sm:bottom-10 text-xs sm:text-sm text-gray-500">
        &copy; {new Date().getFullYear()} LIRA - Todos los derechos reservados
      </div>
      
      {/* Estado */}
      <div className="absolute top-6 sm:top-10 left-6 sm:left-10 text-lg sm:text-xl md:text-2xl font-bold text-blue-400 animate-pulse">
        🔧 EN CONSTRUCCIÓN
      </div>
      
      {/* Efectos visuales */}
      <div className="hidden md:block absolute top-1/4 -left-20 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
      <div className="hidden md:block absolute bottom-1/4 -right-20 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
    </div>
  );
}