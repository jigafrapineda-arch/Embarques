import React from 'react';

interface LogoProps {
  customLogo?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ customLogo, size = 'md', showSubtitle = true }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className="flex flex-col items-center">
      <div
        className={`bg-white border-2 border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-2.5 shadow-xs transition-transform ${
          isSm ? 'w-20 h-16' : isLg ? 'w-36 h-28' : 'w-28 h-22'
        }`}
      >
        {customLogo ? (
          <img
            src={customLogo}
            alt="Logo Empresa"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center select-none">
            {/* Emblem badge SVG */}
            <div className="relative mb-1 flex items-center justify-center">
              <svg
                viewBox="0 0 100 48"
                className={`${isSm ? 'w-12 h-6' : isLg ? 'w-20 h-10' : 'w-16 h-8'}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer curved frame */}
                <path
                  d="M10 38 C 25 8, 75 8, 90 38"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M18 38 C 30 14, 70 14, 82 38"
                  stroke="#059669"
                  strokeWidth="1.2"
                />
                {/* Stylized JIGAFRA signature symbol */}
                <path
                  d="M32 26 C 36 16, 44 14, 48 20 C 52 26, 62 14, 68 22"
                  stroke="#047857"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="50" cy="15" r="2.5" fill="#10b981" />
                <path
                  d="M40 30 Q 50 36 60 30"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[7px] font-semibold text-emerald-700 tracking-wider uppercase leading-none">
              DISTRIBUIDORA DE AUTOPARTES
            </span>
            <span className="text-[9px] font-black text-slate-800 tracking-tight uppercase mt-0.5 leading-none">
              JIGAFRA, S.A. DE C.V.
            </span>
          </div>
        )}
      </div>

      {showSubtitle && (
        <span className="mt-3 text-[11px] font-extrabold tracking-wider text-slate-800 uppercase text-center">
          BITÁCORA DE EMBARQUES
        </span>
      )}
    </div>
  );
};
