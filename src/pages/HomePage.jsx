import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, ArrowRight, Search, ShieldCheck, Ticket, Users, Star, Mail, Scan, Zap, Sparkles, Play, ArrowUpRight, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Nav = ({ navigate, isAuthenticated }) => (
    <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-x-0 top-6 z-50 pointer-events-auto"
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden backdrop-blur-2xl bg-white/72 rounded-3xl border border-slate-200/80 p-3 flex items-center justify-between gap-3 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_45%)] pointer-events-none" />
                <button className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/') }>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-red-700 via-red-600 to-red-500 shadow-[0_12px_28px_-10px_rgba(220,38,38,0.65)]" />
                    <span className="text-slate-900 font-extrabold tracking-tight">Evenflow</span>
                </button>
                <div className="relative z-10 flex items-center gap-4 shrink-0">
                    {isAuthenticated ? (
                        <button onClick={() => navigate('/explore')} className="text-sm text-slate-900/90 hover:text-slate-900 font-semibold">Explorer</button>
                    ) : (
                        <button onClick={() => navigate('/auth')} className="text-sm text-slate-900/90 hover:text-slate-900 font-semibold">Se connecter</button>
                    )}
                </div>
            </div>
        </div>
    </motion.header>
);

const FloatingBlobs = () => (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(248,113,113,0.11),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.88),rgba(255,255,255,0.45)_42%,rgba(248,250,252,1)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0))]" />
        <div className="absolute -left-24 -top-28 w-[520px] h-[520px] rounded-full bg-linear-to-tr from-red-700/18 to-transparent blur-3xl opacity-90 animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute right-[-120px] top-20 w-[420px] h-[420px] rounded-full bg-linear-to-br from-red-500/14 to-transparent blur-2xl opacity-80 animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 w-[360px] h-[360px] rounded-full bg-red-500/8 blur-3xl animate-[float_14s_ease-in-out_infinite]" />
        <div className="absolute inset-x-0 top-0 h-[48rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0)_35%,rgba(255,255,255,0.95)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.98),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-[0.09] mix-blend-multiply bg-[linear-gradient(rgba(15,23,42,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.35)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
        <style>{`@keyframes float{0%{transform:translateY(0)}50%{transform:translateY(18px)}100%{transform:translateY(0)}} @keyframes drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(20px,-18px,0)}100%{transform:translate3d(0,0,0)}} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(calc(-50% - 0.5rem))}}`}</style>
    </div>
);

const Card = ({ ev, onOpen }) => (
    <motion.article
        whileHover={{ scale: 1.02, y: -6 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/82 backdrop-blur-xl shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.7),rgba(255,255,255,0.12)_40%,rgba(15,23,42,0.04)_100%)] opacity-60 pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_45%)]" />
        <div className="relative h-48 overflow-hidden">
            <img src={ev.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'} alt={ev.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_42%,rgba(220,38,38,0.08))]" />

            <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-900 shadow-sm backdrop-blur-md">{new Date(ev.date).toLocaleDateString()}</span>
                <span className="rounded-full border border-red-600/80 bg-linear-to-r from-red-700 to-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-sm">{ev.tickets?.length ? `À partir de ${Math.min(...ev.tickets.map(t=>Number(t.price)||0))}€` : 'Gratuit'}</span>
            </div>

            <div className="absolute right-4 bottom-4 rounded-2xl border border-white/30 bg-white/18 backdrop-blur-xl px-3 py-2 text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.8)]">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">Accès</div>
                <div className="mt-1 text-sm font-extrabold flex items-center gap-2"><Sparkles className="w-4 h-4 text-red-300" /> Premium</div>
            </div>
        </div>

        <div className="relative p-5 sm:p-5.5 bg-white/96 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-extrabold text-[1.05rem] text-slate-900 truncate">{ev.title}</h3>
                <div className="flex items-center gap-1 text-amber-400 text-[11px]"><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /></div>
            </div>
            <p className="text-sm text-slate-600 mt-1">{ev.organization?.name || 'Evenflow'}</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-xs uppercase font-black tracking-[0.18em] text-slate-400"><Clock className="w-3.5 h-3.5" /> {new Date(ev.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                    <div className="inline-flex items-center gap-1 text-xs uppercase font-black tracking-[0.18em] text-slate-400"><MapPin className="w-3.5 h-3.5" /> {ev.location || 'Lieu premium'}</div>
                </div>
                <button onClick={() => onOpen(ev)} className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-linear-to-r from-red-700 via-red-600 to-red-500 text-white font-bold shadow-[0_14px_30px_-14px_rgba(220,38,38,0.72)] transition-transform duration-300 hover:scale-[1.03]">
                    Réserver <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    </motion.article>
);

const BentoStat = ({ label, value, hint, icon: Icon }) => (
        <div className="rounded-2xl border border-white/70 bg-white/72 backdrop-blur-xl flex-none w-[191px] sm:w-[207px] lg:w-[231px] p-3 shadow-sm flex items-start gap-3">
        {Icon ? <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><Icon className="w-4 h-4" /></div> : null}
        <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase tracking-[0.14em] text-slate-400 font-black truncate">{label}</div>
            <div className="mt-1 text-base font-black text-slate-900 truncate">{value}</div>
            <div className="mt-1 text-xs text-slate-600 leading-tight truncate">{hint}</div>
        </div>
    </div>
);

const SectionTitle = ({ eyebrow, title, subtitle }) => (
    <div className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[11px] font-black tracking-[0.18em] uppercase text-red-600">
            <Sparkles className="w-3.5 h-3.5" />
            {eyebrow}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto sm:mx-0">{subtitle}</p> : null}
    </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const isAuthenticated = !!localStorage.getItem('token');

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

    const aboutFeatures = [
        { icon: Users, title: 'Précision Locale', desc: "Conçu pour l'écosystème béninois. De Cotonou à Parakou, nous comprenons vos défis." },
        { icon: ShieldCheck, title: 'Sécurité Absolue', desc: 'Chaque transaction est cryptée. Chaque ticket est unique. Votre confiance est notre priorité.' },
        { icon: Zap, title: 'Rapidité Extrême', desc: '60 secondes. C’est tout ce qu’il faut pour réserver votre place et recevoir votre ticket.' },
    ];

    const howItWorks = [
        { step: '01', icon: Search, title: 'Explorez', desc: "Parcourez notre catalogue d'événements exclusifs et trouvez celui qui vous ressemble." },
        { step: '02', icon: Ticket, title: 'Réservez', desc: 'Choisissez votre ticket et réglez en toute sécurité via Mobile Money ou carte bancaire.' },
        { step: '03', icon: Mail, title: 'Recevez', desc: 'Votre ticket digital arrive instantanément par email et dans votre espace.' },
        { step: '04', icon: Scan, title: 'Profitez', desc: 'Présentez votre écran à l’entrée et vivez l’expérience sans friction.' },
    ];

    const testimonials = [
        { name: 'Koffi Mensah', role: 'Organisateur - Festival Cotonou 2023', text: 'EvenFlow a transformé notre événement. Nous avons doublé nos revenus et réduit nos coûts de 40%.', stat: '12,000+ tickets' },
        { name: 'Aïcha Diallo', role: 'Productrice - Concert Live Parakou', text: 'La plateforme la plus intuitive que j’ai utilisée. Mes clients adorent la simplicité du processus.', stat: '8,500+ tickets' },
        { name: 'Jean-Baptiste Kouassi', role: 'Manager - Nuit des Étoiles', text: 'Support 24/7 exceptionnel. Chaque question trouve une réponse en moins de 10 minutes.', stat: '15,000+ tickets' },
    ];

    return (
        <div className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden">
            <Nav navigate={navigate} isAuthenticated={isAuthenticated} />
            <main className="pt-24 sm:pt-26 lg:pt-28">
                <section className="relative pb-12 sm:pb-16 lg:pb-20">
                    <FloatingBlobs />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
                            <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 text-[11px] font-extrabold tracking-[0.18em] uppercase text-white shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-red-300" />
                                    Tournée exclusive
                                </span>
                                <div className="space-y-4">
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-black leading-[1] tracking-[-0.02em] max-w-3xl mx-auto lg:mx-0">
                                        Luminous <span className="text-red-500 italic">Echoes</span>
                                        <span className="block text-slate-900/95">2026</span>
                                    </h1>
                                    <p className="text-sm sm:text-base text-slate-700/82 max-w-xl xl:max-w-2xl leading-relaxed mx-auto lg:mx-0">
                                        Une expérience audio-visuelle immersive, conçue pour les amateurs de musique exigeants. Billets limités — accès premium.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2 justify-center lg:justify-start">
                                    <motion.button whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.98 }} className="group px-5 py-3 rounded-2xl bg-linear-to-r from-red-700 via-red-600 to-red-500 text-white font-extrabold shadow-[0_22px_50px_-20px_rgba(220,38,38,0.78)] ring-1 ring-red-500/20 w-full sm:w-auto">
                                        <span className="inline-flex items-center gap-2">Réserver mon accès <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></span>
                                    </motion.button>
                                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="group px-5 py-3 rounded-2xl bg-white/75 border border-slate-200 text-slate-900 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl w-full sm:w-auto">
                                        <span className="inline-flex items-center gap-2 font-semibold">Voir le programme <Play className="w-4 h-4 fill-current" /></span>
                                    </motion.button>
                                </div>

                                <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_18px_60px_-36px_rgba(15,23,42,0.28)] max-w-2xl mx-auto lg:mx-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] items-stretch">
                                        <img
                                            src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80"
                                            alt="Evenflow stage preview"
                                            className="h-36 sm:h-full w-full object-cover"
                                        />
                                        <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 bg-linear-to-br from-white via-slate-50 to-white">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-[0.2em] text-red-600 font-black">Stage preview</div>
                                                <h3 className="mt-2 text-lg font-black text-slate-900 leading-tight">Une ambiance qui donne de la profondeur au hero.</h3>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">Une carte visuelle intégrée pour casser la lecture en blocs et renforcer l’effet premium sur desktop.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-2 max-w-7xl mx-auto lg:mx-0 overflow-x-auto lg:overflow-visible justify-between flex-nowrap">
                                    <BentoStat label="Live" value="Immersif" hint="Son, lumière et scénographie alignés." icon={Star} />
                                    <BentoStat label="Style" value="Premium" hint="Un rendu inspiré des meilleures startups." icon={Sparkles} />
                                    <BentoStat label="Focus" value="Red glow" hint="Une identité visuelle intense mais élégante." icon={Zap} />
                                    <BentoStat label="Flow" value="Instantané" hint="Un parcours de réservation sans friction." icon={ArrowUpRight} />
                                </div>
                            </div>

                            <div className="relative lg:pl-6 xl:pl-12">
                                <div className="absolute -inset-6 sm:-inset-8 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.16),transparent_56%)] blur-3xl" />
                                <div className="relative rounded-[2rem] overflow-hidden border border-white/70 bg-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.5)] ring-1 ring-slate-200/60">
                                    <div className="relative h-64 sm:h-72 lg:h-80 xl:h-[22rem] overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1514525253361-b83f85df0f5c?auto=format&fit=crop&w=1400&q=80" alt="hero" className="h-full w-full object-cover scale-[1.02]" />
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.2)_50%,rgba(15,23,42,0.34)_100%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.42),transparent_20%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.22),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.15),transparent_45%,rgba(220,38,38,0.08)_92%)]" />

                                        <div className="absolute left-4 top-4 max-w-32 xl:max-w-40 rounded-2xl border border-white/35 bg-white/16 backdrop-blur-2xl px-2.5 py-2 text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.8)] animate-[float_11s_ease-in-out_infinite]">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black">On stage</div>
                                            <div className="mt-2 text-sm font-bold leading-tight">Ambiance cinématique, prête pour une grande scène.</div>
                                        </div>

                                        <div className="absolute right-4 top-24 max-w-52 xl:max-w-60 rounded-3xl border border-white/35 bg-white/14 backdrop-blur-2xl px-4 py-3 text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.9)] animate-[float_13s_ease-in-out_infinite]">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-black">Capacité</div>
                                            <div className="mt-2 text-sm font-bold leading-tight">12k invités attendus pour cette édition.</div>
                                        </div>

                                        <div className="absolute left-4 top-24 hidden sm:block w-24 lg:w-28 xl:w-32 rounded-2xl overflow-hidden border border-white/35 bg-white/18 backdrop-blur-2xl shadow-[0_12px_24px_-12px_rgba(15,23,42,0.9)] animate-[float_15s_ease-in-out_infinite]">
                                            <img
                                                src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80"
                                                alt="Evenflow stage detail"
                                                className="h-20 lg:h-24 xl:h-28 w-full object-cover"
                                            />
                                            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white bg-slate-950/45 backdrop-blur-xl">
                                                Stage view
                                            </div>
                                        </div>

                                        <div className="absolute left-4 right-4 bottom-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="rounded-3xl border border-white/35 bg-white/20 backdrop-blur-2xl px-4 py-3 text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.9)]">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-black"><Clock className="w-3.5 h-3.5" /> Start 20:00</div>
                                                <div className="mt-2 text-sm font-bold">Expérience immersive</div>
                                            </div>
                                            <div className="rounded-3xl border border-white/35 bg-white/20 backdrop-blur-2xl px-4 py-3 text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.9)]">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-black"><MapPin className="w-3.5 h-3.5" /> Cotonou</div>
                                                <div className="mt-2 text-sm font-bold">Lieu iconique premium</div>
                                            </div>
                                            <div className="rounded-3xl border border-white/35 bg-white/20 backdrop-blur-2xl px-4 py-3 text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.9)]">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 font-black"><ShieldCheck className="w-3.5 h-3.5" /> Verified</div>
                                                <div className="mt-2 text-sm font-bold">Accès sécurisé et fluide</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid grid-cols-1 gap-4 lg:gap-6 items-stretch">
                        <div className="rounded-[2rem] border border-slate-100 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)] p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6 text-center sm:text-left">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-red-600">Sélection premium</div>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Événements à la une</h2>
                                </div>
                                <p className="hidden sm:block text-sm text-slate-400">Sélection quotidienne</p>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-500" /></div>
                            ) : events.length === 0 ? (
                                <div className="text-slate-400 py-12">Aucun événement pour le moment.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {events.map((ev, index) => (
                                        <motion.div key={ev._id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08, duration: 0.45 }}>
                                            <Card ev={ev} onOpen={openEvent} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="rounded-[2rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.82))] p-6 sm:p-8 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)] overflow-hidden relative">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-100/80 blur-3xl" />
                        <div className="relative z-10">
                            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80"
                                    alt="Evenflow atmosphere"
                                    className="h-36 w-full object-cover sm:h-44"
                                />
                            </div>
                            <SectionTitle
                                eyebrow="Evenflow atmosphere"
                                title="Bento rhythm"
                                subtitle="Des blocs qui respirent, sans espaces morts. Une structure plus cinématique avec des volumes alternés, des contrastes légers et une lecture plus dense visuellement."
                            />
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm xl:col-span-1">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-black">Curation</div>
                                    <div className="mt-2 text-base sm:text-lg font-black text-slate-900 leading-tight max-w-[14ch] sm:max-w-none">Événements sélectionnés</div>
                                    <p className="mt-2 text-sm text-slate-600">Mise en avant claire des expériences les plus fortes.</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-linear-to-br from-slate-950 to-slate-800 p-4 text-white shadow-sm xl:col-span-1">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-black">Atmosphere</div>
                                    <div className="mt-2 text-base sm:text-lg font-black leading-tight max-w-[14ch] sm:max-w-none">Light red glow</div>
                                    <p className="mt-2 text-sm text-white/70">Des reflets et des ombres plus riches sur toute la page.</p>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm xl:col-span-1">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-black">Motion</div>
                                    <div className="mt-2 text-base sm:text-lg font-black text-slate-900 leading-tight max-w-[14ch] sm:max-w-none">Scroll reveal</div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm xl:col-span-3 xl:flex xl:items-center xl:justify-between xl:gap-8">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-black">Depth</div>
                                        <div className="mt-2 text-base sm:text-lg font-black text-slate-900 leading-tight max-w-[14ch] sm:max-w-none">Layered cards</div>
                                    </div>
                                    <p className="mt-2 xl:mt-0 text-sm text-slate-600 leading-relaxed max-w-md">Sur desktop, cette dernière boîte s'étire pour créer une vraie respiration visuelle et une structure plus premium.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-extrabold tracking-[0.18em] uppercase text-slate-700"><ArrowUpRight className="w-3.5 h-3.5" /> Comment ça marche</span>
                            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Simple, rapide, sans friction.</h2>
                        </div>
                    </div>
                    <div className="mb-6 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)]">
                        <img
                            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80"
                            alt="Evenflow event flow"
                            className="h-56 w-full object-cover sm:h-72"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {howItWorks.map((step) => {
                            const Icon = step.icon;
                            return (
                                <motion.div key={step.step} whileHover={{ y: -6 }} className="group rounded-[1.75rem] border border-slate-100 bg-linear-to-b from-white to-slate-50 p-5 shadow-sm relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_55%)]" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-black uppercase tracking-[0.25em] text-red-600">{step.step}</div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 group-hover:text-red-600 transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <h3 className="mt-4 text-lg font-black text-slate-900">{step.title}</h3>
                                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[11px] font-extrabold tracking-[0.18em] uppercase text-red-600"><Star className="w-3.5 h-3.5 fill-current" /> Témoignages</span>
                            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Ce que les organisateurs disent.</h2>
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <div className="flex w-max gap-4 pb-2 md:pb-3 animate-[marquee_36s_linear_infinite] hover:[animation-play-state:paused]">
                            {[...testimonials, ...testimonials].map((item, index) => (
                                <motion.div key={`${item.name}-${index}`} whileHover={{ y: -6 }} className={`w-48 sm:w-56 lg:w-64 h-48 sm:h-56 lg:h-64 rounded-2xl border p-4 shadow-sm relative overflow-hidden shrink-0 ${index % testimonials.length === 1 ? 'bg-linear-to-b from-white via-white to-slate-50 border-slate-100' : 'bg-white border-slate-100'}`}>
                                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.1),transparent_45%)]" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-1 text-red-500 text-sm mb-3">★★★★★</div>
                                        <p className="text-xs text-slate-700 leading-tight mb-2 max-h-[3.75rem] overflow-hidden">&quot;{item.text}&quot;</p>
                                        <div className="border-t border-slate-100 pt-3">
                                            <h3 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h3>
                                            <p className="text-[11px] text-slate-500 truncate">{item.role}</p>
                                            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-red-600 truncate">{item.stat}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 lg:gap-6 items-stretch">
                        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-linear-to-br from-white via-slate-50 to-white p-4 sm:p-5 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.45)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.09),transparent_42%)] pointer-events-none" />
                            <div className="relative z-10 space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                                    <Sparkles className="h-3.5 w-3.5 text-red-600" />
                                    Newsletter premium
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight max-w-[14ch]">Ne manquez pas la prochaine étape.</h3>
                                    <p className="text-sm text-slate-700 leading-relaxed max-w-xl">Recevez des recommandations et accès early-bird. Le bloc est pensé comme un mini-héro avec plus d’air et un meilleur contraste sur pc.</p>
                                </div>
                                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="px-4 py-2.5 rounded-2xl border border-slate-300 w-full outline-none bg-white text-slate-900 shadow-inner focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition" />
                                    <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="group inline-flex items-center justify-center gap-2 bg-linear-to-r from-red-700 via-red-600 to-red-500 px-5 py-2.5 rounded-2xl text-white font-extrabold shadow-[0_18px_40px_-18px_rgba(220,38,38,0.8)]">
                                        S'abonner <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </motion.button>
                                </form>
                                {subscribed && <div className="text-emerald-600 font-bold mt-0.5 text-sm">Merci — vous êtes inscrit(e) !</div>}
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
