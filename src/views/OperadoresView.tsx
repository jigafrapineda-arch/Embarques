import React, { useState } from 'react';
import {
  Search,
  Upload,
  Download,
  Camera,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Operador, Localidad } from '../types';
import { QrCodeDisplay } from '../components/QrCodeDisplay';
import { CargaMasivaModal } from '../components/CargaMasivaModal';
import { exportToExcel } from '../utils/exportExcel';

interface OperadoresViewProps {
  operadores: Operador[];
  localidades: Localidad[];
  onAddOperador: (operador: Operador) => void;
  onUpdateOperador: (id: string, updates: Partial<Operador>) => void;
  onDeleteOperador: (id: string) => void;
  onBulkAddOperadores: (operadores: Operador[]) => void;
}

export const OperadoresView: React.FC<OperadoresViewProps> = ({
  operadores,
  localidades,
  onAddOperador,
  onUpdateOperador,
  onDeleteOperador,
  onBulkAddOperadores,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [licencia, setLicencia] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [tipoSangre, setTipoSangre] = useState('O+');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [localidad, setLocalidad] = useState('CDMX');
  const [foto, setFoto] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clave.trim() || !nombre.trim()) {
      alert('Clave y Nombre completo son obligatorios.');
      return;
    }

    if (editingId) {
      onUpdateOperador(editingId, {
        clave: clave.toUpperCase(),
        nombre: nombre.toUpperCase(),
        telefono,
        licencia,
        contactoEmergencia,
        tipoSangre,
        fechaIngreso,
        localidad,
        foto,
      });
      setNotification(`Operador "${nombre}" actualizado.`);
      setEditingId(null);
    } else {
      const newOp: Operador = {
        id: crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}`,
        clave: clave.toUpperCase(),
        nombre: nombre.toUpperCase(),
        telefono: telefono || '55 1234 5678',
        licencia: licencia || 'ABC123456',
        contactoEmergencia: contactoEmergencia || 'Familia',
        tipoSangre: tipoSangre || 'O+',
        fechaIngreso: fechaIngreso || new Date().toISOString().split('T')[0],
        localidad: localidad || 'CDMX',
        foto,
      };
      onAddOperador(newOp);
      setNotification(`Operador "${newOp.nombre}" registrado.`);
    }

    // Reset
    setClave('');
    setNombre('');
    setTelefono('');
    setLicencia('');
    setContactoEmergencia('');
    setTipoSangre('O+');
    setFechaIngreso('');
    setLocalidad('CDMX');
    setFoto('');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (op: Operador) => {
    setEditingId(op.id);
    setClave(op.clave);
    setNombre(op.nombre);
    setTelefono(op.telefono);
    setLicencia(op.licencia || '');
    setContactoEmergencia(op.contactoEmergencia || '');
    setTipoSangre(op.tipoSangre || 'O+');
    setFechaIngreso(op.fechaIngreso || '');
    setLocalidad(op.localidad);
    setFoto(op.foto || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    const data = operadores.map((o) => ({
      ID: o.id,
      CLAVE: o.clave,
      NOMBRE: o.nombre,
      TELÉFONO: o.telefono,
      LOCALIDAD: o.localidad,
      LICENCIA: o.licencia || '',
      'TIPO DE SANGRE': o.tipoSangre || '',
      'FECHA INGRESO': o.fechaIngreso || '',
      'CONTACTO EMERGENCIA': o.contactoEmergencia || '',
    }));
    exportToExcel(data, `Listado-Operadores-${new Date().toISOString().split('T')[0]}`);
  };

  const handleBulkImport = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const imported: Operador[] = [];

    for (const line of lines) {
      // Format: CLAVE, NOMBRE, TELEFONO, LOCALIDAD
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        imported.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random()}`,
          clave: parts[0].toUpperCase(),
          nombre: parts[1].toUpperCase(),
          telefono: parts[2] || '5500000000',
          localidad: parts[3] || 'CDMX',
          licencia: 'LIC-AUTO',
          tipoSangre: 'O+',
        });
      }
    }

    if (imported.length > 0) {
      onBulkAddOperadores(imported);
      return { success: true, count: imported.length };
    }
    return { success: false, count: 0, error: 'No se reconocieron registros válidos.' };
  };

  const filteredOperadores = operadores.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.clave.toLowerCase().includes(q) ||
      o.nombre.toLowerCase().includes(q) ||
      o.telefono.toLowerCase().includes(q) ||
      o.localidad.toLowerCase().includes(q)
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

      {/* Top Search & Actions Bar matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por clave, nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Carga Masiva (Texto) */}
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
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

      {/* Card 1: Registrar Nuevo Operador */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h2 className="text-base font-black text-slate-800 tracking-tight mb-5">
          {editingId ? 'Editar Operador' : 'Registrar Nuevo Operador'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left form fields (lg:col-span-9) */}
            <div className="lg:col-span-9 space-y-4">
              {/* Row 1: Foto, ID Interno, Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* FOTO */}
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    FOTO
                  </label>
                  <label className="flex items-center justify-center w-12 h-10 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-slate-500">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setFoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* ID INTERNO */}
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

                {/* CLAVE */}
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    CLAVE
                  </label>
                  <input
                    type="text"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    placeholder="Ej: OP-001"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                  />
                </div>
              </div>

              {/* Row 2: Nombre Completo, Número Celular, Licencia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    NOMBRE COMPLETO
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del operador"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    NÚMERO CELULAR
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    LICENCIA
                  </label>
                  <input
                    type="text"
                    value={licencia}
                    onChange={(e) => setLicencia(e.target.value)}
                    placeholder="ABC123456"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium uppercase"
                  />
                </div>
              </div>

              {/* Row 3: Contacto Emergencia, Tipo de Sangre, Fecha de Ingreso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    CONTACTO EMERGENCIA
                  </label>
                  <input
                    type="text"
                    value={contactoEmergencia}
                    onChange={(e) => setContactoEmergencia(e.target.value)}
                    placeholder="Nombre y Teléfono"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    TIPO DE SANGRE
                  </label>
                  <input
                    type="text"
                    value={tipoSangre}
                    onChange={(e) => setTipoSangre(e.target.value)}
                    placeholder="O+"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    FECHA DE INGRESO
                  </label>
                  <input
                    type="date"
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                    placeholder="dd / mm / aaaa"
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Localidad */}
              <div className="max-w-xs">
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
                value={clave}
                title="GENERADOR DE QR"
                labelPrefix="CLAVE OPERADOR"
                subtitleValue={clave}
                fileNamePrefix="operador-qr"
              />
            </div>
          </div>

          {/* Full width button: + Agregar */}
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

      {/* Card 2: Listado de Operadores */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Listado de Operadores
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredOperadores.length} registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Clave</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Teléfono</th>
                <th className="px-5 py-3">Localidad</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOperadores.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                    {op.id}
                  </td>
                  <td className="px-5 py-3.5 font-black text-slate-900">{op.clave}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{op.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{op.telefono}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">{op.localidad}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(op)}
                        className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Editar operador"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar operador ${op.nombre}?`)) {
                            onDeleteOperador(op.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Eliminar operador"
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
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Carga Masiva de Operadores"
        formatGuide="CLAVE, NOMBRE COMPLETO, TELÉFONO, LOCALIDAD"
        placeholderText="OP-01, JUAN PEREZ, 5512345678, CDMX&#10;OP-02, MARIA LOPEZ, 5587654321, Oaxaca"
        onImport={handleBulkImport}
      />
    </div>
  );
};
