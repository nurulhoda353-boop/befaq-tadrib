import { useEffect, useState } from "react";

export function AboutVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full bg-[#04160f] overflow-hidden flex items-center justify-center">
      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes spinSlowest {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-float-slow {
            animation: floatSlow 6s ease-in-out infinite;
          }
          .animate-spin-slowest {
            animation: spinSlowest 45s linear infinite;
          }
        `}
      </style>

      {/* Soft halo */}
      <div className="absolute w-96 h-96 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/15 via-transparent to-transparent opacity-80" />

      {/* The assembly */}
      <div className="relative z-10 flex items-center justify-center animate-float-slow">
        
        {/* Thin gold rings */}
        <div className="absolute w-64 h-64 rounded-full border border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-spin-slowest" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
        <div className="absolute w-72 h-72 rounded-full border border-[#d4af37]/20 animate-spin-slowest" style={{ animationDirection: 'reverse', animationDuration: '35s', borderLeftColor: 'transparent' }} />

        {/* The Najmah */}
        <div className="relative animate-spin-slowest text-[#f4d97a] drop-shadow-[0_0_20px_rgba(244,217,122,0.5)]" style={{ animationDuration: '25s' }}>
          <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current">
            {/* 8 point star */}
            <path d="M50 0 L60 38 L98 40 L65 60 L75 98 L50 72 L25 98 L35 60 L2 40 L40 38 Z" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Heart pip */}
            <div className="w-4 h-4 bg-[#fbf3dc] rounded-full shadow-[0_0_15px_#fff]" />
          </div>
        </div>
      </div>
    </div>
  );
}
