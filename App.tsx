
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { translations } from './translations';
import type { View, Case, CaseFile, CaseParticipant, PendingCaseData, UsageInfo } from './types';

// Desktop Components
import { Navigation } from './components/Navigation';
import { CaseNavigation } from './components/CaseNavigation';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CaseInputForm } from './components/CaseInputForm';
import { AiDebateView } from './components/AiDebateView';
import { SummaryView } from './components/SummaryView';
import { HistoryView } from './components/HistoryView';
import { ResearchView } from './components/ResearchView';
import { SettingsView } from './components/SettingsView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { SimulationView } from './components/SimulationView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ParticipantEditorModal } from './components/ParticipantEditorModal';
import { PricingView } from './components/PricingView';
import { FeedbackModal } from './components/FeedbackModal';
import { TasksView } from './components/TasksView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { TimelineView } from './components/TimelineView';
import { EvidenceView } from './components/EvidenceView';
import { BillingView } from './components/BillingView';
import { NotesView } from './components/NotesView';
import { CalendarView } from './components/CalendarView';

// Mobile Components
import { MobileLayout } from './components/mobile/MobileLayout';

// Services
import { 
    getLegalStrategy, 
    getCaseParticipants,
    getDeepDiveAnalysis,
    generateSimulationData
} from './services/geminiService';

import { DashboardIcon } from './components/icons';

const App: React.FC = () => {
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'uz-cyr');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Persist balance in localStorage
    const [userBalance, setUserBalance] = useState(() => {
        const saved = localStorage.getItem('adolat_user_balance');
        return saved ? parseFloat(saved) : 1500000;
    });

    useEffect(() => {
        localStorage.setItem('adolat_user_balance', userBalance.toString());
    }, [userBalance]);

    const deductTokens = (usage: UsageInfo | undefined) => {
        if (usage && usage.cost > 0) {
            setUserBalance(prev => Math.max(0, prev - usage.cost));
        }
    };

    const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
        let translation = translations[language]?.[key] || translations['uz-cyr']?.[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(new RegExp(`{{${rKey}}}`, 'g'), replacements[rKey]);
            });
        }
        return translation;
    }, [language]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        document.body.classList.toggle('light-mode', theme === 'light');
        localStorage.setItem('language', language);
        localStorage.setItem('theme', theme);
        return () => window.removeEventListener('resize', handleResize);
    }, [theme, language]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [activeCaseView, setActiveCaseView] = useState<View>('knowledge_base');
    const [history, setHistory] = useState<Case[]>(() => JSON.parse(localStorage.getItem('caseHistory') || '[]'));
    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
    const [isSimulationLoading, setIsSimulationLoading] = useState(false);
    const [pendingCaseData, setPendingCaseData] = useState<PendingCaseData | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    
    const [deviceList, setDeviceList] = useState<string[]>(['AD-2025', 'MAC-BOOK-PRO', 'IPHONE-15-PRO']);
    const handleRemoveDevice = (id: string) => setDeviceList(prev => prev.filter(d => d !== id));

    useEffect(() => {
        localStorage.setItem('caseHistory', JSON.stringify(history));
    }, [history]);

    const handleLogin = (token: string) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    const handleAnalyze = async (courtType: string, caseDetails: string, files: CaseFile[], courtStage: string) => {
        setIsLoading(true);
        try {
            const { participants, usage } = await getCaseParticipants(caseDetails, files, t, language);
            deductTokens(usage);
            setPendingCaseData({ 
                caseDetails, 
                files, 
                courtType, 
                courtStage, 
                participants: participants.map(p => ({ name: p.name, role: p.suggestedRole })), 
                clientRole: '', 
                clientName: '' 
            });
        } catch (error: any) {
            alert(t(error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmParticipantsAndAnalyze = async (participants: CaseParticipant[], client: {name: string, role: string}) => {
        if (!pendingCaseData) return;
        setIsLoading(true);
        try {
            const result = await getLegalStrategy(pendingCaseData.caseDetails, pendingCaseData.files, pendingCaseData.courtType, pendingCaseData.courtStage, client.role, client.name, participants, t, language);
            deductTokens(result.usage);
            const newCase: Case = {
                id: `case-${Date.now()}`,
                title: `${client.name} иши`,
                caseDetails: pendingCaseData.caseDetails,
                files: pendingCaseData.files.map(({content, ...rest}) => rest),
                result,
                courtStage: pendingCaseData.courtStage,
                clientRole: client.role,
                clientName: client.name,
                participants,
                tasks: result.suggestedTasks.map((text, i) => ({ id: `task-${Date.now()}-${i}`, text, completed: false })),
                timeline: [], evidence: [], billing: [], notes: [], tags: [pendingCaseData.courtType, pendingCaseData.courtStage], folder: null, timestamp: new Date().toISOString()
            };
            setHistory(prev => [newCase, ...prev]);
            setCurrentCase(newCase);
            setActiveCaseView('knowledge_base');
            setPendingCaseData(null);
        } catch (error: any) {
            alert(t(error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetDeepDive = async () => {
        if (!currentCase) return;
        setIsDeepDiveLoading(true);
        try {
            const { analysis, usage } = await getDeepDiveAnalysis(
                currentCase.caseDetails,
                currentCase.files,
                currentCase.courtType,
                currentCase.courtStage,
                currentCase.participants,
                t,
                language
            );
            deductTokens(usage);
            
            // Update the case with deep dive analysis
            const updatedCase = {
                ...currentCase,
                result: {
                    ...currentCase.result,
                    deepDiveAnalysis: analysis
                }
            };
            
            setCurrentCase(updatedCase);
            setHistory(prev => prev.map(c => c.id === currentCase.id ? updatedCase : c));
        } catch (error: any) {
            console.error("Failed to get deep dive analysis", error);
            alert(t('error_generic_title'));
        } finally {
            setIsDeepDiveLoading(false);
        }
    };

    const handleGenerateSimulation = async () => {
        if (!currentCase) return;
        setIsSimulationLoading(true);
        try {
            const { courtroomScenario, crossExaminationQuestions, closingArgumentLead, closingArgumentDefender, usage } = await generateSimulationData(
                currentCase.caseDetails,
                currentCase.files,
                currentCase.courtType,
                currentCase.courtStage,
                currentCase.participants,
                t,
                language
            );
            deductTokens(usage);
            
            // Update the case with simulation data
            const updatedCase = {
                ...currentCase,
                result: {
                    ...currentCase.result,
                    courtroomScenario,
                    crossExaminationQuestions,
                    closingArgumentLead,
                    closingArgumentDefender
                }
            };
            
            setCurrentCase(updatedCase);
            setHistory(prev => prev.map(c => c.id === currentCase.id ? updatedCase : c));
        } catch (error: any) {
            console.error("Failed to generate simulation data", error);
            alert(t('error_generic_title'));
        } finally {
            setIsSimulationLoading(false);
        }
    };

    if (!authToken) return <PricingView onLogin={handleLogin} t={t} loginError={null} />;


    if (isMobile) {
        return <MobileLayout t={t} language={language} onLogout={handleLogout} balance={userBalance} onDeductTokens={deductTokens} />;
    }

    const renderActiveView = () => {
        const viewToRender = currentCase ? activeCaseView : activeView;
        
        switch (viewToRender) {
            case 'dashboard': return <DashboardView onStartAnalysis={() => setActiveView('analyze')} cases={history} onNavigate={setActiveView} onSelectCase={(c) => { setCurrentCase(c); setActiveCaseView('knowledge_base'); }} t={t} language={language} />;
            case 'analyze': return <CaseInputForm onAnalyze={handleAnalyze} isLoading={isLoading} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'history': return <HistoryView history={history} onSelect={(c) => { setCurrentCase(c); setActiveCaseView('knowledge_base'); }} onDelete={(id) => setHistory(prev => prev.filter(c => c.id !== id))} onSetFolder={() => {}} t={t} language={language} />;
            case 'research': return <ResearchView initialQuery={null} onQueryHandled={() => {}} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'calendar': return <CalendarView t={t} />;
            case 'settings': return <SettingsView t={t} deviceId="AD-2025" deviceList={deviceList} onRemoveDevice={handleRemoveDevice} />;
            
            case 'knowledge_base': return <KnowledgeBaseView caseData={currentCase} onNewAnalysis={() => { setCurrentCase(null); setActiveView('analyze'); }} onUpdateCase={() => {}} isUpdating={false} onGetDeepDive={handleGetDeepDive} isDeepDiveLoading={isDeepDiveLoading} onArticleSelect={(art) => { setActiveView('research'); }} onOpenFeedback={() => setShowFeedbackModal(true)} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'tasks': return <TasksView tasks={currentCase?.tasks || []} onUpdateTasks={(nt) => currentCase && setHistory(prev => prev.map(c => c.id === currentCase.id ? {...c, tasks: nt} : c))} t={t} language={language} />;
            case 'documents': return <DocumentGeneratorView caseData={currentCase} onNewAnalysis={() => {}} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'debate': return <AiDebateView caseData={currentCase} onNewAnalysis={() => {}} onRate={() => {}} t={t} language={language} />;
            case 'simulation': return <SimulationView caseData={currentCase} onNewAnalysis={() => {}} isLoading={isSimulationLoading} onGenerateSimulation={handleGenerateSimulation} onOpenFeedback={() => {}} t={t} />;
            case 'summary': return <SummaryView caseData={currentCase} onNewAnalysis={() => {}} onOpenFeedback={() => {}} onUpdateCase={(u) => currentCase && setHistory(prev => prev.map(c => c.id === currentCase.id ? u : c))} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'timeline': return <TimelineView caseData={currentCase} onUpdateTimeline={(nt) => currentCase && setHistory(prev => prev.map(c => c.id === currentCase.id ? {...c, timeline: nt} : c))} t={t} language={language} onDeductTokens={deductTokens} />;
            case 'evidence': return <EvidenceView caseData={currentCase} onUpdateEvidence={() => {}} t={t} />;
            case 'billing': return <BillingView caseData={currentCase} onUpdateBilling={(nb) => currentCase && setHistory(prev => prev.map(c => c.id === currentCase.id ? {...c, billing: nb} : c))} t={t} />;
            case 'notes': return <NotesView caseData={currentCase} onUpdateNotes={(nn) => currentCase && setHistory(prev => prev.map(c => c.id === currentCase.id ? {...c, notes: nn} : c))} t={t} language={language} />;
            
            default: return <DashboardView onStartAnalysis={() => setActiveView('analyze')} cases={history} onNavigate={setActiveView} onSelectCase={(c) => { setCurrentCase(c); setActiveCaseView('knowledge_base'); }} t={t} language={language}/>;
        }
    };

    return (
        <main className="main-container flex">
            {isLoading && <LoadingSpinner t={t} />}
            {pendingCaseData && (
                <ParticipantEditorModal
                    initialParticipants={pendingCaseData.participants.map(p => ({ name: p.name, suggestedRole: p.role }))}
                    onConfirm={handleConfirmParticipantsAndAnalyze}
                    onCancel={() => setPendingCaseData(null)}
                    isLoading={isLoading}
                    t={t}
                />
            )}
            <Navigation 
                activeView={currentCase ? 'dashboard' : activeView} 
                setActiveView={(v) => { setCurrentCase(null); setActiveView(v); }} 
                onLogout={handleLogout} 
                t={t} 
            />
            <div className="flex-1 pl-20 overflow-y-auto">
                <div className="p-6 sm:p-8 max-w-7xl mx-auto">
                   <Header 
                        title={t(`view_${currentCase ? activeCaseView : activeView}_title`)} 
                        description={t('app_subtitle')} 
                        icon={<DashboardIcon />} 
                        theme={theme} 
                        toggleTheme={toggleTheme} 
                        language={language} 
                        setLanguage={setLanguage} 
                        deviceId="AD-2025" 
                        balance={userBalance}
                        t={t} 
                    />
                   {currentCase && (
                        <div className="animate-assemble-in">
                            <CaseNavigation activeView={activeCaseView} setActiveView={setActiveCaseView} caseData={currentCase} t={t} />
                        </div>
                   )}
                   <div className="mt-8">{renderActiveView()}</div>
                </div>
            </div>
        </main>
    );
};

export default App;
