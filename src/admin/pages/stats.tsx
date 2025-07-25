import React, { useState } from "react";
import Sidebar from "../components/sidebar";

const Estadisticas: React.FC = () => {
  const [iframesLoaded, setIframesLoaded] = useState({
    kmeans: false,
    svm: false,
    dbscan: false,
  });

  const allLoaded = Object.values(iframesLoaded).every(Boolean);

  const handleIframeLoad = (name: keyof typeof iframesLoaded) => {
    setIframesLoaded((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      {!allLoaded && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-800 font-medium">Cargando análisis...</p>
          </div>
        </div>
      )}

      <Sidebar />

      <main className="md:ml-64 p-6 pt-20 md:pt-6">
        <div className="max-w-7xl mx-auto">
          <header className="text-center md:text-left mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Dashboard de Segmentación de Usuarios
            </h1>
            <p className="text-gray-600 text-lg">
              Análisis inteligente con 3 algoritmos de machine learning diferentes
            </p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* K-Means Clustering */}
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">K-Means Clustering</h2>
              <p className="text-gray-600 mb-4">Agrupa usuarios en 4 clusters...</p>
              <iframe
                src="https://piton-lirita.onrender.com/usuarios/segmentacion-kmeans"
                title="Segmentación K-Means"
                className="w-full h-[550px] border border-gray-300 rounded-lg"
                loading="lazy"
                onLoad={() => handleIframeLoad("kmeans")}
              />
            </section>

            {/* Support Vector Machine */}
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support Vector Machine (SVM)</h2>
              <p className="text-gray-600 mb-4">Clasifica usuarios en categorías...</p>
              <iframe
                src="https://piton-lirita.onrender.com/usuarios/segmentacion-svm"
                title="Clasificación SVM"
                className="w-full h-[550px] border border-gray-300 rounded-lg"
                loading="lazy"
                onLoad={() => handleIframeLoad("svm")}
              />
            </section>
          </div>

          {/* DBSCAN */}
          <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">DBSCAN Clustering</h2>
            <p className="text-gray-600 mb-4">Identifica grupos densos y outliers...</p>
            <iframe
              src="https://piton-lirita.onrender.com/usuarios/segmentacion-dbscan"
              title="Clustering DBSCAN"
              className="w-full h-[650px] border border-gray-300 rounded-lg"
              loading="lazy"
              onLoad={() => handleIframeLoad("dbscan")}
            />
          </section>

          {/* Info adicional y footer igual */}
          {/* ... */}
        </div>
      </main>
    </div>
  );
};

export default Estadisticas;
