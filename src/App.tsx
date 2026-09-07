import React, { useState, useEffect } from 'react';
import { ViewType, AppConfig, BitacoraRegistro, Operador, Camioneta, Ruta, Localidad, UsuarioVigilancia } from './types';
import {
  INITIAL_OPERADORES,
  INITIAL_CAMIONETAS,
  INITIAL_RUTAS,
  INITIAL_LOCALIDADES,
  INITIAL_USUARIOS,
  INITIAL_REGISTROS,
  INITIAL_CONFIG,
} from './mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BitacoraView } from './views/BitacoraView';
import { HistorialView } from './views/HistorialView';
import { DashboardView } from './views/DashboardView';
import { VigilanciaView } from './views/VigilanciaView';
import { OperadoresView } from './views/OperadoresView';
import { LocalidadesView } from './views/LocalidadesView';
import { CamionetasView } from './views/CamionetasView';
import { RutasView } from './views/RutasView';
import { ConfiguracionView } from './views/ConfiguracionView';
import { EmbarquesView } from './views/EmbarquesView';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('bitacora');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Configuration
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('jigafra_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          modulos: {
            ...INITIAL_CONFIG.modulos,
            ...parsed.modulos,
          },
        };
      } catch {
        return INITIAL_CONFIG;
      }
    }
    return INITIAL_CONFIG;
  });

  // Domain Entities with LocalStorage Persistence
  const [registros, setRegistros] = useState<BitacoraRegistro[]>(() => {
    const saved = localStorage.getItem('jigafra_registros');
    return saved ? JSON.parse(saved) : INITIAL_REGISTROS;
  });

  const [operadores, setOperadores] = useState<Operador[]>(() => {
    const saved = localStorage.getItem('jigafra_operadores');
    return saved ? JSON.parse(saved) : INITIAL_OPERADORES;
  });

  const [camionetas, setCamionetas] = useState<Camioneta[]>(() => {
    const saved = localStorage.getItem('jigafra_camionetas');
    if (saved) {
      try {
        const parsed: Camioneta[] = JSON.parse(saved);
        return parsed.map((cam) => {
          if (!cam.claveToka) {
            const initial = INITIAL_CAMIONETAS.find((ic) => ic.clave === cam.clave);
            if (initial?.claveToka) {
              return { ...cam, claveToka: initial.claveToka };
            }
          }
          return cam;
        });
      } catch {
        return INITIAL_CAMIONETAS;
      }
    }
    return INITIAL_CAMIONETAS;
  });

  const [rutas, setRutas] = useState<Ruta[]>(() => {
    const saved = localStorage.getItem('jigafra_rutas');
    return saved ? JSON.parse(saved) : INITIAL_RUTAS;
  });

  const [localidades, setLocalidades] = useState<Localidad[]>(() => {
    const saved = localStorage.getItem('jigafra_localidades');
    return saved ? JSON.parse(saved) : INITIAL_LOCALIDADES;
  });

  const [usuarios, setUsuarios] = useState<UsuarioVigilancia[]>(() => {
    const saved = localStorage.getItem('jigafra_usuarios');
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState({
    name: 'sistemas',
    email: 'sistemas@jigafra.com.mx',
    role: 'Admin',
  });

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('jigafra_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('jigafra_registros', JSON.stringify(registros));
  }, [registros]);

  useEffect(() => {
    localStorage.setItem('jigafra_operadores', JSON.stringify(operadores));
  }, [operadores]);

  useEffect(() => {
    localStorage.setItem('jigafra_camionetas', JSON.stringify(camionetas));
  }, [camionetas]);

  useEffect(() => {
    localStorage.setItem('jigafra_rutas', JSON.stringify(rutas));
  }, [rutas]);

  useEffect(() => {
    localStorage.setItem('jigafra_localidades', JSON.stringify(localidades));
  }, [localidades]);

  useEffect(() => {
    localStorage.setItem('jigafra_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  // Handlers for Bitacora
  const handleSaveRegistro = (newReg: BitacoraRegistro) => {
    setRegistros((prev) => [newReg, ...prev]);
  };

  const handleUpdateRegistro = (id: string, updates: Partial<BitacoraRegistro>) => {
    setRegistros((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleDepurarHistorial = () => {
    // Keep top 2 latest as samples, purge remainder
    setRegistros((prev) => prev.slice(0, 2));
  };

  // Handlers for Operadores
  const handleAddOperador = (newOp: Operador) => {
    setOperadores((prev) => [newOp, ...prev]);
  };

  const handleUpdateOperador = (id: string, updates: Partial<Operador>) => {
    setOperadores((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handleDeleteOperador = (id: string) => {
    setOperadores((prev) => prev.filter((o) => o.id !== id));
  };

  const handleBulkAddOperadores = (newOps: Operador[]) => {
    setOperadores((prev) => [...newOps, ...prev]);
  };

  // Handlers for Camionetas
  const handleAddCamioneta = (newCam: Camioneta) => {
    setCamionetas((prev) => [newCam, ...prev]);
  };

  const handleUpdateCamioneta = (id: string, updates: Partial<Camioneta>) => {
    setCamionetas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCamioneta = (id: string) => {
    setCamionetas((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDepurarCamionetas = () => {
    setCamionetas((prev) => prev.slice(0, 2));
  };

  const handleBulkAddCamionetas = (newCams: Camioneta[]) => {
    setCamionetas((prev) => [...newCams, ...prev]);
  };

  // Handlers for Rutas
  const handleAddRuta = (newRuta: Ruta) => {
    setRutas((prev) => [newRuta, ...prev]);
  };

  const handleUpdateRuta = (id: string, updates: Partial<Ruta>) => {
    setRutas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleDeleteRuta = (id: string) => {
    setRutas((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBulkAddRutas = (newRutas: Ruta[]) => {
    setRutas((prev) => [...newRutas, ...prev]);
  };

  // Handlers for Localidades
  const handleAddLocalidad = (newLoc: Localidad) => {
    setLocalidades((prev) => [...prev, newLoc]);
  };

  const handleUpdateLocalidad = (id: string, nombre: string) => {
    setLocalidades((prev) =>
      prev.map((l) => (l.id === id ? { ...l, nombre } : l))
    );
  };

  const handleDeleteLocalidad = (id: string) => {
    setLocalidades((prev) => prev.filter((l) => l.id !== id));
  };

  const handleBulkAddLocalidades = (newLocs: Localidad[]) => {
    setLocalidades((prev) => [...prev, ...newLocs]);
  };

  // Handlers for Usuarios / Vigilancia
  const handleAddUsuario = (newUsr: UsuarioVigilancia) => {
    setUsuarios((prev) => [newUsr, ...prev]);
  };

  const handleUpdateUsuario = (id: string, updates: Partial<UsuarioVigilancia>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const handleDeleteUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  // Handlers for Config
  const handleUpdateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleResetToDefaults = () => {
    setRegistros(INITIAL_REGISTROS);
    setOperadores(INITIAL_OPERADORES);
    setCamionetas(INITIAL_CAMIONETAS);
    setRutas(INITIAL_RUTAS);
    setLocalidades(INITIAL_LOCALIDADES);
    setUsuarios(INITIAL_USUARIOS);
    setConfig(INITIAL_CONFIG);
  };

  const handleExportBackup = () => {
    const backup = {
      config,
      registros,
      operadores,
      camionetas,
      rutas,
      localidades,
      usuarios,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jigafra_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    alert('Sesión cerrada. Iniciando como operador invitado para revisión.');
  };

  const handleDeleteRegistro = (id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  // View title & subtitle mapping matching screenshots
  const getViewHeaders = (view: ViewType) => {
    switch (view) {
      case 'bitacora':
        return {
          title: 'Bitácora de Embarques',
          subtitle: 'Registro horizontal de salidas, embarque y arribos.',
        };
      case 'embarques':
        return {
          title: 'Gestión de Embarques',
          subtitle: 'Carga de información de despacho, pedidos y escaneo inicial.',
        };
      case 'historial':
        return {
          title: 'Historial de Bitácora',
          subtitle: 'Consulta de bitácoras pasadas y conciliación.',
        };
      case 'dashboard':
        return {
          title: 'Dashboard Operativo',
          subtitle: 'Métricas en tiempo real de salidas, flota y rutas.',
        };
      case 'vigilancia':
        return {
          title: 'Gestión de Vigilancia',
          subtitle: 'Administra accesos y roles del sistema.',
        };
      case 'operadores':
        return {
          title: 'Gestión de Operadores',
          subtitle: 'Administra el registro de personal autorizado.',
        };
      case 'localidades':
        return {
          title: 'Gestión de Localidades',
          subtitle: 'Administra las sedes y puntos de operación.',
        };
      case 'camionetas':
        return {
          title: 'Gestión de Camionetas',
          subtitle: 'Control de flota y vehículos de transporte.',
        };
      case 'rutas':
        return {
          title: 'Gestión de Rutas',
          subtitle: 'Administra las rutas asignadas a los operadores.',
        };
      case 'configuracion':
        return {
          title: 'Configuración del Sistema',
          subtitle: 'Personaliza y gestiona las opciones globales.',
        };
      default:
        return { title: 'Bitácora', subtitle: '' };
    }
  };

  const viewHeaders = getViewHeaders(currentView);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden select-none">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        config={config}
        userEmail={currentUser.email}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          title={viewHeaders.title}
          subtitle={viewHeaders.subtitle}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          userEmail={currentUser.email}
          userName={currentUser.name}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'bitacora' && (
              <BitacoraView
                operadores={operadores}
                camionetas={camionetas}
                rutas={rutas}
                registros={registros}
                onSaveRegistro={handleSaveRegistro}
                onUpdateRegistro={handleUpdateRegistro}
                onNavigateToHistorial={() => setCurrentView('historial')}
              />
            )}

            {currentView === 'embarques' && (
              <EmbarquesView
                registros={registros}
                camionetas={camionetas}
                operadores={operadores}
                rutas={rutas}
                onSaveRegistro={handleSaveRegistro}
                onUpdateRegistro={handleUpdateRegistro}
                onDeleteRegistro={handleDeleteRegistro}
                onDepurarEmbarques={handleDepurarHistorial}
                onNavigateToBitacora={(_unidad) => {
                  setCurrentView('bitacora');
                }}
              />
            )}

            {currentView === 'historial' && (
              <HistorialView
                registros={registros}
                onDepurarHistorial={handleDepurarHistorial}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                registros={registros}
                operadores={operadores}
                camionetas={camionetas}
                rutas={rutas}
                localidades={localidades}
              />
            )}

            {currentView === 'vigilancia' && (
              <VigilanciaView
                usuarios={usuarios}
                localidades={localidades}
                onAddUsuario={handleAddUsuario}
                onUpdateUsuario={handleUpdateUsuario}
                onDeleteUsuario={handleDeleteUsuario}
              />
            )}

            {currentView === 'operadores' && (
              <OperadoresView
                operadores={operadores}
                localidades={localidades}
                onAddOperador={handleAddOperador}
                onUpdateOperador={handleUpdateOperador}
                onDeleteOperador={handleDeleteOperador}
                onBulkAddOperadores={handleBulkAddOperadores}
              />
            )}

            {currentView === 'localidades' && (
              <LocalidadesView
                localidades={localidades}
                onAddLocalidad={handleAddLocalidad}
                onUpdateLocalidad={handleUpdateLocalidad}
                onDeleteLocalidad={handleDeleteLocalidad}
                onBulkAddLocalidades={handleBulkAddLocalidades}
              />
            )}

            {currentView === 'camionetas' && (
              <CamionetasView
                camionetas={camionetas}
                localidades={localidades}
                onAddCamioneta={handleAddCamioneta}
                onUpdateCamioneta={handleUpdateCamioneta}
                onDeleteCamioneta={handleDeleteCamioneta}
                onDepurarCamionetas={handleDepurarCamionetas}
                onBulkAddCamionetas={handleBulkAddCamionetas}
              />
            )}

            {currentView === 'rutas' && (
              <RutasView
                rutas={rutas}
                localidades={localidades}
                onAddRuta={handleAddRuta}
                onUpdateRuta={handleUpdateRuta}
                onDeleteRuta={handleDeleteRuta}
                onBulkAddRutas={handleBulkAddRutas}
              />
            )}

            {currentView === 'configuracion' && (
              <ConfiguracionView
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onResetToDefaults={handleResetToDefaults}
                onExportBackup={handleExportBackup}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
