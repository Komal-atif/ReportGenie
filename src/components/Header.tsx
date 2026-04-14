import React from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';

interface HeaderProps {
  status?: string | null;
}

export const Header = ({ status }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
          <Stethoscope className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter flex items-center">
            Report<span className="gradient-text">Genie</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-extrabold tracking-[0.2em] uppercase">AI Medical Intelligence</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {status && (
          <div className="flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border border-primary/20 shadow-lg shadow-primary/5 animate-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-spin-slow" />
            <span className="text-primary text-xs font-extrabold tracking-wide">{status}</span>
          </div>
        )}
        <div className="hidden lg:flex items-center">
          <div className="px-5 py-2 bg-slate-900/5 backdrop-blur-md rounded-full border border-slate-200/50">
            <span className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">Precision Lab Analysis</span>
          </div>
        </div>
      </div>
    </header>
  );
};
