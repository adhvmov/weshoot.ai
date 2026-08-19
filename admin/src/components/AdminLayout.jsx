import { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, Box, Settings,
    LogOut, Search, Bell, Shield, BarChart3,
    Layers, Image as ImageIcon, MessageSquare, Database, Ban, Mail, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Ban, label: 'Banned Users', path: '/banned' },
        { icon: CreditCard, label: 'Plans & Pricing', path: '/plans' },
        { icon: BarChart3, label: 'AI Usage', path: '/ai-usage' },
        { icon: Layers, label: 'Models', path: '/models' },
        { icon: ImageIcon, label: 'Templates', path: '/templates' },
        { icon: MessageSquare, label: 'Gallery Moderation', path: '/gallery' },
        { icon: Mail, label: 'Contact Messages', path: '/contact' },
        { icon: Briefcase, label: 'Custom Requests', path: '/custom-requests' },
        { icon: Shield, label: 'Reports', path: '/reports' },
        { icon: Database, label: 'Logs', path: '/logs' },
        { icon: MessageSquare, label: 'Chat Support', path: '/support' },
        { icon: Settings, label: 'System Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#F5F8FF] overflow-hidden font-tight">
            {/* Sidebar */}
            <aside className="w-[300px] bg-white m-4 rounded-[40px] shadow-[rgba(15,23,42,0.08)_0px_20px_40px_-10px] border border-[#F1F5F9] flex flex-col overflow-hidden">
                <div className="h-20 flex items-center px-10 border-b border-[#F8FAFC]">
                    <Link to="/" className="flex items-center gap-1.5">
                        <span className="text-2xl font-black tracking-tight text-[#0F172A]">
                            WESHOOT<span className="text-[#4D96FF]">.ADMIN</span>
                        </span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-6 py-4 rounded-[18px] transition-all duration-300 border-2 border-transparent ${isActive
                                        ? 'bg-[#4D96FF] text-white shadow-[rgba(44,121,255,0.3)_0px_8px_20px] border-[#F5F8FF]'
                                        : 'text-[#64748B] hover:bg-[#F5F8FF] hover:text-[#4D96FF]'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-8 border-t border-[#F8FAFC]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-400 hover:text-red-500 font-bold px-6 py-4 w-full rounded-[20px] hover:bg-red-50 transition-all transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm tracking-tight">Sign Out</span>
                    </button>

                    <div className="mt-6 flex items-center gap-4 px-2">
                        <div className="w-11 h-11 rounded-[14px] bg-[#4D96FF] flex items-center justify-center text-white font-black text-xs shadow-md">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-[#0F172A] truncate">{user?.username || 'Admin'}</p>
                            <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-widest">{user?.role || 'Super Admin'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden py-4 pr-4">
                <main className="flex-1 bg-white rounded-[40px] shadow-[rgba(15,23,42,0.08)_0px_20px_40px_-10px] border border-[#F1F5F9] flex flex-col overflow-hidden">
                    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#F8FAFC] flex items-center justify-between px-10 gap-6 z-20">
                        <div className="relative w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full py-2.5 pl-11 pr-5 text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF]/30 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative w-11 h-11 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#4D96FF] transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                            </button>
                            <div className="w-px h-8 bg-[#F1F5F9] mx-2" />
                            <div className="flex items-center gap-2 px-6 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                System Live
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#F8FAFC]/30">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
