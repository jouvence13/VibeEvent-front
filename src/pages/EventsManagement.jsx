import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trash2, Edit3, Eye, Loader2, Plus, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventsManagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/events/my-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const handleDelete = async (eventId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setEvents(prev => prev.filter(e => e._id !== eventId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
                        Événements
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3 text-slate-900">Gestion des Événements</h1>
                    <p className="text-slate-500 font-medium">Visualisez et gérez tous vos événements publiés ou en brouillon.</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/events/create')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                >
                    <Plus size={18} strokeWidth={3} /> Créer un événement
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-slate-700" size={40} />
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white border border-slate-200/70 rounded-[40px] p-16 sm:p-20 text-center shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Vous n'avez pas encore créé d'événement</p>
                    <button 
                        onClick={() => navigate('/dashboard/events/create')}
                        className="text-slate-900 font-black text-sm hover:underline"
                    >
                        Commencer maintenant →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white border border-slate-200/70 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-8 hover:shadow-[0_14px_40px_-24px_rgba(15,23,42,0.2)] transition-all group">
                            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <h3 className="text-xl font-bold mb-2 truncate">{event.title}</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-slate-700" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-slate-700" />
                                        <span className="truncate max-w-[200px]">{event.location}</span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        event.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {event.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigate(`/event/${event._id}`)}
                                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all"
                                    title="Voir l'événement"
                                >
                                    <Eye size={18} />
                                </button>
                                <button 
                                    onClick={() => navigate(`/dashboard/events/edit/${event._id}`)}
                                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all"
                                    title="Modifier"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(event._id)}
                                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all border border-rose-500/10"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default EventsManagement;
