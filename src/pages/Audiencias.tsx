import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Printer, 
  Search,
  User,
  Building2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface AudienciaConDetalle {
  id: number;
  expediente_id: number;
  fecha_hora: string;
  tipo: string;
  estado: string;
  numero_expediente: string;
  denunciante_nombre: string;
  empresa_denunciada: string;
}

export function Audiencias() {
  const [audiencias, setAudiencias] = useState<AudienciaConDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audiencias?fecha=${filterDate}`)
      .then(res => res.json())
      .then(data => {
        setAudiencias(data);
        setLoading(false);
      });
  }, [filterDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda de Audiencias</h2>
          <p className="text-gray-500">Listado y programación de audiencias conciliatorias</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <button 
            onClick={handlePrint}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Día
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block mb-8 text-center border-b pb-6">
        <h1 className="text-2xl font-bold">Defensa del Consumidor</h1>
        <h2 className="text-xl mt-2">Cronograma de Audiencias</h2>
        <p className="text-gray-600 mt-1">
          Día: {format(new Date(filterDate + 'T00:00:00'), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Cargando agenda...</div>
        ) : audiencias.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No hay audiencias programadas para esta fecha.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {audiencias.map((aud, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={aud.id} 
                className="p-6 hover:bg-gray-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[80px]">
                      <div className="p-2 bg-blue-50 rounded-xl text-[#1E6FDB] mb-1">
                        <Clock className="w-5 h-5 mx-auto" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {format(new Date(aud.fecha_hora), 'HH:mm')} hs
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {aud.numero_expediente}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                          {aud.tipo}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                          <User className="w-4 h-4 text-gray-400" />
                          {aud.denunciante_nombre}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {aud.empresa_denunciada}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 no-print">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                      {aud.estado}
                    </span>
                    <Link 
                      to={`/admin/expedientes/${aud.expediente_id}`}
                      className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .divide-y > * { border-bottom: 1px solid #eee !important; page-break-inside: avoid; }
          .text-gray-500, .text-gray-400 { color: #666 !important; }
          .bg-blue-50, .bg-emerald-50 { background: transparent !important; border: 1px solid #eee !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
