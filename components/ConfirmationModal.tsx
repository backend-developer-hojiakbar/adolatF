import React from 'react';
import { XMarkIcon, ExclamationIcon } from './icons';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, t }) => {
    
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-assemble-in">
            <div className="polished-pane shadow-2xl w-full max-w-md relative animate-assemble-in">
                <button onClick={onCancel} className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-white transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-8">
                    <div className="flex items-start space-x-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                           <ExclamationIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
                        </div>
                    </div>
                     <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-x-reverse">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-[var(--border-color)] shadow-sm px-4 py-2 bg-[var(--bg-secondary)] text-base font-medium text-slate-300 hover:bg-[var(--bg-pane)] focus:outline-none sm:w-auto sm:text-sm"
                        >
                            {t('button_cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm"
                        >
                            {t('button_delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};