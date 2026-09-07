import React, { useState } from 'react';
import {
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Download,
} from 'lucide-react';
import { AppConfig } from '../types';
import { Logo } from '../components/Logo';

interface ConfiguracionViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
  onResetToDefaults: () => void;
  onExportBackup: () => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  config,
  onUpdateConfig,
  onResetToDefaults,
  onExportBackup,
}) => {
  const [empresaNombre, setEmpresaNombre] = useState(config.empresaNombre);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [modulos, setModulos] = useState(config.modulos);
  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleModulo = (moduloKey: keyof AppConfig['modulos']) => {
    const updated = {
      ...modulos,
      [moduloKey]: !modulos[moduloKey],
    };
    setModulos(updated);
    onUpdateConfig({ modulos: updated });
    setNotification(`Módulo "${moduloKey}" actualizado en la barra lateral.`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      empresaNombre,
      logoUrl,
      modulos,
    });
    setNotification('Configuración de la empresa guardada correctamente.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const MODULE_LIST: { key: keyof AppConfig['modulos']; label: string; desc: string }[] = [
    { key: 'bitacora', label: 'Bitácora', desc: 'Registro de accesos y cuatro bloques operativos.' },
    { key: 'embarques', label: 'Embarques', desc: 'Módulo de carga de información de embarques y despacho.' },
    { key: 'historial', label: 'Historial', desc: 'Consulta de bitácoras pasadas y conciliación.' },
    { key: 'dashboard', label: 'Dashboard', desc: 'Indicadores clave y resumen de desempeño de flota.' },
    { key: 'vigilancia', label: 'Vigilancia', desc: 'Control de usuarios y permisos por sede.' },
    { key: 'operadores', label: 'Operadores', desc: 'Catálogo de choferes autorizados y códigos QR.' },
    { key: 'localidades', label: 'Localidades', desc: 'Sedes y puntos de control de la red logística.' },
    { key: 'camionetas', label: 'Camionetas', desc: 'Control de unidades, placas y códigos QR de unidad.' },
    { key: 'rutas', label: 'Rutas', desc: 'Catálogo de circuitos de transporte programados.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Card 1: Configuración de la Empresa matching Image 8 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
          Configuración de la Empresa
        </h2>

        <form onSubmit={handleSaveEmpresa} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  NOMBRE DE LA EMPRESA
                </label>
                <input
                  type="text"
                  value={empresaNombre}
                  onChange={(e) => setEmpresaNombre(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  CAMBIAR LOGO
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Preview Box matching Image 8 */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                LOGO ACTUAL
              </label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center min-h-[110px]">
                <Logo customLogo={logoUrl} size="lg" showSubtitle={true} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Gestión de Módulos (Visibilidad en Barra Lateral) matching Image 8 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3 mb-5">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Gestión de Módulos (Visibilidad en Barra Lateral)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_LIST.map((mod) => {
            const isEnabled = modulos[mod.key];
            return (
              <div
                key={mod.key}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      {mod.label}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{mod.desc}</p>
                  </div>
                  {/* Switch toggle matching screenshots */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggleModulo(mod.key)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[10px] font-bold">
                  {isEnabled ? (
                    <span className="text-emerald-700">Visible en navegación</span>
                  ) : (
                    <span className="text-slate-400">Oculto</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Opciones de Datos y Copias de Seguridad */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-4">
          Opciones de Datos y Respaldo
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar Respaldo Completo (JSON)
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  '¿Desea restablecer todos los datos de prueba iniciales de JIGAFRA (Operadores, Camionetas, Rutas y Bitácora)?'
                )
              ) {
                onResetToDefaults();
                setNotification('Datos de fábrica restaurados con éxito.');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Datos Iniciales
          </button>
        </div>
      </div>
    </div>
  );
};
