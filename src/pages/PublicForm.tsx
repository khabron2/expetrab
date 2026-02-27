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

export function PublicForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    denunciante_nombre: '',
    denunciante_dni: '',
    denunciante_email: '',
    denunciante_telefono: '',
    denunciante_calle: '',
    denunciante_numeracion: '',
    denunciante_barrio: '',
    denunciante_entre_calle_1: '',
    denunciante_entre_calle_2: '',
    denunciante_lote: '',
    empresa_denunciada: '',
    empresa_denunciada_2: '',
    empresa_denunciada_3: '',
    empresa_denunciada_4: '',
    motivo_reclamo: '',
    peticiones: ''
  });
  const [numEmpresas, setNumEmpresas] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/expedientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                  {/* Sección Denunciante */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[#1E6FDB]">
                      <User className="w-5 h-5" />
                      <h3 className="font-bold uppercase text-xs tracking-wider">Datos del Denunciante</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nombre Completo</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Ej: Juan Pérez"
                          value={formData.denunciante_nombre}
                          onChange={e => setFormData({...formData, denunciante_nombre: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">DNI / CUIL</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Sin puntos ni espacios"
                          value={formData.denunciante_dni}
                          onChange={e => setFormData({...formData, denunciante_dni: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Teléfono de Contacto</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input 
                            required
                            type="tel" 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                            placeholder="Ej: 3834123456"
                            value={formData.denunciante_telefono}
                            onChange={e => setFormData({...formData, denunciante_telefono: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input 
                            required
                            type="email" 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                            placeholder="ejemplo@correo.com"
                            value={formData.denunciante_email}
                            onChange={e => setFormData({...formData, denunciante_email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Calle</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Ej: Av. Belgrano"
                          value={formData.denunciante_calle}
                          onChange={e => setFormData({...formData, denunciante_calle: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Numeración / Lote</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Ej: 123 o Lote 4"
                          value={formData.denunciante_numeracion}
                          onChange={e => setFormData({...formData, denunciante_numeracion: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Barrio</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Ej: Centro"
                          value={formData.denunciante_barrio}
                          onChange={e => setFormData({...formData, denunciante_barrio: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Entre Calle 1</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Calle de referencia 1"
                          value={formData.denunciante_entre_calle_1}
                          onChange={e => setFormData({...formData, denunciante_entre_calle_1: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Entre Calle 2</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Calle de referencia 2"
                          value={formData.denunciante_entre_calle_2}
                          onChange={e => setFormData({...formData, denunciante_entre_calle_2: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Sección Reclamo */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Building2 className="w-5 h-5" />
                        <h3 className="font-bold uppercase text-xs tracking-wider">Datos de la Empresa</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">¿Cuántas empresas?</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          {[1, 2, 3, 4].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNumEmpresas(n)}
                              className={cn(
                                "w-6 h-6 rounded-md text-xs font-bold transition-all",
                                numEmpresas === n ? "bg-white text-[#1E6FDB] shadow-sm" : "text-gray-400 hover:text-gray-600"
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Empresa Denunciada 1</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Nombre de la empresa o comercio"
                          value={formData.empresa_denunciada}
                          onChange={e => setFormData({...formData, empresa_denunciada: e.target.value})}
                        />
                      </div>

                      {numEmpresas >= 2 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Empresa Denunciada 2</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                            placeholder="Nombre de la segunda empresa"
                            value={formData.empresa_denunciada_2}
                            onChange={e => setFormData({...formData, empresa_denunciada_2: e.target.value})}
                          />
                        </motion.div>
                      )}

                      {numEmpresas >= 3 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Empresa Denunciada 3</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                            placeholder="Nombre de la tercera empresa"
                            value={formData.empresa_denunciada_3}
                            onChange={e => setFormData({...formData, empresa_denunciada_3: e.target.value})}
                          />
                        </motion.div>
                      )}

                      {numEmpresas >= 4 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Empresa Denunciada 4</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                            placeholder="Nombre de la cuarta empresa"
                            value={formData.empresa_denunciada_4}
                            onChange={e => setFormData({...formData, empresa_denunciada_4: e.target.value})}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-blue-600">
                        <FileText className="w-5 h-5" />
                        <h3 className="font-bold uppercase text-xs tracking-wider">Motivo del Reclamo</h3>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Resumen del Reclamo</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm md:text-base"
                          placeholder="Ej: Cobro indebido, Servicio deficiente..."
                          value={formData.motivo_reclamo}
                          onChange={e => setFormData({...formData, motivo_reclamo: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-bold uppercase text-xs tracking-wider">Peticiones</h3>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">¿Qué solicita a la empresa?</label>
                        <textarea 
                          required
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all resize-none text-sm md:text-base"
                          placeholder="Ej: Devolución de dinero, Reparación del producto, etc."
                          value={formData.peticiones}
                          onChange={e => setFormData({...formData, peticiones: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1E6FDB] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-base md:text-lg"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Reclamo
                      </>
                    )}
                  </button>
                </form>
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
