import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  MoreVertical,
  Plus,
  FileText
} from 'lucide-react';
import { Expediente } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const statusColors = {
  'Ingresado': 'bg-blue-50 text-blue-600 border-blue-100',
  'En proceso': 'bg-amber-50 text-amber-600 border-amber-100',
  'Resuelto': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Archivado': 'bg-gray-50 text-gray-600 border-gray-100',
};

export function Expedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterEstado) params.append('estado', filterEstado);

    fetch(`/api/expedientes?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExpedientes(data);
        setLoading(false);
      });
  }, [search, filterEstado]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expedientes</h2>
          <p className="text-gray-500">Gestión y seguimiento de reclamos institucionales</p>
        </div>
        <button className="bg-[#1E6FDB] text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Expediente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por número, nombre, DNI o empresa..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-gray-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Ingresado">Ingresado</option>
            <option value="En proceso">En proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Archivado">Archivado</option>
          </select>

          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all border border-gray-100">
            <Filter className="w-5 h-5" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-gray-100">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expediente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Denunciante</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : expedientes.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900">{exp.numero_expediente}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exp.denunciante_nombre}</p>
                      <p className="text-xs text-gray-500">DNI: {exp.denunciante_dni}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{exp.empresa_denunciada}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {format(new Date(exp.fecha_ingreso), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      statusColors[exp.estado]
                    )}>
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/admin/expedientes/${exp.id}`}
                        className="p-2 text-gray-400 hover:text-[#1E6FDB] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Mostrando {expedientes.length} expedientes</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50" disabled>Anterior</button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#1E6FDB] rounded-xl hover:bg-blue-700 transition-all">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
