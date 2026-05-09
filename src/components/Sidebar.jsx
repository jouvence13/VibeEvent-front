import React from 'react';
import { 
    LayoutDashboard, 
    Calendar, 
    BarChart3, 
    Users, 
    Plus, 
    LogOut,
    Eye,
    Vote,
    Ticket,
    Scan,
    Settings,
    User as UserIcon
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ShieldAlert } from 'lucide-react';

const Sidebar = ({ user, isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const publicMenuItems = [
        { icon: Eye, label: 'Explorer', path: '/explore' },
        { icon: Vote, label: 'Votes Live', path: '/voting' },
        { icon: Ticket, label: 'Mes Billets', path: '/tickets' },
    ];

    const organizerMenuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', plan: ['events_only', 'premium'] },
        { icon: Scan, label: 'Scanner', path: '/dashboard/scanner', plan: ['events_only', 'premium'] },
        { icon: Calendar, label: 'Événements', path: '/dashboard/events', plan: ['events_only', 'premium'] },
        { icon: Vote, label: 'Sondages', path: '/dashboard/voting', plan: ['polls_only', 'premium'] },
        { icon: BarChart3, label: 'Analyses', path: '/dashboard/analytics', plan: ['events_only', 'polls_only', 'premium'] },
        { icon: Users, label: 'Participants', path: '/dashboard/attendees', plan: ['events_only', 'premium'] },
        { icon: UserIcon, label: 'Mon Profil', path: '/profile' },
    ];

    const filteredOrganizerItems = organizerMenuItems.filter(item => {
        if (!item.plan) return true;
        // Admins see everything
        if (user.role === 'admin') return true;
        // Check if the user plan provides access to this item
        return item.plan.includes(user.plan || 'none');
    });

    const handleCreateClick = () => {
        if (user.plan === 'polls_only') {
            navigate('/dashboard/voting');
        } else {
            navigate('/dashboard/events/create');
        }
    };

    const adminMenuItems = [
        { icon: ShieldAlert, label: 'Admin Terminal', path: '/admin' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/auth');
    };

    return (
        <aside className={cn(
            "w-72 h-screen bg-gradient-to-b from-white via-slate-50 to-slate-50 border-r border-slate-200/60 flex flex-col fixed left-0 top-0 z-[60] overflow-y-hidden custom-scrollbar transition-transform duration-300 lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Mobile close overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1] lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />
            <div className="p-5 pb-3 flex-shrink-0">
                <div className="flex items-center gap-2.5 mb-5 cursor-pointer" onClick={() => navigate('/explore')}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 shadow-lg shadow-red-500/20"></div>
                    <h2 className="text-slate-900 font-black text-base tracking-tighter uppercase italic">Evenflow</h2>
                </div>

                <div className="mb-5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Participant</p>
                    <nav className="space-y-0.5">
                        {publicMenuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group",
                                    location.pathname.startsWith(item.path)
                                        ? "bg-gradient-to-r from-red-500/10 to-red-400/5 text-red-600 border border-red-200/40" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                                )}
                            >
                                <item.icon size={16} strokeWidth={location.pathname.startsWith(item.path) ? 2.5 : 2} />
                                <span className="text-xs font-bold tracking-tight">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                
                {(user.role === 'organizer' || user.role === 'admin') && (
                    <>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent mb-5"></div>

                        <div className="mb-5">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Organisateur</p>
                            </div>
                            
                            <button 
                                onClick={handleCreateClick}
                                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all active:scale-95 mb-4 text-[9px] uppercase tracking-[0.15em]"
                            >
                                <Plus size={15} strokeWidth={3} />
                                Créer
                            </button>


                            <nav className="space-y-0.5">
                                {filteredOrganizerItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group",
                                            location.pathname === item.path 
                                                ? "bg-gradient-to-r from-red-500/10 to-red-400/5 text-red-600 border border-red-200/40" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                                        )}
                                    >
                                        <item.icon size={16} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                        <span className="text-xs font-bold tracking-tight">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </>
                )}

                {user.role === 'admin' && (
                    <>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent mb-5"></div>

                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Plateforme</p>
                            <nav className="space-y-0.5">
                                {adminMenuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group",
                                            location.pathname === item.path 
                                                ? "bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 text-emerald-600 border border-emerald-200/40" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                                        )}
                                    >
                                        <item.icon size={16} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                        <span className="text-xs font-bold tracking-tight">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </>
                )}

            </div>

            <div className="mt-auto p-5 pt-3 border-t border-slate-200/40 bg-gradient-to-b from-transparent to-slate-100/30">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-red-500 hover:bg-red-500/5 transition-colors group"
                >
                    <LogOut size={16} />
                    <span className="text-xs font-bold tracking-tight">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
