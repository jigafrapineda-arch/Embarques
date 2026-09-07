import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Truck,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  X,
  Gauge,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { BitacoraRegistro } from '../types';

export interface ConflictoEnRutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  camionetaClave: string;
  camionetaModelo?: string;
  camionetaPlacas?: string;
  registroEnRuta: BitacoraRegistro;
  intentAction?: 'salida' | 'entrada' | 'guardar_salida';
  onFinalizarViajeAnterior: (params: {
    id: string;
    horaArribo: string;
    kmArribo: number | string;
    gasolinaArribo: string;
    observaciones?: string;
  }) => void;
  onMantenerEnRuta: () => void;
}

export const ConflictoEnRutaModal: React.FC<ConflictoEnRutaModalProps> = ({
  isOpen,
  onClose,
  camionetaClave,
  camionetaModelo,
  camionetaPlacas,
  registroEnRuta,
  intentAction = 'salida',
  onFinalizarViajeAnterior,
  onMantenerEnRuta,
}) => {
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [horaArribo, setHoraArribo] = useState(currentTime);
  const [kmArribo, setKmArribo] = useState<string>('');
  const [gasolinaArribo, setGasolinaArribo] = useState<string>('.50');
  const [observaciones, setObservaciones] = useState<string>(
    'Arribo registrado retroactivamente antes de nueva salida'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize arrival time whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setHoraArribo(new Date().toTimeString().slice(0, 5));
      setKmArribo('');
      setGasolinaArribo(registroEnRuta.gasolinaSalida || '.50');
      setObservaciones('Arribo registrado retroactivamente antes de nueva salida');
      setErrorMsg(null);
    }
  }, [isOpen, registroEnRuta]);

  if (!isOpen) return null;

  const kmSalidaNum = Number(registroEnRuta.kmSalida);
  const kmArriboNum = Number(kmArribo);
  const hasValidKmSalida = !isNaN(kmSalidaNum) && kmSalidaNum > 0;
  const hasEnteredKmArribo = !isNaN(kmArriboNum) && kmArribo.trim() !== '';
  const kmDiff = hasValidKmSalida && hasEnteredKmArribo ? kmArriboNum - kmSalidaNum : null;

  const handleSubmitFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!horaArribo.trim()) {
      setErrorMsg('Por favor especifique la hora de arribo del viaje anterior.');
      return;
    }
    if (!kmArribo.trim()) {
      setErrorMsg('El kilometraje de arribo es obligatorio para cerrar el viaje y calcular la nueva salida.');
      return;
    }
    if (isNaN(kmArriboNum) || kmArriboNum <= 0) {
      setErrorMsg('Ingrese un valor numérico válido para el kilometraje de arribo.');
      return;
    }

    if (hasValidKmSalida && kmArriboNum < kmSalidaNum) {
      const confirmLower = window.confirm(
        `El kilometraje de arribo (${kmArriboNum} km) es menor que el de salida (${kmSalidaNum} km). ¿Desea guardarlo de todas formas?`
      );
      if (!confirmLower) return;
    }

    onFinalizarViajeAnterior({
      id: registroEnRuta.id,
      horaArribo: horaArribo.trim(),
      kmArribo: kmArriboNum,
      gasolinaArribo,
      observaciones: observaciones.trim() || undefined,
    });
  };

  const actionLabel =
    intentAction === 'entrada'
      ? 'registrar una nueva entrada / embarque'
      : 'asignar o escanear una nueva hora de salida';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md text-amber-100 border border-white/20">
                  Validación de Tránsito
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              </div>
              <h3 className="text-base font-black tracking-tight text-white mt-0.5">
                La camioneta ya se encuentra en ruta
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onMantenerEnRuta}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar y mantener en ruta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main alert callout */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <p className="font-bold">
                No es posible {actionLabel} para la unidad{' '}
                <strong className="font-mono text-amber-950 font-black px-1.5 py-0.5 bg-amber-200 rounded">
                  {camionetaClave}
                </strong>{' '}
                {camionetaPlacas ? `(${camionetaPlacas})` : ''} porque sigue registrada como{' '}
                <span className="text-rose-700 font-black underline uppercase">"En Ruta"</span> en un viaje anterior.
              </p>
              <p className="text-amber-900 leading-relaxed">
                Esto ocurre cuando la camioneta regresa a las instalaciones pero se olvidó capturar su llegada en{' '}
                <strong>Bloque 3: Arribo</strong>. Para evitar duplicidad de folios y mantener la precisión del kilometraje,
                debe finalizarse el viaje anterior.
              </p>
            </div>
          </div>

          {/* Details of the Unfinalized Trip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                <Truck className="w-4 h-4 text-slate-600" />
                <span>Datos del Viaje Anterior No Finalizado</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-md">
                Folio: {registroEnRuta.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Fecha y Salida</span>
                <div className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{registroEnRuta.fecha} • {registroEnRuta.horaSalida || '00:00'}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Ruta Programada</span>
                <div className="font-black text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{registroEnRuta.claveRuta} - {registroEnRuta.nombreRuta}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Operador</span>
                <div className="font-black text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{registroEnRuta.nombreOperador || registroEnRuta.claveOperador}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">KM de Salida Previo</span>
                <span className="font-mono font-black text-slate-900 text-sm block mt-0.5">
                  {registroEnRuta.kmSalida || 'Sin registrar'} km
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Gasolina de Salida</span>
                <span className="font-black text-slate-800 block mt-0.5">
                  {registroEnRuta.gasolinaSalida ? `${registroEnRuta.gasolinaSalida} tanq.` : 'N/A'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Pedidos Asignados</span>
                <span className="font-black text-slate-800 block mt-0.5">
                  {registroEnRuta.pedidos || 'Sin pedidos'}
                </span>
              </div>
            </div>
          </div>

          {/* Solution form: Finalize previous trip now */}
          <form onSubmit={handleSubmitFinalizar} className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ¿Gusta finalizar el viaje anterior en este momento?
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Capture la llegada para archivar el viaje anterior. El odómetro de arribo se usará automáticamente como el KM de salida de su nuevo viaje.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Hora de Arribo */}
              <div>
                <label className="block text-[11px] font-black text-emerald-950 uppercase mb-1">
                  Hora de Arribo <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={horaArribo}
                    onChange={(e) => setHoraArribo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-emerald-500 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xs"
                  />
                  <Clock className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <span className="text-[9.5px] text-emerald-800 mt-1 block">
                  Hora en que regresó la camioneta.
                </span>
              </div>

              {/* Kilometraje de Arribo */}
              <div>
                <label className="block text-[11px] font-black text-emerald-950 uppercase mb-1">
                  KM de Arribo <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={kmArribo}
                    onChange={(e) => {
                      setKmArribo(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={hasValidKmSalida ? `Ej: ${kmSalidaNum + 45}` : 'Ej: 88950'}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-emerald-500 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xs font-mono"
                  />
                  <Gauge className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                {hasValidKmSalida && (
                  <span className="text-[9.5px] text-emerald-800 mt-1 block font-medium">
                    Salida previa fue: <strong>{kmSalidaNum} km</strong>
                  </span>
                )}
              </div>

              {/* Gasolina de Arribo */}
              <div>
                <label className="block text-[11px] font-black text-emerald-950 uppercase mb-1">
                  Gasolina de Arribo
                </label>
                <select
                  value={gasolinaArribo}
                  onChange={(e) => setGasolinaArribo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-emerald-500 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xs"
                >
                  <option value=".25">1/4 (.25)</option>
                  <option value=".50">1/2 (.50)</option>
                  <option value=".75">3/4 (.75)</option>
                  <option value="1">Lleno (1.0)</option>
                </select>
                <span className="text-[9.5px] text-emerald-800 mt-1 block">
                  Nivel de combustible al regresar.
                </span>
              </div>
            </div>

            {/* Calculated Distance Feedback */}
            {kmDiff !== null && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                  kmDiff >= 0
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                <span>Recorrido calculado del viaje:</span>
                <span className="font-mono text-sm font-black">
                  {kmDiff >= 0 ? `+${kmDiff} km` : `${kmDiff} km (Revisar odómetro)`}
                </span>
              </div>
            )}

            {/* Observaciones (opcional) */}
            <div>
              <label className="block text-[11px] font-black text-emerald-950 uppercase mb-1">
                Nota / Observaciones de Cierre (Opcional)
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. Arribo capturado retroactivamente..."
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xs"
              />
            </div>

            {/* Action buttons inside form */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-200">
              <button
                type="button"
                onClick={onMantenerEnRuta}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer order-2 sm:order-1"
              >
                Cancelar (Mantener unidad en ruta)
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer order-1 sm:order-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Viaje Anterior y Continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
