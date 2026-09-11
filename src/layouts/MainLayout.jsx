import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Search, Bell, Loader2, Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{"name": "Guest"}'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const syncUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const latestUser = await response.json();
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

                    // If role or plan changed (e.g. upgraded or expired), update local storage and state
                    if (latestUser.role !== storedUser.role || latestUser.plan !== storedUser.plan) {
                        localStorage.setItem('user', JSON.stringify(latestUser));
                        setUser(latestUser);

                        // If on a restricted route, redirect
                        if (latestUser.role === 'attendee' && (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/admin'))) {
                            navigate('/explore');
                        }
                    }
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } catch (err) {
                console.error("Sync error:", err);
            }
        };

        syncUser();
    }, [navigate]);

    // Close sidebar on route change for mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60 text-slate-900 font-['Inter'] selection:bg-slate-400/20 flex">
            <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="lg:pl-72 flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
                <header className="h-20 border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-12 fixed left-0 lg:left-72 right-0 top-0 bg-white/80 backdrop-blur-2xl z-[40] shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]">
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden p-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-900 mr-4 active:scale-95 transition-all"
                        aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={isSidebarOpen}
                    >
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    <div className="relative group w-full max-w-md hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-all duration-300" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher des événements, artistes..."
                            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 transition-all text-[13px] font-medium text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8 ml-auto">
                        <div className="flex items-center gap-4 border-r border-slate-200/60 pr-6 mr-2 hidden sm:flex">
                            <div className="relative group cursor-pointer" aria-hidden="true">
                                <div className="p-2.5 bg-slate-100/50 rounded-xl hover:bg-slate-200/50 transition-colors">
                                    <Bell className="text-slate-500 group-hover:text-slate-900 transition-colors" size={18} />
                                </div>
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/10"></div>
                            </div>
                        </div>

                        <div 
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-100/50 border border-transparent hover:border-slate-200/60 hover:bg-white transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 p-0.5 group-hover:scale-105 transition-transform">
                                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user.name}&backgroundColor=ffffff,f8fafc`} alt="profile" className="w-full h-full object-cover rounded-[10px]" />
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session</p>
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[100px] leading-none">{user.name?.split(' ')[0]}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 w-full overflow-x-hidden pt-20">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
