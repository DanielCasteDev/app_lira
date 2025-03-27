export default function ComingSoonPage() {
  const handleGoHome = () => {
    window.history.back(); // Solo retrocede en el historial
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 sm:px-6 text-center overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 md:-left-20 w-32 h-32 md:w-40 md:h-40 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-0 md:-right-20 w-32 h-32 md:w-40 md:h-40 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Estado construcción */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-sm sm:text-lg md:text-xl font-bold text-blue-400 animate-pulse flex items-center">
          <span className="mr-2">🔧</span> EN CONSTRUCCIÓN
        </div>

        {/* Título principal */}
        <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-wide sm:tracking-wider text-blue-400 drop-shadow-lg animate-pulse">
          PRÓXIMAMENTE
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-4 sm:mt-6 text-gray-200">
          ¡Contenido en desarrollo!
        </p>
        
        {/* Descripción */}
        <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-md sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed">
          Esta sección está en desarrollo. Estamos preparando contenido especial para ti. Vuelve pronto.
        </p>
        
        {/* Botón simplificado */}
        <button
          onClick={handleGoHome}
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-3 text-sm sm:text-base md:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Volver atrás
        </button>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-auto py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
        &copy; {new Date().getFullYear()} LIRA - Todos los derechos reservados
      </div>
    </div>
  );
}