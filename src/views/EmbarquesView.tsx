import React, { useState, useMemo } from 'react';
import {
  Search,
  FilterX,
  Download,
  Trash2,
  PackageCheck,
  ClipboardPaste,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
  Boxes,
  MapPin,
  User,
} from 'lucide-react';
import { BitacoraRegistro, Operador, Camioneta, Ruta } from '../types';
import { exportToExcel } from '../utils/exportExcel';
import { CargarTextoEmbarqueModal } from '../components/CargarTextoEmbarqueModal';

interface EmbarquesViewProps {
  registros: BitacoraRegistro[];
  camionetas: Camioneta[];
  operadores: Operador[];
  rutas: Ruta[];
  onSaveRegistro: (newReg: BitacoraRegistro) => void;
  onUpdateRegistro: (id: string, updates: Partial<BitacoraRegistro>) => void;
  onDeleteRegistro: (id: string) => void;
  onDepurarEmbarques: () => void;
  onNavigateToBitacora: (unidadKey?: string) => void;
}

export const EmbarquesView: React.FC<EmbarquesViewProps> = ({
  registros,
  camionetas,
  operadores,
  rutas,
  onSaveRegistro,
  onUpdateRegistro,
  onDeleteRegistro,
  onDepurarEmbarques,
  onNavigateToBitacora,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'todos' | 'carga' | 'en_ruta' | 'completados'>('todos');
  const [showDepurarConfirm, setShowDepurarConfirm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<BitacoraRegistro | null>(null);

  // Column specific filters
  const [colFilters, setColFilters] = useState<{
    fecha: string;
    claveOp: string;
    unidad: string;
    operador: string;
    placas: string;
    modelo: string;
    claveRuta: string;
    ruta: string;
    iniEmb: string;
    pedidos: string;
    hSalida: string;
    kmSal: string;
    gasSal: string;
  }>({
    fecha: '',
    claveOp: '',
    unidad: '',
    operador: '',
    placas: '',
    modelo: '',
    claveRuta: '',
    ruta: '',
    iniEmb: '',
    pedidos: '',
    hSalida: '',
    kmSal: '',
    gasSal: '',
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
      claveRuta: '',
      ruta: '',
      iniEmb: '',
      pedidos: '',
      hSalida: '',
      kmSal: '',
      gasSal: '',
    });
  };

  const hasActiveFilters =
    Boolean(globalSearch) || Object.values(colFilters).some((v) => Boolean(v));

  // Filtered shipments
  const filteredEmbarques = useMemo(() => {
    return registros.filter((reg) => {
      // Tab filter
      if (activeFilterTab === 'carga' && (reg.estado !== 'Salida' && reg.horaSalida)) {
        return false;
      }
      if (activeFilterTab === 'en_ruta' && reg.estado !== 'En Ruta') {
        return false;
      }
      if (activeFilterTab === 'completados' && reg.estado !== 'Arribado' && reg.estado !== 'Cerrado') {
        return false;
      }

      // Global query search
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
          (reg.pedidos || '').toLowerCase().includes(query) ||
          (reg.inicioEmbarque || '').toLowerCase().includes(query) ||
          (reg.horaSalida || '').toLowerCase().includes(query);

        if (!matchesGlobal) return false;
      }

      // Column filters
      if (colFilters.fecha && !reg.fecha.toLowerCase().includes(colFilters.fecha.toLowerCase()))
        return false;
      if (colFilters.claveOp && !reg.claveOperador.toLowerCase().includes(colFilters.claveOp.toLowerCase()))
        return false;
      if (colFilters.unidad && !reg.unidad.toLowerCase().includes(colFilters.unidad.toLowerCase()))
        return false;
      if (colFilters.operador && !reg.nombreOperador.toLowerCase().includes(colFilters.operador.toLowerCase()))
        return false;
      if (colFilters.placas && !reg.placas.toLowerCase().includes(colFilters.placas.toLowerCase()))
        return false;
      if (colFilters.modelo && !(reg.modelo || '').toLowerCase().includes(colFilters.modelo.toLowerCase()))
        return false;
      if (colFilters.claveRuta && !reg.claveRuta.toLowerCase().includes(colFilters.claveRuta.toLowerCase()))
        return false;
      if (colFilters.ruta && !reg.nombreRuta.toLowerCase().includes(colFilters.ruta.toLowerCase()))
        return false;
      if (colFilters.iniEmb && !(reg.inicioEmbarque || '').toLowerCase().includes(colFilters.iniEmb.toLowerCase()))
        return false;
      if (colFilters.pedidos && !(reg.pedidos || '').toLowerCase().includes(colFilters.pedidos.toLowerCase()))
        return false;
      if (colFilters.hSalida && !(reg.horaSalida || '').toLowerCase().includes(colFilters.hSalida.toLowerCase()))
        return false;
      if (colFilters.kmSal && !String(reg.kmSalida || '').toLowerCase().includes(colFilters.kmSal.toLowerCase()))
        return false;
      if (colFilters.gasSal && !String(reg.gasolinaSalida || '').toLowerCase().includes(colFilters.gasSal.toLowerCase()))
        return false;

      return true;
    });
  }, [registros, activeFilterTab, globalSearch, colFilters]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = registros.length;
    const enCarga = registros.filter((r) => r.estado === 'Salida' || (!r.horaSalida && r.inicioEmbarque)).length;
    const enRuta = registros.filter((r) => r.estado === 'En Ruta').length;
    const totalPedidos = registros.reduce((acc, curr) => {
      const parsed = parseInt(curr.pedidos || '0', 10);
      return acc + (isNaN(parsed) ? 1 : parsed);
    }, 0);

    return { total, enCarga, enRuta, totalPedidos };
  }, [registros]);

  const handleExportExcel = () => {
    const exportData = filteredEmbarques.map((r, idx) => ({
      '#': idx + 1,
      FECHA: r.fecha,
      'CLAVE OP.': r.claveOperador,
      UNIDAD: r.unidad,
      OPERADOR: r.nombreOperador,
      PLACAS: r.placas,
      MODELO: r.modelo || '',
      'CLAVE RUTA': r.claveRuta,
      RUTA: r.nombreRuta,
      'INICIO EMBARQUE (ENTRADA)': r.inicioEmbarque,
      PEDIDOS: r.pedidos || '',
      'HORA SALIDA': r.horaSalida || '',
      'KM SALIDA': r.kmSalida,
      'GAS SALIDA': r.gasolinaSalida,
      ESTADO: r.estado,
      OBSERVACIONES: r.observaciones || '',
    }));

    exportToExcel(exportData, `Embarques-Despacho-${new Date().toISOString().split('T')[0]}`);
  };

  const handleSaveBulkEmbarques = (nuevos: BitacoraRegistro[], goToBitacora?: boolean) => {
    nuevos.forEach((emb) => {
      onSaveRegistro(emb);
    });

    if (goToBitacora && nuevos.length > 0) {
      onNavigateToBitacora(nuevos[0].unidad);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Embarques</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</p>
          <span className="text-[11px] text-slate-400 font-medium">Registrados en el sistema</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">En Rampa / Carga</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{metrics.enCarga}</p>
          <span className="text-[11px] text-amber-600/80 font-medium">Hora de entrada registrada</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Unidades en Ruta</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{metrics.enRuta}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium">Hora de salida despachada</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Pedidos Totales</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-2">{metrics.totalPedidos}</p>
          <span className="text-[11px] text-indigo-600/80 font-medium">Volumen programado</span>
        </div>
      </div>

      {/* Top Search and Actions Bar matching Historial */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Filtrar embarques por unidad, operador, ruta, pedidos..."
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

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilterTab('todos')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeFilterTab === 'todos'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilterTab('carga')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeFilterTab === 'carga'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Carga
            </button>
            <button
              onClick={() => setActiveFilterTab('en_ruta')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeFilterTab === 'en_ruta'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Ruta
            </button>
          </div>

          {/* Cargar Texto Button (Prominent) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <ClipboardPaste className="w-4 h-4 text-emerald-400" />
            <span>Cargar Texto de Embarque</span>
          </button>

          {/* Exportar a Excel */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Excel
          </button>

          {/* Depurar */}
          <button
            onClick={() => setShowDepurarConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Depurar lista de embarques"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Depurar
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              Listado de Embarques y Despacho
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredEmbarques.length} embarques
          </span>
        </div>

        {/* Scrollable Table matching Historial layout */}
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

                {/* 2. UNIDAD */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>2. UNIDAD</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.unidad}
                      onChange={(e) => handleColFilterChange('unidad', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-18"
                    />
                  </div>
                </th>

                {/* 3. CLAVE OP. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>3. CLAVE OP.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.claveOp}
                      onChange={(e) => handleColFilterChange('claveOp', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
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

                {/* 7. CLAVE RUTA */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>7. CVE RUTA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.claveRuta}
                      onChange={(e) => handleColFilterChange('claveRuta', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 8. RUTA */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>8. RUTA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.ruta}
                      onChange={(e) => handleColFilterChange('ruta', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24"
                    />
                  </div>
                </th>

                {/* 9. INI EMBARQUE (ENTRADA) */}
                <th className="px-3.5 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>9. INI EMB.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.iniEmb}
                      onChange={(e) => handleColFilterChange('iniEmb', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 10. PEDIDOS */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>10. PEDIDOS</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.pedidos}
                      onChange={(e) => handleColFilterChange('pedidos', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 11. HORA SALIDA */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>11. H. SALIDA</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.hSalida}
                      onChange={(e) => handleColFilterChange('hSalida', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 12. KM SAL. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>12. KM SAL.</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.kmSal}
                      onChange={(e) => handleColFilterChange('kmSal', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-16"
                    />
                  </div>
                </th>

                {/* 13. GAS SAL. */}
                <th className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <span>13. GAS</span>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilters.gasSal}
                      onChange={(e) => handleColFilterChange('gasSal', e.target.value)}
                      className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-normal lowercase focus:outline-none focus:ring-1 focus:ring-emerald-500 w-14"
                    />
                  </div>
                </th>

                {/* 14. ESTADO */}
                <th className="px-3 py-2.5">ESTADO</th>

                {/* 15. ACCIONES */}
                <th className="px-3 py-2.5 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmbarques.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-slate-400">
                    <ClipboardPaste className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">No se encontraron embarques con los filtros actuales.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
                      Cargar Nuevo Embarque por Texto
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEmbarques.map((r, idx) => {
                  const isEnRuta = r.estado === 'En Ruta';
                  const isCarga = r.estado === 'Salida' || (!r.horaSalida && r.inicioEmbarque);

                  return (
                    <tr
                      key={r.id || idx}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Fecha */}
                      <td className="px-3.5 py-2.5 font-bold text-slate-800">{r.fecha}</td>

                      {/* 2. Unidad */}
                      <td className="px-3 py-2.5">
                        <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.unidad}
                        </span>
                      </td>

                      {/* 3. Clave Op */}
                      <td className="px-3 py-2.5 font-black text-slate-700">{r.claveOperador}</td>

                      {/* 4. Operador */}
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                        {r.nombreOperador}
                      </td>

                      {/* 5. Placas */}
                      <td className="px-3 py-2.5 font-mono text-slate-600 font-bold">{r.placas}</td>

                      {/* 6. Modelo */}
                      <td className="px-3.5 py-2.5 text-slate-600 truncate max-w-[140px]" title={r.modelo}>
                        {r.modelo || '-'}
                      </td>

                      {/* 7. Clave Ruta */}
                      <td className="px-3 py-2.5 font-black text-emerald-700">{r.claveRuta}</td>

                      {/* 8. Ruta */}
                      <td className="px-3.5 py-2.5 text-slate-700 font-medium truncate max-w-[130px]" title={r.nombreRuta}>
                        {r.nombreRuta}
                      </td>

                      {/* 9. Inicio Embarque (Entrada) */}
                      <td className="px-3.5 py-2.5 font-bold text-emerald-800">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {r.inicioEmbarque || '-'}
                        </span>
                      </td>

                      {/* 10. Pedidos */}
                      <td className="px-3 py-2.5">
                        <span className="font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {r.pedidos || '0'}
                        </span>
                      </td>

                      {/* 11. Hora Salida */}
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {r.horaSalida ? (
                          <span className="text-slate-800">{r.horaSalida}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pendiente</span>
                        )}
                      </td>

                      {/* 12. KM Salida */}
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                        {r.kmSalida || '-'}
                      </td>

                      {/* 13. Gas Salida */}
                      <td className="px-3 py-2.5 font-bold text-slate-700">
                        {r.gasolinaSalida || '-'}
                      </td>

                      {/* 14. Estado */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                            isEnRuta
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isCarga
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isEnRuta ? 'bg-emerald-500' : isCarga ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {r.estado || 'Salida'}
                        </span>
                      </td>

                      {/* 15. Acciones */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onNavigateToBitacora(r.unidad)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Despachar o Continuar en Bitácora"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDetail(r)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRegistro(r.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cargar Texto Modal */}
      <CargarTextoEmbarqueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        camionetas={camionetas}
        operadores={operadores}
        rutas={rutas}
        registros={registros}
        onSaveEmbarques={handleSaveBulkEmbarques}
      />

      {/* Depurar Confirmation Modal */}
      {showDepurarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">¿Depurar lista de embarques?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción limpiará los registros históricos y mantendrá únicamente los embarques de muestra.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDepurarConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDepurarEmbarques();
                  setShowDepurarConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Sí, Depurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    Embarque: {selectedDetail.unidad}
                  </h3>
                  <span className="text-xs text-slate-500">{selectedDetail.fecha}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Operador</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.nombreOperador}</p>
                <span className="text-[10px] text-slate-500">Clave: {selectedDetail.claveOperador}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehículo</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.placas}</p>
                <span className="text-[10px] text-slate-500">{selectedDetail.modelo || 'Sin modelo'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ruta</span>
                <p className="font-bold text-emerald-800 mt-0.5">{selectedDetail.nombreRuta}</p>
                <span className="text-[10px] text-emerald-600 font-black">Cve: {selectedDetail.claveRuta}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pedidos</span>
                <p className="font-black text-indigo-900 mt-0.5 text-sm">{selectedDetail.pedidos}</p>
                <span className="text-[10px] text-slate-500">Programados</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hora Entrada</span>
                <p className="font-black text-slate-800 mt-0.5">{selectedDetail.inicioEmbarque || '-'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hora Salida</span>
                <p className="font-black text-slate-800 mt-0.5">{selectedDetail.horaSalida || 'Pendiente'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Odómetro Salida</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedDetail.kmSalida || '-'} km</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gasolina Salida</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.gasolinaSalida || '-'}</p>
              </div>
            </div>

            {selectedDetail.observaciones && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Observaciones</span>
                <p className="text-slate-700">{selectedDetail.observaciones}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedDetail(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const u = selectedDetail.unidad;
                  setSelectedDetail(null);
                  onNavigateToBitacora(u);
                }}
                className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Cargar a Bitácora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
