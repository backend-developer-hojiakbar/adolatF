
import React, { useState, useRef, useCallback } from 'react';
import { MicrophoneIcon, CheckIcon, CopyIcon } from './icons';
import { transcribeAudioMemo } from '../services/geminiService';

interface VoiceMemoUploaderProps {
    t: (key: string) => string;
    language: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

export const VoiceMemoUploader: React.FC<VoiceMemoUploaderProps> = ({ t, language }) => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleStartRecording = async () => {
        setRecordingState('recording');
        setError(null);
        setTranscribedText('');
        try {
            // Fix: Pass language argument
            const text = await transcribeAudioMemo(10, t as any, language); // Record for 10 seconds
            setTranscribedText(text);
            setRecordingState('finished');
        } catch (err: any) {
            setError(err.message || t('error_generic_title'));
            setRecordingState('idle');
        }
    };
    
    const handleCopy = () => {
        if (transcribedText) {
            navigator.clipboard.writeText(transcribedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getButtonContent = () => {
        switch(recordingState) {
            case 'recording':
                return <><div className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></div><span>{t('voice_memo_recording')}</span></>;
            case 'processing':
                return <span>{t('voice_memo_processing')}</span>;
            case 'finished':
                return <span>{t('voice_memo_record_again')}</span>;
            case 'idle':
            default:
                return <><MicrophoneIcon className="h-6 w-6" /><span>{t('voice_memo_start')}</span></>;
        }
    }

    return (
        <div className="polished-pane p-5 rounded-xl w-full h-full flex flex-col">
            <div className="flex items-start space-x-4">
                 <div className="p-3 bg-[var(--bg-secondary)]/50 rounded-lg text-[var(--accent-secondary)] border border-[var(--border-color)]">
                    <MicrophoneIcon className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-slate-200">{t('dashboard_action_voice_memo_title')}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">{t('dashboard_action_voice_memo_desc')}</p>
                </div>
            </div>

            <div className="flex-1 mt-4 flex flex-col">
                <button 
                    onClick={handleStartRecording} 
                    disabled={recordingState === 'recording' || recordingState === 'processing'}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-pane)] text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-70"
                >
                    {getButtonContent()}
                </button>

                {(transcribedText || error) && (
                    <div className="mt-3 p-3 bg-black/20 rounded-lg flex-1 text-sm text-slate-300 relative">
                        {error ? <p className="text-red-400">{error}</p> : <p>{transcribedText}</p>}
                        
                        {transcribedText && !error && (
                             <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white">
                                {copied ? <CheckIcon className="h-4 w-4 text-[var(--accent-primary)]" /> : <CopyIcon className="h-4 w-4" />}
                             </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
