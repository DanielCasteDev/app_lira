export default function NotFoundPage() {
  const handleGoHome = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-6 text-center">
      <h1 className="text-9xl font-extrabold tracking-widest text-red-600 drop-shadow-lg">404</h1>
      <p className="text-3xl font-bold mt-4 text-gray-200">¡Oops! Página no encontrada</p>
      <p className="mt-2 text-gray-400 max-w-lg">
        Parece que la página que buscas no existe. Puede que haya sido eliminada o que nunca haya existido.
      </p>
      <button
        onClick={handleGoHome}
        className="mt-6 px-8 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
      >
        Volver al inicio
      </button>
      <div className="absolute bottom-10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} LIRA - Todos los derechos reservados
      </div>
      <div className="absolute top-10 left-10 text-2xl font-bold text-gray-500 animate-pulse">⚠️ ERROR</div>
    </div>
  );
}