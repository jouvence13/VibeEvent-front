import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Nav = ({ navigate }) => (
    <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="fixed inset-x-0 top-6 z-50 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-6">
            <div className="backdrop-blur-md bg-black/40 rounded-2xl border border-white/8 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/') }>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-700 to-red-500 shadow-lg" />
                    <span className="text-white font-extrabold tracking-tight">Evenflow</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/explore')} className="text-sm text-white/90 hover:text-white font-semibold">Explorer</button>
                    <button onClick={() => navigate('/auth')} className="text-sm text-white/80 hover:text-white font-semibold">Se connecter</button>
                </div>
            </div>
        </div>
    </motion.header>
);

const FloatingBlobs = () => (
    <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -left-24 -top-28 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-red-700/20 to-transparent blur-3xl opacity-90 animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute right-[-120px] top-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-red-500/14 to-transparent blur-2xl opacity-80 animate-[float_12s_ease-in-out_infinite]" />
        <style>{`@keyframes float{0%{transform:translateY(0)}50%{transform:translateY(18px)}100%{transform:translateY(0)}}`}</style>
    </div>
);

const Card = ({ ev, onOpen }) => (
    <motion.article whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.995 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="group relative w-full overflow-hidden rounded-[32px] border border-black/30 bg-black/70 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="relative h-56 overflow-hidden">
            <img src={ev.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'} alt={ev.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-md">{new Date(ev.date).toLocaleDateString()}</span>
                <span className="rounded-full border border-red-600 bg-red-600/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg">{ev.tickets?.length ? `À partir de ${Math.min(...ev.tickets.map(t=>Number(t.price)||0))}€` : 'Gratuit'}</span>
            </div>
        </div>

        <div className="p-5 bg-black/50 backdrop-blur-sm">
            <h3 className="font-extrabold text-lg text-white truncate">{ev.title}</h3>
            <p className="text-sm text-white/70 mt-1">{ev.organization?.name || 'Evenflow'}</p>
            <div className="mt-4 flex items-center justify-between">
                <div className="text-xs uppercase font-black text-white/70">{new Date(ev.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                <div className="flex items-center gap-3">
                    <button onClick={() => onOpen(ev)} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-red-700 text-white font-bold shadow-md">Réserver <ChevronRight size={14} /></button>
                </div>
            </div>
        </div>
    </motion.article>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/events');
                const data = await res.json();
                if (res.ok && Array.isArray(data)) setEvents(data.slice(0, 6));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3500);
    };

    const openEvent = (ev) => {
        // conserve la logique existante : navigation vers la page event
        navigate(`/event/${ev._id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
            <Nav navigate={navigate} />
            <main className="pt-28">
                <section className="relative pb-16">
                    <FloatingBlobs />
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                                <div className="space-y-4">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-black/60 text-xs font-extrabold tracking-widest text-white">Tournée exclusive</span>
                                                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">Luminous <span className="text-red-500">Echoes</span> 2024</h1>
                                                        <p className="text-lg text-white/70 max-w-xl">Une expérience audio-visuelle immersive, conçue pour les amateurs de musique exigeants. Billets limités — accès premium.</p>

                                                        <div className="flex gap-4 mt-6">
                                                                <motion.button whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-extrabold shadow-lg">Réserver mon accès</motion.button>
                                                                <motion.button whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-2xl bg-black/40 border border-white/8 text-white">Détails</motion.button>
                                                        </div>
                                                </div>

                            <div className="hidden lg:block">
                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/6">
                                    <img src="https://images.unsplash.com/photo-1514525253361-b83f85df0f5c?auto=format&fit=crop&w=1200&q=80" alt="hero" className="w-full h-80 object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-extrabold">Événements à la une</h2>
                        <p className="text-sm text-slate-400">Sélection premium — mise à jour quotidienne</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-500" /></div>
                    ) : events.length === 0 ? (
                        <div className="text-slate-400 py-12">Aucun événement pour le moment.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(ev => (
                                <Card key={ev._id} ev={ev} onOpen={openEvent} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="max-w-3xl mx-auto px-6 py-12">
                    <div className="bg-white/6 dark:bg-slate-800/40 border border-white/6 dark:border-slate-700/40 rounded-3xl p-8 text-center backdrop-blur-md">
                        <h3 className="text-xl font-extrabold mb-2">Ne manquez pas la prochaine étape.</h3>
                        <p className="text-slate-300 mb-4">Recevez des recommandations et accès early-bird.</p>
                        <form onSubmit={handleSubscribe} className="flex items-center justify-center gap-3">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="px-4 py-3 rounded-2xl border w-72 outline-none bg-transparent text-white" />
                              <motion.button whileTap={{ scale: 0.98 }} className="bg-gradient-to-tr from-red-700 to-red-500 px-5 py-3 rounded-2xl text-white font-extrabold">S'abo</motion.button>
                        </form>
                        {subscribed && <div className="text-emerald-400 font-bold mt-3">Merci — vous êtes inscrit(e) !</div>}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
