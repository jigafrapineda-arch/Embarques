import React, { useState } from 'react';
import {
  Search,
  Upload,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Ruta, Localidad } from '../types';
import { QrCodeDisplay } from '../components/QrCodeDisplay';
import { CargaMasivaModal } from '../components/CargaMasivaModal';
import { exportToExcel } from '../utils/exportExcel';

interface RutasViewProps {
  rutas: Ruta[];
  localidades: Localidad[];
  onAddRuta: (ruta: Ruta) => void;
  onUpdateRuta: (id: string, updates: Partial<Ruta>) => void;
  onDeleteRuta: (id: string) => void;
  onBulkAddRutas: (rutas: Ruta[]) => void;
}

export const RutasView: React.FC<RutasViewProps> = ({
  rutas,
  localidades,
  onAddRuta,
  onUpdateRuta,
  onDeleteRuta,
  onBulkAddRutas,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Form fields
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('CDMX');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) {
      alert('Código y Nombre de la ruta son obligatorios.');
      return;
    }

    if (editingId) {
      onUpdateRuta(editingId, {
        codigo: codigo.toUpperCase(),
        nombre: nombre.toUpperCase(),
        localidad,
      });
      setNotification(`Ruta "${codigo}" actualizada.`);
      setEditingId(null);
    } else {
      const newRuta: Ruta = {
        id: crypto.randomUUID ? crypto.randomUUID() : `ruta-${Date.now()}`,
        codigo: codigo.toUpperCase(),
        nombre: nombre.toUpperCase(),
        localidad: localidad || 'CDMX',
      };
      onAddRuta(newRuta);
      setNotification(`Ruta "${newRuta.codigo} - ${newRuta.nombre}" agregada.`);
    }

    // Reset
    setCodigo('');
    setNombre('');
    setLocalidad('CDMX');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (r: Ruta) => {
    setEditingId(r.id);
    setCodigo(r.codigo);
    setNombre(r.nombre);
    setLocalidad(r.localidad);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    const data = rutas.map((r) => ({
      ID: r.id,
      CÓDIGO: r.codigo,
      NOMBRE: r.nombre,
      LOCALIDAD: r.localidad,
    }));
    exportToExcel(data, `Listado-Rutas-${new Date().toISOString().split('T')[0]}`);
  };

  const handleBulkImport = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const imported: Ruta[] = [];

    for (const line of lines) {
      // Format: CODIGO, NOMBRE, LOCALIDAD
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        imported.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `ruta-${Date.now()}-${Math.random()}`,
          codigo: parts[0].toUpperCase(),
          nombre: parts[1].toUpperCase(),
          localidad: parts[2] || 'CDMX',
        });
      }
    }

    if (imported.length > 0) {
      onBulkAddRutas(imported);
      return { success: true, count: imported.length };
    }
    return { success: false, count: 0, error: 'No se reconocieron rutas válidas.' };
  };

  const filteredRutas = rutas.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.codigo.toLowerCase().includes(q) ||
      r.nombre.toLowerCase().includes(q) ||
      r.localidad.toLowerCase().includes(q)
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

      {/* Top Search & Actions Bar matching Image 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o nombre de ruta..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
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

      {/* Card 1: Registrar Nueva Ruta */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
          {editingId ? 'Editar Ruta' : 'Registrar Nueva Ruta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form Inputs (lg:col-span-9) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* CÓDIGO DE RUTA */}
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    CÓDIGO DE RUTA
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. R-01"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>

                {/* NOMBRE DE LA RUTA */}
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    NOMBRE DE LA RUTA
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre descriptivo de la ruta"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium uppercase"
                  />
                </div>
              </div>

              {/* LOCALIDAD */}
              <div className="max-w-md">
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  LOCALIDAD
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

            {/* Right side: GENERADOR DE QR (lg:col-span-3) */}
            <div className="lg:col-span-3 flex justify-center">
              <QrCodeDisplay
                value={codigo}
                title="GENERADOR DE QR"
                labelPrefix="CÓDIGO RUTA"
                subtitleValue={codigo}
                fileNamePrefix="ruta-qr"
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
                  setCodigo('');
                  setNombre('');
                }}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Card 2: Listado de Rutas */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Listado de Rutas
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredRutas.length} rutas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Localidad</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRutas.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                    {r.id}
                  </td>
                  <td className="px-5 py-3.5 font-black text-slate-900">{r.codigo}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{r.nombre}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">{r.localidad}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(r)}
                        className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Editar ruta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la ruta ${r.codigo}?`)) {
                            onDeleteRuta(r.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Eliminar ruta"
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
        title="Carga Masiva de Rutas"
        formatGuide="CÓDIGO DE RUTA, NOMBRE DE LA RUTA, LOCALIDAD"
        placeholderText="R-01, RUTA 1 CDMX, CDMX&#10;R-02, RUTA 2 METROPOLITANA, CDMX&#10;R-10, RUTA COSTA, Oaxaca"
        onImport={handleBulkImport}
      />
    </div>
  );
};
