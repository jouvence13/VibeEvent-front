import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-8 sm:right-8 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto w-full sm:w-auto sm:min-w-80 max-w-md bg-white border rounded-[32px] p-5 shadow-2xl flex items-start gap-4 animate-in slide-in-from-right-10 duration-300",
                            toast.type === 'success' ? "border-emerald-500/20" : 
                            toast.type === 'error' ? "border-red-500/20" : "border-slate-200"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                            toast.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : 
                            toast.type === 'error' ? "bg-red-500/10 text-red-500" : "bg-slate-100 text-slate-500"
                        )}>
                            {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
                             toast.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
                        </div>
                        
                        <div className="flex-1 pt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Erreur' : 'Information'}
                            </p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {toast.message}
                            </p>
                        </div>

                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-300 hover:text-slate-900 transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
