import React from 'react';
import type { View } from '../types';
import { AnalysisIcon, HistoryIcon, LogoutIcon, DashboardIcon, ResearchIcon, SettingsIcon, CalendarIcon } from './icons';

interface NavigationProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const NavItem: React.FC<{
  label: string;
  description?: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, description, icon, isActive, onClick }) => {
  const baseClasses = "relative flex items-center justify-center w-16 h-16 group transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)] rounded-lg";
  
  const stateClasses = isActive
    ? "text-[var(--accent-primary)]"
    : "text-[var(--text-secondary)] hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Subtle background and strong glow for active item */}
      <div className={`absolute inset-0 rounded-lg bg-[var(--accent-primary)] transition-all duration-300 ${isActive ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`}></div>
      <div className={`absolute inset-0 rounded-lg blur-lg bg-[var(--accent-primary)] transition-all duration-300 ${isActive ? 'opacity-20' : 'opacity-0'}`}></div>
      
      <div className={`z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-1'}`}>
          {React.cloneElement(icon, { className: "h-7 w-7" })}
      </div>
      
      {/* Active indicator bar */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent-primary)] rounded-r-full transition-transform duration-300 ease-out ${isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50'}`}></div>

      {/* Tooltip */}
      <div className="absolute left-full ml-4 z-30 w-56 p-3 text-sm text-left polished-pane rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="font-bold text-slate-200 whitespace-nowrap">{label}</p>
        {description && <p className="text-xs text-[var(--text-secondary)] whitespace-normal mt-1">{description}</p>}
      </div>
    </button>
  );
};

export const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, onLogout, t }) => {
  const isCaseViewActive = ['knowledge_base', 'tasks', 'documents', 'debate', 'simulation', 'summary'].includes(activeView);

  const mainViews = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: <DashboardIcon />, description: t('view_dashboard_description') },
    { id: 'analyze', label: t('nav_analyze'), icon: <AnalysisIcon />, description: t('view_analyze_description') },
    { id: 'history', label: t('nav_history'), icon: <HistoryIcon />, description: t('view_history_description') },
    { id: 'research', label: t('nav_research'), icon: <ResearchIcon />, description: t('view_research_description') },
    { id: 'calendar', label: t('nav_calendar'), icon: <CalendarIcon />, description: t('view_calendar_description') },
  ];

  const bottomViews = [
    { id: 'settings', label: t('nav_settings'), icon: <SettingsIcon />, description: t('view_settings_description') },
  ]

  return (
    <nav className="fixed top-0 left-0 z-20 polished-pane h-screen w-20 border-r border-[var(--border-color)] flex flex-col justify-between">
      <div>
        <div className="h-20 flex items-center justify-center">
            {/* Logo */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-[var(--glow-color-primary)]">A</div>
        </div>
        <div className="flex flex-col items-center space-y-2 p-2">
            {mainViews.map(item => (
            <NavItem
                key={item.id}
                label={item.label}
                description={item.description}
                icon={item.icon}
                isActive={activeView === item.id}
                onClick={() => setActiveView(item.id as View)}
            />
            ))}
        </div>
      </div>
      
      <div className="w-full flex flex-col items-center p-2 mb-2 space-y-2">
         {bottomViews.map(item => (
            <NavItem
                key={item.id}
                label={item.label}
                description={item.description}
                icon={item.icon}
                isActive={activeView === item.id}
                onClick={() => setActiveView(item.id as View)}
            />
         ))}
         <NavItem
            label={t('nav_logout')}
            icon={<LogoutIcon />}
            isActive={false}
            onClick={onLogout}
        />
      </div>
    </nav>
  );
};