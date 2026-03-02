import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  FileText, 
  Send, 
  CheckCircle,
  Phone,
  Mail,
  Upload,
  Paperclip
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FormularioExpedienteProps {
  onSuccess?: () => void;
  isAdmin?: boolean;
}

export function FormularioExpediente({ onSuccess, isAdmin = false }: FormularioExpedienteProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    peticiones: '',
    prueba_documental_1: '',
    prueba_documental_2: ''
  });
  const [numEmpresas, setNumEmpresas] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'prueba_documental_1' | 'prueba_documental_2') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Expediente Creado!</h2>
          <p className="text-gray-500 mt-2">El expediente ha sido registrado correctamente en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-8", isAdmin ? "p-0" : "p-6 md:p-8")}>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
              placeholder="Ej: Centro"
              value={formData.denunciante_barrio}
              onChange={e => setFormData({...formData, denunciante_barrio: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Entre Calle 1</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
              placeholder="Calle de referencia 1"
              value={formData.denunciante_entre_calle_1}
              onChange={e => setFormData({...formData, denunciante_entre_calle_1: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Entre Calle 2</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
              placeholder="Nombre de la empresa o comercio"
              value={formData.empresa_denunciada}
              onChange={e => setFormData({...formData, empresa_denunciada: e.target.value})}
            />
          </div>

          {numEmpresas >= 2 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Empresa Denunciada 2</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
                placeholder="Nombre de la segunda empresa"
                value={formData.empresa_denunciada_2}
                onChange={e => setFormData({...formData, empresa_denunciada_2: e.target.value})}
              />
            </div>
          )}

          {numEmpresas >= 3 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Empresa Denunciada 3</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
                placeholder="Nombre de la tercera empresa"
                value={formData.empresa_denunciada_3}
                onChange={e => setFormData({...formData, empresa_denunciada_3: e.target.value})}
              />
            </div>
          )}

          {numEmpresas >= 4 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Empresa Denunciada 4</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
                placeholder="Nombre de la cuarta empresa"
                value={formData.empresa_denunciada_4}
                onChange={e => setFormData({...formData, empresa_denunciada_4: e.target.value})}
              />
            </div>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all text-sm"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1E6FDB]/20 outline-none transition-all resize-none text-sm"
              placeholder="Ej: Devolución de dinero, Reparación del producto, etc."
              value={formData.peticiones}
              onChange={e => setFormData({...formData, peticiones: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-purple-600">
            <Paperclip className="w-5 h-5" />
            <h3 className="font-bold uppercase text-xs tracking-wider">Prueba Documental</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Documento / Imagen 1</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'prueba_documental_1')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "w-full px-4 py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                  formData.prueba_documental_1 ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50 group-hover:border-[#1E6FDB]/30"
                )}>
                  {formData.prueba_documental_1 ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600">Archivo Cargado</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#1E6FDB]" />
                      <span className="text-xs font-bold text-gray-500">Subir Imagen o PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Documento / Imagen 2</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'prueba_documental_2')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "w-full px-4 py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                  formData.prueba_documental_2 ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50 group-hover:border-[#1E6FDB]/30"
                )}>
                  {formData.prueba_documental_2 ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600">Archivo Cargado</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#1E6FDB]" />
                      <span className="text-xs font-bold text-gray-500">Subir Imagen o PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-[#1E6FDB] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Crear Expediente
          </>
        )}
      </button>
    </form>
  );
}
