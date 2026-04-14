import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { UploadSection } from './components/Upload';
import { Queue, Report } from './components/Queue';
import { ReportModal } from './components/ReportModal';
import { summarizeLabReport } from './lib/gemini';

export default function App() {
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Blood CP (Complete Picture)-2602-11387.pdf',
        status: 'Completed',
        date: 'Mar 16, 2026 11:25 AM',
        summary: 'This lab report for Mr. Muhammad Atif provides a detailed look at his blood cell counts. Most of his results, including his white blood cell count, red blood cell count, hemoglobin levels, and platelet count, are all within the healthy reference ranges, which is great news for his overall health and blood clotting ability. However, his monocyte count is slightly elevated. While this elevation is mild, monocytes are important for fighting infections and inflammation, and a slight increase can sometimes suggest the body is actively responding to something. It is always a good idea to discuss this finding with your doctor to understand what it means for your personal health and if any further steps are recommended.',
        urduSummary: 'مسٹر محمد عاطف کی یہ لیب رپورٹ ان کے خون کے خلیوں کی تعداد کا تفصیلی جائزہ فراہم کرتی ہے۔ ان کے زیادہ تر نتائج، بشمول سفید خون کے خلیات کی تعداد، سرخ خون کے خلیات کی تعداد، ہیموگلوبن کی سطح، اور پلیٹلیٹ کی تعداد، سب صحت مند حوالہ کی حدوں کے اندر ہیں، جو ان کی مجموعی صحت اور خون جمنے کی صلاحیت کے لیے بہترین خبر ہے۔ تاہم، ان کے مونو سائیٹ کی تعداد تھوڑی زیادہ ہے۔ اگرچہ یہ اضافہ معمولی ہے، مونو سائیٹس انفیکشن اور سوزش سے لڑنے کے لیے اہم ہیں، اور تھوڑا سا اضافہ کبھی کبھی یہ تجویز کر سکتا ہے کہ جسم کسی چیز کا فعال طور پر جواب دے رہا ہے۔ اپنی ذاتی صحت کے لیے اس کا کیا مطلب ہے اور اگر مزید اقدامات کی سفارش کی جاتی ہے تو اسے سمجھنے کے لیے اپنے ڈاکٹر سے اس تلاش پر بات کرنا ہمیشہ اچھا خیال ہے۔'
      },
      {
        id: '2',
        name: 'blood test report.png',
        status: 'Completed',
        date: 'Mar 16, 2026 5:23 AM',
        summary: 'Your blood test results show normal levels for most indicators. Your glucose levels are stable, and your cholesterol is within the recommended range. There is a slight deficiency in Vitamin D, which is common. You might want to consider more sunlight exposure or a supplement after consulting your physician.',
        urduSummary: 'آپ کے خون کے ٹیسٹ کے نتائج زیادہ تر اشارے کے لیے نارمل سطح ظاہر کرتے ہیں۔ آپ کے گلوکوز کی سطح مستحکم ہے، اور آپ کا کولیسٹرول تجویز کردہ حد کے اندر ہے۔ وٹامن ڈی میں تھوڑی سی کمی ہے، جو کہ عام ہے۔ آپ اپنے معالج سے مشورہ کرنے کے بعد سورج کی روشنی میں زیادہ رہنے یا سپلیمنٹ لینے پر غور کر سکتے ہیں۔'
      }
    ];
  });

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('reports', JSON.stringify(reports));
  }, [reports]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pending').length,
    processing: reports.filter(r => r.status === 'Processing').length,
    completed: reports.filter(r => r.status === 'Completed').length,
    failed: reports.filter(r => r.status === 'Failed').length,
  };

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleUpload = async (files: File[]) => {
    const newReports = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      status: 'Processing' as const,
      date: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      mimeType: file.type
    }));

    setReports(prev => [...newReports, ...prev]);

    // Process each file
    for (const report of newReports) {
      const file = files.find(f => f.name === report.name);
      if (!file) continue;

      try {
        setAgentStatus(`Reading ${file.name}...`);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          
          setAgentStatus(`Analyzing ${file.name} with Gemini...`);
          // Get English summary
          const englishData = await summarizeLabReport(base64, file.type, 'English');
          
          setAgentStatus(`Translating to Urdu...`);
          // Get Urdu summary
          const urduData = await summarizeLabReport(base64, file.type, 'Urdu');

          setAgentStatus(`Finalizing report...`);
          setReports(prev => {
            const updated = prev.map(r => 
              r.id === report.id 
                ? { 
                    ...r, 
                    status: 'Completed', 
                    summary: englishData.interpretation, 
                    riskLevel: englishData.riskLevel,
                    recommendations: englishData.recommendations,
                    urduSummary: urduData.interpretation,
                    urduRecommendations: urduData.recommendations
                  } 
                : r
            );
            
            // Auto-open the report if it's the one we just finished
            const finishedReport = updated.find(r => r.id === report.id);
            if (finishedReport) {
              setSelectedReport(finishedReport);
            }
            
            setAgentStatus(null);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing report:', error);
        setAgentStatus(`Error processing ${file.name}`);
        setReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, status: 'Failed' } : r
        ));
        setTimeout(() => setAgentStatus(null), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header status={agentStatus} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full py-8 relative z-10">
        <div className="px-8 mb-8">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Welcome to <span className="gradient-text">ReportGenie</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Upload complex medical lab reports and our AI will immediately translate them 
            into simple, patient-friendly language you can understand.
          </p>
        </div>

        <Stats stats={stats} />
        
        <UploadSection onUpload={handleUpload} />
        
        <Queue 
          reports={reports} 
          onView={(report) => setSelectedReport(report)} 
          onDelete={handleDelete}
        />
      </main>

      <ReportModal 
        report={selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />

      {/* Footer Branding */}
      <footer className="py-8 px-8 flex justify-center">
        <div className="bg-slate-100 px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            System Online & Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
