import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket as TicketIcon, Clock, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

const TicketWallet = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [qrToken, setQrToken] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/tickets/my-tickets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) setTickets(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch dynamic QR Token
    useEffect(() => {
        if (!selectedTicket) return;

        let isSubscribed = true;

        const generateQR = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}/qr`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok && isSubscribed) {
                    setQrToken(data.qrToken);
                    setTimeLeft(60); // Reset timer 
                }
            } catch (err) {
                console.error(err);
            }
        };

        generateQR(); // Init
        const qrInterval = setInterval(generateQR, 55000); // Rafraichissement toutes les 55s
        
        const tickInterval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            isSubscribed = false;
            clearInterval(qrInterval);
            clearInterval(tickInterval);
        };
    }, [selectedTicket]);

    if (loading) return <div className="p-10 flex justify-center text-red-500"><RefreshCw className="animate-spin" size={40} /></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 relative">
            {/* Liste des billets */}
            <div className={`flex-1 transition-all duration-300 ${selectedTicket && isMobile ? 'blur-sm pointer-events-none scale-[0.99]' : ''}`}>
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3 leading-none">
                        <TicketIcon className="text-red-500" size={36} /> Mes billets
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">Retrouvez tous vos billets d'accès ici.</p>
                </div>

                {tickets.length === 0 ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-3xl p-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                        Aucun billet pour le moment.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div 
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={cn(
                                    "bg-slate-100 border border-slate-200 rounded-[32px] p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 cursor-pointer hover:border-red-500/50 transition-all",
                                    selectedTicket?._id === ticket._id ? "border-red-500/50 shadow-lg shadow-red-500/10" : ""
                                )}
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black overflow-hidden shrink-0 hidden sm:block">
                                    {ticket.event?.image && <img src={ticket.event.image} alt="Event" className="w-full h-full object-cover opacity-80" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg sm:text-xl font-bold leading-tight">{ticket.event?.title || 'Événement inconnu'}</h3>
                                        <span className={cn(
                                            "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
                                            ticket.pricePaid === 0 ? "border-emerald-200 bg-emerald-500/10 text-emerald-600" : "border-red-200 bg-red-500/10 text-red-600"
                                        )}>
                                            {ticket.pricePaid === 0 ? 'Gratuit' : 'Payant'}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 text-sm mt-1 flex items-center gap-4 flex-wrap">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(ticket.event?.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-3 inline-block">
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                            ticket.tier === 'VVIP' ? "bg-red-500/20 text-red-600 border-red-500/30" : 
                                            ticket.tier === 'VIP' ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                                            "bg-red-500/20 text-red-600 border-red-500/30"
                                        )}>
                                            Pass {ticket.tier}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider",
                                        ticket.status === 'checked_in' ? "bg-emerald-500/10 text-emerald-500" :
                                        ticket.status === 'checked_out' ? "bg-orange-500/10 text-orange-500" : "bg-white text-slate-500"
                                    )}>
                                        {ticket.status === 'checked_in' ? 'À l\'intérieur' : ticket.status === 'checked_out' ? 'Sorti' : 'Valide'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Zone QR Code Dynamique */}
            {selectedTicket && !isMobile && (
                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="sticky top-28 bg-white border border-slate-200 rounded-[40px] p-8 text-center shadow-2xl flex flex-col items-center">
                        <div className="w-full mb-6">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full",
                                selectedTicket.status === 'checked_in' ? "bg-emerald-500 text-black" : "bg-slate-200 text-slate-900"
                            )}>
                                {selectedTicket.tier} - {selectedTicket.status === 'checked_in' ? 'Actuellement Dedans' : 'Prêt à entrer'}
                            </span>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white p-4 rounded-3xl mx-auto w-64 h-64 flex items-center justify-center relative overflow-hidden">
                            {qrToken ? (
                                <QRCodeSVG 
                                    value={qrToken} 
                                    size={220} 
                                    level="H"
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                />
                            ) : (
                                <RefreshCw className="animate-spin text-slate-300" size={40} />
                            )}
                            
                            {/* Scanning Effect Overlay */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_bg-red-500] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>

                        <div className="mt-8 space-y-2">
                            <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                Code anti-fraude sécurisé
                            </p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                Actualisation dans <RefreshCw size={12} className={timeLeft < 10 ? "animate-spin text-red-500" : ""} /> {timeLeft}s
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedTicket && isMobile && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm px-4 py-6 flex items-end sm:items-center justify-center"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="w-full max-w-md bg-white/95 border border-slate-200 rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col items-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="w-full flex items-center justify-between gap-3 mb-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Billet sélectionné</p>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-1">{selectedTicket.event?.title || 'Événement inconnu'}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                            >
                                Fermer
                            </button>
                        </div>

                        <div className="w-full mb-4 text-center">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full",
                                selectedTicket.status === 'checked_in' ? "bg-emerald-500 text-black" : "bg-slate-200 text-slate-900"
                            )}>
                                {selectedTicket.tier} - {selectedTicket.status === 'checked_in' ? 'Actuellement Dedans' : 'Prêt à entrer'}
                            </span>
                        </div>

                        <div className="bg-white p-4 rounded-3xl mx-auto w-56 h-56 flex items-center justify-center relative overflow-hidden shadow-sm border border-slate-100">
                            {qrToken ? (
                                <QRCodeSVG
                                    value={qrToken}
                                    size={190}
                                    level="H"
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            ) : (
                                <RefreshCw className="animate-spin text-slate-300" size={40} />
                            )}
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_bg-red-500] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>

                        <div className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-center backdrop-blur-[2px]">
                            <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                Code anti-fraude sécurisé
                            </p>
                            <p className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                Actualisation dans <RefreshCw size={12} className={timeLeft < 10 ? "animate-spin text-red-500" : ""} /> {timeLeft}s
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </div>
    );
};

export default TicketWallet;
