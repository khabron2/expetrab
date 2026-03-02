import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  FileText,
  History,
  CheckCircle2,
  AlertCircle,
  Save,
  Paperclip
} from 'lucide-react';
import { Expediente, Movimiento, Audiencia } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

export function ExpedienteDetail() {
  const { id } = useParams();
  const [data, setData] = useState<(Expediente & { movimientos: Movimiento[], audiencias: Audiencia[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEstado, setNewEstado] = useState('');
  const [newTramite, setNewTramite] = useState('');
  const [isManualTramite, setIsManualTramite] = useState(false);
  const [showAudienciaModal, setShowAudienciaModal] = useState(false);
  const [audienciaData, setAudienciaData] = useState({ fecha: '', hora: '08:00', tipo: 'Conciliación' });

  useEffect(() => {
    apiFetch(`/api/expedientes/${id}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setNewEstado(data.estado);
        setNewTramite(data.tramite || '');
        setLoading(false);
      });
  }, [id]);

  const TRAMITES_PREDEFINIDOS = [
    'Sale cédula al consumidor',
    'Sale cédula Al denunciado',
    'Para Imputar',
    'Pasa a Archivo',
    'Plazo de 5 días',
    'Plazo de 10 días',
    'Con acuerdo',
    'Las partes informan acuerdo',
    'SALE CED. AL CONS.',
    'A CAJA',
    'NUEVA AUDIENCIA',
    'ARCHIVADO PASE A DESPACHO',
    'PARA HACER'
  ];

  const handleUpdate = async () => {
    setSaving(true);
    await apiFetch(`/api/expedientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        estado: newEstado,
        tramite: newEstado === 'En proceso' ? newTramite : null
      })
    });
    // Refresh
    const res = await apiFetch(`/api/expedientes/${id}`);
    const updated = await res.json();
    setData(updated);
    setSaving(false);
  };

  const handleScheduleAudiencia = async (e: React.FormEvent) => {
    e.preventDefault();
    const fecha_hora = `${audienciaData.fecha}T${audienciaData.hora}:00`;
    await apiFetch('/api/audiencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expediente_id: data.id,
        fecha_hora,
        tipo: audienciaData.tipo
      })
    });
    setShowAudienciaModal(false);
    // Refresh
    const res = await apiFetch(`/api/expedientes/${id}`);
    const updated = await res.json();
    setData(updated);
  };

  if (loading || !data) return <div className="p-8 animate-pulse">Cargando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/expedientes" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.numero_expediente}</h2>
            <p className="text-gray-500">
              Estado: <span className="font-bold text-[#1E6FDB]">
                {data.estado === 'En proceso' && data.tramite ? data.tramite : data.estado}
              </span>
              {data.fecha_cambio_estado && (
                <span className="ml-2 text-xs">
                  (Desde el {format(new Date(data.fecha_cambio_estado), "d 'de' MMMM", { locale: es })})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {!isManualTramite ? (
              <select 
                className="bg-white border border-gray-200 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all min-w-[200px]"
                value={newEstado === 'En proceso' && newTramite ? `EN_PROCESO:${newTramite}` : newEstado}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'OTRO') {
                    setNewEstado('En proceso');
                    setIsManualTramite(true);
                    setNewTramite('');
                  } else if (val.startsWith('EN_PROCESO:')) {
                    setNewEstado('En proceso');
                    setIsManualTramite(false);
                    setNewTramite(val.split(':')[1]);
                  } else {
                    setNewEstado(val as any);
                    setIsManualTramite(false);
                    setNewTramite('');
                  }
                }}
              >
                <option value="Ingresado">Ingresado</option>
                <optgroup label="En proceso (Trámites)">
                  {TRAMITES_PREDEFINIDOS.map(t => (
                    <option key={t} value={`EN_PROCESO:${t}`}>{t}</option>
                  ))}
                  <option value="OTRO">Otro trámite (Manual)...</option>
                </optgroup>
                <option value="Paso a Jurídico">Paso a Jurídico</option>
                <option value="Paso a Despacho">Paso a Despacho</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Archivado">Archivado</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Escribir trámite..."
                  className="bg-white border border-gray-200 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
                  value={newTramite}
                  onChange={(e) => setNewTramite(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setIsManualTramite(false);
                    setNewTramite('');
                  }}
                  className="text-xs text-[#1E6FDB] font-bold hover:underline"
                >
                  Volver a lista
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleUpdate}
            disabled={saving || (newEstado === data.estado && newTramite === (data.tramite || ''))}
            className="bg-[#1E6FDB] text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Actualizar Estado'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Info Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Datos del Denunciante</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{data.denunciante_nombre}</p>
                    <p className="text-sm text-gray-500">DNI: {data.denunciante_dni}</p>
                    <p className="text-sm text-gray-500">{data.denunciante_email || 'Sin email'}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-[#1E6FDB] bg-blue-50 w-fit px-2 py-1 rounded-lg">
                      <Calendar className="w-3 h-3" />
                      <span>Ingreso: {format(new Date(data.fecha_ingreso), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase">Domicilio</p>
                      <p className="text-sm text-gray-700">
                        {data.denunciante_calle} {data.denunciante_numeracion}
                        {data.denunciante_barrio && `, B° ${data.denunciante_barrio}`}
                      </p>
                      {(data.denunciante_entre_calle_1 || data.denunciante_entre_calle_2) && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Entre {data.denunciante_entre_calle_1 || '...'} y {data.denunciante_entre_calle_2 || '...'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Empresas Denunciadas</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{data.empresa_denunciada}</p>
                    </div>
                  </div>
                  {data.empresa_denunciada_2 && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{data.empresa_denunciada_2}</p>
                      </div>
                    </div>
                  )}
                  {data.empresa_denunciada_3 && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{data.empresa_denunciada_3}</p>
                      </div>
                    </div>
                  )}
                  {data.empresa_denunciada_4 && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{data.empresa_denunciada_4}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Motivo del Reclamo
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed font-bold">{data.motivo_reclamo}</p>
              </div>
            </div>

            {data.peticiones && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Peticiones
                </h3>
                <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.peticiones}</p>
                </div>
              </div>
            )}

            {(data.prueba_documental_1 || data.prueba_documental_2) && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-500" />
                  Prueba Documental
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.prueba_documental_1 && (
                    <div className="p-4 bg-purple-50/30 rounded-xl border border-purple-100 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Documento 1</p>
                          <p className="text-xs text-gray-500">Prueba adjunta</p>
                        </div>
                      </div>
                      <a 
                        href={data.prueba_documental_1} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                      >
                        Ver Archivo
                      </a>
                    </div>
                  )}
                  {data.prueba_documental_2 && (
                    <div className="p-4 bg-purple-50/30 rounded-xl border border-purple-100 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Documento 2</p>
                          <p className="text-xs text-gray-500">Prueba adjunta</p>
                        </div>
                      </div>
                      <a 
                        href={data.prueba_documental_2} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                      >
                        Ver Archivo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.observaciones && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Observaciones Internas</h3>
                <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                  <p className="text-gray-700 italic">"{data.observaciones}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Audiencias */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1E6FDB]" />
                Audiencias Programadas
              </h3>
              <button 
                onClick={() => setShowAudienciaModal(true)}
                className="text-sm font-bold text-[#1E6FDB] hover:underline"
              >
                Programar Nueva
              </button>
            </div>

            {showAudienciaModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Programar Audiencia</h3>
                  <form onSubmit={handleScheduleAudiencia} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
                      <input 
                        type="date" 
                        required
                        className="w-full border border-gray-200 rounded-xl p-3"
                        value={audienciaData.fecha}
                        onChange={e => setAudienciaData({...audienciaData, fecha: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Hora (8:00 a 12:00)</label>
                      <select 
                        className="w-full border border-gray-200 rounded-xl p-3"
                        value={audienciaData.hora}
                        onChange={e => setAudienciaData({...audienciaData, hora: e.target.value})}
                      >
                        <option value="08:00">08:00 hs</option>
                        <option value="09:00">09:00 hs</option>
                        <option value="10:00">10:00 hs</option>
                        <option value="11:00">11:00 hs</option>
                        <option value="12:00">12:00 hs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                      <select 
                        className="w-full border border-gray-200 rounded-xl p-3"
                        value={audienciaData.tipo}
                        onChange={e => setAudienciaData({...audienciaData, tipo: e.target.value})}
                      >
                        <option value="Conciliación">Conciliación</option>
                        <option value="Testimonial">Testimonial</option>
                        <option value="Informativa">Informativa</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAudienciaModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-4 py-3 bg-[#1E6FDB] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                      >
                        Programar
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
            
            {data.audiencias.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No hay audiencias programadas para este expediente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.audiencias.map(aud => (
                  <div key={aud.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {format(new Date(aud.fecha_hora), "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Hora: {format(new Date(aud.fecha_hora), 'HH:mm')} hs - {aud.tipo}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                      {aud.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-[#1E6FDB]" />
              Línea de Tiempo
            </h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-blue-200 before:to-transparent">
              {data.movimientos.map((mov, i) => (
                <div key={mov.id} className="relative flex items-start gap-6 group">
                  <div className={cn(
                    "absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center z-10 transition-all",
                    i === 0 ? "bg-blue-500 text-white scale-110 shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"
                  )}>
                    {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="ml-12 pt-0.5">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      {format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <h4 className="font-bold text-gray-900">{mov.accion}</h4>
                    <p className="text-sm text-gray-500 mt-1">{mov.observacion}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {mov.usuario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
