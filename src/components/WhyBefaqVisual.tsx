import { useEffect, useState } from "react";

export function WhyBefaqVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full bg-[#04160f] overflow-hidden flex flex-col items-center justify-end pb-16">
      <style>
        {`
          @keyframes glowPulse {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-glow {
            animation: glowPulse 5s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spinSlow 35s linear infinite;
          }
        `}
      </style>

      {/* Background ambient glow */}
      <div className="absolute top-[30%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/15 via-transparent to-transparent opacity-70" />

      {/* The Mihrab Arch (2D vector style) */}
      <div className="relative z-10 w-64 h-80 border-[3px] border-[#d4af37]/40 rounded-t-[120px] flex flex-col items-center justify-start pt-12 bg-gradient-to-b from-[#d4af37]/10 to-[#04160f] shadow-[inset_0_20px_50px_rgba(212,175,55,0.1)] backdrop-blur-sm">
        
        {/* Inner Arch Layer */}
        <div className="absolute inset-x-6 top-6 bottom-0 border-[2px] border-[#f4d97a]/30 rounded-t-[100px]" />
        
        {/* Decorative hanging line */}
        <div className="absolute top-0 w-[2px] h-12 bg-gradient-to-b from-[#d4af37]/50 to-[#f4d97a]" />

        {/* The Najmah (8-pointed star) */}
        <div className="relative animate-glow mt-[20px]">
          <div className="absolute inset-0 bg-[#f4d97a]/20 blur-xl rounded-full scale-150" />
          <div className="relative animate-spin-slow text-[#f4d97a] opacity-95 drop-shadow-[0_0_15px_rgba(244,217,122,0.6)]">
            <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current">
              <path d="M50 0 L58 35 L95 40 L65 60 L75 95 L50 75 L25 95 L35 60 L5 40 L42 35 Z" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#fbf3dc] rounded-full shadow-[0_0_10px_#fff]" />
          </div>
        </div>

      </div>

      {/* Twin columns */}
      <div className="absolute bottom-0 w-[300px] flex justify-between z-0">
        <div className="w-5 h-[340px] bg-gradient-to-r from-[#7a5d1c] via-[#d4af37] to-[#7a5d1c] opacity-70 rounded-t-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
        <div className="w-5 h-[340px] bg-gradient-to-r from-[#7a5d1c] via-[#d4af37] to-[#7a5d1c] opacity-70 rounded-t-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
      </div>
      
      {/* Floor reflection line */}
      <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
      <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-[#d4af37]/10 to-transparent" />
    </div>
  );
}
