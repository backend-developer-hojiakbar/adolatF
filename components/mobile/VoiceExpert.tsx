
import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, XMarkIcon, StrategyIcon } from '../icons';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import type { UsageInfo } from '../../types';

interface VoiceExpertProps {
    t: (key: string) => string;
    language: string;
    incomingDoc: {pages: string[], name: string} | null;
    onDocProcessed: () => void;
    onDeductTokens: (usage: UsageInfo) => void;
    disabled?: boolean;
}

function decodeBase64(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

function encodeBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}

export const VoiceExpert: React.FC<VoiceExpertProps> = ({ t, incomingDoc, onDocProcessed, onDeductTokens, disabled }) => {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState(t('mobile_voice_ready'));
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null);
    
    // Tracking tokens to deduct in real-time
    const lastDeductedTokensRef = useRef<number>(0);
    const PRICE_PER_TOKEN = 0.03;

    // Auto-trigger voice session if document is incoming
    useEffect(() => {
        if (incomingDoc && !isActive && !disabled) {
            setIsAnalyzingDoc(true);
            startSession(incomingDoc);
            onDocProcessed();
        }
    }, [incomingDoc, disabled]);

    const SYSTEM_INSTRUCTION = `
[SYSTEM ROLE]
Siz O'zbekiston Respublikasining professional huquqshunos-maslahatchisi va tajribali notiqsiz.

[CORE MISSION]
Agar foydalanuvchi hujjat yuborsa, uni chuqur tahlil qiling va quyidagi tartibda o'zbek tilida so'zlab bering:
1. HUJJAT TURI: Bu qanday hujjat?
2. FOYDA: Foydalanuvchi (mijoz) uchun bu hujjatdagi eng foydali 3 ta jihat qaysilar?
3. XAVF: Hujjatdagi "tuzoqlar", kamchiliklar yoki mijoz uchun xavfli bo'lishi mumkin bo'lgan bandlarni aniq ayting.
4. TAVSIYA: Keyingi qadamlar nima bo'lishi kerak?

[VOICE PARAMETERS]
Nutqingiz adabiy o'zbek tilida, professional va muloyim bo'lsin. Intonatsiyaga rioya qiling.
    `;

    const createAudioBlob = (data: Float32Array) => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
        return { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    };

    const cleanup = () => {
        if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
        sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        lastDeductedTokensRef.current = 0; // Reset token counter for next session
        setIsActive(false);
        setIsAiSpeaking(false);
        setIsAnalyzingDoc(false);
        setStatus(t('mobile_voice_ready'));
    };

    const startSession = async (docToAnalyze?: {pages: string[], name: string}) => {
        if (disabled) return;
        try {
            if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            await inputAudioContextRef.current.resume();
            await outputAudioContextRef.current.resume();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            setIsActive(true);
            lastDeductedTokensRef.current = 0;
            setStatus(docToAnalyze ? "Ҳужжат таҳлил қилинмоқда..." : t('mobile_voice_listening'));

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            sessionPromise.then(session => { if (sessionRef.current) session.sendRealtimeInput({ media: createAudioBlob(inputData) }); });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);

                        sessionPromise.then(session => {
                            if (docToAnalyze) {
                                // Send multimodal input for analysis
                                const imageParts = docToAnalyze.pages.map(page => ({
                                    inlineData: { mimeType: 'image/jpeg', data: page.split(',')[1] }
                                }));
                                session.sendRealtimeInput({ 
                                    parts: [
                                        ...imageParts, 
                                        { text: "Mana skanerlangan hujjat. Uni foydali va xavfli tomonlari bo'yicha chuqur tahlil qilib, ovoz chiqarib tushuntirib bering." }
                                    ] 
                                });
                            } else {
                                session.sendRealtimeInput({ text: "Salom bering va o'zingizni tanishtiring." });
                            }
                        });
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Real-time token deduction logic
                        if (message.usageMetadata) {
                            const currentTotal = message.usageMetadata.totalTokenCount;
                            const delta = currentTotal - lastDeductedTokensRef.current;
                            
                            if (delta > 0) {
                                onDeductTokens({
                                    totalTokens: delta,
                                    cost: delta * PRICE_PER_TOKEN
                                });
                                lastDeductedTokensRef.current = currentTotal;
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsAiSpeaking(true);
                            setIsAnalyzingDoc(false);
                            const ctx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.onended = () => { sourcesRef.current.delete(source); if (sourcesRef.current.size === 0) setIsAiSpeaking(false); };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsAiSpeaking(false);
                        }
                    },
                    onerror: (e) => { setStatus('Хатолик юз берди'); cleanup(); },
                    onclose: (e) => cleanup()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: SYSTEM_INSTRUCTION
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (error) { setStatus('Микрофон хатоси'); cleanup(); }
    };

    return (
        <div className="flex flex-col items-center text-center animate-assemble-in w-full h-full justify-center">
            <div className="mb-10">
                <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-fill-transparent uppercase tracking-widest">
                    {isAnalyzingDoc ? "AI ТАҲЛИЛИ" : t('mobile_voice_title')}
                </h2>
                <p className={`text-sm mt-3 font-bold transition-all duration-500 ${isAiSpeaking ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {isAiSpeaking ? "Adolat AI гапирмоқда..." : isAnalyzingDoc ? "Ҳужжат ўрганилмоқда..." : status}
                </p>
            </div>

            <div className="relative">
                {isActive && (
                    <>
                        <div className={`absolute inset-0 rounded-full blur-[80px] animate-pulse opacity-30 ${isAiSpeaking ? 'bg-violet-600' : 'bg-indigo-600'}`}></div>
                        <div className={`absolute inset-[-60px] border-2 rounded-full animate-ping opacity-5 ${isAiSpeaking ? 'border-violet-500' : 'border-indigo-500'}`}></div>
                        <div className={`absolute inset-[-30px] border-2 rounded-full animate-pulse opacity-10 ${isAiSpeaking ? 'border-violet-400' : 'border-indigo-400'}`}></div>
                    </>
                )}
                
                <button 
                    onClick={isActive ? cleanup : () => startSession()}
                    disabled={disabled}
                    className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-1000 shadow-2xl ${
                        isActive
                            ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-700 scale-105 shadow-indigo-500/40 border-0' 
                            : disabled ? 'bg-slate-900 opacity-50 grayscale cursor-not-allowed' : 'bg-slate-900/50 border border-white/5 backdrop-blur-md'
                    }`}
                >
                    {isAnalyzingDoc ? (
                         <StrategyIcon className="h-16 w-16 text-white animate-spin-slow" />
                    ) : isActive ? (
                        <div className="flex flex-col items-center gap-2">
                             <div className="flex gap-1 items-end h-8 mb-4">
                                {[1,2,3,4,5,6].map(i => (
                                    <div 
                                        key={i} 
                                        className={`w-1.5 rounded-full bg-white transition-all duration-300`} 
                                        style={{ 
                                            height: isAiSpeaking ? `${50 + Math.random() * 50}%` : '6px', 
                                            opacity: 0.6 + (Math.random() * 0.4)
                                        }}
                                    ></div>
                                ))}
                            </div>
                            <XMarkIcon className="h-10 w-10 text-white" />
                        </div>
                    ) : (
                        <MicrophoneIcon className={`h-16 w-16 ${disabled ? 'text-slate-600' : 'text-indigo-400'}`} />
                    )}
                </button>
            </div>

            <div className="mt-16 max-w-xs px-6">
                <div className="p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-3xl shadow-inner">
                    <p className="text-slate-400 text-[11px] leading-relaxed italic font-medium opacity-80">
                        {isAnalyzingDoc ? "Ҳужжатдаги барча бетлар АИ томонидан ўқилмоқда ва хавфлар қидирилмоқда..." : `"${t('mobile_voice_hint')}"`}
                    </p>
                </div>
            </div>
            
            {isActive && (
                <button 
                    onClick={cleanup}
                    className="mt-10 text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em]"
                >
                    Мулоқотни якунлаш
                </button>
            )}
        </div>
    );
};
