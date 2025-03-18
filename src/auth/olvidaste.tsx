import { motion } from "framer-motion";
import { EnvelopeIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid"; // Importa los iconos que necesitas

export default function RestablecerContrasena() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      {/* Botón de Regresar */}
      <div className="absolute top-4 left-4">
        <a
          href="/" // Cambia la ruta según tu configuración de enrutamiento
          className="text-orange-600 hover:text-orange-800 font-semibold text-sm"
        >
          &larr; Regresar
        </a>
      </div>

      {/* Métodos de Restablecimiento */}
      <section className="w-full max-w-lg">
        <motion.h2
          className="text-2xl font-bold mb-6 text-center text-orange-600"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Elige tu Método
        </motion.h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Restablecer por Correo */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-center items-center mb-4">
              <EnvelopeIcon className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-orange-600">Restablecer por Correo</h3>
            <p className="text-gray-600 text-sm mb-4">
              Te enviaremos un codigo a tu correo electrónico para que puedas restablecer tu contraseña de manera segura.
            </p>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">
              Usar Correo
            </button>
          </motion.div>

          {/* Restablecer por WhatsApp */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-center items-center mb-4">
              <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-orange-600">Restablecer por WhatsApp</h3>
            <p className="text-gray-600 text-sm mb-4">
              Te enviaremos un enlace de verificación a tu número de WhatsApp para restablecer tu contraseña.
            </p>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">
              Usar WhatsApp
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}