
import React from 'react';
import type { Case, EvidenceItem } from '../types';
import { BeakerIcon, UploadIcon, DownloadIcon } from './icons';

interface EvidenceViewProps {
    caseData: Case | null;
    onUpdateEvidence: (newEvidence: EvidenceItem[]) => void;
    t: (key: string) => string;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ caseData, onUpdateEvidence, t }) => {
    
    const evidence = caseData?.evidence || [];

    return (
         <div className="space-y-6 animate-assemble-in">
            <div className="polished-pane p-4">
                 <div 
                    className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                    <label className="cursor-pointer">
                        <UploadIcon className="h-10 w-10 mx-auto text-[var(--text-secondary)]" />
                        <p className="mt-2 text-sm text-slate-300">{t('evidence_upload_prompt')}</p>
                        <p className="text-xs text-slate-500">{t('feature_coming_soon')}</p>
                    </label>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-3">{t('view_evidence_title')} ({evidence.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evidence.map(item => (
                        <div key={item.id} className="polished-pane p-3 flex flex-col gap-3 group">
                            { (item as any).dataUrl && (
                                <div className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5">
                                    <img src={(item as any).dataUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.name} />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-200 text-sm truncate">{item.name}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    { (item as any).dataUrl && (
                                        <a href={(item as any).dataUrl} download={`${item.name}.jpg`} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg">
                                            <DownloadIcon className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                     {evidence.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                             <BeakerIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                             <p>{t('evidence_none')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
