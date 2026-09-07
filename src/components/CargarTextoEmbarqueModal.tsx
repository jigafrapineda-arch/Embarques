import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ClipboardPaste,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  MapPin,
  Package,
  Clock,
  Gauge,
  Fuel,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
  ArrowRight,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Camioneta, Operador, Ruta, BitacoraRegistro } from '../types';
import {
  parseEmbarqueText,
  ParsedEmbarque,
  findMatchingOperador,
  findMatchingRuta,
  findMatchingCamioneta,
} from '../utils/parseEmbarqueText';

interface CargarTextoEmbarqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  camionetas: Camioneta[];
  operadores: Operador[];
  rutas: Ruta[];
  registros: BitacoraRegistro[];
  onSaveEmbarques: (nuevosEmbarques: BitacoraRegistro[], goToBitacora?: boolean) => void;
}

const SAMPLE_TEXT_1 = `FECHA: ${new Date().toISOString().split('T')[0]}
UNIDAD: NPBNV
OPERADOR: ERICK DAVID MONTAÑO BERNAL
RUTA: Maravatio
PEDIDOS: 16
HORA ENTRADA: 07:18
PLACAS: U87-BNV
KM SALIDA: 279322
GASOLINA: .25`;

const SAMPLE_TEXT_2 = `UNIDAD: U87-BNV
CLAVE OP: CO6
CODIGO RUTA: M01
PEDIDOS: 14
HORA ENTRADA: 07:30`;

const SAMPLE_TEXT_3 = `*DESPACHO DE EMBARQUE*
Unidad: TK-1018
Operador: GUILLERMO VELAZQUEZ
Destino: R10
Pedidos: 22
Entrada: 07:45
Gasolina: 1/2`;

export const CargarTextoEmbarqueModal: React.FC<CargarTextoEmbarqueModalProps> = ({
  isOpen,
  onClose,
  camionetas,
  operadores,
  rutas,
  registros,
  onSaveEmbarques,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedEmbarque[]>([]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Helper to obtain previous arrival km for a unit
  const getLastKmArriboForUnit = (unitKey: string): number | null => {
    if (!unitKey) return null;
    const upper = unitKey.trim().toUpperCase();
    const recordsWithArribo = registros.filter(
      (r) =>
        r.unidad.toUpperCase() === upper &&
        r.kmArribo !== undefined &&
        r.kmArribo !== null &&
        String(r.kmArribo).trim() !== '' &&
        !isNaN(Number(r.kmArribo)) &&
        Number(r.kmArribo) > 0
    );
    if (recordsWithArribo.length === 0) return null;

    const sorted = [...recordsWithArribo].sort((a, b) => {
      const timeA = a.id.startsWith('bit-') ? Number(a.id.replace('bit-', '')) || 0 : 0;
      const timeB = b.id.startsWith('bit-') ? Number(b.id.replace('bit-', '')) || 0 : 0;
      if (timeA && timeB) return timeB - timeA;
      return (b.fecha || '').localeCompare(a.fecha || '');
    });

    return Number(sorted[0].kmArribo) || null;
  };

  // Re-parse automatically when raw text changes
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedItems([]);
      return;
    }

    const results = parseEmbarqueText(rawText, camionetas, operadores, rutas);

    // Apply retroalimentación for kmSalida if empty and previous arrival km exists
    const enriched = results.map((item) => {
      const lastKm = getLastKmArriboForUnit(item.unidad);
      if (!item.kmSalida && lastKm) {
        return {
          ...item,
          kmSalida: String(lastKm),
        };
      }
      return item;
    });

    setParsedItems(enriched);
  }, [rawText, camionetas, operadores, rutas]);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setRawText(clipText);
        setCopiedNotification('✓ Texto pegado exitosamente desde el portapapeles.');
        setTimeout(() => setCopiedNotification(null), 3000);
      } else {
        setCopiedNotification('El portapapeles está vacío.');
        setTimeout(() => setCopiedNotification(null), 3000);
      }
    } catch {
      setCopiedNotification('No se pudo acceder al portapapeles. Por favor use Ctrl+V o pegue manualmente.');
      setTimeout(() => setCopiedNotification(null), 4000);
    }
  };

  const handleLoadSample = (sample: string) => {
    setRawText(sample);
    setCopiedNotification('✓ Ejemplo cargado y procesado.');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleUpdateItem = (index: number, updates: Partial<ParsedEmbarque>) => {
    setParsedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOperadorClaveChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { claveOperador: '', matchedOperador: undefined });
      return;
    }
    const match = findMatchingOperador(trimmed, operadores);
    if (match) {
      handleUpdateItem(index, {
        claveOperador: match.clave,
        nombreOperador: match.nombre,
        matchedOperador: match,
      });
    } else {
      handleUpdateItem(index, {
        claveOperador: val.toUpperCase(),
        matchedOperador: undefined,
      });
    }
  };

  const handleOperadorNombreChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { nombreOperador: '', matchedOperador: undefined });
      return;
    }
    const match = findMatchingOperador(trimmed, operadores);
    if (match) {
      handleUpdateItem(index, {
        claveOperador: match.clave,
        nombreOperador: match.nombre,
        matchedOperador: match,
      });
    } else {
      handleUpdateItem(index, {
        nombreOperador: val,
        matchedOperador: undefined,
      });
    }
  };

  const handleRutaCodigoChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { claveRuta: '', matchedRuta: undefined });
      return;
    }
    const match = findMatchingRuta(trimmed, rutas);
    if (match) {
      handleUpdateItem(index, {
        claveRuta: match.codigo,
        nombreRuta: match.nombre,
        matchedRuta: match,
      });
    } else {
      handleUpdateItem(index, {
        claveRuta: val.toUpperCase(),
        matchedRuta: undefined,
      });
    }
  };

  const handleRutaNombreChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { nombreRuta: '', matchedRuta: undefined });
      return;
    }
    const match = findMatchingRuta(trimmed, rutas);
    if (match) {
      handleUpdateItem(index, {
        claveRuta: match.codigo,
        nombreRuta: match.nombre,
        matchedRuta: match,
      });
    } else {
      handleUpdateItem(index, {
        nombreRuta: val,
        matchedRuta: undefined,
      });
    }
  };

  const handleUnidadChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { unidad: '', matchedUnidad: undefined });
      return;
    }
    const match = findMatchingCamioneta(trimmed, camionetas);
    if (match) {
      const lastKm = getLastKmArriboForUnit(match.clave);
      handleUpdateItem(index, {
        unidad: match.clave,
        placas: match.placa,
        modelo: match.modelo,
        matchedUnidad: match,
        ...(lastKm ? { kmSalida: String(lastKm) } : {}),
      });
    } else {
      handleUpdateItem(index, {
        unidad: val.toUpperCase(),
        matchedUnidad: undefined,
      });
    }
  };

  const handlePlacasChange = (index: number, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      handleUpdateItem(index, { placas: '' });
      return;
    }
    const match = findMatchingCamioneta(trimmed, camionetas);
    if (match) {
      const lastKm = getLastKmArriboForUnit(match.clave);
      handleUpdateItem(index, {
        unidad: match.clave,
        placas: match.placa,
        modelo: match.modelo,
        matchedUnidad: match,
        ...(lastKm ? { kmSalida: String(lastKm) } : {}),
      });
    } else {
      handleUpdateItem(index, {
        placas: val.toUpperCase(),
      });
    }
  };

  const handleAddBlankItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    const newItem: ParsedEmbarque = {
      id: `emb-${Date.now()}-${parsedItems.length}`,
      fecha: today,
      unidad: '',
      claveOperador: '',
      nombreOperador: '',
      placas: '',
      modelo: '',
      claveRuta: '',
      nombreRuta: '',
      inicioEmbarque: currentTime,
      pedidos: '1',
      horaSalida: '',
      kmSalida: '',
      gasolinaSalida: '.50',
      observaciones: '',
    };
    setParsedItems((prev) => [...prev, newItem]);
  };

  const handleConfirmSave = (goToBitacora = false) => {
    if (parsedItems.length === 0) return;

    const newRegistros: BitacoraRegistro[] = parsedItems.map((item, idx) => {
      const lastKm = getLastKmArriboForUnit(item.unidad);
      const finalKmSalida = item.kmSalida ? Number(item.kmSalida) || item.kmSalida : lastKm || '';

      return {
        id: `bit-${Date.now()}-${idx}`,
        fecha: item.fecha || new Date().toISOString().split('T')[0],
        claveOperador: item.claveOperador || 'CO1',
        unidad: item.unidad.toUpperCase() || 'UNIDAD',
        nombreOperador: item.nombreOperador || 'OPERADOR',
        placas: item.placas || '-',
        modelo: item.modelo || '',
        ultimaGasolina: item.gasolinaSalida || '.50',
        kmSalida: finalKmSalida,
        gasolinaSalida: item.gasolinaSalida || '.50',
        claveRuta: item.claveRuta.toUpperCase() || 'R10',
        nombreRuta: item.nombreRuta || 'RUTA PROGRAMADA',
        inicioEmbarque: item.inicioEmbarque || new Date().toTimeString().slice(0, 5),
        horaEntrada: item.inicioEmbarque || new Date().toTimeString().slice(0, 5),
        bloque1Completado: Boolean(finalKmSalida),
        pedidos: item.pedidos || '1',
        horaSalida: item.horaSalida || '',
        bloque2Completado: Boolean(item.horaSalida),
        estado: item.horaSalida ? 'En Ruta' : 'Salida',
        bloque3Completado: false,
        bloque4Completado: false,
        observaciones: item.observaciones || '',
      };
    });

    onSaveEmbarques(newRegistros, goToBitacora);
    onClose();
    setRawText('');
    setParsedItems([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Carga de Información de Embarque por Texto
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-Comprensión
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Pegue el texto emitido por el sistema al realizar el primer escaneo de la bitácora.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {copiedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {/* Quick Actions & Format Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Pegar desde portapapeles
              </button>

              <span className="text-slate-300">|</span>

              <span className="text-[11px] font-bold text-slate-500">Probar ejemplo:</span>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_TEXT_1)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                1. NPBNV (Detallado)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_TEXT_2)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                2. Delimitado (|)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_TEXT_3)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                3. Texto Libre
              </button>
            </div>

            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Limpiar texto
              </button>
            )}
          </div>

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Pegue aquí la información del escaneo o sistema:
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Soporta clave-valor, delimitado con barra (|), tabuladores de Excel o texto libre.
              </span>
            </div>

            <div className="relative">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={5}
                placeholder={`Pegue aquí el texto... Por ejemplo:
UNIDAD: NPBNV
OPERADOR: GUILLERMO VELAZQUEZ FRANCO
RUTA: M01
PEDIDOS: 16
HORA ENTRADA: 07:18
PLACAS: U87-BNV
KM SALIDA: 279322`}
                className="w-full p-4 text-xs font-mono bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-2xl focus:outline-none focus:ring-3 focus:ring-emerald-400/20 text-slate-900 leading-relaxed shadow-inner resize-y transition-all"
              />
              {!rawText && (
                <div className="absolute right-4 bottom-4 pointer-events-none text-slate-300 flex items-center gap-1 text-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Procesamiento instantáneo
                </div>
              )}
            </div>
          </div>

          {/* Comprehended / Detected Output Cards */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Datos Comprendidos y Mapeados a Campos:
                </h4>
                {parsedItems.length > 0 && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {parsedItems.length} {parsedItems.length === 1 ? 'Embarque detectado' : 'Embarques detectados'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleAddBlankItem}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  + Agregar Fila Manual
                </button>
              </div>

              {parsedItems.length > 0 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Validación bidireccional activa: ingrese clave o nombre para completar automáticamente.
                </span>
              )}
            </div>

            {parsedItems.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ClipboardPaste className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  Aún no se ha ingresado información.
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  Pegue el texto arriba, use alguno de los ejemplos de prueba o pulse <strong>+ Agregar Fila Manual</strong> para probar la auto-completación de operadores y rutas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {parsedItems.map((item, idx) => {
                  const lastKm = getLastKmArriboForUnit(item.unidad);
                  const isUnitRecognized = Boolean(item.matchedUnidad);
                  const isOpRecognized = Boolean(item.matchedOperador);
                  const isRutaRecognized = Boolean(item.matchedRuta);

                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 relative"
                    >
                      {/* Top Bar of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900 uppercase">
                            Embarque: {item.unidad || 'Pendiente'}
                          </span>
                          {isUnitRecognized && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Unidad Verificada ({item.matchedUnidad?.placa})
                            </span>
                          )}
                          {isOpRecognized && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operador: {item.matchedOperador?.clave}
                            </span>
                          )}
                          {isRutaRecognized && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ruta: {item.matchedRuta?.codigo}
                            </span>
                          )}
                        </div>

                        {parsedItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer transition-colors"
                            title="Quitar este embarque"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Fields Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                        {/* 1. FECHA */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" /> Fecha
                          </label>
                          <input
                            type="date"
                            value={item.fecha}
                            onChange={(e) => handleUpdateItem(idx, { fecha: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 2. UNIDAD */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600" /> Unidad / Camioneta
                          </label>
                          <input
                            type="text"
                            list="datalist-camionetas"
                            value={item.unidad}
                            onChange={(e) => handleUnidadChange(idx, e.target.value)}
                            placeholder="Ej: NPBNV o TK-1018"
                            className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-xl font-black text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 uppercase"
                          />
                          {item.matchedUnidad ? (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1 truncate">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              {item.matchedUnidad.clave} ({item.matchedUnidad.placa})
                              {item.matchedUnidad.claveToka ? ` • Toka: ${item.matchedUnidad.claveToka}` : ''}
                            </span>
                          ) : item.unidad ? (
                            <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" /> Unidad personalizada o externa
                            </span>
                          ) : null}
                        </div>

                        {/* 3. CLAVE OP & NOMBRE OPERADOR (BIDIRECCIONAL) */}
                        <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" /> Operador (Código y Nombre)
                            </span>
                            <span className="text-[9.5px] text-emerald-700 font-semibold lowercase">
                              (ingrese código o nombre)
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              list="datalist-operadores-clave"
                              value={item.claveOperador}
                              onChange={(e) => handleOperadorClaveChange(idx, e.target.value)}
                              placeholder="Código (CO6)"
                              title="Ingrese código (ej: CO6) o nombre para autocompletar"
                              className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              list="datalist-operadores-nombre"
                              value={item.nombreOperador}
                              onChange={(e) => handleOperadorNombreChange(idx, e.target.value)}
                              placeholder="Nombre del operador..."
                              title="Ingrese nombre del operador o su código para autocompletar"
                              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          {item.matchedOperador ? (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1 truncate">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              Validado en catálogo: <strong className="font-mono text-emerald-950">{item.matchedOperador.clave}</strong> — {item.matchedOperador.nombre}
                            </span>
                          ) : (item.claveOperador || item.nombreOperador) ? (
                            <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                              Operador no registrado en catálogo de operadores (se guardará tal como se ingresó)
                            </span>
                          ) : null}
                        </div>

                        {/* 4. PLACAS */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                            Placas
                          </label>
                          <input
                            type="text"
                            value={item.placas}
                            onChange={(e) => handlePlacasChange(idx, e.target.value)}
                            placeholder="Placas"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 5. MODELO */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                            Modelo
                          </label>
                          <input
                            type="text"
                            value={item.modelo}
                            onChange={(e) => handleUpdateItem(idx, { modelo: e.target.value })}
                            placeholder="Modelo vehículo"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 6. CLAVE RUTA Y NOMBRE RUTA (BIDIRECCIONAL) */}
                        <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> Ruta Programada (Código y Destino)
                            </span>
                            <span className="text-[9.5px] text-emerald-700 font-semibold lowercase">
                              (ingrese código o nombre)
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              list="datalist-rutas-clave"
                              value={item.claveRuta}
                              onChange={(e) => handleRutaCodigoChange(idx, e.target.value)}
                              placeholder="Código (M01)"
                              title="Ingrese código (ej: M01) o nombre para autocompletar"
                              className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              list="datalist-rutas-nombre"
                              value={item.nombreRuta}
                              onChange={(e) => handleRutaNombreChange(idx, e.target.value)}
                              placeholder="Nombre o destino de la ruta (Maravatio)..."
                              title="Ingrese nombre de la ruta o código para autocompletar"
                              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          {item.matchedRuta ? (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1 truncate">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              Validada en catálogo: <strong className="font-mono text-emerald-950">{item.matchedRuta.codigo}</strong> — {item.matchedRuta.nombre}
                            </span>
                          ) : (item.claveRuta || item.nombreRuta) ? (
                            <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                              Ruta no registrada en catálogo de rutas (se guardará tal como se ingresó)
                            </span>
                          ) : null}
                        </div>

                        {/* 7. HORA ENTRADA / INICIO EMBARQUE */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" /> Hora Entrada (Bloque 2)
                          </label>
                          <input
                            type="time"
                            value={item.inicioEmbarque}
                            onChange={(e) => handleUpdateItem(idx, { inicioEmbarque: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-emerald-50/40 border border-emerald-300 rounded-xl font-black text-emerald-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 8. PEDIDOS */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                            <Package className="w-3 h-3 text-emerald-600" /> Pedidos / Cantidad
                          </label>
                          <input
                            type="text"
                            value={item.pedidos}
                            onChange={(e) => handleUpdateItem(idx, { pedidos: e.target.value })}
                            placeholder="Ej: 16 o PED-101"
                            className="w-full px-2.5 py-1.5 bg-emerald-50/40 border border-emerald-300 rounded-xl font-black text-emerald-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 9. KM SALIDA */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10.5px] font-bold text-slate-600 uppercase flex items-center gap-1">
                              <Gauge className="w-3 h-3 text-slate-400" /> KM Salida
                            </label>
                            {lastKm && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded flex items-center gap-0.5">
                                <RotateCcw className="w-2.5 h-2.5" /> Último arribo: {lastKm}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.kmSalida}
                            onChange={(e) => handleUpdateItem(idx, { kmSalida: e.target.value })}
                            placeholder={lastKm ? String(lastKm) : 'Ej: 279322'}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 10. GASOLINA */}
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-slate-400" /> Gasolina
                          </label>
                          <select
                            value={item.gasolinaSalida}
                            onChange={(e) => handleUpdateItem(idx, { gasolinaSalida: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value=".25">1/4 (.25)</option>
                            <option value=".50">1/2 (.50)</option>
                            <option value=".75">3/4 (.75)</option>
                            <option value="1.0">Lleno (1.0)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={parsedItems.length === 0}
              onClick={() => handleConfirmSave(false)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Guardar Embarque en Sistema
            </button>

            <button
              type="button"
              disabled={parsedItems.length === 0}
              onClick={() => handleConfirmSave(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>Guardar y Pasar a Bitácora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Datalists for Bi-directional Autocompletion */}
      <datalist id="datalist-camionetas">
        {camionetas.map((c) => (
          <option key={`dl-cam-${c.clave}`} value={c.clave}>
            {c.placa} {c.claveToka ? `[TOKA: ${c.claveToka}]` : ''} - {c.modelo}
          </option>
        ))}
      </datalist>

      <datalist id="datalist-operadores-clave">
        {operadores.map((op) => (
          <option key={`dl-op-c-${op.clave}`} value={op.clave}>
            {op.nombre}
          </option>
        ))}
      </datalist>

      <datalist id="datalist-operadores-nombre">
        {operadores.map((op) => (
          <option key={`dl-op-n-${op.clave}`} value={op.nombre}>
            Código: {op.clave}
          </option>
        ))}
      </datalist>

      <datalist id="datalist-rutas-clave">
        {rutas.map((r) => (
          <option key={`dl-rt-c-${r.codigo}`} value={r.codigo}>
            {r.nombre}
          </option>
        ))}
      </datalist>

      <datalist id="datalist-rutas-nombre">
        {rutas.map((r) => (
          <option key={`dl-rt-n-${r.codigo}`} value={r.nombre}>
            Código: {r.codigo}
          </option>
        ))}
      </datalist>
    </div>
  );
};
