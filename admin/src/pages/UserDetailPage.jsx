import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Clock, CreditCard, Image as ImageIcon, Shield,
    ChevronLeft, Settings, Mail, Calendar,
    CheckCircle2, AlertCircle, Trash2, Ban, Activity,
    TrendingUp, Zap, MousePointer2
} from 'lucide-react';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [usage, setUsage] = useState([]);
    const [generations, setGenerations] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({ distribution: [], success_rate: 0, total_ops: 0 });
    const [velocity, setVelocity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('activity');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [updatingPlan, setUpdatingPlan] = useState(false);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            if (response.data.success) {
                setUser(response.data.data.user);
                setUsage(response.data.data.usage || []);
                setGenerations(response.data.data.generations || []);
                setSessions(response.data.data.sessions || []);
                setStats(response.data.data.stats || { distribution: [], success_rate: 0, total_ops: 0 });
                setVelocity(response.data.data.velocity || []);
            }
        } catch (error) {
            console.error('Fetch user details failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (!window.confirm('Are you sure you want to ban this user?')) return;
        try {
            await api.post(`/admin/users/${id}/ban`, { reason: 'Policy violation' });
            fetchUserDetails();
        } catch (error) {
            console.error('Ban user failed:', error);
        }
    };

    const handleUnban = async () => {
        if (!window.confirm('Restore access for this user?')) return;
        try {
            await api.post(`/admin/users/${id}/unban`);
            fetchUserDetails();
        } catch (error) {
            console.error('Unban user failed:', error);
        }
    };

    const handleUpdateCredits = async () => {
        const newCredits = window.prompt('Enter new total credits:', user.total_credits);
        if (newCredits === null || newCredits === '') return;
        try {
            await api.post(`/admin/users/${id}/credits`, { total_credits: parseInt(newCredits) });
            fetchUserDetails();
        } catch (error) {
            console.error('Update credits failed:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('CRITICAL: This will permanently expunge ALL user data. Proceed?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            navigate('/users');
        } catch (error) {
            console.error('Delete user failed:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/admin/plans');
            if (response.data.success) {
                setAvailablePlans(response.data.data);
            }
        } catch (error) {
            console.error('Fetch plans failed:', error);
        }
    };

    const handleOpenPlanModal = () => {
        fetchPlans();
        setShowPlanModal(true);
    };

    const handleUpdatePlan = async () => {
        if (!selectedPlan) {
            alert('Please select a plan');
            return;
        }

        try {
            setUpdatingPlan(true);
            await api.post(`/admin/users/${id}/plan`, {
                planId: selectedPlan,
                billingCycle: billingCycle
            });
            alert('User plan updated successfully!');
            setShowPlanModal(false);
            fetchUserDetails(); // Refresh user data
        } catch (error) {
            console.error('Update plan failed:', error);
            alert('Failed to update user plan: ' + (error.response?.data?.message || error.message));
        } finally {
            setUpdatingPlan(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#4D96FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-[#94A3B8] font-black uppercase tracking-widest">User not found</p>
                <button onClick={() => navigate('/users')} className="mt-4 text-[#4D96FF] font-bold">Back to Directory</button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Sub-nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/users')}
                    className="w-11 h-11 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-[#64748B] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all shadow-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">{user.full_name || 'User Profile'}</h1>
                    <p className="text-[#64748B] font-bold text-sm tracking-tight">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: User Summary & Actions */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm p-10 flex flex-col items-center">
                        <div className="w-28 h-28 rounded-[36px] bg-[#F5F8FF] border-2 border-[#E2E8F0] flex items-center justify-center text-[#4D96FF] text-3xl font-black shadow-inner mb-6">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">{user.full_name}</h2>
                            <p className="text-xs font-black text-[#4D96FF] uppercase tracking-[0.2em] mt-1">{user.role || 'User'}</p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                                <div className="flex items-center gap-3 text-[#64748B]">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-xs font-bold">Account Status</span>
                                </div>
                                {user.is_blocked ? (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-black uppercase rounded-lg border border-red-100">Blocked</span>
                                ) : user.is_verified ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                                <div className="flex items-center gap-3 text-[#64748B]">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-bold">Member Since</span>
                                </div>
                                <span className="text-xs font-black text-[#0F172A]">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="w-full mt-10 space-y-3">
                            <button
                                onClick={handleUpdateCredits}
                                className="w-full bg-[#4D96FF] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(77,150,255,0.25)] hover:shadow-none transition-all"
                            >
                                Adjust User Credits
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                {!user.is_blocked ? (
                                    <button
                                        onClick={handleBan}
                                        className="bg-red-50 text-red-500 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-red-100 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Block User
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnban}
                                        className="bg-green-50 text-green-500 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-green-100 flex items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Unblock User
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="bg-[#F8FAFC] text-[#64748B] font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-[#E2E8F0] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Card */}
                    <div className="bg-[#0F172A] rounded-[40px] p-10 text-white shadow-xl shadow-[#0F172A]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CreditCard className="w-32 h-32" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#4D96FF] mb-2">Subscription Plan</h3>
                        <p className="text-3xl font-black tracking-tight mb-8">{user.plan_name || 'Free Tier'}</p>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Next Renewal</p>
                                    <p className="text-sm font-bold">
                                        {user.current_period_end
                                            ? new Date(user.current_period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Billing Amount</p>
                                    <p className="text-sm font-bold">${((user.monthly_price_cents || 0) / 100).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${user.sub_status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                                    }`}>
                                    {user.sub_status || 'INACTIVE'}
                                </span>
                                <button
                                    onClick={handleOpenPlanModal}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#4D96FF] hover:text-white transition-colors"
                                >
                                    Manage Subscription
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Usage & Logs */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Credit Inventory</h3>
                                    <p className="text-xs font-bold text-[#64748B] mt-1">Resource consumption.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-[#4D96FF] tracking-tight tabular-nums">{user.used_credits || 0}</span>
                                    <span className="text-[#94A3B8] font-black mx-1">/</span>
                                    <span className="text-xl font-black text-[#94A3B8] tabular-nums">{user.total_credits || 0}</span>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-[#F5F8FF] rounded-full overflow-hidden border border-[#E2E8F0] p-0.5">
                                <div
                                    className="h-full bg-[#4D96FF] rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (user.used_credits / (user.total_credits || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm p-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Success Rate</h3>
                                <p className="text-xs font-bold text-[#64748B] mt-1">Operational reliability index.</p>
                                <div className="flex items-center gap-4 mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-[#22C55E] tracking-tight">{stats.success_rate}%</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Efficiency</span>
                                    </div>
                                    <div className="w-px h-8 bg-[#F1F5F9]"></div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-[#0F172A] tracking-tight">{stats.total_ops}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Total Ops</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-20 h-20 relative flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#F1F5F9]" />
                                    <circle
                                        cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={213.6}
                                        strokeDashoffset={213.6 - (213.6 * stats.success_rate) / 100}
                                        className="text-[#22C55E] transition-all duration-1000"
                                    />
                                </svg>
                                <TrendingUp className="absolute w-6 h-6 text-[#22C55E]" />
                            </div>
                        </div>
                    </div>

                    {/* Activity Velocity */}
                    <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Production Velocity</h3>
                                <p className="text-xs font-bold text-[#64748B] mt-1">Asset creation volume over the last 7 days.</p>
                            </div>
                        </div>
                        <div className="h-32 flex items-end gap-2 md:gap-4 px-4">
                            {velocity.map((v, i) => {
                                const max = Math.max(...velocity.map(x => parseInt(x.count)), 1);
                                const h = (parseInt(v.count) / max) * 100;
                                return (
                                    <div key={i} className="flex-1 bg-[#F5F8FF] hover:bg-[#4D96FF] transition-all rounded-t-xl group relative" style={{ height: `${Math.max(h, 5)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap">
                                            {v.count} Assets
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabs for detailed lists */}
                    <div className="bg-white border border-[#F1F5F9] rounded-[40px] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="flex border-b border-[#F1F5F9] px-10">
                            {[
                                { id: 'activity', label: 'Activity Logs' },
                                { id: 'assets', label: 'Generated Assets' },
                                { id: 'sessions', label: 'Auth Sessions' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-8 text-xs font-black uppercase tracking-widest border-b-2 transition-all mr-10 ${activeTab === tab.id ? 'border-[#4D96FF] text-[#4D96FF]' : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-10">
                            {activeTab === 'activity' && (
                                <div className="space-y-10">
                                    {/* Tool Distribution */}
                                    {stats.distribution?.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10 border-b border-[#F1F5F9]">
                                            {stats.distribution.map((tool, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                        <span className="text-[#0F172A]">{tool.tool_name}</span>
                                                        <span className="text-[#4D96FF]">{tool.count} usages</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#F1F5F9]">
                                                        <div
                                                            className="h-full bg-[#4D96FF] rounded-full"
                                                            style={{ width: `${(tool.count / stats.total_ops) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {usage.length > 0 ? usage.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-[#F1F5F9] hover:border-[#4D96FF]/30 transition-all group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Settings className="w-5 h-5 text-[#4D96FF]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#0F172A] tracking-tight">{item.tool_name || 'System Operation'}</p>
                                                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{item.model_id || 'v1'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Status</p>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest text-green-500`}>Success</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Resource</p>
                                                        <span className="text-sm font-black text-[#0F172A]">-{item.credits_cost || item.credits_used || 0} credits</span>
                                                    </div>
                                                    <div className="text-right min-w-[100px]">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Time</p>
                                                        <span className="text-xs font-bold text-[#94A3B8]">{new Date(item.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 bg-[#F8FAFC] rounded-[32px] border border-dashed border-[#E2E8F0]">
                                                <Activity className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                                                <p className="text-[#94A3B8] font-black uppercase tracking-widest text-[10px]">No historical activity detected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {generations.length > 0 ? generations.map((gen, idx) => (
                                        <div key={idx} className="group relative aspect-square bg-[#F8FAFC] rounded-3xl border border-[#F1F5F9] overflow-hidden hover:border-[#4D96FF] transition-all">
                                            <img src={gen.image_url.startsWith('http') ? gen.image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${gen.image_url}`} alt="Generation" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{gen.tool_name}</p>
                                                <p className="text-[8px] text-white/70 font-bold truncate mt-1">{gen.prompt}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full text-center py-20 bg-[#F8FAFC] rounded-[32px] border border-dashed border-[#E2E8F0]">
                                            <ImageIcon className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                                            <p className="text-[#94A3B8] font-black uppercase tracking-widest text-[10px]">No digital assets found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'sessions' && (
                                <div className="space-y-4">
                                    {sessions.length > 0 ? sessions.map((sess, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-[#F1F5F9] hover:border-[#4D96FF]/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#0F172A] tracking-tight">{sess.browser} on {sess.device_type}</p>
                                                    <p className="text-[10px] font-bold text-[#64748B]">{sess.ip_address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">Last Active</p>
                                                <span className="text-xs font-bold text-[#0F172A]">
                                                    {sess.last_active ? new Date(sess.last_active).toLocaleString() : new Date(sess.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-[#F8FAFC] rounded-[32px] border border-dashed border-[#E2E8F0]">
                                            <Shield className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                                            <p className="text-[#94A3B8] font-black uppercase tracking-widest text-[10px]">No active session records</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Management Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Manage Subscription</h2>
                                    <p className="text-sm font-bold text-[#64748B] mt-1">Update user's subscription plan</p>
                                </div>
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="w-10 h-10 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Current Plan Info */}
                            <div className="bg-[#F8FAFC] rounded-3xl p-6 mb-8 border border-[#F1F5F9]">
                                <p className="text-xs font-black uppercase tracking-widest text-[#64748B] mb-2">Current Plan</p>
                                <p className="text-xl font-black text-[#0F172A]">{user?.plan_name || 'Free'}</p>
                            </div>

                            {/* Billing Cycle Toggle */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly'
                                        ? 'bg-[#4D96FF] text-white shadow-lg'
                                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly'
                                        ? 'bg-[#4D96FF] text-white shadow-lg'
                                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
                                        }`}
                                >
                                    Yearly
                                </button>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {availablePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                                            ? 'border-[#4D96FF] bg-[#F5F8FF] shadow-lg'
                                            : 'border-[#F1F5F9] bg-white hover:border-[#4D96FF]/30'
                                            }`}
                                    >
                                        <h3 className="text-lg font-black text-[#0F172A] mb-2">{plan.name}</h3>
                                        <div className="mb-4">
                                            <span className="text-3xl font-black text-[#4D96FF]">
                                                ${(plan.monthly_price_cents / 100).toFixed(2)}
                                            </span>
                                            <span className="text-sm font-bold text-[#64748B]">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                        </div>
                                        <p className="text-xs font-bold text-[#64748B] mb-4">
                                            {plan.credit_limit_monthly} credits/month
                                        </p>
                                        {plan.features && (
                                            <div className="space-y-2">
                                                {(Array.isArray(plan.features) ? plan.features : []).slice(0, 3).map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                                                        <span className="text-xs font-bold text-[#0F172A]">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="flex-1 bg-[#F8FAFC] text-[#64748B] font-black py-4 rounded-2xl text-xs uppercase tracking-widest border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePlan}
                                    disabled={updatingPlan || !selectedPlan}
                                    className="flex-1 bg-[#4D96FF] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(77,150,255,0.25)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingPlan ? 'Updating...' : 'Update Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetailPage;
