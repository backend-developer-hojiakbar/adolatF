
import React, { useState } from 'react';
import { DocumentTextIcon, TrashIcon, DownloadIcon, ChatBubbleLeftRightIcon, MicrophoneIcon, XMarkIcon, PlusIcon } from '../icons';
import { ScannedDoc } from './MobileLayout';

interface DocumentListProps {
    t: (key: string) => string;
    documents: ScannedDoc[];
    onDelete: (id: string) => void;
    onSendToChat: (doc: {pages: string[], name: string}) => void;
    onSendToVoice: (doc: {pages: string[], name: string}) => void;
    onAddClick: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ t, documents, onDelete, onSendToChat, onSendToVoice, onAddClick }) => {
    const [selectedDoc, setSelectedDoc] = useState<ScannedDoc | null>(null);

    const exportToPdf = (doc: ScannedDoc) => {
        if (!window.jspdf) return;
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        doc.pages.forEach((page, index) => {
            if (index > 0) pdf.addPage();
            const imgProps = pdf.getImageProperties(page);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(page, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        });
        pdf.save(`${doc.name}.pdf`);
    };

    if (selectedDoc) {
        return (
            <div className="flex-1 flex flex-col bg-[#0f172a] animate-assemble-in overflow-hidden w-full h-full">
                <header className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
                    <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400"><XMarkIcon className="h-6 w-6" /></button>
                    <div className="flex-1 text-center px-4">
                        <p className="text-sm font-bold text-slate-200 truncate">{selectedDoc.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedDoc.pages.length} та саҳифа</p>
                    </div>
                    <button onClick={() => { onDelete(selectedDoc.id); setSelectedDoc(null); }} className="p-2 text-red-400/60"><TrashIcon className="h-5 w-5" /></button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
                    {selectedDoc.pages.map((page, i) => (
                        <div key={i} className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                            <img src={page} className="w-full h-auto" alt={`Page ${i+1}`} />
                            <div className="p-2 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Саҳифа {i+1}</div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/80 border-t border-white/10 backdrop-blur-3xl grid grid-cols-2 gap-3">
                     <button onClick={() => onSendToChat({pages: selectedDoc.pages, name: selectedDoc.name})} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" /> Чатга
                     </button>
                     <button onClick={() => onSendToVoice({pages: selectedDoc.pages, name: selectedDoc.name})} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                        <MicrophoneIcon className="h-4 w-4" /> Овозли АИ
                     </button>
                     <button onClick={() => exportToPdf(selectedDoc)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 border border-white/5 text-red-400 font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all">
                        <DownloadIcon className="h-3.5 w-3.5" /> PDF Юклаб олиш
                     </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col animate-assemble-in relative">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-fill-transparent uppercase tracking-widest text-center">
                {t('mobile_docs_title')}
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 px-2">
                {documents.length === 0 ? (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                        <DocumentTextIcon className="h-12 w-12 text-slate-600" />
                        <p className="text-sm font-bold uppercase tracking-widest">Ҳужжатлар мавжуд эмас</p>
                    </div>
                ) : (
                    documents.map(doc => (
                        <div 
                            key={doc.id} 
                            onClick={() => setSelectedDoc(doc)}
                            className="polished-pane p-4 flex items-center gap-4 animate-assemble-in bg-slate-900/40 border-white/5 active:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                            <div className="w-14 h-18 bg-indigo-500/10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                                <img src={doc.pages[0]} className="w-full h-full object-cover" alt="Thumb" />
                                <div className="absolute bottom-0 right-0 bg-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-tl-md">{doc.pages.length}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-200 truncate">{doc.name}</p>
                                <p className="text-[9px] text-slate-500">{new Date(doc.timestamp).toLocaleString()}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="p-2 text-slate-500 hover:text-red-400 active:scale-90"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    ))
                )}
                <div className="h-24"></div>
            </div>

            {/* Floating Action Button for New Scan */}
            <button 
                onClick={onAddClick}
                className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 active:scale-90 transition-transform z-30"
            >
                <PlusIcon className="h-7 w-7 text-white" />
            </button>
        </div>
    );
};
