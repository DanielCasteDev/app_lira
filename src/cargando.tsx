import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Fondo semitransparente con opacidad directa
        >
            {/* Spinner moderno */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent"></div>
        </div>
    );
};

export default LoadingSpinner;