import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Expedientes', path: '/admin/expedientes' },
  { icon: Calendar, label: 'Audiencias', path: '/admin/audiencias' },
  { icon: BarChart3, label: 'Reportes', path: '/admin/reportes' },
  { icon: Settings, label: 'Configuración', path: '/admin/config' },
];

export function Sidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-[#1E6FDB] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white p-2 rounded-lg">
          <ShieldCheck className="text-[#1E6FDB] w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">CRM Defensa</h1>
          <p className="text-xs text-white/70">C.A.P.E. Av. Belgrano</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white text-[#1E6FDB] shadow-lg" 
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#1E6FDB]" : "text-white/60 group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5 text-white/60" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
