import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    DollarSign, 
    Users, 
    QrCode, 
    Zap,
    Loader2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }
                const response = await fetch('http://localhost:5000/api/events/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
                <Loader2 className="animate-spin text-slate-700" size={50} />
            </div>
        );
    }

    if (!stats) {
        return <div className="p-10 text-slate-900">Erreur lors du chargement des statistiques.</div>;
    }

    const statCards = [
        { label: 'Total Événements', value: stats.totalEvents, change: 'Créés', icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-500/10' },
        { label: 'Revenus', value: `${stats.totalRevenue} €`, change: 'Générés', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
        { label: 'Billets Vendus', value: stats.ticketsSold, change: 'Ventes', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
        { label: 'Participants Actifs', value: stats.scansIn, change: 'Scannés', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/10' }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="font-bold text-slate-900 mb-2">{label}</p>
                    <p className="text-emerald-400 text-sm font-black tracking-widest">{`Revenus : ${payload[0].value}€`}</p>
                    <p className="text-red-600 text-sm font-black tracking-widest mt-1">{`Participants : ${payload[0].payload.attendees}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
            {/* Welcome Section */}
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
                    Tableau de bord
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-slate-900">Centre de commandement</h1>
                <p className="text-slate-500 font-medium">Bon retour. Vos événements avancent avec une vue claire et premium.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200/70 rounded-[28px] p-6 hover:shadow-[0_14px_40px_-20px_rgba(15,23,42,0.15)] transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/2 opacity-[0.02] rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`${stat.bg} ${stat.color} p-3.5 rounded-2xl`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">{stat.change}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-200/70 rounded-[32px] p-8 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Ventes par Événement</h3>
                            <p className="text-slate-500 text-sm font-medium">Revenus globaux des tickets vendus</p>
                        </div>
                    </div>
                    
                    <div className="h-72 w-full">
                        {stats.chartData && stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                    <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Pas encore de données de vente
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Access List */}
                <div className="bg-white border border-slate-200/70 rounded-[32px] p-8 flex flex-col justify-between shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
                    <div>
                        <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-6">
                            <QrCode size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2">Terminal de Check-in</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">Accès rapide pour le staff. Scannez et validez les billets à la porte de manière sécurisée.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/scanner')}
                        className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-900 hover:bg-slate-800 transition-all font-bold group"
                    >
                        Lancer le Scanner
                    </button>
                    
                    <button 
                        onClick={() => navigate('/dashboard/events/create')}
                        className="w-full mt-4 bg-slate-100 text-slate-800 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all font-bold"
                    >
                        Créer un Nouvel Événement
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Dashboard;
