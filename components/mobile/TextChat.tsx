
import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlusIcon, XMarkIcon, DocumentTextIcon } from '../icons';
import { GoogleGenAI } from "@google/genai";
import type { UsageInfo } from '../../types';

interface Message {
    id: string;
    role: 'user' | 'model' | 'system_info';
    text: string;
    attachment?: {
        name: string;
        type: string;
        previewUrl?: string;
    };
}

interface AttachedFile {
    file?: File;
    previewUrl?: string;
    base64Data?: string;
    extractedText?: string;
    isImage: boolean;
    name: string;
}

interface TextChatProps {
    t: (key: string) => string;
    language: string;
    incomingDoc: {pages: string[], name: string} | null;
    onDocProcessed: () => void;
    onDeductTokens: (usage: UsageInfo) => void;
    disabled?: boolean;
}

export const TextChat: React.FC<TextChatProps> = ({ t, incomingDoc, onDocProcessed, onDeductTokens, disabled }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'model', text: "Ассалому алайкум! Таҳлил учун ҳужжат юборинг ёки саволингизни ёзинг." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const PRICE_PER_TOKEN = 0.03;

    useEffect(() => {
        if (incomingDoc) {
            setAttachedFile({
                name: incomingDoc.name,
                isImage: true,
                base64Data: incomingDoc.pages[0].split(',')[1],
                previewUrl: incomingDoc.pages[0]
            });
            setInput("Ушбу сканерланган ҳужжатни таҳлил қил.");
            onDocProcessed();
        }
    }, [incomingDoc]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async () => {
        if (disabled || (!input.trim() && !attachedFile) || isLoading) return;
        const currentInput = input;
        const currentFile = attachedFile;
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'user', 
            text: currentInput || `[Ҳужжат: ${currentFile?.name}]`,
            attachment: currentFile ? { name: currentFile.name, type: 'image/jpeg', previewUrl: currentFile.previewUrl } : undefined
        }]);
        setInput('');
        setAttachedFile(null);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const parts: any[] = [];
            if (currentFile) {
                if (currentFile.base64Data) {
                    parts.push({ inlineData: { mimeType: 'image/jpeg', data: currentFile.base64Data } });
                } else if (currentFile.extractedText) {
                    parts.push({ text: `ҲУЖЖАТ МАТНИ:\n${currentFile.extractedText}\n\n` });
                }
            }
            parts.push({ text: currentInput || "Ушбу ҳужжатни Ўзбекистон қонунчилиги бўйича таҳлил қил." });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts },
                config: {
                    systemInstruction: "Сиз Ўзбекистон адвокатисиз. Ҳужжат юборилса дарҳол таҳлил қилинг: 1.Тури 2.Фойдаси 3.Хавфлари 4.Тавсиялар.",
                    temperature: 0.2
                }
            });

            if (response.usageMetadata) {
                onDeductTokens({
                    totalTokens: response.usageMetadata.totalTokenCount,
                    cost: response.usageMetadata.totalTokenCount * PRICE_PER_TOKEN
                });
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || "Хатолик." }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Хатолик юз берди." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col animate-assemble-in overflow-hidden">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-fill-transparent uppercase tracking-tighter text-center">ADOLAT AI MOBILE</h2>
            <div className="flex-1 overflow-y-auto px-2 space-y-4 mb-4 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10' : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.attachment && <div className="mb-2 p-2 bg-black/30 rounded-xl flex items-center gap-3"><DocumentTextIcon className="h-4 w-4 text-indigo-400"/> <span className="text-[10px] font-bold truncate opacity-70">{msg.attachment.name}</span></div>}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-slate-900 border border-white/10 p-4 rounded-2xl animate-pulse text-[10px] text-indigo-400 font-black uppercase tracking-widest">Таҳлил қилинмоқда...</div></div>}
                <div ref={messagesEndRef} />
            </div>
            {attachedFile && (
                <div className="mb-2 p-3 bg-indigo-600/30 border border-indigo-500/50 rounded-2xl flex items-center gap-3 animate-assemble-in backdrop-blur-xl">
                    <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                        {attachedFile.previewUrl ? <img src={attachedFile.previewUrl} className="w-full h-full object-cover" /> : <DocumentTextIcon className="h-5 w-5 text-indigo-400" />}
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate text-white">{attachedFile.name}</p></div>
                    <button onClick={() => setAttachedFile(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><XMarkIcon className="h-4 w-4 text-white" /></button>
                </div>
            )}
            <div className={`relative mt-auto flex items-center gap-2 pb-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsLoading(true);
                    const isImage = file.type.startsWith('image/');
                    if (isImage) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const b64 = (ev.target?.result as string).split(',')[1];
                            setAttachedFile({ file, isImage, base64Data: b64, previewUrl: URL.createObjectURL(file), name: file.name });
                            setIsLoading(false);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        const text = await file.text().catch(() => "");
                        setAttachedFile({ file, isImage, extractedText: text, name: file.name });
                        setIsLoading(false);
                    }
                }} className="hidden" accept=".pdf,.docx,.txt,image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors"><PlusIcon className="h-6 w-6" /></button>
                <div className="flex-1 relative">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={disabled ? "Баланс тўлдирилмаган" : "Саволингизни ёзинг..."} className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white outline-none focus:border-indigo-500/50" />
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && !attachedFile) || disabled} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-transform"><PaperAirplaneIcon className="h-5 w-5 text-white" /></button>
                </div>
            </div>
        </div>
    );
};
