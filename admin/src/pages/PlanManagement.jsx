import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Plus, Edit2, Check, X, ShieldAlert,
    ArrowRight, Sparkles, Zap, Layers,
    CreditCard, Calendar, Settings2
} from 'lucide-react';

const PlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/plans');
            if (response.data.success) {
                setPlans(response.data.data);
            }
        } catch (error) {
            console.error('Fetch plans error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingPlan.id ? `/admin/plans/${editingPlan.id}` : '/admin/plans';
            const method = editingPlan.id ? 'put' : 'post';
            await api[method](endpoint, editingPlan);
            setEditingPlan(null);
            fetchPlans();
        } catch (error) {
            console.error('Save plan error:', error);
        }
    };

    const toggleFeature = (feature) => {
        const currentFeatures = editingPlan.features || [];
        const newFeatures = currentFeatures.includes(feature)
            ? currentFeatures.filter(f => f !== feature)
            : [...currentFeatures, feature];
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Economic Architecture</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Configure pricing tiers, credit quotas, and feature access.</p>
                </div>
                <button
                    onClick={() => setEditingPlan({
                        name: '',
                        slug: '',
                        monthly_price_cents: 0,
                        credit_limit_monthly: 10,
                        features: [],
                        is_active: true
                    })}
                    className="bg-[#4D96FF] text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_20px] transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Forge New Tier
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white border border-[#F1F5F9] rounded-[40px] h-[500px] animate-pulse"></div>
                    ))
                ) : plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm relative group hover:shadow-[rgba(15,23,42,0.08)_0px_30px_60px_-10px] transition-all duration-500 overflow-hidden flex flex-col"
                    >
                        {/* Decorative background Icon */}
                        <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Layers className="w-48 h-48" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{plan.name}</h3>
                                <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-[0.2em] mt-1">{plan.slug}</p>
                            </div>
                            <button
                                onClick={() => setEditingPlan(plan)}
                                className="w-12 h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-[#64748B] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-8 flex-1 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#0F172A] tracking-tight tabular-nums">
                                    ${(plan.monthly_price_cents / 100).toFixed(2)}
                                </span>
                                <span className="text-[#94A3B8] font-bold text-sm tracking-tight">/ month</span>
                            </div>

                            <div className="p-6 bg-[#F5F8FF] border border-[#E2E8F0] rounded-3xl group-hover:bg-[#4D96FF] transition-colors duration-500 group-hover:border-transparent">
                                <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-widest mb-1 group-hover:text-white/80 transition-colors">Monthly Resource Quota</p>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-[#4D96FF] group-hover:text-white transition-colors" />
                                    <p className="text-2xl font-black text-[#0F172A] group-hover:text-white transition-colors tracking-tight">
                                        {plan.credit_limit_monthly.toLocaleString()}<span className="text-sm font-bold ml-1">Credits</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Premium Capabilities</p>
                                <ul className="space-y-3">
                                    {(typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []).map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-bold text-[#64748B] tracking-tight">
                                            <div className="w-5 h-5 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-green-500 group-hover:border-green-400 transition-colors">
                                                <Check className="w-3 h-3 text-green-600 group-hover:text-white transition-colors" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#F8FAFC]">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${plan.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                    {plan.is_active ? 'Active Operation' : 'Vaulted tier'}
                                </span>
                                {plan.is_active && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Global Settings Placeholder */}
            <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F5F8FF] rounded-3xl flex items-center justify-center text-[#4D96FF]">
                        <Settings2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Global Economic Rules</h3>
                        <p className="text-xs font-bold text-[#64748B] mt-1">Configure tax rates, trial periods, and overage charging.</p>
                    </div>
                </div>
                <button className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all">
                    Access Rules
                </button>
            </div>

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#F1F5F9] animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-[#F8FAFC] flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
                                    {editingPlan.id ? 'Reconfigure Tier' : 'Forge New Tier'}
                                </h2>
                                <p className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">Pricing & Limit adjustments</p>
                            </div>
                            <button onClick={() => setEditingPlan(null)} className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <form className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Display Name</label>
                                        <input
                                            value={editingPlan.name}
                                            onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            placeholder="Pro Monthly"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Identifier Slug</label>
                                        <input
                                            value={editingPlan.slug}
                                            onChange={e => setEditingPlan({ ...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            placeholder="pro-monthly"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Monthly Rate (Cents)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#94A3B8]">$</span>
                                            <input
                                                type="number"
                                                value={editingPlan.monthly_price_cents}
                                                onChange={e => setEditingPlan({ ...editingPlan, monthly_price_cents: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 pl-10 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Credit Allocation</label>
                                        <div className="relative">
                                            <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                                            <input
                                                type="number"
                                                value={editingPlan.credit_limit_monthly}
                                                onChange={e => setEditingPlan({ ...editingPlan, credit_limit_monthly: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Feature Matrix</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            'Upscale 4K Images',
                                            'Remove Background',
                                            'AI Backgrounds',
                                            'Magic Eraser',
                                            'Bulk Processing',
                                            'Priority Support',
                                            'API Access',
                                            'Custom Templates'
                                        ].map((feature) => (
                                            <button
                                                key={feature}
                                                type="button"
                                                onClick={() => toggleFeature(feature)}
                                                className={`p-4 rounded-[22px] border text-xs font-bold transition-all flex items-center justify-between group ${(editingPlan.features || []).includes(feature)
                                                        ? 'bg-[#F5F8FF] border-[#4D96FF] text-[#4D96FF]'
                                                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] hover:border-[#CBD5E1]'
                                                    }`}
                                            >
                                                {feature}
                                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${(editingPlan.features || []).includes(feature)
                                                        ? 'bg-[#4D96FF] text-white shadow-md'
                                                        : 'bg-[#E2E8F0] text-transparent'
                                                    }`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-10 border-t border-[#F8FAFC] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={editingPlan.is_active}
                                        onChange={e => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E8F0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="ml-3 text-xs font-black uppercase tracking-widest text-[#64748B]">Active For Users</span>
                                </label>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setEditingPlan(null)} className="px-8 py-4 text-[#64748B] font-black text-xs uppercase tracking-widest">
                                    Abort
                                </button>
                                <button onClick={handleSave} className="bg-[#4D96FF] text-white font-black px-10 py-4 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_30px] transition-all">
                                    Save Tier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanManagement;
