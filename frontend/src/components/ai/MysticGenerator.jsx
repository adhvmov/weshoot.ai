/**
 * Mystic Generator Component (Redesigned)
 * Focused AI Photoshoot tool with 6 key features.
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';

const SparkleIcon = () => (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
        <path d="M5.26931 2.56773L3.86057 2.85449C3.76515 2.8739 3.69655 2.95778 3.69623 3.05549C3.6959 3.15321 3.76408 3.23766 3.85935 3.25756L5.25552 3.55006L5.54286 4.96347C5.56227 5.05914 5.64596 5.12794 5.7431 5.12811H5.74359C5.84056 5.12811 5.92424 5.05996 5.94415 4.96462L6.23663 3.56308L7.64291 3.27353C7.73769 3.25404 7.80603 3.17041 7.80669 3.0731C7.80718 2.9758 7.73981 2.89143 7.64503 2.87087L6.25628 2.56888L5.95981 1.16316C5.93974 1.06807 5.85614 1 5.75925 1H5.75876C5.66194 1.00025 5.57826 1.06872 5.55869 1.16406L5.26931 2.56773ZM5.63022 3.33521C5.61382 3.2547 5.55134 3.19163 5.47125 3.17492L4.91851 3.05902L5.48324 2.9441C5.5635 2.9278 5.62663 2.86473 5.64318 2.78413L5.76153 2.20971L5.88273 2.78446C5.89945 2.86383 5.96095 2.92583 6.03998 2.94303L6.60806 3.06655L6.02244 3.18712C5.94251 3.20358 5.87988 3.26624 5.86316 3.34651L5.74636 3.90628L5.63022 3.33521ZM14.0737 3.39655C14.4767 2.99514 14.4793 2.3417 14.0797 1.93703C13.68 1.53237 13.0293 1.52974 12.6264 1.93114L10.149 4.39906L11.5964 5.86447L14.0737 3.39655ZM10.8895 6.59351L9.44216 5.1281L1.30395 13.2352C0.901006 13.6367 0.898356 14.2901 1.29804 14.6948C1.69771 15.0994 2.34837 15.1021 2.75132 14.7007L10.8895 6.59351ZM11.0539 10.0787L12.4626 9.79191L12.752 8.38825C12.7716 8.29291 12.8553 8.22443 12.9521 8.22419H12.9526C13.0495 8.22419 13.1331 8.29225 13.1531 8.38735L13.4496 9.79306L14.8383 10.0951C14.9331 10.1156 15.0005 10.2 15 10.2973C14.9993 10.3946 14.931 10.4782 14.8362 10.4977L13.4299 10.7873L13.1375 12.1888C13.1176 12.2841 13.0339 12.2841 12.9369 12.3523H12.9364C12.8393 12.3521 12.7566 12.2833 12.7362 12.1877L12.4488 10.7742L11.0527 10.4817C10.9574 10.4618 10.8892 10.3774 10.8895 10.2797C10.8899 10.182 10.9585 10.0981 11.0539 10.0787ZM12.6646 10.3991C12.7447 10.4158 12.8071 10.4789 12.8235 10.5594L12.9397 11.1305L13.0565 10.5707C13.0732 10.4904 13.1358 10.4278 13.2158 10.4113L13.8014 10.2907L13.2333 10.1672C13.1543 10.15 13.0928 10.088 13.076 10.0086L12.9548 9.43389L12.8365 10.0083C12.8199 10.0889 12.7568 10.152 12.6766 10.1683L12.1118 10.2832L12.6646 10.3991ZM7.56563 13.1362L6.86126 13.2795C6.81355 13.2892 6.77925 13.3312 6.77909 13.38C6.77893 13.4289 6.81302 13.4711 6.86065 13.4811L7.55874 13.6273L7.70241 14.334C7.71212 14.3819 7.75396 14.4163 7.80253 14.4163H7.80277C7.85126 14.4163 7.8931 14.3823 7.90305 14.3346L8.04929 13.6338L8.75243 13.4891C8.79982 13.4793 8.834 13.4375 8.83432 13.3888C8.83457 13.3402 8.80088 13.298 8.75349 13.2877L8.05912 13.1367L7.91088 12.4339C7.90085 12.3863 7.85905 12.3523 7.8106 12.3523H7.81036C7.76195 12.3524 7.72011 12.3867 7.71032 12.4343L7.56563 13.1362ZM7.74609 13.5199C7.73789 13.4796 7.70665 13.4481 7.6666 13.4398L7.39023 13.3818L7.6726 13.3243C7.71273 13.3162 7.74429 13.2847 7.75257 13.2444L7.81174 12.9571L7.87234 13.2445C7.8807 13.2842 7.91145 13.3152 7.95097 13.3238L8.23501 13.3856L7.9422 13.4459C7.90224 13.4541 7.87092 13.4854 7.86256 13.5256L7.80416 13.8054L7.74609 13.5199Z" />
    </svg>
);

const GENERATION_MODES = [
    { id: 'Precise', name: 'Precise', image: '/ai_photoshoot/tf_mode_precise-e7bd6d6c93139863b9e16c5e1783586e.png' },
    { id: 'Creative', name: 'Creative', image: '/ai_photoshoot/tf_mode_creative-6bb76eae9274444451c187489690d651.png', defaultPrompt: 'Generate an image of a model holding my product' },
    { id: 'Inspiration', name: 'Inspiration', image: '/ai_photoshoot/tf_mode_inspiration-52443a06382931dcbc6f13916086f0ea.png' },
    { id: 'Background', name: 'Background', image: '/ai_photoshoot/tf_mode_background-5a7cb0b9b044c4329d6b290bba8a7dee.png' },
    { id: 'Product Swap', name: 'Product swap', image: '/ai_photoshoot/tf_mode_mockup-8a25561181d437c19e8c8517a2557a2d.png' }
];

const ASPECT_RATIOS = [
    { id: 'square_1_1', label: '1:1', icon: 'M3 3h18v18H3z' },
    { id: 'portrait_2_3', label: '2:3', icon: 'M7 3h10v18H7z' },
    { id: 'traditional_3_4', label: '3:4', icon: 'M6 3h12v18H6z' },
    { id: 'social_story_9_16', label: '9:16', icon: 'M8 3h8v18H8z' },
    { id: 'standard_3_2', label: '3:2', icon: 'M3 6h18v12H3z' },
    { id: 'classic_4_3', label: '4:3', icon: 'M3 5h18v14H3z' },
    { id: 'widescreen_16_9', label: '16:9', icon: 'M3 8h18v8H3z' },
];

const MysticGenerator = ({
    onBack,
    onSuccess,
    onStart,
    activeImage,
    onRemoveBg,
    onUpload,
    onOpenAssetModal,
    settings,
    onUpdate,
    onImprovePrompt,
    isGenerating,
    onRefreshCredits,
    renderActionButton
}) => {
    // Basic States (Synced with settings if possible, otherwise local)
    const [prompt, setPrompt] = useState(settings?.photoshoot?.prompt || '');
    const [resolution, setResolution] = useState('2k');
    const [aspectRatio, setAspectRatio] = useState(settings?.photoshoot?.aspectRatio || 'square_1_1');
    const [generationMode, setGenerationMode] = useState(settings?.photoshoot?.generationMode || 'Precise');
    const [autoRemoveBg, setAutoRemoveBg] = useState(settings?.photoshoot?.bgRemoval ?? false);
    const [imageCount, setImageCount] = useState(1); // Default to 1

    // Mode-specific asset states (from settings)
    const inspirationImage = settings?.photoshoot?.inspirationImage;
    const backgroundImage = settings?.photoshoot?.backgroundImage;
    const swapImage = settings?.photoshoot?.swapImage;

    // Generation lifecycle state
    const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
    const [generationStatus, setGenerationStatus] = useState(null);
    const [error, setError] = useState(null);
    const [currentTaskId, setCurrentTaskId] = useState(null);

    // Synchronize local state with props only when they actually change externally
    useEffect(() => {
        if (settings?.photoshoot) {
            const ps = settings.photoshoot;
            if (ps.prompt !== undefined && ps.prompt !== prompt) setPrompt(ps.prompt);
            if (ps.aspectRatio !== undefined && ps.aspectRatio !== aspectRatio) setAspectRatio(ps.aspectRatio);
            if (ps.generationMode !== undefined && ps.generationMode !== generationMode) setGenerationMode(ps.generationMode);
            if (ps.bgRemoval !== undefined && ps.bgRemoval !== autoRemoveBg) setAutoRemoveBg(ps.bgRemoval);
        }
    }, [settings?.photoshoot]); // Reduced dependency array to avoid feedback loops

    // Keep track of parent generation state
    useEffect(() => {
        // If parent stops generating and we were generating, stop local too
        // (though they might be independent, usually we want them in sync)
    }, [isGeneratingLocal]);

    // Handle Mode Change
    // Handle Mode Change
    const handleModeChange = (id) => {
        setGenerationMode(id);
        setError(null);
        if (onUpdate) onUpdate('photoshoot', { generationMode: id });

        // If new mode has a default prompt, use it, otherwise clear it
        const mode = GENERATION_MODES.find(m => m.id === id);
        const newPrompt = mode?.defaultPrompt || '';

        setPrompt(newPrompt);
        if (onUpdate) onUpdate('photoshoot', { prompt: newPrompt });
    };

    // Toggle Auto-remove BG
    const handleToggleRemoveBg = async () => {
        const newValue = !autoRemoveBg;
        setAutoRemoveBg(newValue);
        if (onUpdate) onUpdate('photoshoot', { bgRemoval: newValue });

        if (newValue && activeImage && onRemoveBg) {
            try {
                await onRemoveBg({
                    mode: 'General',
                    backgroundColor: 'transparent'
                });
            } catch (err) {
                console.error('Failed to auto-remove background:', err);
                setError('Failed to remove background automatically');
                setAutoRemoveBg(false);
            }
        }
    };

    // Polling Logic
    const pollStatus = async (currentTaskId) => {
        return new Promise((resolve, reject) => {
            const maxAttempts = 150;
            let attempts = 0;

            const poll = async () => {
                try {
                    const response = await api.get(`/generator/mystic-status/${currentTaskId}`);
                    if (response.data.success) {
                        const { status, url } = response.data.data;
                        setGenerationStatus(status);

                        if (status === 'COMPLETED' && url) {
                            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                            const { generationId } = response.data.data;
                            const finalUrl = url.startsWith('http') ? url : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
                            // setIsGeneratingLocal(false); // Managed by caller
                            if (onSuccess) onSuccess(finalUrl, generationId);
                            resolve(finalUrl);
                            return;
                        } else if (status === 'FAILED') {
                            setError('Generation failed');
                            // setIsGeneratingLocal(false); // Managed by caller
                            reject(new Error('Generation failed'));
                            return;
                        }
                    }
                    attempts++;
                    if (attempts < maxAttempts) setTimeout(poll, 2000);
                    else {
                        setError('Timeout - check history');
                        // setIsGeneratingLocal(false); // Managed by caller
                        reject(new Error('Timeout'));
                    }
                } catch (err) {
                    attempts++;
                    if (attempts < maxAttempts) setTimeout(poll, 2000);
                    else {
                        setError('Network error');
                        // setIsGeneratingLocal(false); // Managed by caller
                        reject(err);
                    }
                }
            };
            poll();
        });
    };

    const handleGenerate = async () => {
        const currentPrompt = prompt.trim();
        if ((generationMode === 'Precise' || generationMode === 'Creative') && !currentPrompt) {
            setError('Please enter a prompt');
            return;
        }

        // Validate reference images for specific modes
        if (generationMode === 'Inspiration' && !inspirationImage) {
            setError('Please select an inspiration image');
            return;
        }
        if (generationMode === 'Background' && !backgroundImage) {
            setError('Please select a background image');
            return;
        }
        if (generationMode === 'Product Swap' && !swapImage) {
            setError('Please select a mockup image for swapping');
            return;
        }

        try {
            if (onStart) onStart();
            setIsGeneratingLocal(true);
            setError(null);
            setGenerationStatus('CREATED');

            const payload = {
                prompt: prompt.trim(),
                resolution,
                aspectRatio,
                imageCount: 1, // Default to 1
                mode: generationMode,
                inspirationImage,
                backgroundImage,
                swapImage,
                productImage: activeImage
            };

            const response = await api.post('/generator/mystic-generate', payload);
            if (response.data.success) {
                if (onRefreshCredits) onRefreshCredits();
                await pollStatus(response.data.data.taskId);
            } else {
                throw new Error(response.data.message || 'Generation failed');
            }
        } catch (err) {
            console.error('[MysticGenerator] Generation error:', err);
            setError(err.message || 'Failed to start generation');
        } finally {
            setIsGeneratingLocal(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-900">
            {/* Premium Header */}
            <div className="px-6 pt-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">AI Photoshoot</h3>
                </div>
                <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Generate beautiful AI photography for your products</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar space-y-6">

                {/* 1. Product Image */}
                <section>
                    <div
                        onClick={onUpload}
                        className="w-full aspect-[4/3] border border-[#F1F5F9] rounded-2xl bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center cursor-pointer group hover:border-[#4D96FF]/30 transition-all shadow-sm"
                    >
                        {activeImage ? (
                            <img src={activeImage} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]" alt="Product" />
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <svg className="w-6 h-6 text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="text-xs font-bold text-gray-400">Click to upload product</p>
                            </div>
                        )}
                    </div>
                </section>

                <div className={`rounded-2xl p-4 flex items-center justify-between transition-all animate-border-flow ${autoRemoveBg ? 'bg-[#F5F8FF]' : 'bg-white'}`}>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-[#0F172A]">remove background</span>
                    </div>
                    <div
                        onClick={handleToggleRemoveBg}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${autoRemoveBg ? 'bg-[#4D96FF]' : 'bg-[#E2E8F0]'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${autoRemoveBg ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <h4 className="text-sm font-bold text-[#0F172A]">Aspect ratio</h4>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => {
                                    setAspectRatio(ratio.id);
                                    if (onUpdate) onUpdate('photoshoot', { aspectRatio: ratio.id });
                                }}
                                className={`shrink-0 flex flex-col items-center gap-2 p-2.5 min-w-[56px] rounded-xl transition-all border-2 ${aspectRatio === ratio.id
                                    ? 'bg-white border-[#4D96FF] shadow-md text-[#4D96FF]'
                                    : 'bg-[#F8FAFC] border-transparent text-[#64748B] hover:bg-[#F1F5F9]'
                                    }`}
                            >
                                <div className={`w-6 h-6 flex items-center justify-center ${aspectRatio === ratio.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}`}>
                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                                        <path d={ratio.icon} />
                                    </svg>
                                </div>
                                <span className={`text-[10px] font-bold ${aspectRatio === ratio.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                    {ratio.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generation Mode */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <h4 className="text-sm font-bold text-[#0F172A]">Generation mode</h4>
                        <span className="text-gray-400 cursor-help" title="Select the mode that fits your goal">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {GENERATION_MODES.map(mode => (
                            <div
                                key={mode.id}
                                onClick={() => handleModeChange(mode.id)}
                                className="flex flex-col gap-2 cursor-pointer group"
                            >
                                <div className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${generationMode === mode.id
                                    ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10 shadow-lg'
                                    : 'border-[#F1F5F9] hover:border-[#4D96FF]/30'
                                    }`}>
                                    <img
                                        src={mode.image}
                                        alt={mode.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <span className={`text-[10px] text-center tracking-wider px-1 ${generationMode === mode.id ? 'text-[#0F172A] font-semibold' : 'text-[#64748B] font-medium'
                                    }`}>
                                    {mode.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-2"></div>

                {/* Mode Specific Inputs */}
                {generationMode !== 'Precise' && generationMode !== 'Creative' && (
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <div className="flex flex-col items-center justify-center py-2 gap-3">
                            <div
                                onClick={() => onOpenAssetModal(generationMode === 'Product Swap' ? 'Product swap' : generationMode)}
                                className="w-full h-40 border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-[#4D96FF]/30 transition-all group overflow-hidden bg-white/50"
                            >
                                {(generationMode === 'Inspiration' && inspirationImage) ||
                                    (generationMode === 'Background' && backgroundImage) ||
                                    (generationMode === 'Product Swap' && swapImage) ? (
                                    <img
                                        src={generationMode === 'Inspiration' ? inspirationImage : (generationMode === 'Background' ? backgroundImage : swapImage)}
                                        className="w-full h-full object-cover"
                                        alt="Reference"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#4D96FF] border border-[#F1F5F9]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider text-center px-4 w-full">Upload {generationMode} image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Prompt Input */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-bold text-[#0F172A]">Describe your vision</span>
                        <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{prompt.length} / 1000</span>
                    </div>
                    <div className="relative group">
                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                if (onUpdate) onUpdate('photoshoot', { prompt: e.target.value });
                            }}
                            placeholder="Describe the scene..."
                            className="w-full h-28 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm"
                        />
                        <button
                            onClick={() => onImprovePrompt && onImprovePrompt('photoshoot', prompt, 'image')}
                            disabled={isGenerating}
                            className={`absolute bottom-4 right-4 p-2.5 bg-white border border-[#F1F5F9] rounded-xl shadow-md text-[#4D96FF] hover:text-[#3b82f6] hover:border-[#4D96FF]/20 transition-all flex items-center justify-center group/btn active:scale-90 ${isGenerating ? 'cursor-not-allowed opacity-70' : ''}`}
                            title="Improve Prompt"
                        >
                            {isGenerating ? (
                                <div className="w-4 h-4 border-2 border-[#4D96FF] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="h-2"></div>
            </div>

            {/* Generate Button */}
            <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                {renderActionButton ? (
                    renderActionButton(
                        handleGenerate,
                        'Generate Photoshoot',
                        5,
                        { toolId: 'ai-photoshoot' },
                        isGeneratingLocal
                    )
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isGeneratingLocal || !activeImage}
                        className={`w-full py-4 font-bold rounded-2xl transition-all shadow-xl text-[13px] flex items-center justify-center gap-2 group animate-button-glow ${isGeneratingLocal || !activeImage
                            ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                            : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] shadow-blue-100'
                            }`}
                    >
                        {isGeneratingLocal ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <div className="w-5 h-5 bg-white mask-icon group-hover:scale-110 transition-transform" style={{ WebkitMaskImage: 'url(/site_icons/icon-11.svg)', maskImage: 'url(/site_icons/icon-11.svg)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }}></div>
                        )}
                        <span>{isGeneratingLocal ? 'Processing...' : 'Generate Photoshoot'}</span>
                    </button>
                )}
                {error && (
                    <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{error}</p>
                )}
                {generationStatus && !error && (
                    <p className="text-[10px] text-[#4D96FF] mt-3 text-center font-bold uppercase tracking-widest leading-loose animate-pulse">{generationStatus}</p>
                )}
                {!activeImage && !isGeneratingLocal && (
                    <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                )}
            </div>
        </div>
    );
};

export default MysticGenerator;

