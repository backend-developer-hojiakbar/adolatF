import React from 'react';

interface EmptyStateProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string; // Now receives the translated title directly
    message: string; // Now receives the translated message directly
    children?: React.ReactNode;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children, t }) => {
    return (
        <div className="mt-10 text-center flex flex-col items-center justify-center p-8 polished-pane">
            <div className="text-[var(--accent-primary)] mb-4 p-4 bg-[var(--bg-secondary)]/50 rounded-full border border-[var(--border-color)]">
                {React.cloneElement(icon, { className: "h-10 w-10" })}
            </div>
            <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
            <p className="text-[var(--text-secondary)] mt-2 max-w-sm">{message}</p>
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
};