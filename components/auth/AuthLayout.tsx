
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-2xl p-8 relative z-10 animate-assemble-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-purple-400 bg-clip-text text-transparent mb-2">
                        Adolat AI
                    </h1>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{title}</h2>
                    <p className="text-[var(--text-secondary)] text-sm">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};
