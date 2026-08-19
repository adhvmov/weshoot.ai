import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart3, TrendingUp, Zap, Image as ImageIcon,
    Filter, Calendar, Download, RefreshCw,
    Search, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

const AIUsagePage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('7d');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/usage-stats?timeframe=${timeframe}`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Fetch usage stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeframe]);

    const handleExportData = () => {
        if (!stats) return;

        const headers = ['Metric', 'Value'];
        const dataRows = [
            ['Total Operations', stats.metrics.total_operations],
            ['Credits Burned', stats.metrics.total_credits],
            ['Unique Creators', stats.metrics.unique_users],
            ['Success Rate', stats.metrics.success_rate + '%'],
            ['Timeframe', stats.timeframe],
            [],
            ['Tool Distribution'],
            ['Tool Name', 'Count', 'Percentage']
        ];

        stats.distribution.forEach(item => {
            dataRows.push([item.tool_name, item.count, item.percentage + '%']);
        });

        dataRows.push([], ['Segment Analysis'], ['Plan Name', 'Count', 'Percentage']);
        stats.segments.forEach(item => {
            dataRows.push([item.plan_name || 'Free', item.count, item.percentage + '%']);
        });

        dataRows.push([], ['Top AI Operators'], ['Email', 'Name', 'Operations', 'Credits']);
        stats.top_users.forEach(item => {
            dataRows.push([item.email, item.full_name, item.operation_count, item.total_credits]);
        });

        const csvContent = [headers, ...dataRows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `ai_usage_report_${timeframe}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toolNameMap = {
        'remove_bg': 'Remove Background',
        'upscale': 'Image Upscaling',
        'ai_background': 'AI Photoshoot',
        'edit_image': 'AI Image Edit',
        'image_to_video': 'Image to Video',
        'add_shadows': 'Add Shadows',
        'fix_light': 'Fix Light & Colors',
        'mystic': 'Mystic (Realism)',
        'flux': 'Flux (Creative)'
    };

    const getToolName = (slug) => toolNameMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');

    const metrics = stats ? [
        { label: 'Total Operations', value: stats.metrics.total_operations.toLocaleString(), change: `${stats.metrics.change_percent}%`, isUp: stats.metrics.is_up, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Credits Burned', value: stats.metrics.total_credits.toLocaleString(), change: '+8.2%', isUp: true, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Avg Success Rate', value: `${stats.metrics.success_rate}%`, change: '+0.2%', isUp: true, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Unique Creators', value: stats.metrics.unique_users.toLocaleString(), change: '-2.1%', isUp: false, icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
    ] : [];

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <RefreshCw className="w-12 h-12 text-[#4D96FF] animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Analyzing operational trajectory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">AI Intelligence Analytics</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Deep trajectory analysis of generation volume and economic throughput.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchStats}
                        className="p-3 bg-white border border-[#F1F5F9] rounded-2xl text-[#94A3B8] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all shadow-sm group"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="flex items-center bg-white border border-[#F1F5F9] rounded-2xl p-1 shadow-sm">
                        {['24h', '7d', '30d', '90d'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t
                                    ? 'bg-[#4D96FF] text-white shadow-lg shadow-[#4D96FF]/20'
                                    : 'text-[#94A3B8] hover:text-[#0F172A]'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white border border-[#F1F5F9] rounded-[40px] p-8 shadow-sm group hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                <metric.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${metric.isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {metric.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {metric.change}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-1">{metric.label}</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tight">{metric.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-[#4D96FF] animate-spin" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Generation Velocity</h3>
                            <p className="text-xs font-bold text-[#64748B] mt-1">Operational throughput distributed by internal interval.</p>
                        </div>
                        <button
                            onClick={handleExportData}
                            className="text-[10px] font-black uppercase tracking-widest text-[#4D96FF] flex items-center gap-2 hover:bg-[#F5F8FF] px-4 py-2 rounded-xl transition-all"
                        >
                            <Download className="w-4 h-4" /> Export Raw Data
                        </button>
                    </div>
                    <div className="h-[300px] flex items-end gap-1 md:gap-3 px-4">
                        {stats?.velocity.map((item, i) => {
                            const maxVal = Math.max(...stats.velocity.map(v => parseInt(v.operation_count)), 1);
                            const h = (parseInt(item.operation_count) / maxVal) * 80 + 5;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 bg-[#F5F8FF] hover:bg-[#4D96FF] transition-all rounded-t-xl group relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl z-30 whitespace-nowrap pointer-events-none">
                                        {item.operation_count} Ops
                                        <div className="text-[8px] text-[#94A3B8] mt-0.5">{item.date_point}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-[#F8FAFC]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Interval Start</span>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-[#4D96FF] rounded-full"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">AI Operations</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Interval End</span>
                    </div>
                </div>

                <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm space-y-10 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-[#4D96FF] animate-spin" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Model Distribution</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Usage share by intelligence agent.</p>
                    </div>
                    <div className="space-y-6">
                        {stats?.distribution.map((model, idx) => {
                            const colors = ['#4D96FF', '#FF7B54', '#7B61FF', '#22C55E', '#EAB308', '#F43F5E', '#64748B'];
                            const color = colors[idx % colors.length];
                            return (
                                <div key={idx} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-[#0F172A] tracking-tight">{getToolName(model.tool_name)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-[#94A3B8]">{model.count.toLocaleString()}</span>
                                            <span className="text-xs font-black text-[#64748B]">{model.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#F1F5F9]">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${model.percentage}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        {stats?.distribution.length === 0 && (
                            <div className="py-10 text-center text-[#94A3B8]">
                                <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No data available for this timeframe</p>
                            </div>
                        )}
                    </div>
                    <div className="pt-6 border-t border-[#F8FAFC]">
                        <button
                            onClick={fetchStats}
                            className="w-full bg-[#F5F8FF] text-[#4D96FF] font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#4D96FF] hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Synchronize Indicators
                        </button>
                    </div>
                </div>
            </div>
            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Top Operators */}
                <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Top AI Operators</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Users with highest operational volume.</p>
                    </div>
                    <div className="space-y-4">
                        {stats?.top_users.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl hover:bg-[#F1F5F9] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#4D96FF] text-white rounded-xl flex items-center justify-center font-black text-xs">
                                        {idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-[#0F172A] tracking-tight">{user.full_name || 'Creator'}</span>
                                        <span className="text-[10px] font-bold text-[#94A3B8]">{user.email}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-[#0F172A]">{user.operation_count} Ops</div>
                                    <div className="text-[10px] font-bold text-amber-500 flex items-center justify-end gap-1">
                                        <Zap className="w-3 h-3 fill-amber-500" />
                                        {user.total_credits}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Segments & Peak Hours */}
                <div className="space-y-10">
                    <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-8">Segment Analysis</h3>
                        <div className="space-y-6">
                            {stats?.segments.map((seg, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[#94A3B8]">{seg.plan_name || 'No Plan'}</span>
                                        <span className="text-[#0F172A]">{seg.percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#4D96FF] rounded-full"
                                            style={{ width: `${seg.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Peak Performance</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">24h Distribution</span>
                        </div>
                        <div className="h-32 flex items-end gap-1">
                            {Array.from({ length: 24 }).map((_, h) => {
                                const data = stats?.peak_hours.find(p => parseInt(p.hour) === h);
                                const count = data ? parseInt(data.count) : 0;
                                const maxCount = Math.max(...(stats?.peak_hours.map(p => parseInt(p.count)) || [1]));
                                const height = (count / maxCount) * 100;
                                return (
                                    <div
                                        key={h}
                                        className="flex-1 bg-[#F5F8FF] hover:bg-[#4D96FF] transition-all rounded-t-sm group relative"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap">
                                            {h}:00 - {count} Ops
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Operations Log */}
            <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Recent Intelligence Activity</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Real-time stream of model interactions and asset generation.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Live Monitoring
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                                <th className="px-6 py-4">Intelligence Agent</th>
                                <th className="px-6 py-4">Operator</th>
                                <th className="px-6 py-4">Cost</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recent_operations.map((op, i) => (
                                <tr key={op.id} className="bg-[#F8FAFC]/50 hover:bg-[#F1F5F9] transition-all rounded-2xl group cursor-default">
                                    <td className="px-6 py-4 rounded-l-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F1F5F9] group-hover:scale-110 transition-transform">
                                                <Zap className="w-5 h-5 text-[#4D96FF]" />
                                            </div>
                                            <span className="text-xs font-black text-[#0F172A] tracking-tight">{getToolName(op.tool_name)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-[#0F172A] tracking-tight">{op.user_name || 'Anonymous Creator'}</span>
                                            <span className="text-[10px] font-bold text-[#94A3B8]">{op.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                                            <Zap className="w-3 h-3 fill-amber-500" />
                                            {op.credits_cost}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-sm border ${op.status === 'success'
                                            ? 'bg-green-500 text-white border-green-600'
                                            : 'bg-red-500 text-white border-red-600'
                                            }`}>
                                            {op.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-2xl text-[10px] font-bold text-[#64748B]">
                                        {new Date(op.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'short', day: 'numeric' })}
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

export default AIUsagePage;
