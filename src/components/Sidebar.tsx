import React from 'react';
import {
  ClipboardList,
  History,
  LayoutGrid,
  ShieldCheck,
  User,
  MapPin,
  Truck,
  Map,
  Settings,
  ChevronRight,
  LogOut,
  UserCircle,
  PackageCheck,
} from 'lucide-react';
import { ViewType, AppConfig } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  userEmail: string;
  userName: string;
  onLogout: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  configKey?: keyof AppConfig['modulos'];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'bitacora', label: 'Bitácora', icon: ClipboardList, configKey: 'bitacora' },
  { id: 'embarques', label: 'Embarques', icon: PackageCheck, configKey: 'embarques' },
  { id: 'historial', label: 'Historial', icon: History, configKey: 'historial' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, configKey: 'dashboard' },
  { id: 'vigilancia', label: 'Vigilancia', icon: ShieldCheck, configKey: 'vigilancia' },
  { id: 'operadores', label: 'Operadores', icon: User, configKey: 'operadores' },
  { id: 'localidades', label: 'Localidades', icon: MapPin, configKey: 'localidades' },
  { id: 'camionetas', label: 'Camionetas', icon: Truck, configKey: 'camionetas' },
  { id: 'rutas', label: 'Rutas', icon: Map, configKey: 'rutas' },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  config,
  userEmail,
  userName,
  onLogout,
}) => {
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.configKey) return true;
    return config.modulos[item.configKey] ?? true;
  });

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-2xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="pt-6 pb-4 px-4 flex justify-center border-b border-slate-100">
          <Logo customLogo={config.logoUrl} size="md" showSubtitle={true} />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-700/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-100" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom user profile & session */}
        <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              <UserCircle className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
