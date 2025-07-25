import React from "react";
import Sidebar from "../components/sidebar";

const Estadisticas: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
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
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gray-700 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  K-Means Clustering
                </h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Agrupa usuarios en <strong>4 clusters</strong> basado en edad y puntos acumulados. 
                Algoritmo clásico que identifica centroides optimizados automáticamente.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Ventaja:</span> Clusters bien balanceados y centroides claramente definidos
                </p>
              </div>
              <iframe
                src="https://piton-lirita.onrender.com/usuarios/segmentacion-kmeans"
                title="Segmentación K-Means"
                className="w-full h-[550px] border border-gray-300 rounded-lg"
                loading="lazy"
              />
            </section>

            {/* Support Vector Machine */}
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gray-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Support Vector Machine (SVM)
                </h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Clasifica usuarios en <strong>categorías de rendimiento</strong> (Bajo, Medio-Bajo, Medio-Alto, Alto) 
                basado en sus puntos acumulados con alta precisión.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Ventaja:</span> Clasificación supervisada con métricas de precisión
                </p>
              </div>
              <iframe
                src="https://piton-lirita.onrender.com/usuarios/segmentacion-svm"
                title="Clasificación SVM"
                className="w-full h-[550px] border border-gray-300 rounded-lg"
                loading="lazy"
              />
            </section>
          </div>

          {/* DBSCAN - Ancho completo */}
          <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-gray-800 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                DBSCAN Clustering
              </h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Identifica <strong>grupos densos automáticamente</strong> y detecta usuarios atípicos (outliers). 
              No requiere especificar el número de clusters previamente.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">Ventaja:</span> Detecta outliers y forma clusters de manera adaptativa
              </p>
            </div>
            <iframe
              src="https://piton-lirita.onrender.com/usuarios/segmentacion-dbscan"
              title="Clustering DBSCAN"
              className="w-full h-[650px] border border-gray-300 rounded-lg"
              loading="lazy"
            />
          </section>

          {/* Información adicional */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              📊 Información sobre los Algoritmos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">K-Means</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Clusters: 4 grupos fijos</li>
                  <li>• Método: Centroides optimizados</li>
                  <li>• Ideal para: Grupos balanceados</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">SVM</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Categorías: 4 niveles de rendimiento</li>
                  <li>• Método: Clasificación supervisada</li>
                  <li>• Ideal para: Predicción de categorías</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">DBSCAN</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Clusters: Automático + outliers</li>
                  <li>• Método: Densidad de puntos</li>
                  <li>• Ideal para: Detectar anomalías</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer con estadísticas */}
          <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Dashboard generado con FastAPI + React | 
              Datos de usuarios entre 6-12 años | 
              Actualización en tiempo real
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Estadisticas;