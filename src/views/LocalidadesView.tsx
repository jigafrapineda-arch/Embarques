import React, { useState } from 'react';
import { Search, Upload, Download, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { Localidad } from '../types';
import { CargaMasivaModal } from '../components/CargaMasivaModal';
import { exportToExcel } from '../utils/exportExcel';

interface LocalidadesViewProps {
  localidades: Localidad[];
  onAddLocalidad: (localidad: Localidad) => void;
  onUpdateLocalidad: (id: string, nombre: string) => void;
  onDeleteLocalidad: (id: string) => void;
  onBulkAddLocalidades: (localidades: Localidad[]) => void;
}

export const LocalidadesView: React.FC<LocalidadesViewProps> = ({
  localidades,
  onAddLocalidad,
  onUpdateLocalidad,
  onDeleteLocalidad,
  onBulkAddLocalidades,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nombre, setNombre] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingId) {
      onUpdateLocalidad(editingId, nombre.trim());
      setNotification(`Localidad "${nombre}" actualizada.`);
      setEditingId(null);
    } else {
      const newLoc: Localidad = {
        id: crypto.randomUUID ? crypto.randomUUID() : `loc-${Date.now()}`,
        nombre: nombre.trim(),
      };
      onAddLocalidad(newLoc);
      setNotification(`Localidad "${nombre}" agregada.`);
    }

    setNombre('');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (loc: Localidad) => {
    setEditingId(loc.id);
    setNombre(loc.nombre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    const data = localidades.map((l) => ({
      NOMBRE: l.nombre,
      ID: l.id,
    }));
    exportToExcel(data, `Localidades-${new Date().toISOString().split('T')[0]}`);
  };

  const handleBulkImport = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const newItems: Localidad[] = [];
    for (const line of lines) {
      const cleanName = line.replace(/^[,\s]+|[,\s]+$/g, '').trim();
      if (cleanName && !localidades.some((l) => l.nombre.toLowerCase() === cleanName.toLowerCase())) {
        newItems.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `loc-${Date.now()}-${Math.random()}`,
          nombre: cleanName,
        });
      }
    }

    if (newItems.length > 0) {
      onBulkAddLocalidades(newItems);
      return { success: true, count: newItems.length };
    }
    return { success: false, count: 0, error: 'No se encontraron localidades nuevas para agregar.' };
  };

  const filteredLocalidades = localidades.filter((l) =>
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Search & Actions Bar matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            CARGA MASIVA (TEXTO)
          </button>
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

      {/* Card 1: Registrar Nueva Localidad */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-4">
          {editingId ? 'Editar Localidad' : 'Registrar Nueva Localidad'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
              NOMBRE DE LOCALIDAD
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. CDMX, Oaxaca, Xala..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-black hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setNombre('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      {/* Card 2: Listado de Localidades */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Listado de Localidades
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredLocalidades.length} sedes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLocalidades.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{loc.nombre}</td>
                  <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">{loc.id}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(loc)}
                        className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Editar localidad"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la localidad "${loc.nombre}"?`)) {
                            onDeleteLocalidad(loc.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Eliminar localidad"
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
        title="Carga Masiva de Localidades"
        formatGuide="NOMBRE DE LOCALIDAD (Una por línea)"
        placeholderText="CDMX&#10;Oaxaca&#10;Xalapa&#10;Puebla&#10;Veracruz"
        onImport={handleBulkImport}
      />
    </div>
  );
};
