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
  Save
} from 'lucide-react';
import { Expediente, Movimiento, Audiencia } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';

export function ExpedienteDetail() {
  const { id } = useParams();
  const [data, setData] = useState<(Expediente & { movimientos: Movimiento[], audiencias: Audiencia[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEstado, setNewEstado] = useState('');

  useEffect(() => {
    fetch(`/api/expedientes/${id}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setNewEstado(data.estado);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    await fetch(`/api/expedientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: newEstado })
    });
    // Refresh
    const res = await fetch(`/api/expedientes/${id}`);
    const updated = await res.json();
    setData(updated);
    setSaving(false);
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
            <p className="text-gray-500">Detalle y seguimiento del expediente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-white border border-gray-200 rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
            value={newEstado}
            onChange={(e) => setNewEstado(e.target.value as any)}
          >
            <option value="Ingresado">Ingresado</option>
            <option value="En proceso">En proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Archivado">Archivado</option>
          </select>
          <button 
            onClick={handleUpdate}
            disabled={saving || newEstado === data.estado}
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
              <button className="text-sm font-bold text-[#1E6FDB] hover:underline">Programar Nueva</button>
            </div>
            
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
