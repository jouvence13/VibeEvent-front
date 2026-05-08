import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Bell, 
    Filter, 
    MapPin, 
    Calendar, 
    Heart, 
    ChevronRight, 
    Star,
    Music,
    Mic2,
    Palette,
    Dumbbell,
    PartyPopper,
    Loader2,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
    { name: 'Tous', icon: PartyPopper, active: true },
    { name: 'Concerts', icon: Music, active: false },
    { name: 'Nightlife', icon: Star, active: false },
    { name: 'Workshops', icon: Palette, active: false },
    { name: 'Expositions', icon: Mic2, active: false },
    { name: 'Sports', icon: Dumbbell, active: false },
];

const Explore = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                const data = await response.json();
                if (response.ok) {
                    setEvents(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        // TODO: replace with API call to persist subscription
        setSubscribed(true);
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 5000);
    };

    // Helper to extract min price
    const getMinPrice = (tickets, currency = 'EUR') => {
        if (!tickets || tickets.length === 0) return 'Gratuit';
        const prices = tickets.map(t => t.price);
        const min = Math.min(...prices);
        const allFree = prices.every(price => Number(price) === 0);
        return allFree ? 'Gratuit' : `À partir de ${min} ${currency}`;
    };

    const handleHype = async (e, eventId) => {
        e.stopPropagation(); // prevent navigating to event detail
        try {
            const token = localStorage.getItem('token');
            if(!token) {
                navigate('/auth');
                return;
            }
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/hype`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const { hyped } = await response.json();
                setEvents(prev => prev.map(ev => {
                    if (ev._id === eventId) {
                        let newHypeUsers = [...(ev.hypeUsers || [])];
                        if (hyped) {
                            newHypeUsers.push(currentUser.id || currentUser._id);
                        } else {
                            newHypeUsers = newHypeUsers.filter(id => id !== (currentUser.id || currentUser._id));
                        }
                        return { ...ev, hypeUsers: newHypeUsers };
                    }
                    return ev;
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full">
            <main className="pb-20">
                {/* Hero section */}
                <div className="relative w-full h-[50vh] lg:h-[70vh] px-4 lg:px-12 pt-4 lg:pt-8 mb-8 lg:mb-16 group">
                    <div className="w-full h-full relative rounded-4xl lg:rounded-[48px] overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] opacity-70"
                            alt="Featured"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent"></div>
                        <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-6 lg:bottom-10 left-8 lg:left-16 right-8 lg:right-auto z-10">
                            <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                <span className="bg-black/60 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                                    Tournée exclusive
                                </span>
                                <span className="text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Arrive en Août</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-4 lg:mb-8 leading-[0.9] text-white">
                                Luminous <br /> Echoes 2024
                            </h1>
                            <p className="text-white text-sm lg:text-lg font-medium mb-6 lg:mb-10 max-w-xl leading-relaxed lg:block hidden">
                                Découvrez la première mondiale de l'expérience audio-visuelle la plus immersive de la décennie.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                                <button className="bg-red-600 hover:bg-red-500 text-white font-black py-3 lg:py-4 px-6 lg:px-10 rounded-2xl text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-500/20 transition-all active:scale-95">
                                    Réserver mon accès
                                </button>
                                <button className="bg-slate-100/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-black py-3 lg:py-4 px-6 lg:px-10 rounded-2xl text-[10px] lg:text-xs uppercase tracking-[0.2em] transition-all">
                                    Détails
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="px-8 lg:px-12 mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight underline decoration-red-500 underline-offset-8">Explorer par catégories</h2>
                        <button className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
                            <Filter size={20} />
                        </button>
                    </div>
                    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-r from-white via-slate-50 to-white p-3 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)]">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.04),transparent_38%)]" />
                        <div className="relative flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map((cat, i) => (
                            <button 
                                key={i}
                                className={`group flex items-center gap-3 px-5 lg:px-6 py-2.5 lg:py-3 rounded-full border whitespace-nowrap transition-all duration-300 shrink-0 ${
                                    cat.active 
                                    ? "bg-gradient-to-r from-red-600 to-red-500 border-red-400 text-white shadow-[0_14px_30px_-16px_rgba(239,68,68,0.9)] ring-1 ring-red-500/20" 
                                    : "bg-white/80 border-slate-200 text-slate-500 hover:border-red-200 hover:text-slate-900 hover:bg-white hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.55)]"
                                }`}
                            >
                                <cat.icon size={17} className={cat.active ? "drop-shadow-sm" : "group-hover:text-red-500 transition-colors"} />
                                <span className="text-sm font-black tracking-tight">{cat.name}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-red-500" size={40} />
                    </div>
                ) : events.length === 0 ? (
                    <div className="px-8 lg:px-12 text-center py-20 text-slate-500 font-bold tracking-widest uppercase text-xs">
                        Aucun événement publié pour le moment.
                    </div>
                ) : (
                    <div className="px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 w-full">
                            {events.map((event) => (
                                <div 
                                    key={event._id} 
                                    onClick={() => navigate(`/event/${event._id}`)}
                                    className="group relative w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_100px_-45px_rgba(15,23,42,0.6)] cursor-pointer"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img 
                                            src={event.image || 'https://images.unsplash.com/photo-1514525253361-b83f85df0f5c?auto=format&fit=crop&w=600&q=80'} 
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            alt={event.title} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />

                                        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                                                {new Date(event.date).toLocaleDateString()}
                                            </span>
                                            <span className="rounded-full border border-red-400/20 bg-red-500/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-red-500/25">
                                                {getMinPrice(event.tickets, event.currency)}
                                            </span>
                                        </div>

                                        <button 
                                            onClick={(e) => handleHype(e, event._id)}
                                            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-3 py-2 text-white backdrop-blur-md opacity-100 transition-all hover:bg-white/25 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
                                        >
                                            <Heart 
                                                size={15} 
                                                className={(event.hypeUsers || []).includes(currentUser.id || currentUser._id) ? "fill-red-500 text-red-500" : ""}
                                            />
                                            {event.hypeUsers?.length > 0 && <span className="text-[10px] font-black">{event.hypeUsers.length}</span>}
                                        </button>

                                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                                                    {event.organization?.name || 'Evenflow'}
                                                </p>
                                                <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight leading-none drop-shadow-lg">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <span className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-md">
                                                En vente
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Date & heure</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {new Date(event.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    <Calendar size={13} className="text-red-500" />
                                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            <div className="space-y-1.5 text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Lieu</p>
                                                <p className="text-sm font-bold text-slate-900 line-clamp-2">
                                                    {event.location}
                                                </p>
                                                <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
                                                    <MapPin size={13} className="text-red-500" />
                                                    Sur place
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Organisateur</p>
                                                <p className="truncate text-sm font-bold text-slate-900">{event.organization?.name || 'Evenflow'}</p>
                                            </div>

                                            <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-red-600">
                                                <Heart size={14} className={(event.hypeUsers || []).includes(currentUser.id || currentUser._id) ? "fill-red-500 text-red-500" : ""} />
                                                <span className="text-xs font-black uppercase tracking-[0.16em]">
                                                    {(event.hypeUsers || []).length || 0} hype
                                                </span>
                                            </div>
                                        </div>

                                        <button className="mt-4 inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-left text-white transition-all hover:bg-slate-800">
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">Voir les détails</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Newsletter / Call to action */}
                <div className="px-8 lg:px-12 mt-5">
                    <div className="bg-white border border-slate-200 rounded-[64px] p-8 sm:p-12 lg:p-20 flex flex-col items-start gap-6 relative overflow-hidden">
                            <div className="relative z-10 max-w-3xl text-center md:text-left">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 leading-tight">Ne manquez pas la prochaine étape.</h2>
                                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">Inscrivez-vous pour recevoir des recommandations hebdomadaires.</p>
                            </div>
                            <form onSubmit={handleSubscribe} className="relative z-10 flex flex-col sm:flex-row w-full md:w-auto gap-3 mt-1">
                                <input 
                                    type="email" 
                                    aria-label="Email pour recommandations"
                                    required
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Votre email" 
                                    className="bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 md:py-4 md:px-6 outline-none focus:border-red-500/30 w-full md:w-80 font-medium"
                                />
                                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-black py-3 px-6 md:py-4 md:px-10 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all w-full sm:w-auto shadow-xl shadow-red-500/20">
                                    S'abonner
                                </button>
                            </form>
                            {subscribed && <div className="text-sm text-emerald-600 font-bold mt-1">Merci — vous êtes inscrit(e) !</div>}
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Explore;
