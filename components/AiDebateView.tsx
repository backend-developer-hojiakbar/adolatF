
import React, { useState, useEffect } from 'react';
import type { Case } from '../types';
import { AiLawyerCard } from './AiLawyerCard';
import { EmptyState } from './EmptyState';
import { AnalysisIcon, DownloadIcon } from './icons';
import { AI_LAWYERS, AI_INVESTIGATORS } from '../constants';

interface AiDebateViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  onRate: (debateIndex: number, rating: 'up' | 'down') => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  language: string;
}

export const AiDebateView: React.FC<AiDebateViewProps> = ({ caseData, onNewAnalysis, onRate, t, language }) => {
  const [selectedLawyerName, setSelectedLawyerName] = useState<string | null>(null);
  const debate = caseData?.result?.debate;
  const isInvestigationStage = caseData?.courtStage === 'Tergov_raw';
  const personas = isInvestigationStage ? AI_INVESTIGATORS : AI_LAWYERS;

  useEffect(() => {
    if (debate && debate.length > 0) {
      if (!selectedLawyerName || !debate.some(d => d.lawyerName === selectedLawyerName)) {
        setSelectedLawyerName(debate[0].lawyerName);
      }
    }
  }, [debate, selectedLawyerName]);
  
  if (!debate) {
    return (
        <EmptyState 
            icon={<AnalysisIcon />}
            title={t('empty_state_debate_title')}
            message={t('empty_state_debate_message')}
            t={t}
        >
            <button
                onClick={onNewAnalysis}
                className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-[var(--glow-color)]"
            >
                {t('button_start_new_analysis')}
            </button>
        </EmptyState>
    )
  }

  const selectedResponse = debate.find(response => response.lawyerName === selectedLawyerName);
  const selectedResponseIndex = debate.findIndex(response => response.lawyerName === selectedLawyerName);

  return (
    <section>
        <div className="mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
            {debate.map((response) => {
                const persona = personas.find(p => p.name === response.lawyerName);
                if (!persona) return null;
                const isActive = selectedLawyerName === response.lawyerName;
                const personaKey = persona.name.toLowerCase().replace(/ /g, '_').replace('-', '_');
                const personaNameKey = isInvestigationStage ? `persona_investigator_${personaKey}_name` : `persona_${personaKey}_name`;
                const personaTitleKey = isInvestigationStage ? `persona_investigator_${personaKey}_title` : `persona_${personaKey}_title`;
                const personaDescriptionKey = isInvestigationStage ? `persona_investigator_${personaKey}_description` : `persona_${personaKey}_description`;
                
                return (
                <div key={response.lawyerName} className="relative group flex-1 sm:flex-auto">
                    <button
                        onClick={() => setSelectedLawyerName(response.lawyerName)}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                        isActive
                            ? `bg-[var(--bg-secondary)] text-white shadow-lg scale-105 border-[var(--border-color)] ring-2 ring-[var(--accent-primary)]`
                            : `bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-pane)] hover:text-white hover:-translate-y-1 hover:scale-105`
                        }`}
                    >
                        <span className={persona.textColor}>
                        {React.cloneElement(persona.icon, { className: "h-6 w-6" })}
                        </span>
                        <span className="font-semibold text-sm whitespace-nowrap">{t(personaNameKey)}</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 w-64 left-1/2 -translate-x-1/2 p-3 text-xs text-left polished-pane rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <p className="font-bold text-sm text-slate-200">{t(personaTitleKey)}</p>
                        <p className="text-slate-400 mt-1">{t(personaDescriptionKey)}</p>
                    </div>
                </div>
                );
            })}
            </div>
      </div>
      
      <div className="space-y-6">
        {selectedResponse && selectedResponseIndex !== -1 && (
          <AiLawyerCard 
            key={selectedResponseIndex} 
            response={selectedResponse} 
            onRate={(rating) => onRate(selectedResponseIndex, rating)}
            t={t}
            language={language}
            isInvestigationStage={isInvestigationStage}
          />
        )}
      </div>
    </section>
  );
};
