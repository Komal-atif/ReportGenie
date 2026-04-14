import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, Sparkles } from 'lucide-react';

interface UploadSectionProps {
  onUpload: (files: File[]) => void;
}

export const UploadSection = ({ onUpload }: UploadSectionProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  } as any);

  return (
    <div className="px-8 py-4">
      <div className="glass-card p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Analyze New Report</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Upload your medical documents securely. Our AI will process the data and provide 
              a simplified summary in seconds.
            </p>
          </div>

          <div 
            {...getRootProps()} 
            className={`
              flex-1 border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-slate-200 hover:border-primary/40 hover:bg-primary/[0.02]'}
            `}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadIcon className="text-primary w-10 h-10" />
            </div>
            <p className="text-xl font-black text-slate-800 mb-2">Drop your report here</p>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">PDF, PNG, JPG • MAX 10MB</p>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }}
          className="w-full mt-10 py-5 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-[0.99]"
        >
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="uppercase tracking-widest text-sm">Start AI Analysis</span>
        </button>
      </div>
    </div>
  );
};
