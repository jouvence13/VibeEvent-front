import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const transactionId = searchParams.get('transactionId');
    const eventId = searchParams.get('eventId');
    const summary = searchParams.get('summary');

    useEffect(() => {
        const syncPayment = async () => {
            try {
                if (!transactionId) {
                    setMessage('Paiement validé.');
                    return;
                }

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/tickets/confirm-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ transactionId })
                });

                const data = await response.json();
                if (response.ok) {
                    setMessage(data.message || 'Votre billet est prêt.');
                } else {
                    setMessage(data.message || 'Paiement reçu, synchronisation en cours.');
                }
            } catch (error) {
                console.error(error);
                setMessage('Paiement reçu, synchronisation en cours.');
            } finally {
                setLoading(false);
            }
        };

        syncPayment();
    }, [transactionId]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-[40px] border border-slate-200/80 bg-white p-6 text-center shadow-[0_24px_90px_-50px_rgba(15,23,42,0.4)] sm:p-10 lg:p-14">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 size={44} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Paiement confirmé</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                    Merci, votre achat est validé.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                    {message}
                </p>

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Transaction</p>
                        <p className="mt-2 truncate text-sm font-bold text-slate-900">{transactionId || 'N/A'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Billet</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{summary || 'Pass sélectionné'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Statut</p>
                        <p className="mt-2 text-sm font-bold text-emerald-600">Validé</p>
                    </div>
                </div>

                <div className="mt-8 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5 text-left">
                    <div className="flex items-center gap-2 text-slate-900">
                        <ShieldCheck size={18} className="text-red-500" />
                        <p className="text-sm font-black uppercase tracking-[0.18em]">Votre billet est sécurisé</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Si la page se ferme trop tôt, le webhook FedaPay termine la création du billet en arrière-plan.
                    </p>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => navigate('/tickets')}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800"
                    >
                        <Ticket size={16} />
                        Voir mes billets
                    </button>
                    <button
                        onClick={() => navigate(eventId ? `/event/${eventId}` : '/explore')}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 transition-all hover:border-slate-300"
                    >
                        Continuer
                        <ArrowRight size={16} />
                    </button>
                </div>

                {loading && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="animate-spin" size={16} />
                        Synchronisation du billet...
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
