
import React, { useState, useRef, useEffect } from 'react';
import type { Case, CaseFile } from '../types';
import { EmptyState } from './EmptyState';
import { WinProbabilityGauge } from './SummaryView';
import { DatabaseIcon, CheckCircleIcon, ShieldExclamationIcon, LightBulbIcon, DocumentTextIcon, ChartBarIcon, ResearchIcon, DownloadIcon, UsersIcon, ExclamationIcon, ChatBubbleLeftRightIcon } from './icons';
import { CaseUpdateForm } from './CaseUpdateForm';

// Add type declarations for libraries loaded from CDN
declare global {
    interface Window {
        jspdf: any;
        XLSX: any;
    }
}

interface KnowledgeBaseViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  onUpdateCase: (caseId: string, additionalDetails: string, newFiles: CaseFile[]) => void;
  isUpdating: boolean;
  onGetDeepDive: () => void;
  isDeepDiveLoading: boolean;
  onArticleSelect: (article: string) => void;
  onOpenFeedback: () => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  language: string;
}

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-slate-100 mt-8 mb-4">{line.substring(3)}</h2>);
      continue;
    }
    
    if (line.trim().startsWith('* ')) {
      const listItems = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('* ')) {
        const itemLine = lines[j];
        const itemContent = itemLine.substring(itemLine.indexOf('* ') + 2);
        const parts = itemContent.split('**');
        const renderedParts = parts.map((part, index) => 
          index % 2 !== 0 ? <strong key={index} className="font-bold text-slate-100">{part}</strong> : <span key={index}>{part}</span>
        );
        listItems.push(<li key={j}>{renderedParts}</li>);
        j++;
      }
      elements.push(<ul key={`ul-start-${i}`} className="list-disc list-inside space-y-2 pl-4 my-3">{listItems}</ul>);
      i = j - 1;
      continue;
    }

    const parts = line.split('**');
    const renderedParts = parts.map((part, index) => 
        index % 2 !== 0 ? <strong key={index} className="font-bold text-slate-100">{part}</strong> : <span key={index}>{part}</span>
    );

    elements.push(<p key={i} className="mb-2 text-slate-400">{renderedParts}</p>);
  }
  return elements;
};

const SectionCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
}> = ({ title, icon, children }) => (
    <div className="polished-pane p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
                <div className="text-[var(--accent-secondary)]">{icon}</div>
                <h3 className="font-semibold text-lg text-slate-200">{title}</h3>
            </div>
        </div>
        <div className="text-slate-300 text-sm">
            {children}
        </div>
    </div>
);

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ caseData, onNewAnalysis, onUpdateCase, isUpdating, onGetDeepDive, isDeepDiveLoading, onArticleSelect, onOpenFeedback, t, language }) => {
  const [exportingType, setExportingType] = useState<'word' | null>(null);
  const result = caseData?.result;
  const isInvestigationStage = caseData?.courtStage === 'Tergov_raw';
  
  if (!caseData || !result || !result.knowledgeBase) {
    return (
        <EmptyState
            icon={<DatabaseIcon />}
            title={t('empty_state_kb_title')}
            message={t('empty_state_kb_message')}
            t={t}
        >
            <button
                onClick={onNewAnalysis}
                className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glow-color)]"
            >
                {t('button_start_new_analysis')}
            </button>
        </EmptyState>
    )
  }

  const { knowledgeBase, deepDiveAnalysis, winProbability, probabilityJustification, positiveFactors, negativeFactors } = result;
  const sol = knowledgeBase.statuteOfLimitations;

  const handleUpdate = (additionalDetails: string, newFiles: CaseFile[]) => {
      if (caseData) {
        onUpdateCase(caseData.id, additionalDetails, newFiles);
      }
  }

  const handleExportWord = () => {
    if (!caseData || !result) return;
    setExportingType('word');

    try {
        const listToHtml = (items: string[], title: string) => `<h4>${title}</h4><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        const markdownToHtml = (text: string) => text
            .replace(/##\s*(.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\s(.*)/g, '<li>$1</li>')
            .replace(/(\r\n|\n|\r)/gm, '<br>');

        let html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${caseData.title}</title></head>
            <body>
                <h1>${t('pdf_kb_full_report_title')}</h1>
                <h2>${t('pdf_report_for_case', { caseTitle: caseData.title })}</h2>
                <hr/>
                <h3>${t('win_probability_details')}</h3>
                <p><strong>${t('pdf_win_probability')}: ${winProbability}%</strong> - <i>${probabilityJustification}</i></p>
                ${listToHtml(positiveFactors, t('win_probability_positive_factors'))}
                ${listToHtml(negativeFactors, t('win_probability_negative_factors'))}
                <hr/>
                <h3>${t('kb_participants_title')}</h3>
                <ul>${caseData.participants.map(p => `<li><strong>${p.name}</strong> - ${p.role}${p.name === caseData.clientName ? ` (${t('kb_client_tag')})` : ''}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_key_facts')}</h3>
                <ul>${knowledgeBase.keyFacts.map(item => `<li><strong>${item.fact}:</strong> ${item.relevance}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_legal_issues')}</h3>
                ${listToHtml(knowledgeBase.legalIssues, '')}
                <hr/>
                 <h3>${t('kb_applicable_laws')}</h3>
                <ul>${knowledgeBase.applicableLaws.map(item => `<li><strong>${item.article}:</strong> ${item.summary}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_strengths')}</h3>
                ${listToHtml(knowledgeBase.strengths, '')}
                <h3>${t('kb_weaknesses')}</h3>
                ${listToHtml(knowledgeBase.weaknesses, '')}
                ${deepDiveAnalysis ? `<hr/><h3>${t('kb_deep_dive_title')}</h3>${markdownToHtml(deepDiveAnalysis)}` : ''}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeCaseTitle = caseData.title.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
        link.download = `${safeCaseTitle}_hisobot.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch(e) {
        console.error("Failed to generate Word file", e);
    } finally {
        setExportingType(null);
    }
  };


  return (
    <section className="animate-assemble-in space-y-6">
        <div className="flex justify-end mb-2 gap-2">
            <button onClick={onOpenFeedback} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>{t('button_feedback')}</span>
            </button>
            <button onClick={handleExportWord} disabled={!!exportingType} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover disabled:opacity-50">
                <DownloadIcon className="h-5 w-5" />
                <span>{exportingType ? t('button_generating') : t('button_export_word_kb')}</span>
                {exportingType && <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            </button>
        </div>
        
        <WinProbabilityGauge 
            probability={winProbability}
            justification={probabilityJustification}
            positiveFactors={positiveFactors}
            negativeFactors={negativeFactors}
            t={t}
        />

        <CaseUpdateForm onUpdate={handleUpdate} isLoading={isUpdating} t={t} language={language} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard 
                title={isInvestigationStage ? t('kb_key_evidence') : t('kb_key_facts')}
                icon={<DocumentTextIcon/>}
            >
                <ul className="list-disc list-inside space-y-2 pl-9">
                    {knowledgeBase.keyFacts.map((item, index) => <li key={index}><strong>{item.fact}:</strong> {item.relevance}</li>)}
                </ul>
            </SectionCard>
            <SectionCard 
                title={t('kb_participants_title')} 
                icon={<UsersIcon />}
            >
                 <ul className="list-disc list-inside space-y-2 pl-9">
                    {caseData.participants.map((p, index) => (
                        <li key={index}>
                            <strong>{p.name}</strong> - <span className="text-[var(--text-secondary)]">{p.role}</span>
                            {p.name === caseData.clientName && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">{t('kb_client_tag')}</span>}
                        </li>
                    ))}
                </ul>
            </SectionCard>
            {sol && (
                <SectionCard
                    title={t('kb_sol_title')}
                    icon={
                        sol.status === 'OK' ? <CheckCircleIcon className="text-green-400" /> :
                        sol.status === 'Xavf ostida' ? <ExclamationIcon className="text-yellow-400" /> :
                        <ShieldExclamationIcon className="text-red-400" />
                    }
                >
                    <div className="pl-9">
                        <p className={`font-bold ${
                            sol.status === 'OK' ? 'text-green-400' :
                            sol.status === 'Xavf ostida' ? 'text-yellow-400' :
                            'text-red-400'
                        }`}>{t(`sol_status_${sol.status.replace(/ /g, '_').replace("'", "")}`)}</p>
                        <p className="text-slate-400 mt-1 text-xs">{sol.summary}</p>
                    </div>
                </SectionCard>
            )}
             <SectionCard 
                title={isInvestigationStage ? t('kb_potential_charges') : t('kb_applicable_laws')}
                icon={<ChartBarIcon/>}
            >
                <ul className="space-y-1 -mx-2">
                    {knowledgeBase.applicableLaws.map((item, index) => (
                        <li key={index} className="rounded-md hover:bg-[var(--bg-secondary)] transition-all group transform hover:scale-[1.02]">
                           <div className="p-2 flex items-start gap-3">
                                <ResearchIcon className="h-4 w-4 text-[var(--accent-primary)] mt-1 flex-shrink-0" />
                                <div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <button
                                            onClick={() => onArticleSelect(item.article)}
                                            className="text-left font-semibold text-[var(--accent-primary)] group-hover:underline"
                                            title={t('case_input_research_article_tooltip', { article: item.article })}
                                        >
                                            {item.article}
                                        </button>
                                        {item.url && (
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900"
                                            >
                                                URL
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1">{item.summary}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <SectionCard 
                    title={t('kb_strengths')} 
                    icon={<CheckCircleIcon className="text-green-400"/>}
                >
                    <ul className="list-disc list-inside space-y-1 pl-9">
                        {knowledgeBase.strengths.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </SectionCard>
                 <SectionCard 
                    title={t('kb_weaknesses')} 
                    icon={<ShieldExclamationIcon className="text-red-400"/>}
                >
                    <ul className="list-disc list-inside space-y-1 pl-9">
                        {knowledgeBase.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </SectionCard>
            </div>
             <SectionCard 
                title={t('kb_legal_issues')} 
                icon={<LightBulbIcon/>}
            >
                 <ul className="list-disc list-inside space-y-1 pl-9">
                    {knowledgeBase.legalIssues.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </SectionCard>
        </div>

        <div className="polished-pane p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <LightBulbIcon className="h-10 w-10 text-[var(--accent-primary)] flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold text-xl text-slate-100">{t('kb_deep_dive_title')}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{t('kb_deep_dive_prompt')}</p>
                    </div>
                </div>
                <button
                    onClick={onGetDeepDive}
                    disabled={isDeepDiveLoading}
                    className="w-full sm:w-auto flex-shrink-0 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50"
                >
                    {isDeepDiveLoading ? (
                        <div className="flex items-center gap-2">
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           <span>{t('deep_dive_loading')}</span>
                        </div>
                    ) : (
                       <span>{t('button_deep_dive')}</span>
                    )}
                </button>
            </div>
            {deepDiveAnalysis && (
                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                    {renderMarkdown(deepDiveAnalysis)}
                </div>
            )}
        </div>
    </section>
  );
};
