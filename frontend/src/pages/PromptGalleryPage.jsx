import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/layout/Header';
import PromptDetailModal from '../components/modals/PromptDetailModal';
import { useAuth } from '../context/AuthContext';

const PromptGalleryPage = () => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [contribution, setContribution] = useState({ prompt: '', image: null, preview: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'collection'
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchPrompts();
    }, [activeTab]);

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const params = activeTab === 'collection' ? { onlyMyCollection: true } : {};
            const res = await api.get('/gallery', { params });
            if (res.data.success) {
                setPrompts(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPrompt = (text, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        // Toast indicator could go here
    };

    const handleToggleLike = async (id, e) => {
        e.stopPropagation();
        if (!user) {
            // Redirect to login or show modal
            alert('Please login to like prompts');
            return;
        }

        try {
            const res = await api.post(`/gallery/${id}/like`);
            if (res.data.success) {
                setPrompts(prev => prev.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            user_has_liked: res.data.liked,
                            likes_count: parseInt(p.likes_count) + (res.data.liked ? 1 : -1)
                        };
                    }
                    return p;
                }));
            }
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleDeletePrompt = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this contribution?')) return;

        try {
            const res = await api.delete(`/gallery/${id}`);
            if (res.data.success) {
                setPrompts(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete prompt');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setContribution(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmitContribution = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Please login to contribute');
            return;
        }

        if (!contribution.prompt || !contribution.image) {
            alert('Please provide both a prompt and an image.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append('file', contribution.image);
            const uploadRes = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (uploadRes.data.success) {
                // 2. Save to gallery
                const saveRes = await api.post('/gallery', {
                    prompt: contribution.prompt.trim(),
                    imageUrl: uploadRes.data.url
                });

                if (saveRes.data.success) {
                    setContribution({ prompt: '', image: null, preview: null });
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    fetchPrompts();
                    if (activeTab === 'discover') setActiveTab('collection');
                }
            }
        } catch (err) {
            console.error('Contribution error:', err.response?.data || err);
            alert(`Failed to submit: ${err.response?.data?.message || 'Error occurred'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <main className="gallery-container pt-32 pb-20 px-1 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-4 tracking-tight">
                            Prompt Gallery
                        </h1>
                        <p className="text-[#64748B] text-lg font-medium leading-relaxed">
                            Discover the art of the perfect prompt. Explore our community's best creations and try them with your own images.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'discover' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'}`}
                        >
                            Discover
                        </button>
                        <button
                            onClick={() => setActiveTab('collection')}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'collection' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'}`}
                        >
                            My Collection
                        </button>
                    </div>
                </div>

                {/* Gallery Masonry Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#4D96FF]/20 border-t-[#4D96FF] rounded-full animate-spin"></div>
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/40 rounded-[32px] border-2 border-dashed border-[#E2E8F0]">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                            <svg className="w-10 h-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <p className="text-[#64748B] font-black">{activeTab === 'collection' ? "You haven't contributed any prompts yet" : "No prompts found"}</p>
                    </div>
                ) : (
                    <div className={`gallery-grid gap-6 ${activeTab === 'collection' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'columns-1 sm:columns-2 lg:columns-3 space-y-6'}`}>
                        {prompts.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedPrompt(item)}
                                className={`break-inside-avoid relative group cursor-pointer rounded-[24px] overflow-hidden bg-white border border-[#F1F5F9] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 premium-shadow ${activeTab === 'collection' ? 'aspect-square' : ''}`}
                            >
                                <img
                                    src={
                                        item.image_url.startsWith('http')
                                            ? item.image_url
                                            : item.image_url.startsWith('/img/')
                                                ? item.image_url
                                                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${item.image_url}`
                                    }
                                    alt={item.prompt}
                                    className="w-full h-full object-cover"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                                    {/* Action Icons Top Left */}
                                    <div className="absolute top-4 left-4">
                                        <div className="w-8 h-8 backdrop-blur-md bg-white/40 rounded-lg flex items-center justify-center border border-white/20">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    </div>

                                    {/* Action Icons Bottom Right - Like/Delete */}
                                    <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                                        <button
                                            onClick={(e) => handleToggleLike(item.id, e)}
                                            className={`w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${item.user_has_liked ? 'bg-pink-500 text-white' : 'bg-white/40 text-white hover:bg-white hover:text-pink-500'}`}
                                            title={item.user_has_liked ? "Remove like" : "Like prompt"}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill={item.user_has_liked ? "currentColor" : "none"} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={item.user_has_liked ? 0 : 2.5} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {activeTab === 'collection' && (
                                            <button
                                                onClick={(e) => handleDeletePrompt(item.id, e)}
                                                className="w-9 h-9 bg-white/40 backdrop-blur-md text-white hover:bg-red-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                                                title="Delete Contribution"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Copy Icon Center */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            onClick={(e) => handleCopyPrompt(item.prompt, e)}
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#4D96FF] shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-active:scale-95 hover:bg-[#4D96FF]"
                                            title="Copy Prompt"
                                        >
                                            <img src="/site_icons/copy-outline.svg" className="w-6 h-6" alt="Copy" />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-t from-black/80 via-black/20 to-transparent absolute inset-0 flex flex-col justify-end p-6 pointer-events-none">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className={`text-white font-bold leading-relaxed line-clamp-2 ${activeTab === 'collection' ? 'text-xs' : 'text-sm'}`}>
                                                {item.prompt}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-gradient-to-tr from-[#4D96FF] to-blue-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                                        {item.user_name ? item.user_name[0].toUpperCase() : 'A'}
                                                    </div>
                                                    <span className="text-white/60 text-[10px] font-black uppercase tracking-wider truncate max-w-[80px]">
                                                        {item.user_name || 'Admin'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-white/80">
                                                    <svg className="w-3.5 h-3.5 fill-pink-500 text-pink-500" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                                    <span className="text-[11px] font-black">{item.likes_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* User Contribution Section - Only in My Collection */}
                {activeTab === 'collection' && (
                    <div className="mt-12 pt-12 border-t border-[#E2E8F0]">
                        <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-8 md:p-12 border border-white shadow-2xl relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#F5F8FF] rounded-full blur-3xl -z-10 opacity-60"></div>

                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="md:w-1/2">
                                    <h2 className="text-3xl font-black text-[#0F172A] mb-4">Share your creativity</h2>
                                    <p className="text-[#64748B] font-bold text-sm mb-8 leading-relaxed">
                                        Generated something amazing? Share your image and the prompt you used to inspire other creators in the community.
                                    </p>

                                    <form onSubmit={handleSubmitContribution} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-wider ml-1">Prompt Details</label>
                                            <textarea
                                                value={contribution.prompt}
                                                onChange={(e) => setContribution({ ...contribution, prompt: e.target.value })}
                                                placeholder="Describe the scene you created..."
                                                className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4D96FF]/20 focus:border-[#4D96FF] transition-all resize-none h-32"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[14px] hover:bg-[#1E293B] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0F172A]/10"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                    Share with Gallery
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                <div className="md:w-1/2 w-full">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square w-full rounded-[24px] border-3 border-dashed border-[#E2E8F0] hover:border-[#4D96FF] bg-[#F8FAFC] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#F5F8FF] group overflow-hidden relative"
                                    >
                                        {contribution.preview ? (
                                            <>
                                                <img src={contribution.preview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-black text-sm">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                    <svg className="w-8 h-8 text-[#94A3B8] group-hover:text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <span className="text-[13px] font-bold text-[#64748B]">Click to upload capture</span>
                                                <span className="text-[11px] text-[#94A3B8] mt-1">PNG, JPG up to 10MB</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <PromptDetailModal
                isOpen={!!selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
                promptData={selectedPrompt}
            />
        </div>
    );
};

export default PromptGalleryPage;

