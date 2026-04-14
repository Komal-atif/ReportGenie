import React from 'react';
import { FileText, CheckCircle2, Clock, Sparkles, XCircle, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type ReportStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';
export type RiskLevel = 'Normal' | 'Mild Concern' | 'Critical';

export interface Report {
  id: string;
  name: string;
  status: ReportStatus;
  date: string;
  summary?: string;
  urduSummary?: string;
  riskLevel?: RiskLevel;
  recommendations?: string[];
  urduRecommendations?: string[];
  fileData?: string;
  mimeType?: string;
}

interface QueueProps {
  reports: Report[];
  onView: (report: Report) => void;
  onDelete: (id: string) => void;
}

const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const styles = {
    Pending: "bg-orange-50 text-orange-600 border-orange-100",
    Processing: "bg-primary-light text-primary border-primary/10",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Failed: "bg-rose-50 text-rose-600 border-rose-100"
  };

  const icons = {
    Pending: Clock,
    Processing: Sparkles,
    Completed: CheckCircle2,
    Failed: XCircle
  };

  const Icon = icons[status];

  return (
    <div className={cn("px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 w-fit", styles[status])}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </div>
  );
};

export const Queue = ({ reports, onView, onDelete }: QueueProps) => {
  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Processing Queue</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time status tracking</p>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden border-white/40 shadow-2xl shadow-primary/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">File Details</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <FileText className="text-slate-200 w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                      Queue is empty
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border border-slate-200/50 group-hover:scale-110 transition-transform">
                        <FileText className="text-slate-400 w-6 h-6" />
                      </div>
                      <div>
                        <span className="block font-black text-slate-700 truncate max-w-[200px] md:max-w-md">
                          {report.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {report.mimeType?.split('/')[1] || 'Document'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                    {report.date}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {report.status === 'Completed' && (
                        <button 
                          onClick={() => onView(report)}
                          className="p-3 text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20"
                          title="View analysis"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(report.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:scale-110 active:scale-95"
                        title="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
