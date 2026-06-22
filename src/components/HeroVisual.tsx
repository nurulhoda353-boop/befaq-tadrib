import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

export function HeroVisual() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full bg-[#04160f] overflow-hidden flex items-center justify-center">
      <style>
        {`
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spinSlowReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes floatUp {
            0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
          }
          .animate-spin-slow {
            animation: spinSlow 35s linear infinite;
          }
          .animate-spin-slow-reverse {
            animation: spinSlowReverse 45s linear infinite;
          }
          .particle {
            animation: floatUp 8s ease-in-out infinite;
          }
        `}
      </style>

      {/* Soft glowing background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/20 via-transparent to-transparent opacity-80" />
      
      {/* Rotating geometric mandala / star pattern */}
      <div className="absolute w-[200%] h-[200%] animate-spin-slow opacity-15">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4af37] fill-current">
          <path d="M50 0 L55 40 L95 45 L55 50 L50 90 L45 50 L5 45 L45 40 Z" />
          <path d="M50 10 L53 35 L80 38 L53 41 L50 70 L47 41 L20 38 L47 35 Z" transform="rotate(45 50 50)" />
        </svg>
      </div>

      <div className="absolute w-[150%] h-[150%] animate-spin-slow-reverse opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#f4d97a] fill-current">
          <path d="M50 5 L52 42 L88 45 L52 48 L50 85 L48 48 L12 45 L48 42 Z" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Central Emblem */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-full border border-[#d4af37]/30 bg-[#04160f]/60 backdrop-blur-sm shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        <div className="absolute inset-0 rounded-full border border-[#d4af37]/10 scale-[1.15] animate-pulse" />
        <div className="absolute inset-0 rounded-full border border-[#d4af37]/5 scale-[1.3]" />
        
        <BookOpen size={52} className="text-[#f4d97a] mb-2 opacity-95 drop-shadow-[0_0_15px_rgba(244,217,122,0.5)]" strokeWidth={1} />
        
        <div className="flex items-center gap-3 mt-2">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
          <Sparkles size={16} className="text-[#f4d97a] animate-pulse" />
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
        </div>
      </div>

      {/* Light sweep over the whole frame */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

      {/* Falling/Floating dust particles (CSS only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#f4d97a] particle"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              bottom: "-10px",
              animationDuration: Math.random() * 6 + 6 + "s",
              animationDelay: Math.random() * 5 + "s",
              opacity: Math.random() * 0.5 + 0.3,
              boxShadow: "0 0 10px 2px rgba(244,217,122,0.4)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
