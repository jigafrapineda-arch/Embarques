import React, { useState, useMemo } from 'react';
import {
  Search,
  Table as TableIcon,
  AlertTriangle,
  Download,
  Trash2,
  FilterX,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { BitacoraRegistro } from '../types';
import { exportToExcel } from '../utils/exportExcel';

interface HistorialViewProps {
  registros: BitacoraRegistro[];
  onDepurarHistorial: () => void;
  onDeleteRegistro?: (id: string) => void;
}

export const HistorialView: React.FC<HistorialViewProps> = ({
  registros,
  onDepurarHistorial,
}) => {
  const [activeTab, setActiveTab] = useState<'tabla' | 'incidencias'>('tabla');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showDepurarConfirm, setShowDepurarConfirm] = useState(false);

  // Column specific filters
  const [colFilters, setColFilters] = useState<{
    fecha: string;
    claveOp: string;
    unidad: string;
    operador: string;
    placas: string;
    modelo: string;
    kmSal: string;
    gasSal: string;
    claveRuta: string;
    ruta: string;
    iniEmb: string;
    pedidos: string;
    hSalida: string;
  }>({
    fecha: '',
    claveOp: '',
    unidad: '',
    operador: '',
    placas: '',
    modelo: '',
    kmSal: '',
    gasSal: '',
    claveRuta: '',
    ruta: '',
    iniEmb: '',
    pedidos: '',
    hSalida: '',
  });

  const handleColFilterChange = (col: keyof typeof colFilters, val: string) => {
    setColFilters((prev) => ({ ...prev, [col]: val }));
  };

  const clearAllFilters = () => {
    setGlobalSearch('');
    setColFilters({
      fecha: '',
      claveOp: '',
      unidad: '',
      operador: '',
      placas: '',
      modelo: '',
      kmSal: '',
      gasSal: '',
      claveRuta: '',
      ruta: '',
      iniEmb: '',
      pedidos: '',
      hSalida: '',
    });
  };

  const filteredRegistros = useMemo(() => {
    return registros.filter((reg) => {
      // If incidencias tab is selected, only show items with incidencias or remarks
      if (activeTab === 'incidencias' && !reg.incidencia && !reg.detalleIncidencia) {
        return false;
      }

      // Global search across common fields
      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase();
        const matchesGlobal =
          reg.fecha.toLowerCase().includes(query) ||
          reg.claveOperador.toLowerCase().includes(query) ||
          reg.unidad.toLowerCase().includes(query) ||
          reg.nombreOperador.toLowerCase().includes(query) ||
          reg.placas.toLowerCase().includes(query) ||
          (reg.modelo || '').toLowerCase().includes(query) ||
          reg.claveRuta.toLowerCase().includes(query) ||
          reg.nombreRuta.toLowerCase().includes(query) ||
          (reg.pedidos || '').toLowerCase().includes(query);

        if (!matchesGlobal) return false;
      }

      // Column filters
      if (colFilters.fecha && !reg.fecha.toLowerCase().includes(colFilters.fecha.toLowerCase()))
        return false;
      if (
        colFilters.claveOp &&
        !reg.claveOperador.toLowerCase().includes(colFilters.claveOp.toLowerCase())
      )
        return false;
      if (
        colFilters.unidad &&
        !reg.unidad.toLowerCase().includes(colFilters.unidad.toLowerCase())
      )
        return false;
      if (
        colFilters.operador &&
        !reg.nombreOperador.toLowerCase().includes(colFilters.operador.toLowerCase())
      )
        return false;
      if (
        colFilters.placas &&
        !reg.placas.toLowerCase().includes(colFilters.placas.toLowerCase())
      )
        return false;
      if (
        colFilters.modelo &&
        !(reg.modelo || '').toLowerCase().includes(colFilters.modelo.toLowerCase())
      )
        return false;
      if (
        colFilters.kmSal &&
        !String(reg.kmSalida).toLowerCase().includes(colFilters.kmSal.toLowerCase())
      )
        return false;
      if (
        colFilters.gasSal &&
        !reg.gasolinaSalida.toLowerCase().includes(colFilters.gasSal.toLowerCase())
      )
        return false;
      if (
        colFilters.claveRuta &&
        !reg.claveRuta.toLowerCase().includes(colFilters.claveRuta.toLowerCase())
      )
        return false;
      if (
        colFilters.ruta &&
        !reg.nombreRuta.toLowerCase().includes(colFilters.ruta.toLowerCase())
      )
        return false;
      if (
        colFilters.iniEmb &&
        !reg.inicioEmbarque.toLowerCase().includes(colFilters.iniEmb.toLowerCase())
      )
        return false;
      if (
        colFilters.pedidos &&
        !(reg.pedidos || '').toLowerCase().includes(colFilters.pedidos.toLowerCase())
      )
        return false;
      if (
        colFilters.hSalida &&
        !(reg.horaSalida || '').toLowerCase().includes(colFilters.hSalida.toLowerCase())
      )
        return false;

      return true;
    });
  }, [registros, activeTab, globalSearch, colFilters]);

  const handleExportExcel = () => {
    const exportData = filteredRegistros.map((r, idx) => ({
      '#': idx + 1,
      FECHA: r.fecha,
      'CLAVE OP.': r.claveOperador,
      UNIDAD: r.unidad,
      OPERADOR: r.nombreOperador,
      PLACAS: r.placas,
      MODELO: r.modelo || '',
      'KM SALIDA': r.kmSalida,
      'GAS SALIDA': r.gasolinaSalida,
      'CLAVE RUTA': r.claveRuta,
      RUTA: r.nombreRuta,
      'INI EMBARQUE': r.inicioEmbarque,
      PEDIDOS: r.pedidos || '',
      'HORA SALIDA': r.horaSalida || '',
      'KM ARRIBO': r.kmArribo || '',
      'GAS ARRIBO': r.gasolinaArribo || '',
      'HORA ARRIBO': r.horaArribo || '',
      ESTADO: r.estado,
      INCIDENCIA: r.incidencia ? 'SÍ' : 'NO',
      'DETALLE INCIDENCIA': r.detalleIncidencia || '',
      OBSERVACIONES: r.observaciones || '',
    }));

    exportToExcel(exportData, `Bitacora-Embarques-${new Date().toISOString().split('T')[0]}`);
  };

  const hasActiveFilters =
    Boolean(globalSearch) || Object.values(colFilters).some((v) => Boolean(v));

  return (
    <div className="space-y-5 pb-12">
      {/* Top Search and Actions Bar matching Screenshot 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Filtrar historial..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}

          {/* Tabla toggle */}
          <button
            onClick={() => setActiveTab('tabla')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'tabla'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabla
          </button>

          {/* Incidencias toggle */}
          <button
            onClick={() => setActiveTab('incidencias')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'incidencias'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Incidencias
          </button>

          {/* Exportar a Excel (green solid) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar a Excel
          </button>

          {/* Depurar (red outline) */}
          <button
            onClick={() => setShowDepurarConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Depurar
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            {activeTab === 'tabla' ? 'Historial Completo de Bitácora' : 'Registro de Incidencias'}
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredRegistros.length} registros
          </span>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-700 tracking-wider uppercase">
                {/* 1. FECHA */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>1. FECHA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.fecha}
                      onChange={(e) => handleColFilterChange('fecha', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-20"
                    />
                  </div>
                </th>

                {/* 2. CLAVE OP. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>2. CLAVE OP.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.claveOp}
                      onChange={(e) => handleColFilterChange('claveOp', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 3. UNIDAD */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>3. UNIDAD</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.unidad}
                      onChange={(e) => handleColFilterChange('unidad', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-18"
                    />
                  </div>
                </th>

                {/* 4. OPERADOR */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>4. OPERADOR</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.operador}
                      onChange={(e) => handleColFilterChange('operador', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28"
                    />
                  </div>
                </th>

                {/* 5. PLACAS */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>5. PLACAS</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.placas}
                      onChange={(e) => handleColFilterChange('placas', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-18"
                    />
                  </div>
                </th>

                {/* 6. MODELO */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>6. MODELO</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.modelo}
                      onChange={(e) => handleColFilterChange('modelo', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24"
                    />
                  </div>
                </th>

                {/* 7. KM SAL. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>7. KM SAL.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.kmSal}
                      onChange={(e) => handleColFilterChange('kmSal', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 8. GAS SAL. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>8. GAS SAL.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.gasSal}
                      onChange={(e) => handleColFilterChange('gasSal', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-14"
                    />
                  </div>
                </th>

                {/* 9. CLAVE RUTA */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>9. CLAVE RUTA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.claveRuta}
                      onChange={(e) => handleColFilterChange('claveRuta', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 10. RUTA */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>10. RUTA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.ruta}
                      onChange={(e) => handleColFilterChange('ruta', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24"
                    />
                  </div>
                </th>

                {/* 11. INI EMB. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>11. INI EMB.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.iniEmb}
                      onChange={(e) => handleColFilterChange('iniEmb', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-14"
                    />
                  </div>
                </th>

                {/* 12. PEDIDOS */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>12. PEDIDOS</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.pedidos}
                      onChange={(e) => handleColFilterChange('pedidos', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-20"
                    />
                  </div>
                </th>

                {/* 13. H. SALIDA */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>13. H. SALIDA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.hSalida}
                      onChange={(e) => handleColFilterChange('hSalida', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* ESTADO */}
                <th className="px-3.5 py-2.5 text-center">ESTADO</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    No se encontraron registros en la bitácora con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-3 font-mono text-slate-600 font-medium">
                      {row.fecha}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-800">
                      {row.claveOperador}
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-800">
                      {row.unidad}
                    </td>
                    <td className="px-3.5 py-3 font-bold text-slate-900 truncate max-w-[200px]">
                      {row.nombreOperador}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600">
                      {row.placas}
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 truncate max-w-[180px]">
                      {row.modelo || '-'}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-700 font-semibold">
                      {row.kmSalida}
                    </td>
                    <td className="px-3 py-3 text-slate-600 font-medium">
                      {row.gasolinaSalida}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-700 font-bold">
                      {row.claveRuta}
                    </td>
                    <td className="px-3.5 py-3 text-slate-700 font-medium">
                      {row.nombreRuta}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600">
                      {row.inicioEmbarque}
                    </td>
                    <td className="px-3.5 py-3 text-slate-700 font-medium truncate max-w-[220px]">
                      {row.pedidos || '-'}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600">
                      {row.horaSalida || '-'}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.estado === 'Arribado' || row.estado === 'Cerrado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.estado === 'En Ruta'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Depurar */}
      {showDepurarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">¿Depurar Historial?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción limpiará los registros de la bitácora conservando una copia de seguridad o reiniciando el periodo.
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
                  onDepurarHistorial();
                  setShowDepurarConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Confirmar Depuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
