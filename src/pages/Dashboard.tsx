import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardStats } from '../types';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

const COLORS = ['#1E6FDB', '#F59E0B', '#10B981', '#6B7280'];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(data ? false : true);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Expedientes', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Tiempo Promedio', value: `${stats.avgResolutionTime} días`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-2d' },
    { 
      label: 'Último Ingresado', 
      value: stats.ultimoIngresado?.numero_expediente || 'N/A', 
      subValue: stats.ultimoIngresado?.denunciante_nombre,
      icon: FileCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      trend: 'Nuevo' 
    },
    { 
      label: 'Último Modificado', 
      value: stats.ultimoModificado?.numero_expediente || 'N/A', 
      subValue: stats.ultimoModificado?.estado,
      icon: AlertCircle, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      trend: 'Activo' 
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard General</h2>
          <p className="text-gray-500">Resumen de actividad y estadísticas del sistema</p>
        </div>
        <button className="bg-[#1E6FDB] text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Descargar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl", card.bg)}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider",
                card.trend === 'Nuevo' ? "text-emerald-600 bg-emerald-50" : 
                card.trend === 'Activo' ? "text-amber-600 bg-amber-50" :
                card.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"
              )}>
                {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : 
                 card.trend.startsWith('-') ? <ArrowDownRight className="w-3 h-3" /> : null}
                {card.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 truncate">{card.value}</h3>
              {card.subValue && (
                <p className="text-xs text-gray-400 mt-1 truncate">{card.subValue}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-sans">Evolución Mensual</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={stats.monthly}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E6FDB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E6FDB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#1E6FDB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-sans">Distribución por Estado</h3>
          <div className="h-[300px] w-full relative flex items-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 pr-8">
              {stats.distribution.map((item, i) => (
                <div key={item.estado} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-600">{item.estado}</span>
                  <span className="text-sm font-bold text-gray-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-sans">Carga de Reclamos por Hora (Heatmap)</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={stats.hourly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} label={{ value: 'Hora del día', position: 'insideBottom', offset: -5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#1E6FDB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
