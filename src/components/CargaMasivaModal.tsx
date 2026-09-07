import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface CargaMasivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholderText: string;
  formatGuide: string;
  onImport: (text: string) => { success: boolean; count: number; error?: string };
}

export const CargaMasivaModal: React.FC<CargaMasivaModalProps> = ({
  isOpen,
  onClose,
  title,
  placeholderText,
  formatGuide,
  onImport,
}) => {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!inputText.trim()) {
      setFeedback({ message: 'Por favor ingrese algún texto para procesar.', isError: true });
      return;
    }

    const res = onImport(inputText);
    if (res.success) {
      setFeedback({ message: `Se importaron exitosamente ${res.count} registros.`, isError: false });
      setTimeout(() => {
        setInputText('');
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      setFeedback({ message: res.error || 'Error al procesar el formato.', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-500">Carga por lotes desde texto o Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Formato recomendado:</span>
              <p className="text-emerald-700 text-[11px] mt-0.5 font-mono">{formatGuide}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pega aquí el contenido (un registro por línea):
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder={placeholderText}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.isError
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {feedback.isError && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcess}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Procesar Carga
          </button>
        </div>
      </div>
    </div>
  );
};
