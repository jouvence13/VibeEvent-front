import React, { useState, useEffect } from 'react';
import { Calendar, BarChart2, Star, Check, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';
import { loadFedaPayCheckout } from '../lib/fedapayCheckout';

const Upgrade = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(null);
    const [currency, setCurrency] = useState('EUR');
    const [rate, setRate] = useState(1);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Simulate currency detection (e.g. converting 1 USD to EUR/local roughly)
    useEffect(() => {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        if (locale.includes('US')) {
            setCurrency('USD');
            setRate(1.08); // Equivalent value factor
        } else if (locale.includes('FR') || locale.includes('EU')) {
            setCurrency('EUR');
            setRate(1);
        } else if (locale.includes('SN') || locale.includes('CI')) {
            setCurrency('XOF');
            setRate(655.95);
        }
    }, []);

    const formatPrice = (basePrice) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency }).format(basePrice * rate);
    };

    const handleCheckout = async (plan) => {
        setLoading(plan);
        try {
            const token = localStorage.getItem('token');
            const checkoutScriptPromise = loadFedaPayCheckout();

            const response = await fetch('http://localhost:5000/api/auth/upgrade-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || "Erreur lors de la demande d'abonnement.", "error");
                setLoading(null);
                return;
            }

            await checkoutScriptPromise;

            const checkout = window.FedaPay.init({
                public_key: data.publicKey,
                transaction: { id: data.transactionId },
                onComplete: async (_reason, transaction) => {
                    if (transaction?.status === 'approved') {
                        try {
                            const confirmRes = await fetch('http://localhost:5000/api/auth/confirm-upgrade', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ transactionId: data.transactionId })
                            });
                            const confirmData = await confirmRes.json();

                            if (confirmRes.ok) {
                                localStorage.setItem('user', JSON.stringify(confirmData.user));
                                // Force a page reload to resync the Sidebar options globally
                                window.location.href = '/dashboard';
                                return;
                            }

                            showToast(confirmData.message || 'Paiement reçu, synchronisation en cours.', 'error');
                        } catch (err) {
                            console.error(err);
                            showToast('Paiement reçu, synchronisation en cours.', 'error');
                        }
                    } else {
                        showToast('Paiement non finalisé.', 'error');
                    }
                    setLoading(null);
                }
            });

            checkout.open();
        } catch (err) {
            console.error(err);
            showToast("Erreur de connexion serveur.", "error");
            setLoading(null);
        }
    };

    const iconColorClasses = {
        blue: 'text-blue-500',
        red: 'text-red-500',
        emerald: 'text-emerald-500'
    };

    const plans = [
        {
            id: 'events_only',
            name: 'Événements',
            icon: <Calendar size={24} className="text-blue-500" />,
            price: 15,
            description: 'Parfait pour les organisateurs de soirées et festivals.',
            features: ['Création illimitée d\'événements', 'Génération de billets QR', 'Scanner mobile inclus', 'Pas de sondages'],
            color: 'blue'
        },
        {
            id: 'premium',
            name: 'Suite Complète',
            icon: <Star size={32} className="text-red-500" />,
            price: 20,
            description: 'L\'expérience ultime pour tout gérer sur EventChill.',
            features: ['Toutes les fonctionnalités Événements', 'Toutes les fonctionnalités Sondages', 'Support prioritaire 24/7', 'Analyses avancées'],
            color: 'red',
            popular: true
        },
        {
            id: 'polls_only',
            name: 'Sondages',
            icon: <BarChart2 size={24} className="text-emerald-500" />,
            price: 9,
            description: 'Idéal pour faire participer votre communauté.',
            features: ['Création infinie de sondages', 'Votes en temps réel sécurisés', 'Export CSV des résultats', 'Pas de billetterie'],
            color: 'emerald'
        }
    ];

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-black tracking-tighter mb-4">Devenez un véritable Créateur.</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Choisissez le forfait qui correspond exactement à vos besoins. Vous ne paierez que pour les outils que vous utilisez.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((p) => (
                    <div 
                        key={p.id} 
                        className={cn(
                            "bg-white rounded-[40px] p-8 border-2 transition-all hover:-translate-y-2 relative flex flex-col h-full",
                            p.popular ? "border-red-500 shadow-2xl shadow-red-500/10 lg:scale-105 z-10" : "border-slate-200 shadow-xl shadow-slate-200/50"
                        )}
                    >
                        {p.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest py-1 px-4 rounded-full">
                                Le plus choisi
                            </div>
                        )}

                        <div className="mb-6 flex justify-between items-start">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50", iconColorClasses[p.color])}>
                                {p.icon}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black tracking-tight mb-2">{p.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 h-10">{p.description}</p>
                        
                        <div className="mb-8">
                            <span className="text-4xl font-black tracking-tighter">{formatPrice(p.price)}</span>
                            <span className="text-slate-500 font-bold"> / mois</span>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {p.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check size={16} className={cn("text-slate-400", feat.startsWith('Pas de') && "opacity-30")} />
                                    </div>
                                    <span className={cn("text-sm font-medium", feat.startsWith('Pas de') ? "text-slate-400 line-through" : "text-slate-700")}>
                                        {feat}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => handleCheckout(p.id)}
                            disabled={loading !== null || user.plan === p.id}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2",
                                user.plan === p.id 
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : p.popular 
                                        ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20" 
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                            )}
                        >
                            {loading === p.id ? (
                                <><Loader2 size={18} className="animate-spin" /> Traitement...</>
                            ) : user.plan === p.id ? "Pack Actuel" : (user.plan && user.plan !== 'none') ? "Changer pour ce pack" : "Sélectionner ce pack"}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center text-slate-400 text-xs">
                Paiement sécurisé par FedaPay. Votre abonnement est activé dès la confirmation du paiement.
            </div>
        </div>
    );
};

export default Upgrade;
