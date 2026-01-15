
import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ChevronDownIcon } from './icons';

interface ViewControlsProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LANGUAGES = [
    { code: 'uz-cyr', name: 'Ўзбекча', short: 'ЎЗ' },
    { code: 'ru', name: 'Русский', short: 'РУ' },
    { code: 'en', name: 'English', short: 'EN' },
];

export const ViewControls: React.FC<ViewControlsProps> = ({ theme, toggleTheme, language, setLanguage }) => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLangSelect = (langCode: string) => {
        setLanguage(langCode);
        setIsLangOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 polished-pane px-3 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                >
                    <span className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-400 border border-indigo-500/20">
                        {currentLang.short}
                    </span>
                    <span>{currentLang.name}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                    <div className="absolute right-0 mt-2 w-40 polished-pane p-1.5 z-50 shadow-2xl animate-assemble-in overflow-hidden">
                        <div className="space-y-1">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangSelect(lang.code)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                        language === lang.code 
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'text-[var(--text-secondary)] hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Switcher */}
            <button 
                onClick={toggleTheme} 
                className="p-2.5 polished-pane rounded-xl hover:border-[var(--accent-primary)] transition-all group"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                ) : (
                    <MoonIcon className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                )}
            </button>
        </div>
    );
};
