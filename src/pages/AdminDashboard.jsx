import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, UserCircle, CheckCircle, XCircle, Loader2, ListTree, MoreVertical, Calendar, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../lib/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'users', 'organizations'
    const { showToast } = useToast();

    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    const [stats, setStats] = useState({ totalUsers: 0, totalOrganizations: 0, pendingRequests: 0 });
    const [loading, setLoading] = useState(true);
    const [failedResources, setFailedResources] = useState([]);


    // Approval Modal State
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [durationDays, setDurationDays] = useState('30');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const failures = [];

        try {
            // Fetch Requests
            const reqRes = await fetch(`${API_BASE_URL}/api/auth/pending-upgrades`, { headers });
            if (reqRes.ok) setRequests(await reqRes.json());
            else failures.push('demandes');
        } catch (e) { console.error("Error fetching requests", e); failures.push('demandes'); }

        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
            if (statsRes.ok) setStats(await statsRes.json());
            else failures.push('statistiques');
        } catch (e) { console.error("Error fetching stats", e); failures.push('statistiques'); }

        try {
            // Fetch Users
            const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
            if (usersRes.ok) setUsers(await usersRes.json());
            else failures.push('utilisateurs');
        } catch (e) { console.error("Error fetching users", e); failures.push('utilisateurs'); }

        try {
            // Fetch Organizations
            const orgsRes = await fetch(`${API_BASE_URL}/api/admin/organizations`, { headers });
            if (orgsRes.ok) {
                setOrganizations(await orgsRes.json());
            } else {
                failures.push('organisations');
            }
        } catch (e) { console.error("Error fetching organizations", e); failures.push('organisations'); }

        setFailedResources(failures);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openApproveModal = (requestId) => {
        setSelectedRequestId(requestId);
        setIsApproveModalOpen(true);
    };

    const handleAction = async (requestId, action, finalDuration = null) => {
        if (action === 'approve' && !finalDuration) {
            openApproveModal(requestId);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/handle-upgrade`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    requestId, 
                    action, 
                    durationDays: finalDuration || (action === 'approve' ? durationDays : null) 
                })
            });
            
            if (response.ok) {
                showToast(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`, "success");
                fetchData(); // Refresh everything
                setIsApproveModalOpen(false);
            } else {
                const data = await response.json();
                showToast(data.message, "error");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUserAction = async (userId, type, payload) => {
        try {
            const token = localStorage.getItem('token');
            const url = type === 'role' 
                ? `${API_BASE_URL}/api/admin/users/${userId}/role`
                : `${API_BASE_URL}/api/admin/users/${userId}/status`;
                
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: payload ? JSON.stringify(payload) : undefined
            });

            if (response.ok) {
                fetchData(); // Refresh the list
            } else {
                const data = await response.json();
                showToast(data.message || "Action impossible.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Erreur réseau.", "error");
        }
    };

    return (
        <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-red-500" size={32} />
                    <h1 className="text-4xl font-black tracking-tighter">Terminal Administration</h1>
                </div>
                <p className="text-slate-500 font-medium">Contrôle global de la plateforme EventChill.</p>
            </div>

            {failedResources.length > 0 && (
                <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800">
                    <AlertTriangle size={18} className="shrink-0" />
                    <p className="text-sm font-medium">
                        Certaines données n'ont pas pu être chargées ({failedResources.join(', ')}).
                        <button onClick={fetchData} className="ml-2 font-bold underline hover:no-underline">Réessayer</button>
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-slate-100 border border-slate-200 rounded-[32px] p-5 sm:p-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Utilisateurs</p>
                    <h3 className="text-4xl font-black tracking-tighter">{stats.totalUsers}</h3>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-[32px] p-5 sm:p-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Organisations Active</p>
                    <h3 className="text-4xl font-black tracking-tighter">{stats.totalOrganizations}</h3>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-[32px] p-5 sm:p-8 border-red-500/30 bg-red-500/10">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Demandes en attente</p>
                    <h3 className="text-4xl font-black tracking-tighter text-red-600">{stats.pendingRequests}</h3>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all whitespace-nowrap border ${activeTab === 'requests' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                >
                    Demandes ({stats.pendingRequests})
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all whitespace-nowrap border ${activeTab === 'users' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                >
                    Base Utilisateurs
                </button>
                <button 
                    onClick={() => setActiveTab('organizations')}
                    className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all whitespace-nowrap border ${activeTab === 'organizations' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                >
                    Organisations
                </button>
            </div>

            <section className="mb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-red-500" size={40} />
                    </div>
                ) : (
                    <>
                        {/* TAB: REQUESTS */}
                        {activeTab === 'requests' && (
                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <div className="bg-slate-100 border border-slate-200 rounded-[32px] p-10 sm:p-20 text-center">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Aucune demande en attente</p>
                                    </div>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req._id} className="bg-slate-100 border border-slate-200 rounded-[40px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-200 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-600 flex items-center justify-center text-xl font-black border border-red-500/30">
                                                    {req.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{req.user?.name}</h4>
                                                    <p className="text-sm text-slate-500">{req.user?.email}</p>
                                                    <p className="mt-2 text-xs text-slate-500 italic">"{req.message}"</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleAction(req._id, 'approve')}
                                                    className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 font-black py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                                >
                                                    <CheckCircle size={16} /> Approuver
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(req._id, 'reject')}
                                                    className="flex items-center gap-2 bg-red-500/10 text-red-400 font-black py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all"
                                                >
                                                    <XCircle size={16} /> Rejeter
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: USERS */}
                        {activeTab === 'users' && (
                            <div className="bg-white border border-slate-200 rounded-[40px] overflow-x-auto">
                                <table className="w-full min-w-160 text-left">
                                    <thead className="bg-slate-100 border-b border-slate-200">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Utilisateur</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Rôle</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date d'inscription</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-slate-100 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                            <UserCircle size={20} className="text-slate-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{user.name}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        user.role === 'organizer' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                        'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        user.status === 'blocked' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    }`}>
                                                        {user.status === 'blocked' ? 'Bloqué' : 'Actif'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm text-slate-500 font-medium">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-6 flex items-center justify-end gap-2">
                                                    {user.role === 'attendee' ? (
                                                        <button 
                                                            onClick={() => handleUserAction(user._id, 'role', { role: 'organizer' })} 
                                                            className="px-3 py-2 text-[10px] uppercase font-black tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-200"
                                                        >
                                                            Promouvoir
                                                        </button>
                                                    ) : user.role === 'organizer' ? (
                                                        <button 
                                                            onClick={() => handleUserAction(user._id, 'role', { role: 'attendee' })} 
                                                            className="px-3 py-2 text-[10px] uppercase font-black tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                                                        >
                                                            Rétrograder
                                                        </button>
                                                    ) : null}

                                                    {user.status === 'blocked' ? (
                                                        <button 
                                                            onClick={() => handleUserAction(user._id, 'status')} 
                                                            className="px-3 py-2 text-[10px] uppercase font-black tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                                                        >
                                                            Débloquer
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleUserAction(user._id, 'status')} 
                                                            className="px-3 py-2 text-[10px] uppercase font-black tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                                                        >
                                                            Bloquer
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB: ORGANIZATIONS */}
                        {activeTab === 'organizations' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(!organizations || organizations.length === 0) ? (
                                    <p className="text-slate-500 col-span-full text-center py-20 bg-slate-100 rounded-[32px] font-bold uppercase tracking-widest text-[10px]">Aucune organisation trouvée.</p>
                                ) : (
                                    organizations.map((org) => (
                                        <div key={org._id} className="bg-slate-100 border border-slate-200 rounded-[32px] p-8 hover:border-slate-200 transition-all flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                                    <Building2 size={24} />
                                                </div>
                                                <h3 className="font-bold text-xl mb-1">{org.name}</h3>
                                                <p className="text-xs text-slate-500 mb-6">{org.description || 'Aucune description fournie.'}</p>
                                            </div>
                                            
                                            <div className="pt-6 border-t border-slate-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Propriétaire</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold">
                                                        {org.owner?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">{org.owner?.name || 'Inconnu'}</p>
                                                        <p className="text-[10px] text-slate-500">{org.owner?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Approuver l'Organisateur"
                footer={(
                    <button 
                        onClick={() => handleAction(selectedRequestId, 'approve', durationDays)}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Traitement..." : "Confirmer l'accès"}
                    </button>
                )}
            >
                <div className="space-y-6">
                    <p className="text-slate-500 text-sm font-medium">Définissez la durée de validité du statut organisateur pour cet utilisateur (en jours).</p>
                    <label htmlFor="approve-duration-days" className="sr-only">Durée en jours</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            id="approve-duration-days"
                            type="number"
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value)}
                            placeholder="30"
                            className="w-full bg-slate-100 border border-transparent rounded-2xl py-4 pl-12 pr-6 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Laissez vide ou mettez 0 pour un accès permanent.</p>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
