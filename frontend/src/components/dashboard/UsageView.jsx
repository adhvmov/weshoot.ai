import { useState, useEffect } from 'react';
import { getUsageLog } from '../../services/dashboardService';
import { format } from 'date-fns';

const UsageView = () => {
    const [period, setPeriod] = useState('30d');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = period === 'custom' ? { startDate: customRange.start, endDate: customRange.end } : { period };
            const res = await getUsageLog(params);
            if (res.success) {
                setLogs(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch usage logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (period !== 'custom') {
            fetchLogs();
        }
    }, [period]);

    const handleCustomFilter = () => {
        if (customRange.start && customRange.end) {
            setPeriod('custom');
            fetchLogs();
            setShowDatePicker(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Date', 'Type (Plan)', 'Tool', 'Credits'];
        const csvRows = logs.map(log => [
            format(new Date(log.date), 'MMM d, hh:mm a'),
            log.plan_type,
            log.tool,
            log.credits
        ]);

        const csvContent = [headers, ...csvRows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `usage_report_${period}_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="usage-view animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Period Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] hover:border-[#4D96FF] transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4 text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {period === 'custom' ? `${customRange.start} - ${customRange.end}` : format(new Date(), 'MMM d') + ' - Today'}
                            <svg className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-[rgba(15,23,42,0.15)_0px_20px_40px_-5px] border border-[#F1F5F9] p-6 z-50 animate-in zoom-in-95 duration-200">
                                <h4 className="text-sm font-black text-[#0F172A] mb-4 uppercase tracking-widest">Custom Range</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={customRange.start}
                                            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold outline-none focus:border-[#4D96FF] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-2 block">End Date</label>
                                        <input
                                            type="date"
                                            value={customRange.end}
                                            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold outline-none focus:border-[#4D96FF] transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCustomFilter}
                                        className="w-full py-3 bg-[#4D96FF] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#3B82F6] transition-all"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Filters */}
                    <div className="flex bg-white/50 border border-[#E2E8F0] p-1.5 rounded-2xl gap-1">
                        {['1d', '7d', '30d'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${period === p
                                    ? 'bg-[#4D96FF] text-white shadow-md'
                                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={exportCSV}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl text-sm font-black hover:bg-[#1e293b] transition-all shadow-lg active:scale-95 w-full lg:w-auto"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[rgba(234,238,248,0.3)_0px_8px_24px] overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[800px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th className="py-5 md:py-6 px-4 md:px-10 text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Date</th>
                                <th className="py-5 md:py-6 px-4 md:px-8 text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Type</th>
                                <th className="py-5 md:py-6 px-4 md:px-8 text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">Tool</th>
                                <th className="py-5 md:py-6 px-4 md:px-8 text-[10px] md:text-[11px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9] text-right">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-6 px-10"><div className="h-4 w-32 bg-[#F1F5F9] rounded-full"></div></td>
                                        <td className="py-6 px-8"><div className="h-4 w-20 bg-[#F1F5F9] rounded-full"></div></td>
                                        <td className="py-6 px-8"><div className="h-4 w-40 bg-[#F1F5F9] rounded-full"></div></td>
                                        <td className="py-6 px-8"><div className="h-4 w-12 bg-[#F1F5F9] rounded-full ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-bold text-[#94A3B8] tracking-tight">No usage logs found for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors group">
                                        <td className="py-5 md:py-6 px-4 md:px-10">
                                            <p className="text-[13px] md:text-[15px] font-bold text-[#475569] leading-tight">{format(new Date(log.date), 'MMM d')}<br /><span className="text-[10px] md:text-inherit opacity-60 md:opacity-100">{format(new Date(log.date), 'hh:mm a')}</span></p>
                                        </td>
                                        <td className="py-5 md:py-6 px-4 md:px-8">
                                            <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-wider ${log.plan_type === 'Free'
                                                ? 'bg-gray-100 text-gray-500'
                                                : 'bg-[#4D96FF]/10 text-[#4D96FF]'
                                                }`}>
                                                {log.plan_type}
                                            </span>
                                        </td>
                                        <td className="py-5 md:py-6 px-4 md:px-8">
                                            <p className="text-[13px] md:text-[15px] font-bold text-[#0F172A] capitalize">
                                                {log.tool.replace(/_/g, ' ')}
                                            </p>
                                        </td>
                                        <td className="py-5 md:py-6 px-4 md:px-8 text-right">
                                            <p className="text-[13px] md:text-[15px] font-black text-[#4D96FF]">-{log.credits}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}} />
        </div>
    );
};

export default UsageView;
