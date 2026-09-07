import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { BitacoraRegistro, Operador, Camioneta, Ruta, Localidad } from '../types';

interface DashboardViewProps {
  registros: BitacoraRegistro[];
  operadores: Operador[];
  camionetas: Camioneta[];
  rutas: Ruta[];
  localidades: Localidad[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  registros,
  operadores,
  camionetas,
  rutas,
  localidades,
}) => {
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>('Todas');

  const filteredRegistros = useMemo(() => {
    if (selectedLocalidad === 'Todas') return registros;
    return registros.filter((r) => {
      const op = operadores.find((o) => o.clave === r.claveOperador);
      const cam = camionetas.find((c) => c.clave === r.unidad);
      const rut = rutas.find((rt) => rt.codigo === r.claveRuta);
      return (
        op?.localidad === selectedLocalidad ||
        cam?.localidad === selectedLocalidad ||
        rut?.localidad === selectedLocalidad
      );
    });
  }, [registros, operadores, camionetas, rutas, selectedLocalidad]);

  // Key metrics
  const totalSalidas = filteredRegistros.length;
  const enRuta = filteredRegistros.filter((r) => r.estado === 'En Ruta').length;
  const arribados = filteredRegistros.filter(
    (r) => r.estado === 'Arribado' || r.estado === 'Cerrado'
  ).length;
  const incidencias = filteredRegistros.filter((r) => r.incidencia).length;

  // Route statistics
  const rutaStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRegistros.forEach((r) => {
      const label = `${r.claveRuta} - ${r.nombreRuta}`;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredRegistros]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter and Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Tablero de Control Operativo
          </h2>
          <p className="text-xs text-slate-500">
            Monitoreo en tiempo real de embarques, flota y rutas de JIGAFRA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filtrar Sede:</span>
          <select
            value={selectedLocalidad}
            onChange={(e) => setSelectedLocalidad(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
          >
            <option value="Todas">Todas las sedes</option>
            {localidades.map((l) => (
              <option key={l.id} value={l.nombre}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Salidas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Embarques
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalSalidas}</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Registrados en bitácora</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* En Ruta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Unidades En Ruta
            </p>
            <p className="text-2xl font-black text-sky-700 mt-1">{enRuta}</p>
            <p className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5 mt-1">
              <Activity className="w-3 h-3" />
              <span>En tránsito activo</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Arribos Completados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Arribos Completados
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{arribados}</p>
            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 mt-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Retorno confirmado</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Incidencias */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Incidencias Reportadas
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">{incidencias}</p>
            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Demoras o eventos</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Rutas más activas & Estado de Flota */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rutas con mayor flujo (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Rutas con Mayor Flujo de Embarques
            </h3>
            <span className="text-[11px] text-slate-400">Top 5</span>
          </div>

          <div className="space-y-3 pt-1">
            {rutaStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Sin datos de rutas aún.</p>
            ) : (
              rutaStats.map(([rutaName, count]) => {
                const percentage = Math.round((count / (totalSalidas || 1)) * 100);
                return (
                  <div key={rutaName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[260px]">
                        {rutaName}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {count} viajes ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Resumen de Recursos (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Recursos Operativos Registrados
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase">Operadores</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{operadores.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Activos y autorizados</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase">Camionetas</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{camionetas.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Unidades en flota</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase">Rutas Asignadas</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{rutas.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Circuitos logísticos</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase">Localidades</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{localidades.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Sedes activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Live Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Últimos Movimientos en Bitácora
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Actualizado en vivo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-600 tracking-wider uppercase">
                <th className="px-5 py-3">Hora / Fecha</th>
                <th className="px-5 py-3">Unidad</th>
                <th className="px-5 py-3">Operador</th>
                <th className="px-5 py-3">Ruta</th>
                <th className="px-5 py-3">Km Salida</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRegistros.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono text-slate-600">
                    {r.fecha} {r.inicioEmbarque}
                  </td>
                  <td className="px-5 py-3 font-black text-emerald-800">{r.unidad}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{r.nombreOperador}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{r.nombreRuta}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.kmSalida} km</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.estado === 'Arribado' || r.estado === 'Cerrado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.estado === 'En Ruta'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
