import React, { useState } from 'react';
import { X, FileText, Sparkles, Languages, Download, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Report } from './Queue';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@/src/lib/utils';

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
}

export const ReportModal = ({ report, onClose }: ReportModalProps) => {
  const [showUrdu, setShowUrdu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!report) return null;

  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsExporting(true);
    // Create a temporary container for PDF generation to ensure full height and clean layout
    const pdfContainer = element.cloneNode(true) as HTMLElement;
    pdfContainer.style.position = 'fixed';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '0';
    pdfContainer.style.width = '800px'; // Fixed width for consistent PDF layout
    pdfContainer.style.height = 'auto';
    pdfContainer.style.overflow = 'visible';
    pdfContainer.style.backgroundColor = '#fdfcff';
    pdfContainer.style.padding = '40px';
    document.body.appendChild(pdfContainer);

    try {
      // Helper to force RGB/Hex instead of oklch
      const toRgb = (color: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return color;
        ctx.fillStyle = color;
        return ctx.fillStyle;
      };

      // Show PDF-only elements and hide UI-only elements
      const pdfOnlyElements = pdfContainer.querySelectorAll('.pdf-only');
      pdfOnlyElements.forEach(el => (el as HTMLElement).classList.remove('hidden'));
      
      const uiOnlyElements = pdfContainer.querySelectorAll('.print\\:hidden');
      uiOnlyElements.forEach(el => (el as HTMLElement).classList.add('hidden'));

      // Replace oklch with computed values to avoid html2canvas issues
      const elements = pdfContainer.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const style = window.getComputedStyle(el);
        if (style.color.includes('oklch')) el.style.color = toRgb(style.color);
        if (style.backgroundColor.includes('oklch')) el.style.backgroundColor = toRgb(style.backgroundColor);
        if (style.borderColor.includes('oklch')) el.style.borderColor = toRgb(style.borderColor);
        if (style.fill.includes('oklch')) el.style.fill = toRgb(style.fill);
        if (style.stroke.includes('oklch')) el.style.stroke = toRgb(style.stroke);
      }

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fdfcff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content is long
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${report.name.split('.')[0]}-AI-Analysis.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      document.body.removeChild(pdfContainer);
      setIsExporting(false);
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'Normal': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Mild Concern': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'Normal': return <CheckCircle2 className="w-5 h-5" />;
      case 'Mild Concern': return <AlertTriangle className="w-5 h-5" />;
      case 'Critical': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const recommendations = showUrdu ? report.urduRecommendations : report.recommendations;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">AI Analysis Report</h2>
              <p className="text-sm text-slate-400 font-medium">Generated on {report.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowUrdu(!showUrdu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-light text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
              >
                <Languages className="w-4 h-4" />
                {showUrdu ? 'View English' : 'View Urdu'}
              </button>
              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div id="report-content" className="flex-1 overflow-y-auto p-8 bg-[#fdfcff] custom-scrollbar">
            {/* PDF Header (Hidden in UI) */}
            <div className="hidden pdf-only mb-8 border-b-2 border-primary pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">Report<span className="text-primary">Genie</span></span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">AI Medical Analysis Report</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Generated On</p>
                  <p className="text-sm font-bold text-slate-700">{report.date}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Source File</p>
                <p className="text-base font-bold text-slate-800">{report.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center print:hidden">
                  <FileText className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-700">{report.name}</h3>
                  <p className="text-sm text-slate-400 md:hidden">Generated on {report.date}</p>
                </div>
              </div>
              
              <div className={cn("px-4 py-1.5 border rounded-full text-sm font-bold flex items-center gap-2", getRiskColor(report.riskLevel))}>
                {getRiskIcon(report.riskLevel)}
                Risk: {report.riskLevel || 'Calculating...'}
              </div>
            </div>

            {/* Interpretation Section */}
            <div className="glass-card p-8 border-primary/10 relative overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className={cn("flex items-center gap-2 mb-6 text-primary", showUrdu ? "flex-row-reverse" : "")}>
                <Sparkles className="w-5 h-5 fill-primary/10" />
                <h4 className="text-lg font-bold">{showUrdu ? 'دوستانہ تشریح' : 'Friendly Interpretation'}</h4>
              </div>
              <div className={cn(
                "text-slate-600 leading-relaxed text-lg whitespace-pre-wrap",
                showUrdu ? "text-right font-urdu" : ""
              )} dir={showUrdu ? "rtl" : "ltr"}>
                {showUrdu ? report.urduSummary : report.summary}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8">
              <div className={cn("flex items-center gap-2 mb-6 text-slate-800", showUrdu ? "flex-row-reverse" : "")}>
                <Lightbulb className="w-6 h-6 text-orange-500" />
                <h4 className="text-xl font-bold">{showUrdu ? 'سمارٹ سفارشات' : 'Smart Recommendations'}</h4>
              </div>
              <div className="grid gap-4">
                {recommendations?.map((rec, idx) => (
                  <div key={idx} className={cn(
                    "flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]",
                    showUrdu ? "flex-row-reverse text-right" : ""
                  )}>
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className={cn("text-slate-700 font-medium", showUrdu ? "font-urdu" : "")}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 italic text-rose-600 text-sm leading-relaxed">
              <p className={cn(showUrdu ? "text-right font-urdu" : "")} dir={showUrdu ? "rtl" : "ltr"}>
                {showUrdu 
                  ? "⚠️ ڈس کلیمر: یہ اے آئی سے تیار کردہ خلاصہ صرف معلوماتی مقاصد کے لیے ہے اور طبی مشورہ، تشخیص، یا علاج نہیں ہے۔ طبی حالت کے بارے میں آپ کے کسی بھی سوال کے لیے ہمیشہ اپنے معالج یا دیگر اہل صحت فراہم کنندہ سے مشورہ لیں۔"
                  : "⚠️ DISCLAIMER: This AI-generated summary is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
