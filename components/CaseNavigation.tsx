
import React from 'react';
import type { View, Case } from '../types';
import { DatabaseIcon, CheckBadgeIcon, DocumentTextIcon, DebateIcon, TheaterIcon, StrategyIcon, HistoryIcon, BeakerIcon, CurrencyDollarIcon, PencilSquareIcon } from './icons';

interface CaseNavigationProps {
    activeView: View;
    setActiveView: (view: View) => void;
    caseData: Case;
    t: (key: string) => string;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 sm:flex-initial flex sm:flex-col items-center justify-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-all duration-300 text-sm font-semibold ${
            isActive
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-secondary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-pane)] hover:text-white'
        }`}
    >
        {React.cloneElement(icon, { className: "h-5 w-5" })}
        <span>{label}</span>
    </button>
);


export const CaseNavigation: React.FC<CaseNavigationProps> = ({ activeView, setActiveView, caseData, t }) => {
    const isInvestigationStage = caseData.courtStage === 'Tergov_raw';

    const views = [
        { id: 'knowledge_base', label: isInvestigationStage ? t('nav_investigation_materials') : t('nav_knowledge_base'), icon: <DatabaseIcon /> },
        { id: 'timeline', label: t('nav_timeline'), icon: <HistoryIcon /> },
        { id: 'evidence', label: t('nav_evidence'), icon: <BeakerIcon /> },
        { id: 'tasks', label: t('nav_tasks'), icon: <CheckBadgeIcon /> },
        { id: 'documents', label: t('nav_documents'), icon: <DocumentTextIcon /> },
        { id: 'notes', label: t('nav_notes'), icon: <PencilSquareIcon /> },
        { id: 'billing', label: t('nav_billing'), icon: <CurrencyDollarIcon /> },
        { id: 'debate', label: isInvestigationStage ? t('nav_investigation_debate') : t('nav_debate'), icon: <DebateIcon /> },
        { id: 'simulation', label: t('nav_simulation'), icon: <TheaterIcon /> },
        { id: 'summary', label: isInvestigationStage ? t('nav_investigation_summary') : t('nav_summary'), icon: <StrategyIcon /> },
    ];

    return (
        <div className="mt-8 border-b border-[var(--border-color)]">
            <nav className="flex items-center justify-center flex-wrap -mb-px" aria-label="Tabs">
                {views.map((view) => (
                    <NavItem
                        key={view.id}
                        label={view.label}
                        icon={view.icon}
                        isActive={activeView === view.id}
                        onClick={() => setActiveView(view.id as View)}
                    />
                ))}
            </nav>
        </div>
    );
};
