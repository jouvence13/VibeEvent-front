import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Mail, Lock, Globe, Apple as AppleIcon, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_BASE_URL } from '../lib/api';

const Auth = ({ embedded = false, onClose }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleClientId, setGoogleClientId] = useState('');
    const googleButtonRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleGoogleCallback = async (response) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Connexion Google impossible.');

            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            navigate(data.role === 'admin' ? '/admin' : data.role === 'organizer' ? '/dashboard' : '/explore');
        } catch (err) {
            setError(err.message || 'Erreur lors de la connexion Google');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const setupGoogle = async () => {
            let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            if (!clientId) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/config`);
                    if (res.ok) {
                        const data = await res.json();
                        clientId = data.googleClientId;
                    }
                } catch (e) {
                    console.warn('Configuration Google non récupérée du backend:', e);
                }
            }

            if (!clientId || !isMounted) return;
            setGoogleClientId(clientId);

            const initializeGoogle = () => {
                if (window.google?.accounts?.id && isMounted) {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCallback,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    if (googleButtonRef.current) {
                        googleButtonRef.current.innerHTML = '';
                        window.google.accounts.id.renderButton(googleButtonRef.current, {
                            type: 'standard',
                            theme: 'outline',
                            size: 'medium',
                            text: 'signin_with',
                            shape: 'pill',
                            width: '100%'
                        });
                    }
                }
            };

            if (window.google?.accounts?.id) {
                initializeGoogle();
            } else {
                const existingScript = document.querySelector('script[data-google-identity]');
                if (existingScript) {
                    existingScript.addEventListener('load', initializeGoogle, { once: true });
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.dataset.googleIdentity = 'true';
                    script.onload = initializeGoogle;
                    document.head.appendChild(script);
                }
            }
        };

        setupGoogle();

        return () => {
            isMounted = false;
        };
    }, [isLogin]);

    const handleGoogleLogin = async () => {
        const clientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            setError('La connexion Google n’est pas configurée dans le backend.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (window.google?.accounts?.id) {
                const gBtn = googleButtonRef.current?.querySelector('div[role="button"]');
                if (gBtn) {
                    gBtn.click();
                } else {
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                            setError('Veuillez autoriser les popups ou vérifier les origines Google OAuth.');
                            setLoading(false);
                        }
                    });
                }
            } else {
                setError('Chargement du service Google en cours, réessayez dans 2 secondes...');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || 'Erreur Google Sign-In');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : { ...formData, role: 'attendee' };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.message === 'User already exists' ? 'Cet utilisateur existe déjà' :
                               data.message === 'Invalid email or password' ? 'Email ou mot de passe incorrect' :
                               data.message || 'Une erreur est survenue';
                throw new Error(errMsg);
            }

            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            
            // Redirection basée sur le rôle
            if (data.role === 'admin') {
                navigate('/admin');
            } else if (data.role === 'organizer') {
                navigate('/dashboard');
            } else {
                navigate('/explore');
            }

            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={cn(
            "font-['Inter'] selection:bg-red-500/30",
            embedded
                ? "fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
                : "min-h-screen lg:h-screen lg:overflow-hidden bg-white flex flex-col lg:flex-row"
        )}>
            {/* Left Side - Visual */}
            <div className={cn(
                "relative overflow-hidden bg-red-600 items-center justify-center p-8 xl:p-10 border-r border-red-200",
                embedded ? "hidden" : "hidden lg:flex lg:w-5/12"
            )}>
                {/* Background Party Image with Overlay */}
                <div className="absolute inset-0">
                    <img 
                        src="/assets/party-bg.png" 
                        alt="Ambiance de fête" 
                        className="w-full h-full object-cover opacity-60 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-red-950/75 via-red-900/40 to-white/5"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-white/10 via-transparent to-white/5"></div>
                </div>

                <div className="relative z-10 max-w-lg xl:max-w-xl px-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.26em] text-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.18)] mb-5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-300"></span>
                        Plateforme événementielle premium
                    </div>

                    <div className="rounded-[28px] border border-white/15 bg-black/20 p-5 xl:p-6 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                        <div className="mb-6 flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-red-500 via-red-400 to-orange-300 shadow-lg shadow-red-500/25"></div>
                            <h2 className="text-white font-black text-xl xl:text-2xl tracking-tighter">eventchill</h2>
                        </div>

                        <h1 className="text-white text-4xl xl:text-[3.4rem] font-black leading-[0.94] mb-4 tracking-tighter max-w-[11ch]">
                            Rejoignez la <br />
                            <span className="italic font-light text-white/75">nouvelle scène</span> de <br />
                            l'événementiel<span className="text-red-300">.</span>
                        </h1>
                        
                        <p className="text-white/75 text-sm xl:text-base leading-relaxed max-w-[28ch]">
                            Des expériences exclusives, une identité claire et un accès pensé pour les communautés les plus exigeantes.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur-sm">
                                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/55 mb-1">Accès rapide</p>
                                <p className="text-sm font-bold text-white">Connexion fluide</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur-sm">
                                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/55 mb-1">Expérience</p>
                                <p className="text-sm font-bold text-white">Premium & immersive</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className={cn(
                "flex items-center justify-center relative",
                embedded
                    ? "w-full max-w-md bg-transparent p-0"
                    : "flex-1 px-4 py-4 lg:px-8 xl:px-10 bg-linear-to-b from-white via-white to-red-50/25"
            )}>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.07),transparent_45%)]"></div>
                <div className="w-full max-w-85 xl:max-w-95 relative z-10">
                    <div className="relative overflow-hidden rounded-[30px] border border-black/5 bg-white/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                        {embedded && onClose && (
                            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer">
                                <X size={18} />
                            </button>
                        )}
                        <div className="h-1 w-full bg-linear-to-r from-red-700 via-red-500 to-red-700"></div>
                        <div className="p-4 lg:p-5 xl:p-6">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-red-600 mb-1">Accès sécurisé</p>
                                    <h2 className="text-black text-[22px] xl:text-3xl font-black leading-[1.02] tracking-tight">
                                        {isLogin ? 'Ravi de vous revoir' : 'Créer un compte'}
                                    </h2>
                                    <p className="mt-1.5 text-red-600 text-[11px] xl:text-sm leading-snug max-w-[28ch]">
                                        {isLogin ? 'Connectez-vous pour continuer l\'aventure.' : 'Rejoignez la communauté aujourd\'hui.'}
                                    </p>
                                </div>
                                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 shadow-sm">
                                    <ShieldCheck size={18} strokeWidth={2.25} />
                                </div>
                            </div>

                            {/* Login/Signup Toggle */}
                            <div className="flex gap-1.5 rounded-2xl border border-black/5 bg-slate-50 p-1">
                                <button 
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className={cn(
                                        "flex-1 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-all duration-300",
                                        isLogin ? "bg-red-600 text-white shadow-[0_10px_25px_rgba(239,68,68,0.22)]" : "bg-transparent text-slate-600 hover:text-black"
                                    )}
                                >
                                    Connexion
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className={cn(
                                        "flex-1 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-all duration-300",
                                        !isLogin ? "bg-red-600 text-white shadow-[0_10px_25px_rgba(239,68,68,0.22)]" : "bg-transparent text-slate-600 hover:text-black"
                                    )}
                                >
                                    Inscription
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-2.5 pt-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 py-2 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.14em] ml-1">Nom complet</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-600 transition-colors pointer-events-none">
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    <input 
                                        name="name"
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder=" votre nom"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-[13px] font-medium"
                                    />
                                </div>
                            </div>
                        )}


                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.14em] ml-1">Adresse Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-600 transition-colors pointer-events-none">
                                    <Mail size={16} strokeWidth={2.5} />
                                </div>
                                <input 
                                    name="email"
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder=" votre@email.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-[13px] font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1 gap-2">
                                <label className="text-[8px] font-black text-slate-700 uppercase tracking-[0.14em]">Mot de passe</label>
                                {isLogin && <a href="#" className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-red-700 transition-colors">Oublié ?</a>}
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-600 transition-colors pointer-events-none">
                                    <Lock size={16} strokeWidth={2.5} />
                                </div>
                                <input 
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder=" ••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-9 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-[13px] font-medium"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full bg-red-600 text-white font-black py-2 rounded-2xl uppercase tracking-[0.14em] text-[9px] shadow-[0_14px_35px_rgba(239,68,68,0.20)] hover:bg-red-700 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:grayscale mt-2.5",
                                loading && "cursor-not-allowed"
                            )}
                        >
                            {loading ? 'Entrée...' : isLogin ? 'Entrer sur scène' : 'Créer le compte'}
                        </button>

                        <div className="relative flex items-center py-1.5">
                            <div className="grow border-t border-slate-200"></div>
                            <span className="shrink mx-4 text-[8px] font-black text-slate-500 uppercase tracking-[0.25em]">Ou continuer avec</span>
                            <div className="grow border-t border-slate-200"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div ref={googleButtonRef} className="hidden" />
                            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex items-center justify-center gap-1.5 bg-slate-50 text-slate-900 py-1.5 rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-white hover:shadow-md transition-all group disabled:cursor-not-allowed disabled:opacity-60">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                                    <Globe size={12} className="group-hover:text-red-700 transition-colors" />
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 group-hover:text-red-700">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-1.5 bg-slate-50 text-slate-900 py-1.5 rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-white hover:shadow-md transition-all group">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                                    <AppleIcon size={12} className="group-hover:text-red-700 transition-colors" />
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 group-hover:text-red-700">Apple ID</span>
                            </button>
                        </div>

                        <div className="flex justify-center mt-2">
                            <div className="inline-flex flex-col items-center gap-0.5 text-[8px] font-black text-red-500 uppercase tracking-[0.18em] px-2.5 py-0.5 -mt-1">
                                <a href="#" className="hover:text-red-700 transition-colors">Politique de Confidentialité</a>
                                <a href="#" className="hover:text-red-700 transition-colors">Conditions d'Utilisation</a>
                            </div>
                        </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
