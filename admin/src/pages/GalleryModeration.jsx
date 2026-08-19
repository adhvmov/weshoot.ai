import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    MessageSquare, Trash2, Search, Filter,
    CheckCircle2, AlertCircle, Eye,
    MoreVertical, Download, ExternalLink, X
} from 'lucide-react';

const GalleryModeration = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/gallery');
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Fetch gallery error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this item from the gallery?')) return;
        try {
            await api.delete(`/admin/gallery/${id}`);
            fetchGallery();
            setSelectedItem(null);
        } catch (error) {
            console.error('Delete item error:', error);
        }
    };

    const filteredItems = items.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Prefix with backend URL if it's a relative path from uploads
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Gallery Moderation</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Monitor and curate community-generated prompts and assets.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                        <input
                            type="text"
                            placeholder="Reconnaissance Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-[#F1F5F9] rounded-[22px] py-4 pl-16 pr-8 text-sm font-bold w-full md:w-[350px] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="bg-white border border-[#F1F5F9] rounded-[40px] aspect-[4/5] animate-pulse"></div>
                    ))
                ) : filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-[#F1F5F9] rounded-[40px] overflow-hidden shadow-sm hover:shadow-[rgba(15,23,42,0.1)_0px_20px_40px_-5px] transition-all duration-500 group"
                    >
                        <div className="aspect-[4/5] bg-[#F8FAFC] relative overflow-hidden">
                            <img
                                src={resolveImageUrl(item.image_url)}
                                alt="Gallery Preview"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-all duration-500">
                                <p className="text-white text-xs font-bold line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.prompt}
                                </p>
                            </div>
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-[#0F172A] hover:bg-white transition-all shadow-lg"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="w-10 h-10 bg-red-500/90 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#F8FAFC] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F5F8FF] border border-[#E2E8F0] flex items-center justify-center text-[10px] font-black text-[#4D96FF]">
                                    {item.user_id ? 'U' : 'S'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{item.user_id ? 'Authenticated' : 'System Preset'}</p>
                                    <p className="text-[10px] font-bold text-[#94A3B8]">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
                <div className="bg-white border border-[#F1F5F9] rounded-[40px] p-20 text-center">
                    <div className="w-20 h-20 bg-[#F5F8FF] rounded-3xl flex items-center justify-center text-[#4D96FF] mx-auto mb-6">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">No assets found</h2>
                    <p className="text-[#64748B] font-bold mt-2">Try adjusting your search filters.</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex border border-[#F1F5F9] animate-in zoom-in-95 duration-300">
                        <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center p-10 relative group">
                            <img
                                src={resolveImageUrl(selectedItem.image_url)}
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 cursor-zoom-in"
                                alt="High Resolution"
                            />
                            <div className="absolute top-10 right-10">
                                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#64748B] hover:text-[#4D96FF] shadow-xl transition-all">
                                    <Download className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="w-[450px] flex flex-col">
                            <div className="p-10 border-b border-[#F8FAFC] flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Asset Deep Dive</h2>
                                    <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-[0.2em] mt-1">Audit Log #{selectedItem.id.slice(0, 8)}</p>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Generation Prompt</p>
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 relative">
                                        <p className="text-sm font-bold text-[#0F172A] leading-relaxed italic">"{selectedItem.prompt}"</p>
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#4D96FF] rounded-xl flex items-center justify-center text-white">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Metadata Extraction</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#F5F8FF] rounded-2xl border border-[#E2E8F0]">
                                            <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-widest mb-1">Upload Date</p>
                                            <p className="text-xs font-black text-[#0F172A]">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-4 bg-[#F5F8FF] rounded-2xl border border-[#E2E8F0]">
                                            <p className="text-[10px] font-black text-[#4D96FF] uppercase tracking-widest mb-1">User Status</p>
                                            <p className="text-xs font-black text-[#0F172A]">{selectedItem.user_id ? 'Community' : 'System'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#F8FAFC]">
                                    <button
                                        onClick={() => handleDelete(selectedItem.id)}
                                        className="w-full bg-red-50 text-red-500 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-red-100 flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Expunge From Gallery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryModeration;
