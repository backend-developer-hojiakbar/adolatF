
import React from 'react';
import { ViewControls } from './ViewControls';
import { ComputerDesktopIcon, CurrencyDollarIcon } from './icons';

interface HeaderProps {
    title: string;
    icon: React.ReactElement<{ className?: string }>;
    description: string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    deviceId: string | null;
    balance: number;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const Header: React.FC<HeaderProps> = ({ title, icon, description, theme, toggleTheme, language, setLanguage, deviceId, balance, t }) => {
  // Format balance to 1 499 093.79 style
  const formattedBalance = balance.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).replace(',', '.');

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full polished-pane">
              <div className="text-[var(--accent-primary)]">
                {React.cloneElement(icon, { className: "h-8 w-8" })}
              </div>
          </div>
          <div>
              <h1 className="text-3xl font-bold tracking-tight animated-gradient-text">{title}</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
          </div>
      </div>
      <div className="self-end sm:self-auto flex items-center gap-4">
        {/* Balance Badge (UZS) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 px-4 py-2 rounded-2xl shadow-xl shadow-indigo-500/5">
            <div className="bg-indigo-500 rounded-full p-1 shadow-lg shadow-indigo-500/50">
                <CurrencyDollarIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 leading-none">{t('user_balance')}</span>
                <span className="text-lg font-black text-white leading-tight">
                    {formattedBalance} <span className="text-[10px] opacity-60 font-medium uppercase">{t('currency_sum')}</span>
                </span>
            </div>
        </div>

        {deviceId && (
            <div 
                className="hidden lg:flex items-center gap-2 polished-pane px-3 py-1.5 rounded-xl text-sm font-medium text-[var(--text-secondary)]"
                title={t('device_id_label')}
            >
                <ComputerDesktopIcon className="h-5 w-5" />
                <span className="font-mono tracking-wider">{deviceId}</span>
            </div>
        )}
        <ViewControls
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
      </div>
    </header>
  );
};
