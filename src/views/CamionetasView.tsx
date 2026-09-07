import React, { useState } from 'react';
import {
  Search,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { Camioneta, Localidad } from '../types';
import { QrCodeDisplay } from '../components/QrCodeDisplay';
import { CargaMasivaModal } from '../components/CargaMasivaModal';
import { exportToExcel } from '../utils/exportExcel';

interface CamionetasViewProps {
  camionetas: Camioneta[];
  localidades: Localidad[];
  onAddCamioneta: (camioneta: Camioneta) => void;
  onUpdateCamioneta: (id: string, updates: Partial<Camioneta>) => void;
  onDeleteCamioneta: (id: string) => void;
  onDepurarCamionetas: () => void;
  onBulkAddCamionetas: (camionetas: Camioneta[]) => void;
}

export const CamionetasView: React.FC<CamionetasViewProps> = ({
  camionetas,
  localidades,
  onAddCamioneta,
  onUpdateCamioneta,
  onDeleteCamioneta,
  onDepurarCamionetas,
  onBulkAddCamionetas,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [showDepurarConfirm, setShowDepurarConfirm] = useState(false);

  // Form
  const [clave, setClave] = useState('');
  const [placa, setPlaca] = useState('');
  const [claveToka, setClaveToka] = useState('');
  const [modelo, setModelo] = useState('');
  const [localidad, setLocalidad] = useState('CDMX');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clave.trim() || !placa.trim()) {
      alert('Clave de unidad y Placa son obligatorias.');
      return;
    }

    if (editingId) {
      onUpdateCamioneta(editingId, {
        clave: clave.toUpperCase().trim(),
        placa: placa.toUpperCase().trim(),
        claveToka: claveToka.toUpperCase().trim(),
        modelo: modelo.toUpperCase() || 'VEHÍCULO COMERCIAL',
        localidad,
      });
      setNotification(`Camioneta "${clave}" actualizada.`);
      setEditingId(null);
    } else {
      const newCam: Camioneta = {
        id: crypto.randomUUID ? crypto.randomUUID() : `cam-${Date.now()}`,
        clave: clave.toUpperCase().trim(),
        placa: placa.toUpperCase().trim(),
        claveToka: claveToka.toUpperCase().trim(),
        modelo: modelo.toUpperCase() || 'NISSAN NP300 2023',
        localidad: localidad || 'CDMX',
      };
      onAddCamioneta(newCam);
      setNotification(`Camioneta "${newCam.clave}" registrada.`);
    }

    // Reset
    setClave('');
    setPlaca('');
    setClaveToka('');
    setModelo('');
    setLocalidad('CDMX');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (cam: Camioneta) => {
    setEditingId(cam.id);
    setClave(cam.clave);
    setPlaca(cam.placa);
    setClaveToka(cam.claveToka || '');
    setModelo(cam.modelo);
    setLocalidad(cam.localidad);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    const data = camionetas.map((c) => ({
      ID: c.id,
      CLAVE: c.clave,
      PLACA: c.placa,
      'CLAVE TOKA': c.claveToka || '',
      MODELO: c.modelo,
      LOCALIDAD: c.localidad,
    }));
    exportToExcel(data, `Listado-Camionetas-${new Date().toISOString().split('T')[0]}`);
  };

  const handleBulkImport = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const imported: Camioneta[] = [];

    for (const line of lines) {
      // Formats:
      // 5 parts: CLAVE, PLACA, CLAVE TOKA, MODELO, LOCALIDAD
      // 4 parts: CLAVE, PLACA, MODELO, LOCALIDAD
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        if (parts.length >= 5) {
          imported.push({
            id: crypto.randomUUID ? crypto.randomUUID() : `cam-${Date.now()}-${Math.random()}`,
            clave: parts[0].toUpperCase(),
            placa: parts[1].toUpperCase(),
            claveToka: parts[2].toUpperCase(),
            modelo: parts[3] ? parts[3].toUpperCase() : 'NISSAN NP300',
            localidad: parts[4] || 'CDMX',
          });
        } else {
          imported.push({
            id: crypto.randomUUID ? crypto.randomUUID() : `cam-${Date.now()}-${Math.random()}`,
            clave: parts[0].toUpperCase(),
            placa: parts[1].toUpperCase(),
            claveToka: '',
            modelo: parts[2] ? parts[2].toUpperCase() : 'NISSAN NP300',
            localidad: parts[3] || 'CDMX',
          });
        }
      }
    }

    if (imported.length > 0) {
      onBulkAddCamionetas(imported);
      return { success: true, count: imported.length };
    }
    return { success: false, count: 0, error: 'No se reconocieron registros válidos.' };
  };

  const filteredCamionetas = camionetas.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.clave.toLowerCase().includes(q) ||
      c.placa.toLowerCase().includes(q) ||
      (c.claveToka || '').toLowerCase().includes(q) ||
      c.modelo.toLowerCase().includes(q) ||
      c.localidad.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Search & Actions Bar matching Image 6 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por clave, placa o modelo..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Depurar Todo (red outline) */}
          <button
            type="button"
            onClick={() => setShowDepurarConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            DEPURAR TODO
          </button>

          {/* Carga Masiva (Texto) */}
          <button
            type="button"
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            CARGA MASIVA (TEXTO)
          </button>

          {/* Exportar Excel */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORTAR EXCEL
          </button>
        </div>
      </div>

      {/* Card 1: Registrar Nueva Camioneta */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
          {editingId ? 'Editar Camioneta' : 'Registrar Nueva Camioneta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form Inputs (9 cols) */}
            <div className="lg:col-span-9 space-y-4">
              {/* Row 1: ID Interno, Clave de Unidad, Placas, Clave TOKA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    ID INTERNO
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    placeholder="ID-000"
                    className="w-full px-3 py-2 text-xs bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    CLAVE DE UNIDAD
                  </label>
                  <input
                    type="text"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    placeholder="Ej: CAM-01"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    PLACAS
                  </label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="ABC-123-D"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    CLAVE TOKA
                  </label>
                  <input
                    type="text"
                    value={claveToka}
                    onChange={(e) => setClaveToka(e.target.value)}
                    placeholder="Ej: TK-1001"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>
              </div>

              {/* Row 2: Modelo / Año, Localidad Asignada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    MODELO / AÑO
                  </label>
                  <input
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Nissan NP300 2023"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    LOCALIDAD ASIGNADA
                  </label>
                  <select
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
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
            </div>

            {/* Right side: QR DE UNIDAD (3 cols) */}
            <div className="lg:col-span-3 flex justify-center">
              <QrCodeDisplay
                value={clave}
                title="QR DE UNIDAD"
                labelPrefix="CLAVE UNIDAD"
                subtitleValue={clave}
                fileNamePrefix="unidad-qr"
              />
            </div>
          </div>

          {/* Action Button: + Agregar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Guardar Cambios' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setClave('');
                  setPlaca('');
                  setClaveToka('');
                  setModelo('');
                  setLocalidad('CDMX');
                }}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Card 2: Listado de Camionetas */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Listado de Camionetas
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredCamionetas.length} unidades
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Clave</th>
                <th className="px-5 py-3">Placa</th>
                <th className="px-5 py-3">Clave TOKA</th>
                <th className="px-5 py-3">Modelo</th>
                <th className="px-5 py-3">Localidad</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCamionetas.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                    {cam.id}
                  </td>
                  <td className="px-5 py-3.5 font-black text-slate-900">{cam.clave}</td>
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-800">{cam.placa}</td>
                  <td className="px-5 py-3.5">
                    {cam.claveToka ? (
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded text-[11px]">
                        {cam.claveToka}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{cam.modelo}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">{cam.localidad}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(cam)}
                        className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Editar camioneta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la camioneta con clave ${cam.clave}?`)) {
                            onDeleteCamioneta(cam.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Eliminar camioneta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carga Masiva Modal */}
      <CargaMasivaModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Carga Masiva de Camionetas"
        formatGuide="CLAVE, PLACAS, CLAVE TOKA, MODELO Y AÑO, LOCALIDAD"
        placeholderText="CAM-01, ABC-12-D, TK-1001, NISSAN NP300 2023, CDMX&#10;CAM-02, XYZ-99-A, TK-1002, CHEVROLET TORNADO 2020, Oaxaca"
        onImport={handleBulkImport}
      />

      {/* Depurar Confirm Modal */}
      {showDepurarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">¿Depurar flota vehicular?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Se limpiará la lista actual de camionetas. Asegúrate de haber exportado un respaldo antes si lo requieres.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDepurarConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDepurarCamionetas();
                  setShowDepurarConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Depurar Flota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
