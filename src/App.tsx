import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Expedientes } from './pages/Expedientes';
import { ExpedienteDetail } from './pages/ExpedienteDetail';
import { Login } from './pages/Login';
import { PublicForm } from './pages/PublicForm';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem('auth');
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="expedientes" element={<Expedientes />} />
          <Route path="expedientes/:id" element={<ExpedienteDetail />} />
          <Route path="audiencias" element={<div className="p-8">Módulo de Audiencias (Próximamente)</div>} />
          <Route path="reportes" element={<div className="p-8">Módulo de Reportes (Próximamente)</div>} />
          <Route path="config" element={<div className="p-8">Módulo de Configuración (Próximamente)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
