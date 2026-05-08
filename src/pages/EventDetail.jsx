import React, { useState, useEffect } from 'react';
import { 
    MapPin, 
    Calendar, 
    ChevronLeft, 
    Share2, 
    Navigation, 
    ShieldCheck, 
    Timer,
    Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

const loadFedaPayCheckout = () => {
    if (window.FedaPay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://cdn.fedapay.com/checkout.js?v=1.1.7"]');

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Unable to load FedaPay checkout')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load FedaPay checkout'));
        document.body.appendChild(script);
    });
};

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [ticketQuantities, setTicketQuantities] = useState({});
    const [heroImageSrc, setHeroImageSrc] = useState(null);
    const [heroImageTooSmall, setHeroImageTooSmall] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Minimum dimensions for the hero image (avoid low-res uploads)
    const MIN_HERO_IMAGE_WIDTH = 1200;
    const MIN_HERO_IMAGE_HEIGHT = 600;
    const FALLBACK_HERO_IMAGE =
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80';

    const handleGoBack = () => {
        if (event && event.createdBy) {
            // Check if createdBy is a string (ObjectId) or an object (populated user)
            const createdById = typeof event.createdBy === 'string' 
                ? event.createdBy 
                : event.createdBy._id;
            
            // Compare with current user
            const currentUserId = currentUser._id || currentUser.id;
            
            if (createdById === currentUserId) {
                // User created this event, go back to their management dashboard
                navigate('/dashboard/events');
            } else {
                // User is browsing, go back to explore
                navigate('/explore');
            }
        } else {
            // Default to explore if we can't determine ownership
            navigate('/explore');
        }
    };

    const getEventStartAt = (ev) => ev?.startAt || ev?.date;
    const getEventEndAt = (ev) => ev?.endAt || ev?.date;

    const formatDateRange = (ev) => {
        const start = getEventStartAt(ev);
        const end = getEventEndAt(ev);
        if (!start) return '';

        const startDate = new Date(start);
        const endDate = end ? new Date(end) : null;

        // Multi-day event: show date range
        if (endDate && startDate.toDateString() !== endDate.toDateString()) {
            return `${startDate.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })} → ${endDate.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })}`;
        }

        return startDate.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatTimeRange = (ev) => {
        const start = getEventStartAt(ev);
        const end = getEventEndAt(ev);
        if (!start) return '';

        const startDate = new Date(start);
        const endDate = end ? new Date(end) : null;

        // Same-day: show hours range, otherwise show start time only
        if (endDate && startDate.toDateString() === endDate.toDateString()) {
            return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        return startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/events/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setEvent(data);
                    setHeroImageSrc(data.image || FALLBACK_HERO_IMAGE);
                    setHeroImageTooSmall(false);
                    if (Array.isArray(data.tickets)) {
                        const initialQuantities = data.tickets.reduce((acc, ticket) => {
                            acc[ticket.tier] = 0;
                            return acc;
                        }, {});
                        setTicketQuantities(initialQuantities);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    useEffect(() => {
        // Preload checkout as soon as the page is visible to reduce click-to-open latency.
        loadFedaPayCheckout().catch(() => {
            // Ignore preload failure; we'll retry on click.
        });
    }, []);

    const updateQuantity = (tier, nextValue) => {
        const safeValue = Number.isFinite(nextValue) ? Math.max(0, Math.floor(nextValue)) : 0;
        setTicketQuantities((prev) => ({ ...prev, [tier]: safeValue }));
    };

    const selectedItems = event?.tickets
        ?.map((ticket) => ({
            tier: ticket.tier,
            quantity: Number(ticketQuantities[ticket.tier] || 0),
            unitPrice: Number(ticket.price || 0)
        }))
        .filter((item) => item.quantity > 0) || [];

    const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = selectedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const handleBuyTicket = async () => {
        if (totalQuantity <= 0) return;
        setPurchasing(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
                return;
            }

            // Run script loading and transaction creation in parallel for faster checkout opening.
            const checkoutScriptPromise = loadFedaPayCheckout();

            const response = await fetch('http://localhost:5000/api/tickets/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ eventId: event._id, items: selectedItems.map(({ tier, quantity }) => ({ tier, quantity })) })
            });

            const data = await response.json();

            if (response.ok) {
                if (!data.requiresPayment) {
                    navigate('/tickets');
                    return;
                }

                await checkoutScriptPromise;

                const purchaseSummary = selectedItems.map((item) => `${item.tier} x${item.quantity}`).join(', ');

                const checkout = window.FedaPay.init({
                    public_key: data.publicKey,
                    transaction: { id: data.transactionId },
                    onComplete: async (_reason, transaction) => {
                        if (transaction?.status === 'approved') {
                            navigate(`/payment/success?transactionId=${data.transactionId}&eventId=${event._id}&summary=${encodeURIComponent(purchaseSummary)}`);
                            return;
                        }

                        navigate(`/payment/failed?eventId=${event._id}&summary=${encodeURIComponent(purchaseSummary)}&reason=${encodeURIComponent(transaction?.status || 'Paiement non finalisé')}`);
                    }
                });

                checkout.open();
            } else {
                alert(data.message || 'Erreur lors de l\'achat');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <Loader2 className="animate-spin text-red-500" size={50} />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="w-full h-screen flex justify-center items-center flex-col">
                <h1 className="text-3xl font-black mb-4">Événement introuvable</h1>
                <button onClick={() => navigate('/explore')} className="text-red-500 font-bold hover:underline">
                    Retour à l'exploration
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
                {/* Hero */}
                <section className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr] lg:gap-4">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.35)] sm:rounded-3xl">
                        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
                            <img 
                                src={heroImageSrc || FALLBACK_HERO_IMAGE}
                                className="h-full w-full object-cover opacity-75 transition-transform duration-1000 hover:scale-105 min-h-[320px]"
                                alt="Event background"
                                onLoad={(e) => {
                                    const img = e.currentTarget;
                                    const tooSmall =
                                        (img.naturalWidth && img.naturalHeight)
                                            ? img.naturalWidth < MIN_HERO_IMAGE_WIDTH || img.naturalHeight < MIN_HERO_IMAGE_HEIGHT
                                            : false;

                                    if (tooSmall) {
                                        setHeroImageTooSmall(true);
                                        setHeroImageSrc(FALLBACK_HERO_IMAGE);
                                    }
                                }}
                                onError={() => {
                                    setHeroImageTooSmall(true);
                                    setHeroImageSrc(FALLBACK_HERO_IMAGE);
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.12),transparent_45%)]" />

                            <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2 sm:left-4 sm:right-4 sm:top-4">
                                <button 
                                    onClick={handleGoBack}
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1.5 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-md transition-all hover:bg-white sm:px-3 sm:py-2"
                                >
                                    <ChevronLeft size={16} />
                                    <span className="hidden sm:inline text-[10px]">Retour</span>
                                </button>

                                <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1.5 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-md transition-all hover:bg-white sm:px-3 sm:py-2">
                                    <Share2 size={14} />
                                    <span className="hidden sm:inline text-[10px]">Partager</span>
                                </button>
                            </div>

                            {heroImageTooSmall && (
                                <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4">
                                    <div className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-700 shadow-sm backdrop-blur-md">
                                        Image trop petite (min {MIN_HERO_IMAGE_WIDTH}×{MIN_HERO_IMAGE_HEIGHT})
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4">
                                <div className="max-w-3xl">
                                    <div className="mb-2 flex flex-wrap items-center gap-1 sm:mb-2">
                                        <span className="rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-900 backdrop-blur-md shadow-sm">
                                            {event.category}
                                        </span>
                                        <span className="rounded-full border border-red-400/20 bg-red-500/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-500/25">
                                            {event.tickets?.length ? `${event.tickets.length} offres` : 'Offre unique'}
                                        </span>
                                    </div>

                                    <h1 className="max-w-3xl text-lg font-black tracking-tight text-red-500 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:text-2xl lg:text-4xl xl:text-5xl">
                                        {event.title}
                                    </h1>

                                    <div className="mt-2 grid gap-1 sm:mt-2 sm:grid-cols-2 sm:gap-2 xl:max-w-3xl">
                                        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 backdrop-blur-md shadow-sm sm:rounded-2xl sm:p-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 sm:h-9 sm:w-9 sm:rounded-xl">
                                                <Calendar size={14} strokeWidth={2.5} className="sm:hidden" />
                                                <Calendar size={16} strokeWidth={2.5} className="hidden sm:block" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[9px] sm:tracking-[0.18em]">Date & Heure</p>
                                                <p className="truncate text-[11px] font-bold leading-tight text-slate-900 sm:text-xs">
                                                    {formatDateRange(event)}
                                                </p>
                                                <p className="truncate text-[11px] font-bold leading-tight text-slate-600 sm:text-[11px]">
                                                    {formatTimeRange(event)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 backdrop-blur-md shadow-sm sm:rounded-2xl sm:p-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 sm:h-9 sm:w-9 sm:rounded-xl">
                                                <MapPin size={14} strokeWidth={2.5} className="sm:hidden" />
                                                <MapPin size={16} strokeWidth={2.5} className="hidden sm:block" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[9px] sm:tracking-[0.18em]">Lieu</p>
                                                <p className="truncate text-[11px] font-bold leading-tight text-slate-900 sm:text-xs">{event.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.55)] sm:p-4 lg:p-5">
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Réservation</p>
                                    <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">Choisis ton pass</h3>
                                </div>
                                <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-red-600">
                                    <Timer size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.14em]">Pick</span>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                {event.tickets.map((t) => (
                                    <div 
                                        key={t._id} 
                                        className={cn(
                                            "rounded-xl border p-2.5 transition-all duration-300",
                                            (ticketQuantities[t.tier] || 0) > 0
                                                ? "border-red-500 bg-red-500/8 shadow-[0_18px_40px_-30px_rgba(239,68,68,0.55)] ring-1 ring-red-500/15"
                                                : "border-slate-200 bg-slate-50/70 hover:border-red-200 hover:bg-white hover:shadow-[0_16px_34px_-30px_rgba(15,23,42,0.45)]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="text-xs font-black tracking-tight text-slate-900">Pass {t.tier}</h4>
                                                    <span className={cn(
                                                        "rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.16em]",
                                                        t.price === 0 ? "border-emerald-200 bg-emerald-500/10 text-emerald-600" : "border-red-200 bg-red-500/10 text-red-600"
                                                    )}>
                                                        {t.price === 0 ? 'Gratuit' : 'Payant'}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    {t.tier === 'Premium' ? 'Ultime' : t.tier === 'VIP' ? 'Privilégié' : t.tier === 'Early Bird' ? 'Flash' : 'Standard'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black tracking-tighter text-slate-900 shrink-0">
                                                {t.price === 0 ? 'Gratuit' : `${t.price} ${event.currency}`}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                            Accès adapté à cette formule.
                                        </p>

                                        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5">
                                            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">Qty</span>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(t.tier, Number(ticketQuantities[t.tier] || 0) - 1)}
                                                    className="h-6 w-6 rounded-lg border border-slate-200 bg-white text-base font-black text-slate-700 hover:bg-slate-50"
                                                    aria-label={`Diminuer ${t.tier}`}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={ticketQuantities[t.tier] || 0}
                                                    onChange={(event) => updateQuantity(t.tier, Number(event.target.value))}
                                                    className="h-6 w-10 rounded-lg border border-slate-200 bg-white px-1 text-center text-xs font-bold text-slate-900"
                                                    aria-label={`Quantité ${t.tier}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(t.tier, Number(ticketQuantities[t.tier] || 0) + 1)}
                                                    className="h-6 w-6 rounded-lg border border-slate-200 bg-white text-base font-black text-slate-700 hover:bg-slate-50"
                                                    aria-label={`Augmenter ${t.tier}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3">
                                <div className="space-y-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="flex justify-between gap-2">
                                        <span>Frais</span>
                                        <span>0.00 {event.currency}</span>
                                    </div>
                                    <div className="flex justify-between gap-2 pt-1 text-slate-900">
                                        <span>Total ({totalQuantity})</span>
                                        <span className="text-2xl tracking-tighter text-red-600">
                                            {`${totalAmount} ${event.currency}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleBuyTicket}
                                disabled={purchasing || totalQuantity <= 0}
                                className="mt-3 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_-18px_rgba(239,68,68,0.8)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {purchasing ? <Loader2 className="animate-spin" size={16} /> : 'Acheter'}
                            </button>

                            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                                <ShieldCheck size={10} className="text-red-500" />
                                Sécurisé via FedaPay
                            </p>
                        </div>
                    </aside>
                </section>

                <section className="mt-4 grid gap-3 lg:mt-4 lg:grid-cols-[1.35fr_0.85fr] lg:gap-4">
                    <div className="space-y-3 lg:space-y-4">
                        <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.45)] sm:p-4 lg:p-5">
                            <h2 className="text-lg font-black tracking-tight underline decoration-red-500 underline-offset-4 sm:text-xl">À propos</h2>
                            <div className="mt-2 space-y-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 sm:text-base">
                                {event.description}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.45)] sm:p-4 lg:p-5">
                            <h2 className="text-lg font-black tracking-tight underline decoration-red-500 underline-offset-4 sm:text-xl">Localisation</h2>
                            <div className="relative mt-2 min-h-40 overflow-hidden rounded-xl group sm:min-h-48">
                                <img 
                                    src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1000&q=80" 
                                    className="h-full w-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105" 
                                    alt="Map" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/5 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
                                    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 text-slate-900 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-2.5">
                                        <div className="min-w-0">
                                            <h4 className="truncate text-sm font-black text-slate-900 sm:text-base">{event.location}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                {event.organization?.name || 'Evenflow'}
                                            </p>
                                        </div>
                                        {event.googleMapsLink && (
                                            <button 
                                                onClick={() => window.open(event.googleMapsLink, '_blank')}
                                                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-[9px] font-black text-white transition-all hover:bg-red-500 sm:px-3 sm:py-2 sm:text-xs"
                                            >
                                                <Navigation size={14} />
                                                <span className="ml-1 hidden sm:inline">Route</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-slate-900 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.45)] sm:p-4 lg:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Aperçu</p>
                                <h3 className="mt-0.5 text-base font-black tracking-tight sm:text-lg">Infos clés</h3>
                            </div>
                            <span className="rounded-full border border-red-500/15 bg-red-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-red-600">
                                Résumé
                            </span>
                        </div>

                        <div className="mt-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Date</span>
                                <span className="text-xs font-bold text-slate-900 text-right">{new Date(event.date).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'long' })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Horaire</span>
                                <span className="text-xs font-bold text-slate-900 text-right">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Lieu</span>
                                <span className="text-xs font-bold text-slate-900 text-right truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Organisateur</span>
                                <span className="text-xs font-bold text-slate-900 text-right truncate">{event.organization?.name || 'Evenflow'}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EventDetail;
