import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UsuarioVigilancia, Localidad } from '../types';

interface VigilanciaViewProps {
  usuarios: UsuarioVigilancia[];
  localidades: Localidad[];
  onAddUsuario: (usuario: UsuarioVigilancia) => void;
  onUpdateUsuario: (id: string, updates: Partial<UsuarioVigilancia>) => void;
  onDeleteUsuario: (id: string) => void;
}

export const VigilanciaView: React.FC<VigilanciaViewProps> = ({
  usuarios,
  localidades,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
}) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<UsuarioVigilancia['rol']>('Operador');
  const [localidadPrincipal, setLocalidadPrincipal] = useState('');
  const [localidadesPermitidas, setLocalidadesPermitidas] = useState<string[]>(['CDMX']);

  // Editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Permisos state
  const [permisos, setPermisos] = useState({
    bloque1Salida: false,
    bloque2Embarque: false,
    bloque3Arribo: false,
    bloque4Cierre: false,
    soloVisualizar: false,
    editarHistorial: false,
    gestionarOperadores: false,
    gestionarCamionetas: false,
    gestionarRutas: false,
    gestionarVigilancia: false,
    gestionarLocalidades: false,
    gestionarConfiguracion: false,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const togglePermiso = (key: keyof typeof permisos) => {
    setPermisos((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLocalidadPermitida = (locName: string) => {
    setLocalidadesPermitidas((prev) =>
      prev.includes(locName) ? prev.filter((l) => l !== locName) : [...prev, locName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      alert('Por favor ingrese nombre y correo electrónico');
      return;
    }

    if (editingUserId) {
      onUpdateUsuario(editingUserId, {
        nombre,
        email,
        rol,
        localidadPrincipal: localidadPrincipal || 'CDMX',
        localidadesPermitidas,
        permisos,
      });
      setNotification(`Usuario "${nombre}" actualizado correctamente.`);
      setEditingUserId(null);
    } else {
      const newUser: UsuarioVigilancia = {
        id: `user-${Date.now()}`,
        nombre,
        email,
        password: password || '123456',
        rol,
        localidadPrincipal: localidadPrincipal || 'CDMX',
        localidadesPermitidas: localidadesPermitidas.length > 0 ? localidadesPermitidas : ['CDMX'],
        estado: 'Activo',
        permisos,
      };

      onAddUsuario(newUser);
      setNotification(`Usuario de vigilancia "${nombre}" registrado.`);
    }

    // Reset Form
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('Operador');
    setLocalidadPrincipal('');
    setLocalidadesPermitidas(['CDMX']);
    setPermisos({
      bloque1Salida: false,
      bloque2Embarque: false,
      bloque3Arribo: false,
      bloque4Cierre: false,
      soloVisualizar: false,
      editarHistorial: false,
      gestionarOperadores: false,
      gestionarCamionetas: false,
      gestionarRutas: false,
      gestionarVigilancia: false,
      gestionarLocalidades: false,
      gestionarConfiguracion: false,
    });

    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (user: UsuarioVigilancia) => {
    setEditingUserId(user.id);
    setNombre(user.nombre);
    setEmail(user.email);
    setPassword('******');
    setRol(user.rol);
    setLocalidadPrincipal(user.localidadPrincipal);
    setLocalidadesPermitidas(user.localidadesPermitidas);
    setPermisos({ ...user.permisos });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PERMISSION_DEFINITIONS: { key: keyof typeof permisos; label: string }[] = [
    { key: 'bloque1Salida', label: 'DATOS DE EMBARQUE' },
    { key: 'bloque2Embarque', label: 'BLOQUE 2: EMBARQUE' },
    { key: 'bloque3Arribo', label: 'BLOQUE 3: ARRIBO' },
    { key: 'bloque4Cierre', label: 'BLOQUE 4: CIERRE' },
    { key: 'soloVisualizar', label: 'SOLO VISUALIZAR (NO EDITAR)' },
    { key: 'editarHistorial', label: 'EDITAR HISTORIAL' },
    { key: 'gestionarOperadores', label: 'GESTIONAR OPERADORES' },
    { key: 'gestionarCamionetas', label: 'GESTIONAR CAMIONETAS' },
    { key: 'gestionarRutas', label: 'GESTIONAR RUTAS' },
    { key: 'gestionarVigilancia', label: 'GESTIONAR VIGILANCIA' },
    { key: 'gestionarLocalidades', label: 'GESTIONAR LOCALIDADES' },
    { key: 'gestionarConfiguracion', label: 'GESTIONAR CONFIGURACIÓN' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Card 1: Registrar Nueva Vigilancia matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
          {editingUserId ? 'Editar Usuario de Vigilancia' : 'Registrar Nueva Vigilancia'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top 5 Inputs: Nombre, Email, Contraseña, Rol, Localidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* NOMBRE */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                NOMBRE
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vigilancia@empresa.com"
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                CONTRASEÑA
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* ROL */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                ROL
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as UsuarioVigilancia['rol'])}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Operador">Operador</option>
                <option value="Vigilante">Vigilante</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* LOCALIDAD */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                LOCALIDAD
              </label>
              <select
                value={localidadPrincipal}
                onChange={(e) => setLocalidadPrincipal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="">Seleccionar...</option>
                {localidades.map((loc) => (
                  <option key={loc.id} value={loc.nombre}>
                    {loc.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: PERMISOS Y ACCESOS DEL USUARIO (black accent vertical bar) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-l-4 border-slate-900 pl-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                PERMISOS Y ACCESOS DEL USUARIO
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6 pt-2">
              {PERMISSION_DEFINITIONS.map((perm) => {
                const checked = permisos[perm.key];
                return (
                  <label
                    key={perm.key}
                    className="flex items-center gap-3 cursor-pointer select-none group"
                  >
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => togglePermiso(perm.key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        checked ? 'bg-slate-900' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          checked ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider group-hover:text-slate-900">
                      {perm.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: LOCALIDADES PERMITIDAS (FILTRO DE VISUALIZACIÓN) (blue accent vertical bar) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 border-l-4 border-sky-500 pl-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                LOCALIDADES PERMITIDAS (FILTRO DE VISUALIZACIÓN)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {localidades.map((loc) => {
                const isSelected = localidadesPermitidas.includes(loc.nombre);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleLocalidadPermitida(loc.nombre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {loc.nombre}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * El usuario solo podrá ver operadores, camionetas y rutas que pertenezcan a las localidades seleccionadas aquí.
            </p>
          </div>

          {/* Action Button: + Agregar Vigilancia (Black full width) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {editingUserId ? 'Actualizar Vigilancia' : 'Agregar Vigilancia'}
            </button>
            {editingUserId && (
              <button
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  setNombre('');
                  setEmail('');
                }}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Card 2: Usuarios Registrados */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Usuarios Registrados
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Localidad Principal</th>
                <th className="px-5 py-3">Localidades Permitidas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{user.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">
                    {user.localidadPrincipal}
                  </td>
                  <td className="px-5 py-3.5 italic text-slate-400">
                    {user.localidadesPermitidas.length === localidades.length
                      ? 'Todas'
                      : user.localidadesPermitidas.join(', ') || 'Ninguna'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.estado === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar usuario ${user.nombre}?`)) {
                            onDeleteUsuario(user.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
