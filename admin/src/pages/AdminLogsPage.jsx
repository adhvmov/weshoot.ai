import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
    Database, Shield, Clock, Info,
    Search, Filter, ChevronRight,
    Terminal, Lock, Key, Globe, User,
    BarChart3, Calendar, RefreshCw, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

const AdminLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    const fetchLogs = async () => {
        setRefreshing(true);
        try {
            const response = await api.get('/admin/logs');
            if (response.data.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            console.error('Fetch logs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterAction === 'ALL' || log.action === filterAction;

            return matchesSearch && matchesFilter;
        });
    }, [logs, searchTerm, filterAction]);

    const actionStats = useMemo(() => {
        const stats = {};
        logs.forEach(log => {
            stats[log.action] = (stats[log.action] || 0) + 1;
        });
        return Object.entries(stats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [logs]);

    const dailyActivity = useMemo(() => {
        const counts = {};
        logs.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString();
            counts[date] = (counts[date] || 0) + 1;
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count })).reverse().slice(-7);
    }, [logs]);

    const getActionColor = (action) => {
        if (action.includes('LOGIN')) return 'text-blue-500 bg-blue-50 border-blue-100';
        if (action.includes('DELETE')) return 'text-red-500 bg-red-50 border-red-100';
        if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-50 border-amber-100';
        if (action.includes('BAN')) return 'text-orange-500 bg-orange-50 border-orange-100';
        return 'text-green-500 bg-green-50 border-green-100';
    };

    const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action))];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Security Audit Log</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Immutable record of administrative operations and system events.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchLogs}
                        className="p-4 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#4D96FF] transition-all shadow-sm group"
                    >
                        <RefreshCw className={`w-5 h-5 text-[#64748B] group-hover:text-[#4D96FF] ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-[#F1F5F9] rounded-[22px] py-4 pl-16 pr-8 text-sm font-bold w-full md:w-[300px] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-[#F1F5F9] rounded-[48px] p-8 shadow-sm flex flex-col h-[350px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#4D96FF]" />
                            Activity Stream
                        </h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyActivity}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4D96FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4D96FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', padding: '12px', background: '#0F172A' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4D96FF" strokeWidth={3} fill="url(#colorActivity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#0F172A] rounded-[48px] p-8 text-white flex flex-col h-[350px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Terminal className="w-32 h-32" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 relative z-10">Action Distribution</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10 custom-scrollbar">
                        {actionStats.map((stat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/70 truncate mr-4">{stat.name.replace(/_/g, ' ')}</span>
                                    <span>{stat.count}</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#4D96FF] rounded-full transition-all duration-1000"
                                        style={{ width: `${(stat.count / logs.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-wrap gap-2">
                {uniqueActions.slice(0, 8).map(action => (
                    <button
                        key={action}
                        onClick={() => setFilterAction(action)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterAction === action
                                ? 'bg-[#0F172A] text-white'
                                : 'bg-white border border-[#F1F5F9] text-[#64748B] hover:border-[#4D96FF]'
                            }`}
                    >
                        {action.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-[#F1F5F9] rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Operation</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Executor</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Parameters</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Source IP</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-10 py-6 h-16 bg-white"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#F8FAFC]/50 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${getActionColor(log.action)}`}>
                                                <Terminal className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-black text-[#0F172A] tracking-tight">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F5F8FF] flex items-center justify-center text-[10px] font-black text-[#4D96FF]">
                                                {log.admin_email?.[0].toUpperCase() || 'S'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-[#0F172A]">{log.admin_name || 'System'}</span>
                                                <span className="text-[9px] font-bold text-[#94A3B8]">{log.admin_email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <code className="text-[10px] font-bold text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#F1F5F9] max-w-[250px] truncate block">
                                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                        </code>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-xs font-black text-[#0F172A] flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-[#94A3B8]" />
                                            {log.ip_address}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-[#0F172A]">{new Date(log.created_at).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-[#94A3B8]">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && !loading && (
                    <div className="p-20 text-center">
                        <AlertCircle className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
                        <p className="text-[#94A3B8] font-black uppercase tracking-widest text-xs">No administrative intelligence found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogsPage;

