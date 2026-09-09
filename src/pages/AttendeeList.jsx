import React, { useState, useEffect } from 'react';
import { Users, Mail, Clock, ChevronRight, ChevronLeft, UserCircle, Search, Loader2 } from 'lucide-react';

const AttendeeList = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [eventsError, setEventsError] = useState(false);
    const [attendeesError, setAttendeesError] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/events/my-events', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setEvents(data);
                } else {
                    setEventsError(true);
                }
            } catch (err) {
                console.error(err);
                setEventsError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const fetchAttendees = async (eventId) => {
        setSelectedEvent(eventId);
        setAttendeesLoading(true);
        setAttendeesError(false);
        if (window.innerWidth < 640) setMobileOpen(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/tickets/event/${eventId}/attendees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAttendees(data);
            } else {
                setAttendees([]);
                setAttendeesError(true);
            }
        } catch (err) {
            console.error(err);
            setAttendees([]);
            setAttendeesError(true);
        } finally {
            setAttendeesLoading(false);
        }
    };

    const filteredAttendees = attendees.filter(ticket => 
        ticket.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
                <Loader2 className="animate-spin text-slate-700" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            <div className="mb-8 sm:mb-10 shrink-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-3 sm:mb-4">
                    Participants
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter leading-none mb-3 text-slate-900">Liste des Participants</h1>
                <p className="max-w-2xl text-sm sm:text-base text-slate-500 font-medium leading-relaxed">Gérez la base de données des participants pour chaque événement.</p>
            </div>

            <div className="flex flex-1 gap-8 min-h-0 overflow-hidden">
                {/* Events Column */}
                <div className={`${mobileOpen ? 'hidden sm:block' : ''} w-full sm:w-80 border-r-0 sm:border-r border-slate-200 pr-0 sm:pr-8 space-y-4 overflow-y-auto custom-scrollbar`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Vos Événements</p>
                    {eventsError && (
                        <p className="px-2 text-xs font-semibold text-red-600">Impossible de charger vos événements. Vérifiez votre connexion.</p>
                    )}
                    {events.map((event) => (
                        <button 
                            key={event._id}
                            onClick={() => fetchAttendees(event._id)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all text-left ${
                                selectedEvent === event._id ? 'bg-slate-900 shadow-xl shadow-slate-900/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <span className="font-bold text-sm truncate pr-4">{event.title}</span>
                            <ChevronRight size={16} className={`shrink-0 transition-transform ${selectedEvent === event._id ? 'translate-x-1' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* Attendees Column */}
                <div className={`flex-1 min-w-0 flex flex-col overflow-hidden ${mobileOpen ? '' : 'hidden sm:flex'}`}>
                    {selectedEvent ? (
                        <>
                            <div className="mb-5 sm:mb-6 shrink-0 relative flex flex-col gap-3 sm:flex-row sm:items-center">
                                {isMobile && (
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex w-fit items-center gap-2 text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm"
                                        aria-label="Retour aux événements"
                                    >
                                        <ChevronLeft size={16} />
                                        <span className="text-sm font-bold">Retour</span>
                                    </button>
                                )}
                                <div className="relative flex-1 min-w-0 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher un participant..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-slate-300 font-medium"
                                    />
                                </div>
                                <div className="self-start sm:self-auto px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs font-black whitespace-nowrap">
                                    {filteredAttendees.length} PARTICIPANTS
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {attendeesLoading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="animate-spin text-slate-700" size={32} />
                                    </div>
                                ) : attendeesError ? (
                                    <div className="text-center py-20 text-red-600 font-bold uppercase tracking-widest text-[10px]">
                                        Impossible de charger les participants. Réessayez plus tard.
                                    </div>
                                ) : filteredAttendees.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                        {searchTerm ? 'Aucun résultat trouvé' : 'Aucun ticket vendu pour cet événement'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                            {filteredAttendees.map((ticket) => (
                                                <div key={ticket._id} className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                                                            <UserCircle size={22} className="text-slate-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-sm truncate">{ticket.user?.name}</h4>
                                                            <div className="mt-1 text-xs text-slate-500">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <Mail size={12} />
                                                                    <span className="truncate">{ticket.user?.email}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                                                    <Clock size={12} />
                                                                    <span>Acheté le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4 flex flex-col items-end">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                                            ticket.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                            ticket.status === 'active' ? 'bg-slate-50 text-slate-700 border-slate-100' :
                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}>
                                                            {ticket.status === 'checked_in' ? 'Présent' : ticket.status === 'active' ? 'Actif' : 'Utilisé'}
                                                        </span>
                                                        <p className="text-xs font-medium text-slate-500 mt-2">Tier: {ticket.tier}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-50">
                            <Users size={48} className="text-slate-700 mb-6" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sélectionnez un événement pour voir la liste des participants</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default AttendeeList;
