import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Tag, DollarSign, Users, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, Ticket, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [initialLoad, setInitialLoad] = useState(isEditing);
    
    // Nouveaux champs pour les tickets, la devise et maps
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        googleMapsLink: '',
        category: 'Nightlife',
        currency: 'XOF',
        image: '',
        tickets: {
            Standard: { enabled: true, price: 0, limit: '', unlimited: true },
            VIP: { enabled: false, price: 0, limit: '', unlimited: true },
            'Early Bird': { enabled: false, price: 0, limit: '', unlimited: true },
            Premium: { enabled: false, price: 0, limit: '', unlimited: true }
        }
    });

    // Load existing event if editing
    useEffect(() => {
        if (isEditing) {
            const fetchEvent = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/events/${id}`);
                    const data = await response.json();
                    if (response.ok) {
                        // Convert date to datetime-local format
                        const dateObj = new Date(data.date);
                        const localDateTime = dateObj.toISOString().slice(0, 16);

                        // Reconstruct ticket state
                        const ticketsState = {
                            Standard: { enabled: false, price: 0, limit: '', unlimited: true },
                            VIP: { enabled: false, price: 0, limit: '', unlimited: true },
                            'Early Bird': { enabled: false, price: 0, limit: '', unlimited: true },
                            Premium: { enabled: false, price: 0, limit: '', unlimited: true }
                        };

                        data.tickets.forEach(ticket => {
                            ticketsState[ticket.tier] = {
                                enabled: true,
                                price: ticket.price,
                                limit: ticket.limit || '',
                                unlimited: ticket.limit === null
                            };
                        });

                        setFormData({
                            title: data.title,
                            description: data.description,
                            date: localDateTime,
                            location: data.location,
                            googleMapsLink: data.googleMapsLink || '',
                            category: data.category,
                            currency: data.currency || 'XOF',
                            image: data.image || '',
                            tickets: ticketsState
                        });
                    } else {
                        showToast("Impossible de charger l'événement", "error");
                        navigate('/dashboard/events');
                    }
                } catch (err) {
                    console.error(err);
                    showToast("Erreur lors du chargement", "error");
                    navigate('/dashboard/events');
                } finally {
                    setInitialLoad(false);
                }
            };
            fetchEvent();
        }
    }, [id, isEditing, navigate, showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (optional but recommended for Base64)
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showToast("L'image est trop lourde (max 2Mo).", "error");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTicketChange = (tier, field, value) => {
        setFormData(prev => ({
            ...prev,
            tickets: {
                ...prev.tickets,
                [tier]: {
                    ...prev.tickets[tier],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Formater les tickets pour l'API
        const formattedTickets = Object.keys(formData.tickets)
            .filter(tier => formData.tickets[tier].enabled)
            .map(tier => ({
                tier,
                price: Number(formData.tickets[tier].price),
                limit: formData.tickets[tier].unlimited ? null : Number(formData.tickets[tier].limit)
            }));

        if (formattedTickets.length === 0) {
            showToast("Vous devez activer au moins un type de billet.", "error");
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            tickets: formattedTickets
        };

        try {
            const token = localStorage.getItem('token');
            
            // Si on édite, on fait un PUT, sinon un POST
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing 
                ? `http://localhost:5000/api/events/${id}` 
                : 'http://localhost:5000/api/events';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const successMsg = isEditing ? "Événement modifié avec succès !" : "Événement publié avec succès !";
                showToast(successMsg, "success");
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/events'), 2000);
            } else {
                const data = await response.json();
                showToast(data.message || 'Erreur lors de l\'opération', "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Erreur de connexion au serveur.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black mb-2">{isEditing ? 'Événement modifié !' : 'Événement créé !'}</h2>
                <p className="text-slate-500">Votre événement est maintenant en ligne. Redirection...</p>
            </div>
        );
    }

    if (initialLoad) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-red-500" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-b border-red-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.1),_transparent_60%)]"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <Sparkles className="text-white" size={24} />
                                </div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white">
                                    {isEditing ? 'Modifier l\'événement' : 'Créer un événement'}
                                </h1>
                            </div>
                            <p className="text-red-50 text-sm sm:text-base font-medium max-w-2xl">
                                {isEditing 
                                    ? 'Mettez à jour les informations de votre événement et ses paramètres de billetterie.'
                                    : 'Configurez les détails, les tarifs et la billetterie de votre événement. Tout est simplifié pour vous.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    {/* Section 1: Title & Description */}
                    <section className="group">
                        <div className="rounded-[32px] sm:rounded-[40px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] hover:shadow-[0_24px_64px_-12px_rgba(15,23,42,0.15)] transition-all duration-300 p-6 sm:p-8 lg:p-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block">Titre de l'événement</label>
                                    <input 
                                        name="title"
                                        type="text" 
                                        required
                                        placeholder="Ex: Soirée Cyberpunk 2077"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl py-3 sm:py-4 px-5 sm:px-6 text-base sm:text-lg text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block">Description de l'événement</label>
                                    <textarea 
                                        name="description"
                                        rows="4"
                                        required
                                        placeholder="Détaillez le programme, l'ambiance, les artistes..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl py-3 sm:py-4 px-5 sm:px-6 text-sm sm:text-base text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Date, Location & Category */}
                    <section>
                        <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Informations pratiques</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Date */}
                            <div className="rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-5 sm:p-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block flex items-center gap-2">
                                    <Calendar size={12} className="text-red-500" /> Date & Heure
                                </label>
                                <input 
                                    name="date"
                                    type="datetime-local" 
                                    required
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl py-3 sm:py-3.5 px-4 sm:px-5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div className="rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-5 sm:p-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block flex items-center gap-2">
                                    <MapPin size={12} className="text-red-500" /> Localisation
                                </label>
                                <input 
                                    name="location"
                                    type="text"
                                    required
                                    placeholder="Ville"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl py-3 sm:py-3.5 px-4 sm:px-5 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div className="rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-5 sm:p-6">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block flex items-center gap-2">
                                    <Tag size={12} className="text-red-500" /> Catégorie
                                </label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl py-3 sm:py-3.5 px-4 sm:px-5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Nightlife">Nightlife</option>
                                    <option value="Concert">Concert</option>
                                    <option value="Festival">Festival</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Other">Autre</option>
                                </select>
                            </div>
                        </div>

                        {/* Maps Link */}
                        <div className="mt-4 sm:mt-6 rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-5 sm:p-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 mb-3 block flex items-center gap-2">
                                <Globe size={12} className="text-red-500" /> Lien Google Maps (Optionnel)
                            </label>
                            <input 
                                name="googleMapsLink"
                                type="url"
                                placeholder="https://maps.google.com/..."
                                value={formData.googleMapsLink}
                                onChange={handleChange}
                                className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl py-3 sm:py-3.5 px-4 sm:px-5 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                            />
                        </div>
                    </section>

                    {/* Section 3: Billetterie */}
                    <section>
                        <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Billetterie & Tarifs</h2>
                        <div className="rounded-[32px] sm:rounded-[40px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-6 sm:p-8 lg:p-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-slate-200/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                        <Ticket className="text-red-500" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Gestion des billets</p>
                                        <p className="text-sm font-bold text-slate-900">Configurez vos passes</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">Devise</label>
                                    <select 
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full sm:w-40 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                                    >
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">Dollar ($)</option>
                                        <option value="XOF">FCFA (XOF)</option>
                                        <option value="GBP">Livre (£)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {['Standard', 'VIP', 'Early Bird', 'Premium'].map((tier) => (
                                    <div 
                                        key={tier} 
                                        className={cn(
                                            "rounded-[24px] border p-4 sm:p-6 transition-all duration-300",
                                            formData.tickets[tier].enabled 
                                                ? "border-red-500/40 bg-gradient-to-br from-red-500/5 to-red-500/2 shadow-[0_8px_24px_-6px_rgba(239,68,68,0.15)]" 
                                                : "border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-slate-100/50 hover:border-slate-300/60 hover:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.08)]"
                                        )}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                            {/* Toggle */}
                                            <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
                                                <div className="relative inline-flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`enable-${tier}`}
                                                        checked={formData.tickets[tier].enabled}
                                                        onChange={(e) => handleTicketChange(tier, 'enabled', e.target.checked)}
                                                        className="w-5 h-5 accent-red-500 cursor-pointer"
                                                    />
                                                </div>
                                                <span className="font-black text-base sm:text-lg text-slate-900 min-w-24">{tier}</span>
                                            </label>

                                            {/* Config */}
                                            {formData.tickets[tier].enabled && (
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">Prix ({formData.currency})</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={formData.tickets[tier].price}
                                                            onChange={(e) => handleTicketChange(tier, 'price', e.target.value)}
                                                            className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Quantité</label>
                                                            <label className="flex items-center gap-1.5 text-[9px] text-slate-500 cursor-pointer font-bold">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={formData.tickets[tier].unlimited}
                                                                    onChange={(e) => handleTicketChange(tier, 'unlimited', e.target.checked)}
                                                                    className="accent-red-500"
                                                                /> 
                                                                Illimité
                                                            </label>
                                                        </div>
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            disabled={formData.tickets[tier].unlimited}
                                                            value={formData.tickets[tier].unlimited ? '' : formData.tickets[tier].limit}
                                                            onChange={(e) => handleTicketChange(tier, 'limit', e.target.value)}
                                                            className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            placeholder={formData.tickets[tier].unlimited ? "∞" : "Ex: 100"}
                                                            required={!formData.tickets[tier].unlimited}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Image Upload */}
                    <section>
                        <h2 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Photo de couverture</h2>
                        <div className="rounded-[32px] sm:rounded-[40px] border border-slate-200/80 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] p-6 sm:p-8 lg:p-10">
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label 
                                htmlFor="image-upload"
                                className={cn(
                                    "w-full border-2 border-dashed rounded-[28px] py-10 sm:py-16 px-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group",
                                    formData.image 
                                        ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
                                        : "border-slate-300/60 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-red-500/40 hover:bg-red-500/5"
                                )}
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center mb-4 group-hover:from-red-500/30 group-hover:to-red-500/15 transition-all">
                                    <ImageIcon size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-500 transition-colors">
                                    {formData.image ? 'Changer la photo' : 'Importer une image'}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">PNG, JPG ou WEBP • Max 2MB</p>
                            </label>

                            {formData.image && (
                                <div className="mt-8 rounded-[28px] overflow-hidden border border-slate-200 bg-black shadow-lg relative group">
                                    <div className="aspect-video">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white mb-1">Aperçu</p>
                                        <p className="text-xs font-bold text-white/70">Photo optimisée</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="pt-6 sm:pt-8">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-600 hover:from-red-600 hover:via-red-700 hover:to-red-700 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 text-white font-black py-4 sm:py-5 rounded-[24px] sm:rounded-[28px] text-xs sm:text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-lg hover:shadow-red-600/40 transition-all duration-300 active:scale-95 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Traitement...
                                </>
                            ) : isEditing ? (
                                "Enregistrer les modifications"
                            ) : (
                                "Publier l'événement"
                            )}
                        </button>
                        <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-4">
                            {isEditing ? 'Mise à jour de votre événement' : 'Votre événement sera visible immédiatement'}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
