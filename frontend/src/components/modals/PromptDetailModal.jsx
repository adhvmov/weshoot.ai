import React from 'react';
import { useNavigate } from 'react-router-dom';

const PromptDetailModal = ({ isOpen, onClose, promptData }) => {
    const navigate = useNavigate();
    if (!isOpen || !promptData) return null;

    const fullImageUrl = promptData.image_url.startsWith('http')
        ? promptData.image_url
        : promptData.image_url.startsWith('/img/')
            ? promptData.image_url
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${promptData.image_url}`;

    const handleTryNow = () => {
        // Redirect to editor with pre-filled prompt and tool selection
        // We'll use URL parameters like #operation=photoshoot&prompt=...
        const params = new URLSearchParams();
        params.set('operation', 'photoshoot');
        params.set('prompt', promptData.prompt);

        navigate(`/editor#${params.toString()}`);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div className="flex flex-col items-center max-h-full w-full max-w-6xl">
                <div
                    className="modal-content-wrapper bg-white rounded-[32px] shadow-2xl w-full overflow-hidden flex flex-col md:flex-row border-[12px] border-[#F5F8FF] animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image Section */}
                    <div className="md:w-3/5 bg-[#F8FAFC] flex items-center justify-center p-6 md:p-10 min-h-[300px] md:min-h-[500px]">
                        <img
                            src={fullImageUrl}
                            alt="Prompt Preview"
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-xl"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white relative">

                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Prompt Detail</h3>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F8FF] rounded-full">
                                    <svg className="w-4 h-4 text-pink-500 fill-pink-500" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                    <span className="text-[13px] font-black text-[#0F172A]">{promptData.likes_count || 0}</span>
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl font-black text-[#0F172A] leading-tight tracking-tight">
                                {promptData.prompt}
                            </p>


                            <div className="pt-6">
                                <button
                                    onClick={handleTryNow}
                                    className="w-full py-4 bg-[#0F172A] text-white rounded-[20px] font-black text-[15px] hover:bg-[#1E293B] transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-xl shadow-gray-200"
                                >
                                    Try with your image
                                </button>
                                <p className="text-center text-[11px] text-[#94A3B8] font-bold mt-4 uppercase tracking-wider">
                                    Opens in AI Photoshoot Tool
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* External close button at bottom (consistent with PricingModal style) */}
                <button
                    onClick={onClose}
                    className="mt-8 w-12 h-12 bg-white rounded-2xl border-2 border-[#F5F8FF] shadow-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PromptDetailModal;
