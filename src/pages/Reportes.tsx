import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Download,
  Filter
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const COLORS = ['#1E6FDB', '#F59E0B', '#8B5CF6', '#6366F1', '#10B981', '#6B7280'];

interface Stats {
  total: number;
  activos: number;
  resueltos: number;
  archivados: number;
  distribution: { estado: string; value: number }[];
  monthly: { month: string; count: number }[];
}

export function Reportes() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando reportes...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes e Informes</h2>
          <p className="text-gray-500">Análisis detallado de expedientes y estados</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar Periodo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E6FDB] text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<FileText className="w-6 h-6" />} 
          label="Total Expedientes" 
          value={stats.total} 
          color="blue"
        />
        <StatCard 
          icon={<Clock className="w-6 h-6" />} 
          label="En Proceso" 
          value={stats.activos} 
          color="amber"
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6" />} 
          label="Resueltos" 
          value={stats.resueltos} 
          color="emerald"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />} 
          label="Tasa de Resolución" 
          value={`${Math.round((stats.resueltos / (stats.total || 1)) * 100)}%`} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Status */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución por Estado</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="estado"
                >
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Evolution */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Evolución Mensual</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#1E6FDB" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Resumen de Gestión</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Porcentaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.distribution.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="font-medium text-gray-700">{item.estado}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{item.value}</td>
                <td className="px-6 py-4 text-gray-500">
                  {Math.round((item.value / stats.total) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
