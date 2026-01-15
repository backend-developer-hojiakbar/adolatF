
import React, { useState, useCallback } from 'react';
import { UploadIcon, AnalysisIcon, CheckCircleIcon, ExclamationIcon } from './icons';
import type { CaseFile, UsageInfo } from '../types';
import { getDocumentType } from '../services/geminiService';

declare global {
    interface Window {
        mammoth: any;
        pdfjsLib: any;
    }
}

const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' && window.pdfjsLib) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            let text = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            return text;
        } catch (error) {
            return `[PDF ўқиб бўлмади: ${file.name}]`;
        }
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && window.mammoth) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            return `[DOCX ўқиб бўлмади: ${file.name}]`;
        }
    }
    else if (file.type.startsWith('text/')) {
        return file.text();
    }
    return '';
};

interface CaseInputFormProps {
  onAnalyze: (courtType: string, caseDetails: string, files: CaseFile[], courtStage: string) => void;
  isLoading: boolean;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  language: string;
  onDeductTokens: (usage: UsageInfo) => void;
}

const courtTypes = ["Fuqarolik", "Jinoyat", "Mamuriy", "Iqtisodiy"];
const courtStages = ["Tergov_raw", "Birinchi_sud", "Apellyatsiya", "Kassatsiya"];

type ProcessedFile = CaseFile & {
    status: 'processing' | 'ready' | 'error';
    statusText: string;
};

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const CaseInputForm: React.FC<CaseInputFormProps> = ({ onAnalyze, isLoading, t, language, onDeductTokens }) => {
  const [courtType, setCourtType] = useState('');
  const [courtStage, setCourtStage] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const handleFilesAdded = useCallback(async (fileList: File[]) => {
      if (!fileList || fileList.length === 0) return;

      const readFileAsDataURL = (fileToRead: File): Promise<string> => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToRead);
      });
      
      const newPlaceholders: ProcessedFile[] = fileList.map(file => ({
        id: `${Date.now()}-${file.name}`, 
        name: file.name, 
        type: file.type,
        status: 'processing', 
        statusText: t('file_status_reading'),
      }));
      
      setFiles(prev => [...prev, ...newPlaceholders]);

      await Promise.all(newPlaceholders.map(async (placeholder) => {
          const file = fileList.find(f => f.name === placeholder.name);
          if (!file) return;

          try {
              const [content, extractedText] = await Promise.all([
                  readFileAsDataURL(file),
                  extractTextFromFile(file)
              ]);

              setFiles(prev => prev.map(f => f.id === placeholder.id ? { ...f, content, extractedText, statusText: t('file_status_analyzing') } : f));
              
              const { documentType, usage } = await getDocumentType({ ...placeholder, content, extractedText }, t, language);
              onDeductTokens(usage);
              
              setFiles(prev => prev.map(f => f.id === placeholder.id ? { 
                  ...f, 
                  documentType, 
                  status: 'ready', 
                  statusText: documentType 
              } : f));
          } catch (error) {
              setFiles(prev => prev.map(f => f.id === placeholder.id ? { ...f, status: 'error', statusText: t('file_status_error') } : f));
          }
      }));
  }, [t, language, onDeductTokens]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if(e.dataTransfer.files) handleFilesAdded(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtType || !courtStage || (!caseDetails.trim() && files.length === 0)) return;
    const filesToAnalyze: CaseFile[] = files.filter(f => f.status === 'ready').map(({ status, statusText, ...rest }) => rest);
    onAnalyze(courtType, caseDetails, filesToAnalyze, courtStage);
  };

  return (
    <div className="polished-pane p-8 shadow-2xl relative animate-assemble-in">
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-6" disabled={isLoading}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="court-type" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('case_input_court_type')}</label>
                        <select id="court-type" value={courtType} onChange={e => setCourtType(e.target.value)} required className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] transition-all duration-300">
                            <option value="" disabled>{t('select_option_placeholder')}</option>
                            {courtTypes.map(type => <option key={type} value={type}>{t(`court_type_${type.toLowerCase()}`)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="court-stage" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('case_input_court_stage')}</label>
                        <select id="court-stage" value={courtStage} onChange={e => setCourtStage(e.target.value)} required className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] transition-all duration-300">
                            <option value="" disabled>{t('select_option_placeholder')}</option>
                            {courtStages.map(stage => <option key={stage} value={stage}>{t(`court_stage_${stage.toLowerCase()}`)}</option>)}
                        </select>
                    </div>
                </div>

                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-300">
                    <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} accept=".pdf,.docx,.txt,image/*" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadIcon className="h-12 w-12 mx-auto text-[var(--text-secondary)]" />
                        <p className="mt-3 text-base font-semibold text-slate-300">{t('case_input_dropzone_title')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('case_input_dropzone_subtitle')}</p>
                    </label>
                </div>
                
                {files.length > 0 && (
                   <div className="space-y-2">
                        <h4 className="font-semibold text-slate-400 text-sm">{t('case_input_uploaded_files_title')}:</h4>
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-[var(--bg-secondary)]/70 p-2.5 rounded-lg text-sm border border-[var(--border-color)]/50">
                                <div className="flex items-center gap-3 truncate">
                                    <div className="flex-shrink-0 w-5 h-5">{file.status === 'processing' ? <SpinnerIcon /> : file.status === 'ready' ? <CheckCircleIcon className="h-5 w-5 text-green-400" /> : <ExclamationIcon className="h-5 w-5 text-red-400" />}</div>
                                    <p className="text-slate-300 truncate">{file.name}</p>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' : file.status === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{file.statusText}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <label htmlFor="case-details" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('case_input_section1_title')}</label>
                    <textarea id="case-details" value={caseDetails} onChange={e => setCaseDetails(e.target.value)} placeholder={t('case_input_details_placeholder')} className="w-full h-48 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] transition-all duration-300 resize-none" />
                </div>
            </fieldset>
            
            <button type="submit" disabled={isLoading || !courtType || !courtStage || (!caseDetails.trim() && files.length === 0)} className="w-full flex items-center justify-center gap-3 bg-[var(--accent-primary)] text-black font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.03] disabled:opacity-50 mt-8">
              {isLoading ? <><SpinnerIcon /><span>{t('status_identifying_participants')}</span></> : <><AnalysisIcon className="h-6 w-6" /><span className="text-lg">{t('button_analyze_strategy')}</span></>}
            </button>
        </form>
    </div>
  );
};
