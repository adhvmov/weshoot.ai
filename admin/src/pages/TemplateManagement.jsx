import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ImageIcon, Plus, Trash2, Filter,
    Search, Grid, List, MoreVertical,
    CheckCircle2, AlertCircle, X, Download,
    FolderPlus, Sparkles, Image as LucideImage
} from 'lucide-react';

const TemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    const categories = ['All', 'Humans', 'Popular', 'Nature', 'Flatlays', 'Minimal', 'Platforms', 'Stones', 'Kitchen', 'SPA', 'Fabric', 'City', 'Walls', 'Interiors', 'Office', 'Kids'];

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/templates');
            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error) {
            console.error('Fetch templates error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:5173${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Template Conservatory</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Manage the background library for AI generation workflows.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-white border border-[#E2E8F0] text-[#64748B] font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:border-[#4D96FF] hover:text-[#4D96FF] transition-all flex items-center gap-2">
                        <FolderPlus className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <button className="bg-[#4D96FF] text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[rgba(77,150,255,0.4)_0px_8px_20px] transition-all flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Injest Template
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white border border-[#F1F5F9] rounded-[32px] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat
                                ? 'bg-[#4D96FF] border-[#4D96FF] text-white shadow-md shadow-[#4D96FF]/20'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] hover:border-[#CBD5E1]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Asset ID Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#4D96FF]/10 w-full lg:w-[250px] transition-all"
                        />
                    </div>
                    <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#4D96FF] shadow-sm' : 'text-[#94A3B8]'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#4D96FF] shadow-sm' : 'text-[#94A3B8]'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {loading ? (
                        Array(12).fill(0).map((_, i) => (
                            <div key={i} className="bg-white border border-[#F1F5F9] rounded-[32px] aspect-square animate-pulse"></div>
                        ))
                    ) : filteredTemplates.map((template) => (
                        <div key={template.id} className="group relative bg-white border border-[#F1F5F9] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="aspect-square bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center">
                                <LucideImage className="w-10 h-10 text-[#E2E8F0] absolute" />
                                <img
                                    src={template.url}
                                    className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 z-20 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-300">
                                    <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0F172A] hover:bg-[#4D96FF] hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-500">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#F8FAFC]">
                                <h3 className="text-[11px] font-black text-[#0F172A] truncate tracking-tight">{template.name}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px] font-black text-[#4D96FF] uppercase tracking-widest">{template.category}</span>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#F1F5F9] rounded-[32px] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Template</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Identifier</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                            {filteredTemplates.map((template) => (
                                <tr key={template.id} className="hover:bg-[#F8FAFC]/50 transition-all">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
                                                <img src={resolveImageUrl(template.url)} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-[#0F172A]">{template.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-mono text-[#64748B]">{template.id}</td>
                                    <td className="px-8 py-4">
                                        <span className="px-3 py-1 bg-[#F5F8FF] text-[#4D96FF] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#E2E8F0]">
                                            {template.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-[#94A3B8] hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TemplateManagement;
