import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  FileText, 
  Send, 
  CheckCircle,
  Phone,
  Mail,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { FormularioExpediente } from '../components/FormularioExpediente';

export function PublicForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 md:py-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#1E6FDB] p-2 rounded-xl">
              <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Defensa del Consumidor</h1>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">Ventanilla Única de Reclamos</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-[#1E6FDB]">C.A.P.E. Av. Belgrano</p>
            <p className="text-xs text-gray-400">Atención al Ciudadano</p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 md:py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 overflow-hidden"
              >
                <div className="bg-[#1E6FDB] p-6 md:p-8 text-white">
                  <h2 className="text-xl md:text-2xl font-bold">Formulario de Reclamo</h2>
                  <p className="text-white/80 mt-2 text-sm md:text-base">Complete los datos para iniciar su expediente administrativo.</p>
                </div>

                <FormularioExpediente onSuccess={() => setSubmitted(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6 border border-gray-100"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">¡Reclamo Enviado!</h2>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm md:text-base">
                    Su reclamo ha sido registrado correctamente. Un agente se pondrá en contacto con usted a la brevedad.
                  </p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-[#1E6FDB] font-bold hover:underline"
                  >
                    Enviar otro reclamo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Botón Flotante para Admin */}
      <Link 
        to="/login"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-white text-[#1E6FDB] p-3 md:p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2 md:gap-3 hover:scale-105 transition-all group z-50"
      >
        <div className="bg-[#1E6FDB]/10 p-2 rounded-xl group-hover:bg-[#1E6FDB] group-hover:text-white transition-all">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <span className="font-bold text-xs md:text-sm pr-1 md:pr-2">Acceso CRM</span>
      </Link>

      {/* Footer */}
      <footer className="py-6 md:py-8 text-center text-gray-400 text-[10px] md:text-xs px-4">
        <p>© 2024 Defensa del Consumidor - Provincia de Catamarca</p>
        <p className="mt-1">Ventanilla Única de Reclamos Institucional</p>
      </footer>
    </div>
  );
}
