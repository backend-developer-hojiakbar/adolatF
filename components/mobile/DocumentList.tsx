
import React, { useState, useMemo } from 'react';
import { DocumentTextIcon, TrashIcon, DownloadIcon, ChatBubbleLeftRightIcon, MicrophoneIcon, XMarkIcon, PlusIcon, ShareIcon } from '../icons';
import { ScannedDoc } from './MobileLayout';

interface DocumentListProps {
    t: (key: string) => string;
    documents: ScannedDoc[];
    onDelete: (id: string) => void;
    onSendToChat: (doc: { pages: string[], name: string }) => void;
    onSendToVoice: (doc: { pages: string[], name: string }) => void;
    onAddClick: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ t, documents, onDelete, onSendToChat, onSendToVoice, onAddClick }) => {
    const [selectedDoc, setSelectedDoc] = useState<ScannedDoc | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');
    const [pdfExportDoc, setPdfExportDoc] = useState<ScannedDoc | null>(null);
    const [pdfQuality, setPdfQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const filteredDocs = useMemo(() => {
        let docs = [...documents];
        if (searchQuery) {
            docs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        docs.sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            if (sortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            return 0;
        });
        return docs;
    }, [documents, searchQuery, sortBy]);

    const compressImage = async (base64: string, q: number): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', q));
            };
            img.src = base64;
        });
    };

    const generatePdf = async () => {
        if (!window.jspdf || !pdfExportDoc) return;
        setIsGeneratingPdf(true);

        try {
            // Check if document is ALREADY a PDF
            if (pdfExportDoc.pages.length === 1 && pdfExportDoc.pages[0].split('?')[0].toLowerCase().endsWith('.pdf')) {
                const link = document.createElement('a');
                link.href = pdfExportDoc.pages[0];
                link.download = `${pdfExportDoc.name}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setPdfExportDoc(null);
                setIsGeneratingPdf(false);
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const qualityScore = pdfQuality === 'low' ? 0.4 : pdfQuality === 'medium' ? 0.7 : 1.0;

            for (let i = 0; i < pdfExportDoc.pages.length; i++) {
                const page = pdfExportDoc.pages[i];
                if (page.split('?')[0].toLowerCase().endsWith('.pdf')) continue;

                if (i > 0) pdf.addPage();

                // Compress if needed
                const imgData = qualityScore < 1.0 ? await compressImage(page, qualityScore) : page;

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }
            pdf.save(`${pdfExportDoc.name}.pdf`);
            setPdfExportDoc(null);
        } catch (e) {
            console.error("PDF Generation failed", e);
            alert("PDF яратишда хатолик бўлди: " + e);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleShare = async (doc: ScannedDoc) => {
        if (navigator.share) {
            try {
                // For a real app we'd convert base64 to File object, here we just share text/title
                // Or if supported, share the file. Doing simple text share for now.
                // To share actual file we need to convert base64 to Blob/File.

                // Example with File (simplified)
                // const blob = await (await fetch(doc.pages[0])).blob();
                // const file = new File([blob], `${doc.name}.jpg`, { type: 'image/jpeg' });

                await navigator.share({
                    title: doc.name,
                    text: `Hujjat: ${doc.name} (${doc.pages.length} sahifa)`,
                    // files: [file] // Experimental
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            alert("Share feature not supported on this device/browser.");
        }
    };

    if (selectedDoc) {
        return (
            <div className="flex-1 flex flex-col bg-[#0f172a] animate-assemble-in overflow-hidden w-full h-full relative">
                {/* PDF Export Modal */}
                {pdfExportDoc && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-lg font-black text-white mb-4 text-center uppercase tracking-tight">PDF Сифати</h3>
                            <div className="space-y-3 mb-6">
                                {(['low', 'medium', 'high'] as const).map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setPdfQuality(q)}
                                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${pdfQuality === q ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400'}`}
                                    >
                                        <span className="font-bold uppercase text-xs">{q === 'low' ? 'Паст (kichik hajm)' : q === 'medium' ? 'Ўрта (тавсия)' : 'Юқори (асл сифат)'}</span>
                                        {pdfQuality === q && <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_indigo]"></div>}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPdfExportDoc(null)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase">Бекор қилиш</button>
                                <button onClick={generatePdf} disabled={isGeneratingPdf} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                    {isGeneratingPdf ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                                    Юклаш
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <header className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
                    <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400"><XMarkIcon className="h-6 w-6" /></button>
                    <div className="flex-1 text-center px-4">
                        <p className="text-sm font-bold text-slate-200 truncate">{selectedDoc.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedDoc.pages.length} та саҳифа</p>
                    </div>
                    <button onClick={() => handleShare(selectedDoc)} className="p-2 text-indigo-400"><ShareIcon className="h-5 w-5" /></button>
                    <button onClick={() => { onDelete(selectedDoc.id); setSelectedDoc(null); }} className="p-2 text-red-400/60"><TrashIcon className="h-5 w-5" /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
                    {selectedDoc.pages.map((page, i) => (
                        <div key={i} className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
                            {page.split('?')[0].toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-[500px] bg-slate-800 flex flex-col items-center justify-center">
                                    <iframe src={page} className="w-full h-full" title={`PDF Page ${i + 1}`}></iframe>
                                    <div className="absolute inset-x-0 bottom-0 p-2 text-center pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-[10px] text-slate-400">PDF oldindan ko'rish</p>
                                    </div>
                                </div>
                            ) : (
                                <img src={page} className="w-full h-auto" alt={`Page ${i + 1}`} />
                            )}
                            <div className="p-2 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Саҳифа {i + 1}</div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/80 border-t border-white/10 backdrop-blur-3xl grid grid-cols-2 gap-3">
                    <button onClick={() => onSendToChat({ pages: selectedDoc.pages, name: selectedDoc.name })} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" /> Чатга
                    </button>
                    <button onClick={() => onSendToVoice({ pages: selectedDoc.pages, name: selectedDoc.name })} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                        <MicrophoneIcon className="h-4 w-4" /> Овозли АИ
                    </button>
                    <button onClick={() => setPdfExportDoc(selectedDoc)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 border border-white/5 text-red-400 font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all">
                        <DownloadIcon className="h-3.5 w-3.5" /> PDF Юклаб олиш
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col animate-assemble-in relative">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-fill-transparent uppercase tracking-widest text-center mt-4">
                {t('mobile_docs_title')}
            </h2>

            <div className="px-4 mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Қидириш..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-2 py-2 text-xs text-slate-400 outline-none"
                >
                    <option value="date_desc">Янги</option>
                    <option value="date_asc">Эски</option>
                    <option value="name_asc">A-Z</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-2">
                {filteredDocs.length === 0 ? (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                        <DocumentTextIcon className="h-12 w-12 text-slate-600" />
                        <p className="text-sm font-bold uppercase tracking-widest">Ҳужжатлар топилмади</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="polished-pane p-4 flex items-center gap-4 animate-assemble-in bg-slate-900/40 border-white/5 active:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                            <div className="w-14 h-18 bg-indigo-500/10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative flex items-center justify-center">
                                {doc.pages[0].split('?')[0].toLowerCase().endsWith('.pdf') ? (
                                    <div className="flex flex-col items-center text-red-500">
                                        <span className="text-[10px] font-black">PDF</span>
                                        <DocumentTextIcon className="h-6 w-6" />
                                    </div>
                                ) : (
                                    <img src={doc.pages[0]} className="w-full h-full object-cover" alt="Thumb" />
                                )}
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
