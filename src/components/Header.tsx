import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export function Header() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { nombre: 'Admin User', rol: 'Administrador' };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar expedientes, DNI o empresas..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1E6FDB]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-100 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user.nombre}</p>
            <p className="text-xs text-gray-500 uppercase">{user.rol}</p>
          </div>
          <div className="w-10 h-10 bg-[#1E6FDB]/10 rounded-full flex items-center justify-center text-[#1E6FDB]">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
