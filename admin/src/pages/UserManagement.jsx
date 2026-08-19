import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Search, UserPlus, MoreVertical, Shield,
    User as UserIcon, Filter, Download,
    Trash2, Ban, CheckCircle2, XCircle,
    RotateCcw, Coins, ShieldCheck, Activity
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');

    const formatRelativeTime = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.last_ip && u.last_ip.includes(searchTerm));

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'verified' && u.is_verified) ||
            (filterStatus === 'unverified' && !u.is_verified) ||
            (filterStatus === 'blocked' && u.is_blocked);

        const matchesPlan = filterPlan === 'all' || u.plan_name?.toLowerCase() === filterPlan.toLowerCase();

        return matchesSearch && matchesStatus && matchesPlan;
    });

    const handleUnban = async (id) => {
        if (!window.confirm('Restore access for this user?')) return;
        try {
            await api.post(`/admin/users/${id}/unban`);
            fetchUsers();
        } catch (error) {
            console.error('Unban user failed:', error);
        }
    };

    const handleUpdateCredits = async (id, currentCredits) => {
        const newCredits = window.prompt('Enter new total credits:', currentCredits);
        if (newCredits === null || newCredits === '') return;

        try {
            await api.post(`/admin/users/${id}/credits`, { total_credits: parseInt(newCredits) });
            fetchUsers();
        } catch (error) {
            console.error('Update credits failed:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('CRITICAL: This will permanently expunge ALL user data. Proceed?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Delete user failed:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">User Directory</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Manage and monitor all platform users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const headers = ['ID', 'Email', 'Name', 'Role', 'Plan', 'Credits Used', 'Total Credits', 'Generations', 'Last Active', 'IP'];
                            const rows = filteredUsers.map(u => [
                                u.id, u.email, u.full_name || 'N/A', u.role, u.plan_name, u.used_credits, u.total_credits, u.total_generations, u.last_active, u.last_ip
                            ]);
                            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement("a");
                            link.setAttribute("href", URL.createObjectURL(blob));
                            link.setAttribute("download", "user_directory_export.csv");
                            link.click();
                        }}
                        className="bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button className="bg-[#4D96FF] text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_20px] transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Create User
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-[#F1F5F9] rounded-[32px] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-[#0F172A] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF]/30 transition-all placeholder:text-[#CBD5E1]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#64748B] outline-none focus:border-[#4D96FF] transition-all"
                    >
                        <option value="all">All Plans</option>
                        <option value="free">Free Tier</option>
                        <option value="essentials">Essentials</option>
                        <option value="pro">Pro Plan</option>
                        <option value="lifetime">Lifetime</option>
                    </select>
                    <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-1">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'verified', label: 'Verified' },
                            { id: 'blocked', label: 'Blocked' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterStatus(btn.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === btn.id
                                    ? 'bg-white text-[#4D96FF] shadow-sm border border-[#E2E8F0]'
                                    : 'text-[#94A3B8] hover:text-[#64748B]'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                                <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Identification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Plan & Usage</th>
                                <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Resource Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Activity & IP</th>
                                <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl"></div>
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-[#F1F5F9] rounded-full"></div>
                                                    <div className="w-24 h-3 bg-[#F8FAFC] rounded-full"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[#F8FAFC] rounded-[24px] flex items-center justify-center mb-4">
                                                <Search className="w-8 h-8 text-[#CBD5E1]" />
                                            </div>
                                            <p className="text-[#94A3B8] font-black text-sm uppercase tracking-widest">No users found matching your query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-[#F8FAFC]/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <Link to={`/users/${user.id}`} className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-[18px] bg-[#F5F8FF] border border-[#E2E8F0] flex items-center justify-center text-[#4D96FF] font-black text-xs shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    {user.is_online && (
                                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-[#0F172A] tracking-tight group-hover:text-[#4D96FF] transition-colors">
                                                            {user.full_name || 'Anonymous User'}
                                                        </p>
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${user.role === 'User'
                                                            ? 'bg-blue-50 text-blue-500 border-blue-100'
                                                            : 'bg-purple-50 text-purple-500 border-purple-100'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-[#64748B] tabular-nums">{user.email}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#4D96FF]">{user.plan_name || 'Free Tier'}</span>
                                                <span className="text-xs font-black text-[#0F172A] mt-1 flex items-center gap-1.5">
                                                    <Activity className="w-3 h-3 text-[#94A3B8]" />
                                                    {user.total_generations || 0} Assets
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[80px] h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#4D96FF] rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (user.used_credits / (user.total_credits || 1)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#0F172A] tabular-nums tracking-tighter">
                                                        {user.used_credits || 0}<span className="text-[#94A3B8] mx-0.5">/</span>{user.total_credits || 0}
                                                    </span>
                                                    {user.is_blocked ? (
                                                        <span className="text-[8px] font-black text-red-500 uppercase">Blocked</span>
                                                    ) : user.is_verified ? (
                                                        <span className="text-[8px] font-black text-green-500 uppercase">Verified</span>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-amber-500 uppercase">Pending</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[#0F172A] tracking-tight">
                                                    {formatRelativeTime(user.last_active)}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#94A3B8] mt-1 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {user.last_ip || '---'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!user.is_blocked ? (
                                                    <button
                                                        onClick={() => handleBan(user.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-red-500 hover:border-red-500 transition-all"
                                                        title="Block User"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnban(user.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 border border-green-100 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                                        title="Unblock User"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-red-500 hover:border-red-500 transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateCredits(user.id, user.total_credits)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all"
                                                    title="Adjust Credits"
                                                >
                                                    <Coins className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-8 bg-[#F8FAFC]/50 border-t border-[#F1F5F9] flex items-center justify-between">
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.1em]">
                        Showing <span className="text-[#0F172A]">{filteredUsers.length}</span> of <span className="text-[#0F172A]">{users.length}</span> global accounts
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#CBD5E1] font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-not-allowed">Previous Session</button>
                        <button className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#F5F8FF] hover:border-[#4D96FF] hover:text-[#4D96FF] transition-all">Next Session</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
