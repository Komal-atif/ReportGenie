import React from 'react';
import { FileText, Clock, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatCard = ({ label, value, icon: Icon, color, bgColor }: StatCardProps) => (
  <div className="glass-card p-6 flex flex-col gap-4 flex-1 min-w-[200px] transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 group">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-3", bgColor)}>
      <Icon className={cn("w-7 h-7", color)} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  </div>
);

export const Stats = ({ stats }: { stats: any }) => {
  return (
    <div className="flex flex-wrap gap-4 px-8 py-6">
      <StatCard 
        label="Total Reports" 
        value={stats.total} 
        icon={FileText} 
        color="text-blue-600" 
        bgColor="bg-blue-50" 
      />
      <StatCard 
        label="Pending" 
        value={stats.pending} 
        icon={Clock} 
        color="text-orange-600" 
        bgColor="bg-orange-50" 
      />
      <StatCard 
        label="Processing" 
        value={stats.processing} 
        icon={Sparkles} 
        color="text-primary" 
        bgColor="bg-primary-light" 
      />
      <StatCard 
        label="Completed" 
        value={stats.completed} 
        icon={CheckCircle2} 
        color="text-emerald-600" 
        bgColor="bg-emerald-50" 
      />
      <StatCard 
        label="Failed" 
        value={stats.failed} 
        icon={XCircle} 
        color="text-rose-600" 
        bgColor="bg-rose-50" 
      />
    </div>
  );
};
