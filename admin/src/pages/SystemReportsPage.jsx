import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Shield, Activity, Database, Server,
    Wifi, WifiOff, HardDrive, Cpu,
    RefreshCw, AlertTriangle, CheckCircle,
    BarChart3, PieChart as PieChartIcon, TrendingUp, Clock,
    AlertCircle, Users, Zap, ShieldAlert,
    ExternalLink, Map
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';

const COLORS = ['#4D96FF', '#FFB800', '#8B5CF6', '#10B981', '#FF4D4D', '#F59E0B'];

const SystemReportsPage = () => {
    const [health, setHealth] = useState(null);
    const [stats, setStats] = useState(null);
    const [security, setSecurity] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [healthRes, usageRes, securityRes, logsRes] = await Promise.all([
                api.get('/admin/health'),
                api.get('/admin/usage-stats?timeframe=30d'),
                api.get('/admin/security/audit'),
                api.get('/admin/logs')
            ]);

            if (healthRes.data.success) setHealth(healthRes.data.data);
            if (usageRes.data.success) setStats(usageRes.data.data);
            if (securityRes.data.success) setSecurity(securityRes.data.data);
            if (logsRes.data.success) setLogs(logsRes.data.data || []);
        } catch (error) {
            console.error('Fetch reports error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !health) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-[#4D96FF] border-t-transparent rounded-full animate-spin shadow-lg"></div>
                <p className="text-xs font-black text-[#0F172A] uppercase tracking-widest">Compiling System intelligence...</p>
            </div>
        );
    }

    const toolDistribution = stats?.distribution || [];
    const peakHours = stats?.peak_hours || [];
    const flaggedGroups = security?.flagged_groups || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">System Intelligence Report</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Deep-dive into platform performance, usage trends, and security audits.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="bg-white border border-[#E2E8F0] text-[#0F172A] font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:border-[#4D96FF] hover:text-[#4D96FF] transition-all flex items-center gap-2 shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Analyzing...' : 'Generate Fresh Audit'}
                </button>
            </div>

            {/* Health & Infrastructure Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-[#0F172A] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Shield className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex items-center gap-8">
                        <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-transform hover:scale-105 duration-500">
                            <Activity className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Operational Excellence</h2>
                            <p className="text-green-500 font-black uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                All Sentinel nodes report 100% nominal status
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex-1 grid grid-cols-2 lg:grid-cols-3 gap-8 border-l border-white/10 pl-10">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">Process Uptime</p>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {Math.floor((health?.uptime || 0) / 3600)}h {Math.floor(((health?.uptime || 0) % 3600) / 60)}m
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">Success Rate</p>
                            <p className="text-2xl font-black text-white tabular-nums">{stats?.metrics?.success_rate}%</p>
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">Memory Footprint</p>
                            <p className="text-2xl font-black text-white tabular-nums">
                                {Math.round((health?.memory?.rss || 0) / 1024 / 1024)}MB
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-[#F1F5F9] rounded-[48px] p-8 shadow-sm flex flex-col justify-center items-center text-center group transition-all hover:bg-[#F5F8FF]">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                        <Database className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-1">PostgreSQL Link</p>
                    <p className="text-xl font-black text-[#0F172A]">{health?.db_status === 'Operational' ? 'OPTIMAL' : 'DEGRADED'}</p>
                </div>
            </div>

            {/* Distribution & Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-[#F1F5F9] rounded-[48px] p-10 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-[#FFB800]" />
                                Power Distribution
                            </h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">Resource consumption per tool category (Last 30 Days).</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={toolDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="tool_name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F5F8FF' }}
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderRadius: '16px',
                                        border: 'none',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                    labelStyle={{ color: '#94A3B8', fontSize: '10px', marginBottom: '4px' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                    {toolDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-[48px] p-10 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#8B5CF6]" />
                                Peak Usage
                            </h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">Load distribution by hour of day.</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={peakHours}>
                                <defs>
                                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', padding: '12px', background: '#0F172A' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorPeak)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Security Audit Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-[#F1F5F9] rounded-[48px] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-[#F8FAFC] flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                                <ShieldAlert className="w-7 h-7 text-[#FF4D4D]" />
                                Flagged IP Clusters
                            </h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">Multi-account detection by shared network signatures.</p>
                        </div>
                        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {flaggedGroups.length} Critical Flags
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-4">
                        {flaggedGroups.map((group, idx) => (
                            <div key={idx} className="p-6 bg-red-50/30 border border-dashed border-red-200 rounded-[32px] group hover:bg-red-50 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm border border-red-50">
                                            <Map className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#0F172A]">{group.ip_address}</p>
                                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Global IP Signature</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-red-600">{group.user_count}</p>
                                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Associated IDs</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(group.associated_users || []).map((user, uidx) => (
                                        <div key={uidx} className="bg-white px-3 py-1.5 rounded-lg text-[9px] font-bold text-[#475569] border border-red-100 shadow-sm">
                                            {user.email}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {flaggedGroups.length === 0 && (
                            <div className="py-20 text-center">
                                <Shield className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
                                <p className="text-sm font-bold text-[#94A3B8]">No suspicious IP clusters detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-[48px] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-[#F8FAFC]">
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                            <ShieldAlert className="w-7 h-7 text-[#0F172A]" />
                            Sentinel Containment
                        </h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Users currently restricted from platform access.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-[#F8FAFC]">
                                    <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Target</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Restricted Since</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8FAFC]">
                                {(security?.blocked_users || []).map((user) => (
                                    <tr key={user.id} className="group hover:bg-[#F8FAFC] transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#0F172A]">{user.full_name}</span>
                                                <span className="text-[10px] font-bold text-[#94A3B8]">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[11px] font-black text-[#64748B] tabular-nums">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="text-red-500 hover:text-red-700 p-2 transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {security?.blocked_users?.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-10 py-20 text-center">
                                            <p className="text-sm font-bold text-[#94A3B8]">Containment protocol is currently empty.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Admin Audit Trail */}
            <div className="bg-white border border-[#F1F5F9] rounded-[48px] shadow-sm overflow-hidden">
                <div className="p-10 border-b border-[#F8FAFC] flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                            <Activity className="w-7 h-7 text-[#4D96FF]" />
                            Operational Audit Trail
                        </h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Immutable record of high-level administrative actions.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-[#F8FAFC]">
                                <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Agent</th>
                                <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Action</th>
                                <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Parameters</th>
                                <th className="px-10 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                            {(logs.slice(0, 10)).map((log, idx) => (
                                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[10px] font-black text-[#0F172A]">
                                                {log.admin_email?.[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-black text-[#0F172A]">{log.admin_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.action?.includes('DELETE') ? 'bg-red-50 text-red-500 border border-red-100' :
                                                log.action?.includes('BAN') ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                                    'bg-blue-50 text-blue-500 border border-blue-100'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <code className="text-[10px] font-bold text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#F1F5F9]">
                                            {JSON.stringify(log.details || {}).substring(0, 50)}...
                                        </code>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <span className="text-[11px] font-black text-[#64748B] tabular-nums">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemReportsPage;

