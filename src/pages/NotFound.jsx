import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Inter'] selection:bg-red-500/30">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-lg w-full text-center">
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest mb-6">
                    <AlertCircle size={14} />
                    <span>Erreur 404 • Page introuvable</span>
                </div>

                {/* Big 404 Title */}
                <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-white via-slate-200 to-slate-600 tracking-tighter mb-4 select-none">
                    404
                </h1>

                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-3">
                    Oups ! Cette scène n'existe pas.
                </h2>

                <p className="text-slate-400 text-sm lg:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    La page que vous recherchez a peut-être été déplacée, supprimée ou n'a jamais existé dans l'expérience EventChill.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <ArrowLeft size={16} />
                        <span>Retour</span>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-wider hover:bg-red-700 hover:scale-102 transition-all shadow-lg shadow-red-600/25 active:scale-95"
                    >
                        <Home size={16} />
                        <span>Accueil</span>
                    </button>

                    <button
                        onClick={() => navigate('/explore')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 border border-white/10 transition-all active:scale-95 backdrop-blur-sm"
                    >
                        <Compass size={16} />
                        <span>Explorer</span>
                    </button>
                </div>
            </div>

            {/* Bottom Brand */}
            <div className="absolute bottom-6 flex items-center gap-2 text-slate-600 text-xs font-medium">
                <Sparkles size={14} className="text-red-500" />
                <span>EventChill Platform</span>
            </div>
        </div>
    );
};

export default NotFound;
