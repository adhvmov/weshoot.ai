import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Ban, ShieldAlert, ShieldCheck, Trash2, Search,
    ChevronRight, ArrowRight, User as UserIcon, Globe,
    Shield, RefreshCw, AlertCircle
} from 'lucide-react';
import api from '../services/api';

const BannedUsersPage = () => {
    const [auditData, setAuditData] = useState({ blocked_users: [], flagged_groups: [] });
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('blocked'); // 'blocked' or 'flagged'

    const fetchAuditData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/security/audit');
            if (response.data.success) {
                setAuditData(response.data.data);
            }
        } catch (error) {
            console.error('Fetch audit data failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    const handleBan = async (id) => {
        if (!window.confirm('Block this user? They will be immediately logged out and restricted.')) return;
        try {
            await api.post(`/admin/users/${id}/ban`, { reason: 'Security Audit: Matching Profile' });
            fetchAuditData();
        } catch (error) {
            console.error('Ban failed:', error);
        }
    };

    const handleUnban = async (id) => {
        if (!window.confirm('Restore access for this user?')) return;
        try {
            await api.post(`/admin/users/${id}/unban`);
            fetchAuditData();
        } catch (error) {
            console.error('Unban failed:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('CRITICAL: Permanently delete this user and all their data?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchAuditData();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const gradientTextStyle = {
        background: 'linear-gradient(90deg, #0F172A 0%, #4D96FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    };

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight" style={gradientTextStyle}>
                        Security Audit
                    </h1>
                    <p className="text-[#64748B] text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Banned Users & Risk Management
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchAuditData}
                        className="p-4 bg-white border border-[#E2E8F0] rounded-2xl text-[#64748B] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all group"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-active:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="bg-white border border-[#E2E8F0] p-1 rounded-2xl flex">
                        <button
                            onClick={() => setActiveSection('blocked')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'blocked' ? 'bg-[#4D96FF] text-white shadow-md' : 'text-[#64748B] hover:text-[#4D96FF]'
                                }`}
                        >
                            Blocked ({auditData.blocked_users.length})
                        </button>
                        <button
                            onClick={() => setActiveSection('flagged')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'flagged' ? 'bg-[#4D96FF] text-white shadow-md' : 'text-[#64748B] hover:text-[#4D96FF]'
                                }`}
                        >
                            Risk Detection ({auditData.flagged_groups.length})
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-[#F1F5F9] rounded-[32px] p-8 h-40 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {activeSection === 'blocked' ? (
                        <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-[#F8FAFC]">
                                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Explicitly Banned Accounts</h3>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">Users restricted from accessing the platform</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#F8FAFC]">
                                            <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Banned Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F1F5F9]">
                                        {auditData.blocked_users.length > 0 ? auditData.blocked_users.map((item) => (
                                            <tr key={item.id} className="group hover:bg-[#F5F8FF]/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100/50">
                                                            <UserIcon className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0F172A] tracking-tight">{item.full_name || 'Anonymous'}</p>
                                                            <p className="text-[11px] font-bold text-[#64748B]">{item.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-bold text-[#64748B] tabular-nums">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link
                                                            to={`/users/${item.id}`}
                                                            className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#64748B] hover:text-[#4D96FF] transition-all"
                                                        >
                                                            View Profile
                                                        </Link>
                                                        <button
                                                            onClick={() => handleUnban(item.id)}
                                                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Restore
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center">
                                                    <ShieldCheck className="w-12 h-12 text-green-200 mx-auto mb-4" />
                                                    <p className="text-[#94A3B8] font-black uppercase tracking-widest text-xs">No banned users detected</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-10 bg-[#0F172A] rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4D96FF]/10 blur-[100px]" />
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-white tracking-tight">IP Duplication Warning</h3>
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2">
                                        The following groups share identical network signatures (IP Addresses).
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {auditData.flagged_groups.length > 0 ? auditData.flagged_groups.map((group, idx) => (
                                    <div key={idx} className="bg-white border border-[#F1F5F9] rounded-[40px] p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:border-[#4D96FF]/30 transition-all border-l-4 border-l-amber-400">
                                        <div className="bg-[#F8FAFC] p-6 rounded-[32px] border border-[#E2E8F0] min-w-[240px]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Globe className="w-5 h-5 text-[#4D96FF]" />
                                                <p className="text-xs font-black text-[#0F172A] tabular-nums">{group.ip_address}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[32px] font-black tracking-tight text-[#0F172A]">{group.user_count}</p>
                                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Associated Accounts</p>
                                            </div>
                                            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.1em] flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Multi-Account Risk
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {group.associated_users.map(u => (
                                                <div key={u.id} className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${u.is_blocked ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-[#F1F5F9] hover:border-[#4D96FF]'
                                                    }`}>
                                                    <div>
                                                        <p className="text-sm font-black text-[#0F172A] tracking-tight">{u.full_name || 'User'}</p>
                                                        <p className="text-[10px] font-bold text-[#64748B]">{u.email}</p>
                                                        {u.is_blocked && <span className="text-[8px] font-black uppercase text-red-500 mt-1 block">Already Banned</span>}
                                                    </div>
                                                    {!u.is_blocked && (
                                                        <button
                                                            onClick={() => handleBan(u.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            title="Ban immediately"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="bg-white border border-[#F1F5F9] border-dashed rounded-[40px] p-20 text-center">
                                        <div className="w-20 h-20 bg-[#F8FAFC] rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                            <Shield className="w-10 h-10 text-green-200" />
                                        </div>
                                        <h4 className="text-lg font-black text-[#0F172A] tracking-tight">Security System Clear</h4>
                                        <p className="text-xs font-bold text-[#94A3B8] max-w-[280px] mx-auto mt-2 uppercase tracking-widest leading-relaxed">
                                            No concurrent IP fingerprints detected in current active sessions.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BannedUsersPage;
