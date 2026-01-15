
import React from 'react';
import { MapIcon, CheckCircleIcon } from '../icons';

export const LegalRoadmap: React.FC<{ t: (key: string) => string, language: string }> = ({ t }) => {
    const steps = [
        { id: 1, title: t('mobile_roadmap_step1'), status: 'completed' },
        { id: 2, title: t('mobile_roadmap_step2'), status: 'active' },
        { id: 3, title: t('mobile_roadmap_step3'), status: 'pending' },
        { id: 4, title: t('mobile_roadmap_step4'), status: 'pending' },
    ];

    return (
        <div className="w-full animate-assemble-in">
            <header className="flex items-center gap-3 mb-8">
                <MapIcon className="h-6 w-6 text-indigo-400" />
                <h2 className="text-xl font-bold">{t('mobile_roadmap_title')}</h2>
            </header>

            <div className="space-y-4">
                {steps.map((step) => (
                    <div key={step.id} className={`p-4 rounded-2xl border transition-all ${
                        step.status === 'active' 
                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                            : 'bg-slate-900/40 border-white/5 opacity-70'
                    }`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                step.status === 'completed' ? 'bg-green-500 text-white' :
                                step.status === 'active' ? 'bg-indigo-500 text-white' : 'bg-slate-700'
                            }`}>
                                {step.status === 'completed' ? <CheckCircleIcon className="h-5 w-5" /> : step.id}
                            </div>
                            <span className="font-semibold text-slate-200">{step.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
