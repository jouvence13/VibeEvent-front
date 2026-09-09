import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content */}
            <div className="bg-white w-full max-w-md max-h-[90vh] rounded-[40px] shadow-2xl shadow-slate-900/10 border border-slate-200 relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h3 className="text-xl font-black tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                        aria-label="Fermer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {children}
                </div>

                {footer && (
                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
