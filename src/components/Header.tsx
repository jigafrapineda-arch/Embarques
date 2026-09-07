import React from 'react';
import { Menu } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
  userEmail: string;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string }> = {
  bitacora: {
    title: 'Gestión de Bitácora',
    subtitle: 'Registro de operaciones diarias.',
  },
  embarques: {
    title: 'Gestión de Embarques',
    subtitle: 'Carga de información, despacho de pedidos y control de salida.',
  },
  historial: {
    title: 'Gestión de Historial',
    subtitle: 'Consulta el registro completo de movimientos.',
  },
  dashboard: {
    title: 'Dashboard Operativo',
    subtitle: 'Métricas, estatus de flota y resumen en tiempo real.',
  },
  vigilancia: {
    title: 'Gestión de Vigilancia',
    subtitle: 'Administra accesos y roles del sistema.',
  },
  operadores: {
    title: 'Gestión de Operadores',
    subtitle: 'Administra el registro de personal autorizado.',
  },
  localidades: {
    title: 'Gestión de Localidades',
    subtitle: 'Administra las sedes y puntos de operación.',
  },
  camionetas: {
    title: 'Gestión de Camionetas',
    subtitle: 'Control de flota y vehículos de transporte.',
  },
  rutas: {
    title: 'Gestión de Rutas',
    subtitle: 'Configuración de trayectos y destinos.',
  },
  configuracion: {
    title: 'Gestión de Configuración',
    subtitle: 'Personaliza la apariencia y visibilidad de los módulos.',
  },
};

export const Header: React.FC<HeaderProps> = ({ currentView, onToggleSidebar }) => {
  const meta = VIEW_TITLES[currentView] || {
    title: 'Sistema de Bitácora',
    subtitle: 'Control y registro de operaciones.',
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Abrir o cerrar menú"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/60"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Avatar badge matching screenshot */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white ring-1 ring-emerald-500/20 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Usuario"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // fallback to initials if image doesn't load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute">JS</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
