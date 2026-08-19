import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Layers, Cpu, Zap, Activity,
    Plus, Edit2, ShieldCheck, ShieldAlert,
    BarChart3, Settings, Play, Pause, X
} from 'lucide-react';

const AIModelManagement = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingModel, setEditingModel] = useState(null);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/models');
            if (response.data.success) {
                setModels(response.data.data);
            }
        } catch (error) {
            console.error('Fetch models error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingModel.id ? `/admin/models/${editingModel.id}` : '/admin/models';
            const method = editingModel.id ? 'put' : 'post';
            await api[method](endpoint, editingModel);
            setEditingModel(null);
            fetchModels();
        } catch (error) {
            console.error('Save model error:', error);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Intelligence Grid</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Configure AI agents, costs, and provider redundancy.</p>
                </div>
                <button
                    onClick={() => setEditingModel({
                        name: '',
                        provider: 'freepik',
                        model_id: '',
                        cost_per_generation: 1,
                        is_active: true,
                        type: 'image'
                    })}
                    className="bg-[#4D96FF] text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_20px] transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Deploy New Agent
                </button>
            </div>

            {/* Model Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white border border-[#F1F5F9] rounded-[40px] h-[240px] animate-pulse"></div>
                    ))
                ) : models.map((model) => (
                    <div
                        key={model.id}
                        className="bg-white border border-[#F1F5F9] rounded-[40px] p-8 shadow-sm relative group hover:shadow-[rgba(15,23,42,0.08)_0px_20px_40px_-5px] transition-all duration-500 overflow-hidden"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${model.is_active ? 'bg-[#F5F8FF] text-[#4D96FF]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                                    <Cpu className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{model.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                            {model.provider}
                                        </span>
                                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                            {model.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingModel(model)}
                                    className="w-10 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#4D96FF] hover:border-[#4D96FF] transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${model.is_active ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}
                                >
                                    {model.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#F8FAFC]">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-1">Compute Cost</p>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    <span className="text-sm font-black text-[#0F172A]">{model.cost_per_generation} Credits</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-1">API Anchor</p>
                                <span className="text-xs font-bold text-[#64748B] truncate block max-w-[120px]">{model.model_id}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-1">Status</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${model.is_active ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${model.is_active ? 'text-green-500' : 'text-amber-500'}`}>
                                        {model.is_active ? 'Operational' : 'Paused'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay Stats Placeholder */}
                        <div className="absolute inset-x-0 bottom-[-100%] group-hover:bottom-0 transition-all duration-500 bg-[#4D96FF] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Activity className="w-4 h-4 text-white/60" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">99.9% Success Rate</span>
                            </div>
                            <button className="text-white font-black text-[10px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl">View Analytics</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingModel && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl overflow-hidden border border-[#F1F5F9] animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-[#F8FAFC] flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Agent Configuration</h2>
                                <p className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">Technical Parameters</p>
                            </div>
                            <button onClick={() => setEditingModel(null)} className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Model Name</label>
                                    <input
                                        value={editingModel.name}
                                        onChange={e => setEditingModel({ ...editingModel, name: e.target.value })}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                        placeholder="Flux Dev (Ultra)"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Provider</label>
                                        <select
                                            value={editingModel.provider}
                                            onChange={e => setEditingModel({ ...editingModel, provider: e.target.value })}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all appearance-none"
                                        >
                                            <option value="freepik">Freepik</option>
                                            <option value="vyro">Vyro AI</option>
                                            <option value="openai">OpenAI</option>
                                            <option value="stability">Stability AI</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Agent Type</label>
                                        <select
                                            value={editingModel.type}
                                            onChange={e => setEditingModel({ ...editingModel, type: e.target.value })}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all appearance-none"
                                        >
                                            <option value="image">Image Generation</option>
                                            <option value="upscale">Super Resolution</option>
                                            <option value="edit">AI Editing</option>
                                            <option value="video">Video Processing</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Internal ID (API)</label>
                                        <input
                                            value={editingModel.model_id}
                                            onChange={e => setEditingModel({ ...editingModel, model_id: e.target.value })}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            placeholder="seedream-v4-edit"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Price Per Burst</label>
                                        <div className="relative">
                                            <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                                            <input
                                                type="number"
                                                value={editingModel.cost_per_generation}
                                                onChange={e => setEditingModel({ ...editingModel, cost_per_generation: parseInt(e.target.value) || 1 })}
                                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setEditingModel(null)} className="flex-1 py-4.5 text-[#64748B] font-black text-xs uppercase tracking-widest border border-[#E2E8F0] rounded-[22px] hover:bg-[#F8FAFC] transition-all">
                                    Abort
                                </button>
                                <button onClick={handleSave} className="flex-[2] bg-[#4D96FF] text-white font-black py-4.5 rounded-[22px] text-xs uppercase tracking-widest shadow-[rgba(77,150,255,0.3)_0px_20px_40px_-5px] hover:shadow-[rgba(77,150,255,0.4)_0px_25px_50px_-5px] transition-all">
                                    Commit Deployment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIModelManagement;
