import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Building, ArrowUpCircle, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const Profile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');

    const handleCreateOrganization = async () => {
        if (!newOrgName) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/organizations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newOrgName })
            });

            if (response.ok) {
                showToast("Organisation créée avec succès !", "success");
                window.location.reload(); 
            } else {
                const data = await response.json();
                showToast(data.message || "Erreur lors de la création.", "error");
            }
        } catch (err) {
            showToast("Erreur de connexion.", "error");
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-10 sm:py-12">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
                    Profil
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2 text-slate-900">Mon Profil</h1>
                <p className="text-slate-500 font-medium">Gérez votre identité et vos accès sur Evenflow.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                {/* Left - Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200/70 rounded-4xl p-6 sm:p-8 text-center relative overflow-hidden group shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                        <div className="absolute inset-0 bg-linear-to-b from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-tr from-slate-900 to-slate-700 mx-auto mb-4 sm:mb-6 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-2xl shadow-slate-900/20 relative z-10 text-white">
                            {user.name?.charAt(0)}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-1 relative z-10">{user.name}</h3>
                        <p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 relative z-10">{user.role}</p>
                        
                        <div className="flex justify-center gap-2 relative z-10">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                user.role === 'admin' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    user.role === 'organizer' ? "bg-slate-900/10 text-slate-800 border-slate-300" :
                                "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            )}>
                                {user.role === 'admin' ? 'Administrateur' : user.role === 'organizer' ? 'Organisateur' : 'Participant'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/70 rounded-4xl p-6 space-y-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Email</p>
                                <p className="text-sm font-bold text-slate-900">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Statut Compte</p>
                                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                    Vérifié <CheckCircle2 size={12} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Organization Section */}
                    <section className="bg-white border border-slate-200/70 rounded-[40px] p-6 sm:p-8 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                            <Building className="text-slate-700" size={20} />
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Organisation</h2>
                        </div>

                        {user.organization ? (
                            <div className="flex items-center justify-between p-6 bg-slate-100 rounded-2xl border border-slate-200">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{user.organization.name || "Ma Structure"}</h4>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Membre actif</p>
                                </div>
                                <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:underline">Quitter</button>
                            </div>
                        ) : (
                                <div className="text-center py-6">
                                <p className="text-slate-500 mb-4 font-medium">Vous n'appartenez à aucune organisation pour le moment.</p>
                                {user.role === 'attendee' ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                                        <AlertCircle className="mx-auto text-slate-700 mb-3" size={28} />
                                        <h4 className="font-bold mb-2">Devenir un créateur</h4>
                                        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                            Choisissez le forfait qui vous correspond (Événements ou Sondages) pour commencer à créer.
                                        </p>
                                        
                                        <button 
                                            onClick={() => navigate('/upgrade')}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2 sm:py-3 px-6 sm:px-10 rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-[0.15em] shadow-md shadow-slate-900/20 transition-all flex items-center justify-center mx-auto"
                                        >
                                            Voir les Forfaits
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        disabled={loading}
                                        className="bg-slate-900 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
                                    >
                                        {loading ? "Chargement..." : "Créer mon organisation"}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                    
                    {/* Subscription Section */}
                    <section className="bg-white border border-slate-200/70 rounded-[40px] p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 -mr-20 -mt-20 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                                        <ArrowUpCircle size={24} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">Mon Abonnement</h2>
                                </div>
                                <span className={cn(
                                    "shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                    user.plan && user.plan !== 'none' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 text-slate-400 border-slate-200"
                                )}>
                                    {user.plan === 'premium' ? 'Suite Complète' : user.plan === 'events_only' ? 'Événements' : user.plan === 'polls_only' ? 'Sondages' : 'Aucun'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50/50 p-6 rounded-4xl border border-slate-200/60">
                                <div>
                                    <h4 className="text-lg font-black mb-2">
                                        {user.plan === 'premium' ? 'Plan Gold Illimité' : user.plan === 'none' ? 'Pass Gratuit' : `Pack ${user.plan === 'events_only' ? 'Organisateur' : 'Community'}`}
                                    </h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                                        {user.plan === 'polls_only' ? "Vous avez accès aux sondages mais pas encore à la création d'événements." : 
                                         user.plan === 'events_only' ? "Vous pouvez créer des événements mais n'avez pas accès aux sondages." :
                                         user.plan === 'premium' ? "Vous avez l'accès total à toutes les fonctionnalités." :
                                         "Passez au statut organisateur pour commencer à vendre des billets."}
                                    </p>
                                    {user.roleExpiresAt && (
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Expire le : {new Date(user.roleExpiresAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => navigate('/upgrade')}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 sm:py-3 px-6 sm:px-8 rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-[0.15em] shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {user.plan && user.plan !== 'none' ? 'Changer de forfait' : 'Améliorer mon compte'}
                                        <ArrowUpCircle size={16} />
                                    </button>
                                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Facturation mensuelle sans engagement</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Preferences / Security Section Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-4xl p-6 opacity-40">
                            <h4 className="font-bold mb-2">Sécurité</h4>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Changez votre mot de passe et activez la 2FA.</p>
                            <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-4xl p-6 opacity-40">
                            <h4 className="font-bold mb-2">Paiements</h4>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Gérez vos méthodes de paiement et factures.</p>
                            <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Nouvelle Organisation"
                footer={(
                    <button 
                        onClick={handleCreateOrganization}
                        disabled={loading || !newOrgName}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "Création..." : "Confirmer la création"}
                    </button>
                )}
            >
                <div className="space-y-4">
                    <p className="text-slate-500 text-sm font-medium">Donnez un nom unique à votre structure pour commencer à organiser des événements.</p>
                    <label htmlFor="new-org-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nom de l'organisation</label>
                    <input
                        id="new-org-name"
                        type="text"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Ex: Visionary Events"
                        className="w-full bg-slate-100 border border-transparent rounded-2xl py-4 px-6 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 transition-all text-sm font-bold"
                        autoFocus
                    />
                </div>
            </Modal>
            </div>
        </div>
    );
};

export default Profile;
