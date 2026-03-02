import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Lock,
  Plus,
  X,
  Download,
  Database,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export function Configuracion() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', password: '', rol: 'admin' });
  const [error, setError] = useState('');
  const [nextExpedienteNum, setNextExpedienteNum] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.next_expediente_number) {
      setNextExpedienteNum(data.next_expediente_number);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'next_expediente_number', value: nextExpedienteNum })
    });
    setSavingConfig(false);
    alert('Configuración guardada correctamente');
  };

  const handleDownloadDB = () => {
    window.location.href = '/api/db/download';
  };

  const handleClearDB = async () => {
    if (confirm('¡ATENCIÓN! Esta acción eliminará TODOS los expedientes, movimientos y audiencias. Esta acción no se puede deshacer. ¿Desea continuar?')) {
      const res = await fetch('/api/db/clear', { method: 'POST' });
      if (res.ok) {
        alert('Base de datos limpiada correctamente');
        window.location.reload();
      } else {
        alert('Error al limpiar la base de datos');
      }
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    const res = await fetch('/api/usuarios');
    const data = await res.json();
    setUsuarios(data);
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ nombre: '', password: '', rol: 'admin' });
      fetchUsuarios();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      fetchUsuarios();
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-500">Gestión de usuarios y accesos administrativos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#1E6FDB] text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-[#1E6FDB]" />
              <h3 className="font-bold text-gray-900">Usuarios Administrativos</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse">Cargando usuarios...</div>
              ) : usuarios.map((user) => (
                <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1E6FDB] font-bold">
                      {user.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.nombre}</p>
                      {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase">
                      {user.rol}
                    </span>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#1E6FDB]" />
              <h3 className="font-bold text-gray-900">Seguridad</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Recuerde que los usuarios creados tendrán acceso total al panel administrativo. 
              Use contraseñas seguras y no comparta sus credenciales.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-5 h-5 text-[#1E6FDB]" />
              <h3 className="font-bold text-gray-900">Numeración de Expedientes</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Configure el número desde el cual el sistema empezará a generar nuevos expedientes (últimos 4 dígitos).
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Próximo Número</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    className="flex-1 border border-gray-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-[#1E6FDB]/20"
                    value={nextExpedienteNum}
                    onChange={e => setNextExpedienteNum(e.target.value)}
                  />
                  <button 
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="bg-[#1E6FDB] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {savingConfig ? '...' : 'Guardar'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Ejemplo: Si pone 9967, el próximo será EXP-{new Date().getFullYear()}-9967
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-[#1E6FDB]" />
              <h3 className="font-bold text-gray-900">Base de Datos</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleDownloadDB}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-200"
              >
                <Download className="w-4 h-4" />
                Descargar Backup (.db)
              </button>
              
              <button 
                onClick={handleClearDB}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
              >
                <AlertTriangle className="w-4 h-4" />
                Limpiar Base de Datos
              </button>
              
              <p className="text-[10px] text-gray-400 text-center">
                Use estas herramientas para mantenimiento del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Crear Nuevo Usuario</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de Usuario</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E6FDB]/20"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#1E6FDB]/20"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1E6FDB] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
