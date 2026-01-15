
import React from 'react';
import type { Case, View } from '../types';
import { AnalysisIcon, HistoryIcon, ResearchIcon, FolderIcon, PlusIcon } from './icons';

const getLocaleForLanguage = (language: string) => {
    switch (language) {
        case 'uz-cyr': return 'uz-Cyrl-UZ';
        case 'ru': return 'ru-RU';
        case 'en': return 'en-US';
        default: return 'uz-Cyrl-UZ';
    }
}

const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);
    const locale = getLocaleForLanguage(language);
    return date.toLocaleString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}


interface DashboardViewProps {
    onStartAnalysis: () => void;
    cases: Case[];
    onNavigate: (view: View) => void;
    onSelectCase: (caseItem: Case) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    language: string;
}

const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
}> = ({ icon, title, description, onClick, variant = 'secondary' }) => (
    <button 
        onClick={onClick} 
        className={`polished-pane interactive-hover p-6 text-left w-full h-full flex items-start space-x-5 ${
            variant === 'primary' ? 'border-indigo-500/30 bg-indigo-500/5' : ''
        }`}
    >
        <div className={`p-4 rounded-2xl flex-shrink-0 ${
            variant === 'primary' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-800 text-indigo-400 border border-white/5'
        }`}>
            {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-7 w-7" })}
        </div>
        <div>
            <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    </button>
);

const CaseCard: React.FC<{ caseItem: Case, onSelect: () => void, t: (key: string) => string, language: string }> = ({ caseItem, onSelect, t, language }) => {
    const translatedTags = caseItem.tags.map(tag => {
        const typeKey = `court_type_${tag.toLowerCase().replace("'", "")}`;
        const typeTranslation = t(typeKey);
        if (typeTranslation !== typeKey) return typeTranslation;

        const stageKey = `court_stage_${tag.replace(/ /g, '_').toLowerCase()}`;
        const stageTranslation = t(stageKey);
        if (stageTranslation !== stageKey) return stageTranslation;
        
        return tag;
    }).join(' • ');
    
    return (
        <button onClick={onSelect} className="polished-pane interactive-hover p-5 rounded-2xl text-left w-full flex flex-col h-full bg-slate-800/40 border-white/5">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-100 truncate">{caseItem.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                        {translatedTags}
                    </span>
                </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{t('case_card_last_updated')}</span>
                <span className="text-xs text-slate-400">{formatDate(caseItem.timestamp, language)}</span>
            </div>
        </button>
    );
};


export const DashboardView: React.FC<DashboardViewProps> = ({ onStartAnalysis, cases, onNavigate, onSelectCase, t, language }) => {
    return (
        <div className="space-y-12 animate-assemble-in pb-12">
            {/* Quick Actions */}
            <section>
                <header className="mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        {t('dashboard_quick_actions')}
                    </h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <QuickActionButton 
                        variant="primary"
                        icon={<AnalysisIcon />}
                        title={t('dashboard_action_new_analysis_title')}
                        description={t('dashboard_action_new_analysis_desc')}
                        onClick={onStartAnalysis}
                    />
                     <QuickActionButton 
                        icon={<ResearchIcon />}
                        title={t('dashboard_action_express_analysis_title')}
                        description={t('dashboard_action_express_analysis_desc')}
                        onClick={() => onNavigate('research')}
                    />
                    <QuickActionButton 
                        icon={<HistoryIcon />}
                        title={t('dashboard_action_all_cases_title')}
                        description={t('dashboard_action_all_cases_desc')}
                        onClick={() => onNavigate('history')}
                    />
                </div>
            </section>

            {/* My Cases */}
            <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        {t('dashboard_my_cases')}
                    </h2>
                    {cases.length > 0 && (
                        <button onClick={() => onNavigate('history')} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                            {t('dashboard_view_all')}
                        </button>
                    )}
                 </div>
                 {cases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cases.slice(0, 6).map(c => (
                            <CaseCard key={c.id} caseItem={c} onSelect={() => onSelectCase(c)} t={t} language={language}/>
                        ))}
                        {/* Empty "Add New" Card */}
                        <button onClick={onStartAnalysis} className="polished-pane border-dashed border-2 border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex flex-col items-center justify-center p-8 gap-3 transition-all duration-300 group">
                             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <PlusIcon className="h-6 w-6" />
                             </div>
                             <span className="font-bold text-slate-500 group-hover:text-slate-300">{t('nav_analyze')}</span>
                        </button>
                    </div>
                 ) : (
                    <div className="text-center py-20 polished-pane rounded-3xl border-dashed border-2 border-slate-700/50 bg-slate-900/20">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FolderIcon className="h-10 w-10 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-lg font-medium">{t('dashboard_no_cases')}</p>
                        <button 
                            onClick={onStartAnalysis} 
                            className="mt-8 btn-gradient font-bold py-4 px-10 rounded-2xl shadow-2xl shadow-indigo-500/20"
                        >
                             {t('button_start_new_analysis')}
                        </button>
                    </div>
                 )}
            </section>
        </div>
    );
};
