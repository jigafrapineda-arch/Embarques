import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QrCodeDisplayProps {
  value: string;
  title: string;
  labelPrefix: string;
  subtitleValue: string;
  fileNamePrefix: string;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  title,
  labelPrefix,
  subtitleValue,
  fileNamePrefix,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    const textToEncode = value.trim() ? value.trim() : 'SIN_ASIGNAR';
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        textToEncode,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
          if (canvasRef.current) {
            setDataUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [value]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${fileNamePrefix}-${value || 'qr'}.png`;
    a.click();
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs w-full max-w-[210px] mx-auto">
      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
        {title}
      </span>

      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs mb-2">
        <canvas ref={canvasRef} className="w-[120px] h-[120px]" />
      </div>

      <span className="text-[9px] font-semibold text-slate-400 uppercase">
        {labelPrefix}
      </span>
      <span className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3 truncate max-w-[180px]">
        {subtitleValue || 'SIN ASIGNAR'}
      </span>

      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors w-full cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        DESCARGAR QR
      </button>
    </div>
  );
};
