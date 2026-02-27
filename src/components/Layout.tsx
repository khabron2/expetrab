import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExternalLink } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Button to Public Form */}
      <Link 
        to="/"
        className="fixed bottom-8 right-8 bg-white text-[#1E6FDB] p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 hover:scale-105 transition-all group z-50"
      >
        <div className="bg-[#1E6FDB]/10 p-2 rounded-xl group-hover:bg-[#1E6FDB] group-hover:text-white transition-all">
          <ExternalLink className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm pr-2">Ir al Formulario</span>
      </Link>
    </div>
  );
}
