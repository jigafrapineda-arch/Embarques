import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, Check, Search } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onScan: (value: string) => void;
  quickOptions?: { label: string; code: string; sub?: string }[];
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  title,
  onScan,
  quickOptions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'quick'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError('No se pudo acceder a la cámara. Puedes ingresar el código o seleccionar uno de la lista rápida.');
      setActiveTab('quick');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  const handleSelectCode = (code: string) => {
    onScan(code);
    onClose();
  };

  const filteredOptions = quickOptions.filter(
    (opt) =>
      opt.code.toLowerCase().includes(filterText.toLowerCase()) ||
      opt.label.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-500">Escanea o selecciona el identificador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-2 bg-slate-100 border-b border-slate-200/80 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Cámara en vivo
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Selección / Manual
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[280px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-emerald-400/60 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                  <div className="w-44 h-44 border-2 border-emerald-400 rounded-lg"></div>
                </div>
              </div>

              {cameraError && (
                <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center">
                  {cameraError}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-3 text-center">
                Apunta la cámara hacia el código QR de la credencial o unidad
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Manual input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ingreso Manual de Código
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej. OP-001, C02, CAM-01..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualCode.trim()) handleSelectCode(manualCode.trim());
                    }}
                    disabled={!manualCode.trim()}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Usar
                  </button>
                </div>
              </div>

              {/* Quick options list */}
              {quickOptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">
                      Disponibles en el Sistema
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {filteredOptions.length} resultados
                    </span>
                  </div>

                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filtrar por clave o nombre..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-1">
                    {filteredOptions.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectCode(item.code)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent text-left transition-all cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-800 group-hover:text-emerald-800">
                              {item.code}
                            </span>
                            {item.sub && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 font-medium">
                                {item.sub}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[240px]">
                            {item.label}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
