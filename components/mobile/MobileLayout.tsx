
import React, { useState, useEffect } from 'react';
import { VoiceExpert } from './VoiceExpert';
import { TextChat } from './TextChat';
import { DocumentScanner } from './DocumentScanner';
import { DocumentList } from './DocumentList';
import { MicrophoneIcon, CameraIcon, LogoutIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon, DocumentTextIcon, ExclamationIcon } from '../icons';
import type { UsageInfo } from '../../types';
import { api } from '../../services/api';

// Helper to convert dataURL to Blob
const dataURLtoBlob = (dataurl: string) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1];
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

interface MobileLayoutProps {
    t: (key: string) => string;
    language: string;
    onLogout: () => void;
    balance: number;
    onDeductTokens: (usage: UsageInfo) => void;
}

export interface ScannedDoc {
    id: string;
    pages: string[];
    timestamp: string;
    name: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ t, language, onLogout, balance, onDeductTokens }) => {
    const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'scanner' | 'documents'>('voice');

    // Global state for scanned documents to sync across tabs
    const [scannedDocs, setScannedDocs] = useState<ScannedDoc[]>([]);

    useEffect(() => {
        // Load documents from backend
        api.getDocuments().then(docs => {
            const mapped = docs.map((d: any) => {
                // Ensure absolute URL
                const fileUrl = d.file.startsWith('http') ? d.file : `https://advokatapi.aiproduct.uz${d.file}`;
                return {
                    id: d.id.toString(),
                    name: d.name,
                    pages: [fileUrl],
                    timestamp: d.uploaded_at
                };
            });
            setScannedDocs(mapped);
        }).catch(err => console.error("Failed to load documents", err));
    }, []);

    const handleSaveDoc = async (newDoc: ScannedDoc) => {
        try {
            // 1. Create PDF from pages (if multiple) or use image (if single)
            let fileToUpload: File;

            if (window.jspdf) {
                const doc = new window.jspdf.jsPDF();
                newDoc.pages.forEach((page, index) => {
                    const imgProps = doc.getImageProperties(page);
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    if (index > 0) doc.addPage();
                    doc.addImage(page, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                });
                const blob = doc.output('blob');
                fileToUpload = new File([blob], `${newDoc.name}.pdf`, { type: 'application/pdf' });
            } else {
                // Fallback: upload first page as image
                const blob = dataURLtoBlob(newDoc.pages[0]);
                fileToUpload = new File([blob], `${newDoc.name}.jpg`, { type: 'image/jpeg' });
            }

            // 2. Upload to Backend
            const savedDoc = await api.uploadDocument(fileToUpload, newDoc.name, 'scan');

            // 3. Update State (using the returned data/file url)
            const savedFileUrl = savedDoc.file.startsWith('http') ? savedDoc.file : `https://advokatapi.aiproduct.uz${savedDoc.file}`;
            setScannedDocs(prev => [{
                id: savedDoc.id.toString(),
                name: savedDoc.name,
                pages: [savedFileUrl],
                timestamp: savedDoc.uploaded_at
            }, ...prev]);

            setActiveTab('documents');
        } catch (e) {
            console.error("Failed to upload document", e);
            alert("Hujjat saqlashda xatolik yuz berdi");
        }
    };

    // Shared state for transferring scanned documents between components
    const [sharedDoc, setSharedDoc] = useState<{ pages: string[], name: string } | null>(null);

    const handleSendToChat = (doc: { pages: string[], name: string }) => {
        setSharedDoc(doc);
        setActiveTab('chat');
    };

    const handleSendToVoice = (doc: { pages: string[], name: string }) => {
        setSharedDoc(doc);
        setActiveTab('voice');
    };

    const isBalanceEmpty = balance <= 0;

    // Format balance to 1 499 093.79 style
    const formattedBalance = balance.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(',', '.');

    return (
        <div className="fixed inset-0 bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[100px] pointer-events-none"></div>

            <header className="p-4 flex items-center justify-between z-20 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">A</div>
                    <h1 className="text-sm font-black tracking-tight uppercase">Adolat AI</h1>
                </div>

                {/* Mobile Balance Chip (UZS) */}
                <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full shadow-inner transition-colors ${isBalanceEmpty ? 'bg-red-500/10 border-red-500/30' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                    <CurrencyDollarIcon className={`h-3.5 w-3.5 ${isBalanceEmpty ? 'text-red-400' : 'text-indigo-400'}`} />
                    <span className={`text-[11px] font-black tracking-tight ${isBalanceEmpty ? 'text-red-400' : 'text-white'}`}>
                        {formattedBalance} {t('currency_sum')}
                    </span>
                </div>

                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <LogoutIcon className="h-5 w-5" />
                </button>
            </header>

            <main className="flex-1 relative flex flex-col items-center justify-center p-4 z-10 overflow-hidden">
                {isBalanceEmpty && (activeTab === 'voice' || activeTab === 'chat') ? (
                    <div className="text-center p-8 polished-pane animate-assemble-in max-w-xs border-red-500/30">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <ExclamationIcon className="h-8 w-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{t('error_insufficient_balance')}</h3>
                        <a href="https://t.me/adolatAI_bot" target="_blank" className="mt-6 inline-block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-all">
                            {t('balance_recharge_button')}
                        </a>
                    </div>
                ) : (
                    <>
                        {activeTab === 'voice' && (
                            <VoiceExpert
                                t={t}
                                language={language}
                                incomingDoc={sharedDoc}
                                onDocProcessed={() => setSharedDoc(null)}
                                onDeductTokens={onDeductTokens}
                                disabled={isBalanceEmpty}
                            />
                        )}
                        {activeTab === 'chat' && (
                            <TextChat
                                t={t}
                                language={language}
                                incomingDoc={sharedDoc}
                                onDocProcessed={() => setSharedDoc(null)}
                                onDeductTokens={onDeductTokens}
                                disabled={isBalanceEmpty}
                            />
                        )}
                        {activeTab === 'scanner' && (
                            <DocumentScanner
                                t={t}
                                onSave={handleSaveDoc}
                            />
                        )}
                        {activeTab === 'documents' && (
                            <DocumentList
                                t={t}
                                documents={scannedDocs}
                                onDelete={(id) => {
                                    api.deleteDocument(id).catch(err => console.error("Failed to delete", err));
                                    setScannedDocs(prev => prev.filter(d => d.id !== id));
                                }}
                                onSendToChat={handleSendToChat}
                                onSendToVoice={handleSendToVoice}
                                onAddClick={() => setActiveTab('scanner')}
                            />
                        )}
                    </>
                )}
            </main>

            <nav className="px-4 mb-6 z-10">
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-2xl max-w-sm mx-auto">
                    <TabButton
                        icon={<MicrophoneIcon />}
                        label={t('nav_voice_expert')}
                        isActive={activeTab === 'voice'}
                        onClick={() => setActiveTab('voice')}
                    />
                    <TabButton
                        icon={<ChatBubbleLeftRightIcon />}
                        label={t('nav_text_chat')}
                        isActive={activeTab === 'chat'}
                        onClick={() => setActiveTab('chat')}
                    />
                    <TabButton
                        icon={<CameraIcon />}
                        label={t('nav_scanner')}
                        isActive={activeTab === 'scanner'}
                        onClick={() => setActiveTab('scanner')}
                    />
                    <TabButton
                        icon={<DocumentTextIcon />}
                        label={t('nav_mobile_documents')}
                        isActive={activeTab === 'documents'}
                        onClick={() => setActiveTab('documents')}
                    />
                </div>
            </nav>
        </div>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-500 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
        <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'hover:bg-white/5'}`}>
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
        </div>
        <span className={`text-[7px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
);
