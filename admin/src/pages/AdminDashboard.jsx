import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users, CreditCard, Layout, ArrowUpRight,
    ArrowDownRight, User, TrendingUp, Zap,
    ShieldCheck, AlertCircle, Clock, Search,
    Filter, RefreshCw, Activity, ExternalLink
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [usageRes, healthRes] = await Promise.all([
                api.get(`/admin/usage-stats?timeframe=${timeframe}`),
                api.get('/admin/health')
            ]);

            if (usageRes.data.success) {
                setData(usageRes.data.data);
            }
            if (healthRes.data.success) {
                setHealth(healthRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Auto refresh every minute
        return () => clearInterval(interval);
    }, [timeframe]);

    const StatCard = ({ icon: Icon, label, value, trend, isUp, color, bgColor, prefix = "" }) => (
        <div className="bg-white border border-[#F1F5F9] rounded-[32px] p-8 shadow-sm group hover:shadow-xl hover:shadow-[#4D96FF]/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm border border-white/50`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isUp ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}%
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-[#64748B] text-xs font-black uppercase tracking-[0.1em] mb-1">{label}</h3>
                <p className="text-3xl font-black text-[#0F172A] tracking-tighter tabular-nums">
                    {loading ? '...' : `${prefix}${value?.toLocaleString() || 0}`}
                </p>
            </div>
        </div>
    );

    if (loading && !data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-[#4D96FF] animate-spin" />
                    <p className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Initalizing Intelligence...</p>
                </div>
            </div>
        );
    }

    const metrics = data?.metrics || {};
    const recentOps = data?.recent_operations || [];
    const topUsers = data?.top_users || [];
    const velocityData = data?.velocity || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">System Overview</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-[#64748B] font-bold tracking-tight">Real-time platform metrics active.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1 flex items-center shadow-sm">
                        {['24h', '7d', '30d'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="bg-[#4D96FF] text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_20px] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Active Explorers"
                    value={metrics.total_users || 0}
                    trend={metrics.change_percent}
                    isUp={metrics.is_up}
                    color="text-[#4D96FF]"
                    bgColor="bg-[#F5F8FF]"
                />
                <StatCard
                    icon={Zap}
                    label="Operations Flow"
                    value={metrics.total_operations || 0}
                    color="text-[#F59E0B]"
                    bgColor="bg-[#FFFBEB]"
                />
                <StatCard
                    icon={CreditCard}
                    label="Credits Volume"
                    value={metrics.total_credits || 0}
                    color="text-[#8B5CF6]"
                    bgColor="bg-[#F5F3FF]"
                />
                <StatCard
                    icon={ShieldCheck}
                    label="Success Velocity"
                    value={metrics.success_rate || 0}
                    trend={100}
                    isUp={true}
                    prefix=""
                    color="text-[#10B981]"
                    bgColor="bg-[#F0FDF4]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Usage Chart */}
                <div className="lg:col-span-2 bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-[#F8FAFC] flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#4D96FF]" />
                                Operation Throughput
                            </h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">AI generation load across the selected period.</p>
                        </div>
                    </div>
                    <div className="p-8 flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={velocityData}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4D96FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4D96FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date_point"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '700' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                                    labelStyle={{ color: '#94A3B8', fontSize: '10px', marginBottom: '4px', fontWeight: '800' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="operation_count"
                                    stroke="#4D96FF"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-[#F8FAFC]">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                            Sentinel Status
                        </h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Infrastructure and microservice health.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { label: 'Cloud Infrastructure', status: 'Operational', color: 'green' },
                            { label: 'Primary DB (PostgreSQL)', status: health?.db_status || 'Checking...', color: health?.db_status === 'Operational' ? 'green' : 'amber' },
                            { label: 'AI Inference Engines', status: 'Optimal', color: 'green' },
                            { label: 'Asset Storage (S3)', status: 'Operational', color: 'green' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                                <span className="text-[11px] font-black text-[#475569] uppercase tracking-wider">{item.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.color === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                    <span className={`text-[10px] font-black uppercase ${item.color === 'green' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto p-8 bg-[#F8FAFC]/50 border-t border-[#F1F5F9]">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">
                            <span>Uptime</span>
                            <span className="text-[#0F172A]">{Math.floor((health?.uptime || 0) / 3600)}h {Math.floor(((health?.uptime || 0) % 3600) / 60)}m</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#10B981] h-full w-[99.9%]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Operations */}
                <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-[#F8FAFC] flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Recent Intelligence Data</h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">Latest processed AI operations.</p>
                        </div>
                        <button className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                            <ExternalLink className="w-5 h-5 text-[#94A3B8]" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-[#F8FAFC]">
                                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Operation</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Explorer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-right">Fuel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8FAFC]">
                                {recentOps.map((op) => (
                                    <tr key={op.id} className="group hover:bg-[#F8FAFC] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-[#0F172A] uppercase tracking-tight">{op.tool_name}</span>
                                                <span className="text-[10px] font-bold text-[#94A3B8] mt-0.5 whitespace-nowrap">
                                                    {new Date(op.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[#475569] max-w-[150px] truncate">{op.user_name || 'Anonymous'}</span>
                                                <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest truncate max-w-[150px]">{op.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${op.status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {op.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="text-xs font-black text-[#0F172A]">{op.credits_cost}</span>
                                                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentOps.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-sm font-bold text-[#94A3B8]">No recent data packets detected.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Users */}
                <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-[#F8FAFC]">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Elite Explorers</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Highest activity volume in this period.</p>
                    </div>
                    <div className="p-4 space-y-4">
                        {topUsers.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-[#F8FAFC] rounded-3xl border border-[#F1F5F9] group hover:border-[#4D96FF] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#4D96FF] shadow-sm font-black text-sm group-hover:bg-[#4D96FF] group-hover:text-white transition-all">
                                        {user.full_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#0F172A] tracking-tight">{user.full_name}</p>
                                        <p className="text-[10px] font-bold text-[#94A3B8]">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-[#0F172A] tabular-nums">{user.operation_count} Ops</p>
                                    <p className="text-[10px] font-bold text-[#4D96FF] uppercase tracking-widest mt-0.5">{user.total_credits} Fuel</p>
                                </div>
                            </div>
                        ))}
                        {topUsers.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-sm font-bold text-[#94A3B8]">No elite explorers logged.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-8 border-t border-[#F8FAFC]">
                        <button className="w-full bg-[#0F172A] text-white font-black px-4 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-xl transition-all">
                            Review All High-Value Assets
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

