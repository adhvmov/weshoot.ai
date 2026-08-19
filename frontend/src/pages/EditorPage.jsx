/**
 * Editor Page/Studio
 * Complex interface for image editing tools
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PricingModal from '../components/modals/PricingModal';
import { useAuth } from '../context/AuthContext';
import AssetSelectionModal from '../components/modals/AssetSelectionModal';
import { generateAIImage, upscaleAIImage, removeBackground, generateBackgroundRealism, addShadows, fixLightColors, resizeExpand, blurBackground, addText, improvePrompt, uploadToHistory, toggleFavorite, toggleDislike, getGenerationHistory } from '../services/aiService';
import api from '../services/api';
import MysticGenerator from '../components/ai/MysticGenerator';
import BackgroundTemplatesPanel from '../components/ai/BackgroundTemplatesPanel';
import BlurBackgroundPanel from '../components/ai/BlurBackgroundPanel';
import ProfileDropdown from '../components/common/ProfileDropdown';
import DeleteImageModal from '../components/modals/DeleteImageModal';

//Helper components for the unified list view
const StudioToolRow = ({ tool, onClick }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log('Video play interrupted', e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group"
        >
            {/* Row for Icon */}
            <div className="w-10 h-10 flex-none flex items-center justify-center transition-colors">
                <div
                    className="w-6 h-6 transition-opacity"
                    style={{
                        maskImage: `url(${tool.icon})`,
                        WebkitMaskImage: `url(${tool.icon})`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        backgroundColor: '#4D96FF'
                    }}
                />
            </div>

            {/* Vertical Separator */}
            <div className="w-px h-8 bg-gray-200 mx-2"></div>

            {/* Row for Thumbnail + Text */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 flex-none rounded-lg overflow-hidden border border-gray-100 relative">
                    <img
                        src={tool.image}
                        alt=""
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered && tool.video ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {tool.video && (
                        <video
                            ref={videoRef}
                            src={tool.video}
                            loop
                            muted
                            playsInline
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{tool.title}</h3>
                </div>
            </div>
        </div>
    );
};

const StudioSeparator = ({ label }) => (
    <div className="flex items-center gap-4 py-4 px-2">
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">{label}</div>
        <div className="flex-1 h-px bg-gray-100"></div>
    </div>
);

//Tool configuration data
import { TOOLS } from '../constants/tools';

const UPSCALE_PRESETS = [
    {
        id: 'General',
        title: 'General',
        image: '/img/quality_type/upscale_general.jpg',
        settings: { flavor: 'photo', sharpen: 7, smart_grain: 7, ultra_detail: 30 }
    },
    {
        id: 'Product',
        title: 'Product',
        image: '/img/quality_type/upscale-proudct.png',
        settings: { flavor: 'photo', sharpen: 12, smart_grain: 5, ultra_detail: 40 }
    },
    {
        id: 'Places',
        title: 'Places',
        image: '/img/quality_type/upscale_places.jpg',
        settings: { flavor: 'photo', sharpen: 10, smart_grain: 5, ultra_detail: 45 }
    },
    {
        id: 'People',
        title: 'People',
        image: '/img/quality_type/upscale_people.jpg',
        settings: { flavor: 'photo_denoiser', sharpen: 5, smart_grain: 10, ultra_detail: 20 }
    },
    {
        id: 'Digital Art',
        title: 'Digital art',
        image: '/img/quality_type/upscale_digital.jpg',
        settings: { flavor: 'sublime', sharpen: 15, smart_grain: 0, ultra_detail: 60 }
    },
    {
        id: 'Text',
        title: 'Text',
        image: '/img/quality_type/upscale_text.jpg',
        settings: { flavor: 'photo', sharpen: 30, smart_grain: 0, ultra_detail: 0 }
    }
];

const SparkleIcon = () => (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
        <path d="M5.26931 2.56773L3.86057 2.85449C3.76515 2.8739 3.69655 2.95778 3.69623 3.05549C3.6959 3.15321 3.76408 3.23766 3.85935 3.25756L5.25552 3.55006L5.54286 4.96347C5.56227 5.05914 5.64596 5.12794 5.7431 5.12811H5.74359C5.84056 5.12811 5.92424 5.05996 5.94415 4.96462L6.23663 3.56308L7.64291 3.27353C7.73769 3.25404 7.80603 3.17041 7.80669 3.0731C7.80718 2.9758 7.73981 2.89143 7.64503 2.87087L6.25628 2.56888L5.95981 1.16316C5.93974 1.06807 5.85614 1 5.75925 1H5.75876C5.66194 1.00025 5.57826 1.06872 5.55869 1.16406L5.26931 2.56773ZM5.63022 3.33521C5.61382 3.2547 5.55134 3.19163 5.47125 3.17492L4.91851 3.05902L5.48324 2.9441C5.5635 2.9278 5.62663 2.86473 5.64318 2.78413L5.76153 2.20971L5.88273 2.78446C5.89945 2.86383 5.96095 2.92583 6.03998 2.94303L6.60806 3.06655L6.02244 3.18712C5.94251 3.20358 5.87988 3.26624 5.86316 3.34651L5.74636 3.90628L5.63022 3.33521ZM14.0737 3.39655C14.4767 2.99514 14.4793 2.3417 14.0797 1.93703C13.68 1.53237 13.0293 1.52974 12.6264 1.93114L10.149 4.39906L11.5964 5.86447L14.0737 3.39655ZM10.8895 6.59351L9.44216 5.1281L1.30395 13.2352C0.901006 13.6367 0.898356 14.2901 1.29804 14.6948C1.69771 15.0994 2.34837 15.1021 2.75132 14.7007L10.8895 6.59351ZM11.0539 10.0787L12.4626 9.79191L12.752 8.38825C12.7716 8.29291 12.8553 8.22443 12.9521 8.22419H12.9526C13.0495 8.22419 13.1331 8.29225 13.1531 8.38735L13.4496 9.79306L14.8383 10.0951C14.9331 10.1156 15.0005 10.2 15 10.2973C14.9993 10.3946 14.931 10.4782 14.8362 10.4977L13.4299 10.7873L13.1375 12.1888C13.1176 12.2841 13.0339 12.3523 12.9369 12.3523H12.9364C12.8393 12.3521 12.7566 12.2833 12.7362 12.1877L12.4488 10.7742L11.0527 10.4817C10.9574 10.4618 10.8892 10.3774 10.8895 10.2797C10.8899 10.182 10.9585 10.0981 11.0539 10.0787ZM12.6646 10.3991C12.7447 10.4158 12.8071 10.4789 12.8235 10.5594L12.9397 11.1305L13.0565 10.5707C13.0732 10.4904 13.1358 10.4278 13.2158 10.4113L13.8014 10.2907L13.2333 10.1672C13.1543 10.15 13.0928 10.088 13.076 10.0086L12.9548 9.43389L12.8365 10.0083C12.8199 10.0889 12.7568 10.152 12.6766 10.1683L12.1118 10.2832L12.6646 10.3991ZM7.56563 13.1362L6.86126 13.2795C6.81355 13.2892 6.77925 13.3312 6.77909 13.38C6.77893 13.4289 6.81302 13.4711 6.86065 13.4811L7.55874 13.6273L7.70241 14.334C7.71212 14.3819 7.75396 14.4163 7.80253 14.4163H7.80277C7.85126 14.4163 7.8931 14.3823 7.90305 14.3346L8.04929 13.6338L8.75243 13.4891C8.79982 13.4793 8.834 13.4375 8.83432 13.3888C8.83457 13.3402 8.80088 13.298 8.75349 13.2877L8.05912 13.1367L7.91088 12.4339C7.90085 12.3863 7.85905 12.3523 7.8106 12.3523H7.81036C7.76195 12.3524 7.72011 12.3867 7.71032 12.4343L7.56563 13.1362ZM7.74609 13.5199C7.73789 13.4796 7.70665 13.4481 7.6666 13.4398L7.39023 13.3818L7.6726 13.3243C7.71273 13.3162 7.74429 13.2847 7.75257 13.2444L7.81174 12.9571L7.87234 13.2445C7.8807 13.2842 7.91145 13.3152 7.95097 13.3238L8.23501 13.3856L7.9422 13.4459C7.90224 13.4541 7.87092 13.4854 7.86256 13.5256L7.80416 13.8054L7.74609 13.5199Z" />
    </svg>
);

//Unified Row Component containing both Icon and Tool Info
const UnifiedToolRow = ({ tool, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex w-full cursor-pointer group transition-all duration-300 relative ${active ? 'bg-white' : 'hover:bg-white/60'}`}
    >
        {/* Left: Icon Section (Context Rail) */}
        <div className="w-16 flex-none flex flex-col items-center justify-center py-4 relative h-[88px]">
            <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${active ? 'bg-[#4D96FF] shadow-lg shadow-blue-200' : 'bg-white border border-[#F1F5F9] group-hover:border-[#4D96FF]/30'}`}>
                {typeof tool.icon === 'string' ? (
                    <img src={tool.icon} alt={tool.shortName} className={`w-6 h-6 ${active ? 'brightness-0 invert' : ''}`} />
                ) : (
                    <tool.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#64748B] group-hover:text-[#4D96FF]'}`} />
                )}
            </div>
            {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4D96FF] rounded-l-full"></div>
            )}
        </div>

        {/* Right: Tool Info Section (Content) */}
        <div className="flex-1 p-3 flex items-center gap-4 h-[88px]">
            <div className={`w-14 h-14 rounded-[20px] overflow-hidden shrink-0 border-2 transition-all duration-300 ${active ? 'border-[#4D96FF]' : 'border-white group-hover:border-[#F1F5F9]'} premium-shadow`}>
                <img src={tool.image} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-[13px] font-bold truncate ${active ? 'text-[#0F172A]' : 'text-[#64748B] group-hover:text-[#0F172A]'}`}>{tool.title}</span>
                <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">{tool.shortName}</span>
                {tool.isNew && (
                    <span className="inline-flex items-center gap-1 bg-[#4D96FF]/10 text-[#4D96FF] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight mt-1 self-start">
                        âœ¨ New Tool
                    </span>
                )}
            </div>
        </div>
    </div>
);

//Separator Component
const UnifiedSeparator = ({ label }) => (
    <div className="flex items-center gap-4 py-6 px-6">
        <span className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-[#F1F5F9]"></div>
    </div>
);

//Tool Details Panel Component
const ToolDetailsPanel = ({ tool, onBack, settings, onUpdate, onGenerate, onUpscale, onRemoveBg, onAddShadows, onFixLight, onResizeExpand, onOpenAssetModal, activeImage, imageSize, isGenerating, generatedImages, generationError, onMysticSuccess, onStart, onUpload, onFashionGenerate, onGenerateVideo, onAddText, onImprovePrompt, fashionAssets, user, onRefreshCredits }) => {
    const navigate = useNavigate();

    // Tool Usage Limits Configuration (aligned with PricingPage.jsx comparisonData)
    const TOOL_LIMITS = {
        free: {
            'upscale-2k': 2,
            'upscale-4k': 0,
            'remove-bg': 5,
            'ai-photoshoot': 5,
            'ai-background': 5,
            'ai-fashion': 2,
            'ai-video-5s': 0,
            'ai-video-10s': 0,
            'ai-edit': 5,
            'ai-shadows': 5,
            'fix-light': 3,
            'blur-background': 3
        },
        essentials: {
            'upscale-2k': 30,
            'upscale-4k': 15,
            'remove-bg': 70,
            'ai-photoshoot': 60,
            'ai-background': 60,
            'ai-fashion': 40,
            'ai-video-5s': 6,
            'ai-video-10s': 2,
            'ai-edit': 60,
            'ai-shadows': 60,
            'fix-light': 40,
            'blur-background': 40
        },
        pro: {
            'upscale-2k': 100,
            'upscale-4k': 60,
            'ai-photoshoot': 200,
            'ai-background': 200,
            'ai-fashion': 120,
            'ai-video-5s': 20,
            'ai-video-10s': 8,
            'ai-edit': 200,
            'ai-shadows': 200,
            'fix-light': 120,
            'blur-background': 120
        },
        business: {
            // Infinity is handled by the check logic
        }
    };

    // Helper to check if user has enough credits and meets plan requirements
    const checkAccess = (cost, requirements = {}) => {
        const remainingCredits = (user?.credits?.total_credits ?? 0) - (user?.credits?.used_credits ?? 0);
        const planSlug = user?.plan?.slug || 'free';
        const usage = user?.plan?.usage || {};

        // 1. Check Credits
        if (remainingCredits < cost) return { allowed: false, reason: 'credits' };

        // 2. Check Plan Level Requirements (e.g. 4X upscale for Pro)
        if (requirements.proOnly && planSlug === 'free') {
            return { allowed: false, reason: 'plan' };
        }

        // 3. Check Tool Usage Limits
        if (requirements.toolId && planSlug !== 'business') {
            const limits = TOOL_LIMITS[planSlug];
            if (limits) {
                let limitKey = requirements.toolId;
                // Handle resolution-specific limits
                if (requirements.toolId === 'upscale') {
                    limitKey = requirements.resolution === '4' ? 'upscale-4k' : 'upscale-2k';
                } else if (requirements.toolId === 'ai-video') {
                    limitKey = requirements.duration === '10' ? 'ai-video-10s' : 'ai-video-5s';
                }

                const currentUsage = usage[limitKey] || 0;
                const limit = limits[limitKey];

                if (limit !== undefined && currentUsage >= limit) {
                    return { allowed: false, reason: 'limit_reached', limit };
                }
            }
        }

        return { allowed: true };
    };

    const renderActionButton = (onClick, text, cost, requirements = {}, isLoading = false) => {
        const { allowed, reason } = checkAccess(cost, requirements);

        if (!allowed) {
            let buttonText = "Upgrade";
            if (reason === 'limit_reached') {
                buttonText = "Upgrade";
            } else if (reason === 'credits') {
                buttonText = "add credits";
            }

            return (
                <button
                    onClick={() => navigate('/pricing')}
                    className="w-full h-14 bg-[#0F172A] text-white rounded-[20px] font-black text-sm shadow-xl shadow-gray-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {buttonText}
                </button>
            );
        }

        return (
            <button
                onClick={onClick}
                disabled={isLoading || isGenerating || !activeImage}
                className={`w-full h-14 font-black text-sm rounded-[20px] transition-all shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] group animate-button-glow ${isLoading || isGenerating || !activeImage
                    ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
                    : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] shadow-blue-100'
                    }`}
            >
                {isLoading || isGenerating ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                ) : (
                    <span>{text}</span>
                )}
            </button>
        );
    };

    //Ref for fix light reference image upload - must be at component level
    const fixLightRefInputRef = useRef(null);
    //Specific UI for "Improve quality & Upscale" (ID 1)
    if (tool.id === 1) {
        const { upscale } = settings;
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    <div className="mb-2">
                        <h3 className="text-lg font-[900] text-[#0F172A] leading-tight tracking-tight whitespace-nowrap">Improve quality & Upscale</h3>
                    </div>
                    <p className="text-[#64748B] text-[12px] font-medium leading-relaxed">Increase image resolution and clarity</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                    {/* Style Presets Grid */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Enhancement Type</span>
                        <div className="grid grid-cols-2 gap-4">
                            {UPSCALE_PRESETS.map(preset => (
                                <div
                                    key={preset.id}
                                    onClick={() => onUpdate('upscale', {
                                        category: preset.id,
                                        ...preset.settings
                                    })}
                                    className="flex flex-col items-center gap-3 cursor-pointer group/preset"
                                >
                                    <div className={`w-full aspect-square rounded-[24px] overflow-hidden border-2 transition-all duration-300 ${upscale.category === preset.id
                                        ? 'border-[#4D96FF] scale-[1.02] shadow-xl shadow-blue-100/50'
                                        : 'border-[#F1F5F9] group-hover/preset:border-[#4D96FF]/30 group-hover/preset:scale-[1.02]'
                                        }`}>
                                        <img src={preset.image} alt={preset.title} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[12px] font-bold text-center transition-colors ${upscale.category === preset.id ? 'text-[#4D96FF]' : 'text-[#64748B] group-hover/preset:text-[#0F172A]'}`}>
                                        {preset.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-[#F1F5F9] mb-6"></div>

                    {/* Scale Factor Selection */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Scale Factor</span>
                        <div className="grid grid-cols-2 gap-4">
                            {['2', '4'].map(factor => (
                                <button
                                    key={factor}
                                    onClick={() => onUpdate('upscale', { resolution: factor })}
                                    className={`py-4 rounded-[20px] font-bold text-[14px] border-2 transition-all ${upscale.resolution === factor
                                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-gray-200 scale-[1.02]'
                                        : 'bg-white text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'
                                        }`}
                                >
                                    {factor}X
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-[#F8FAFC] border-t border-[#F1F5F9] pb-16 lg:pb-6">
                    {renderActionButton(
                        () => onUpscale && onUpscale({
                            scale_factor: parseInt(upscale.resolution),
                            flavor: upscale.flavor,
                            sharpen: upscale.sharpen,
                            smart_grain: upscale.smart_grain,
                            ultra_detail: upscale.ultra_detail,
                            polish: upscale.faceRestore
                        }),
                        `Upscale (${upscale.resolution === '4' ? '18' : '12'}CR)`,
                        upscale.resolution === '4' ? 18 : 12,
                        {
                            proOnly: upscale.resolution === '4' && user?.plan?.slug === 'free',
                            toolId: 'upscale',
                            resolution: upscale.resolution
                        },
                        isGenerating
                    )}
                    {generationError && tool.id === 1 && (
                        <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                    )}
                    {!activeImage && !isGenerating && (
                        <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest leading-loose">Select an image to start</p>
                    )}
                </div>
            </div>
        );
    }

    //Specific UI for "Remove background" (ID 2)
    if (tool.id === 2) {
        const { removeBg } = settings;
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Remove background</h3>
                    </div>
                    <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Remove backgrounds in high resolution</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                    {/* Hero Image */}
                    <div className="mb-8 mt-2">
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#F1F5F9] shadow-sm">
                            <img
                                src="/img/nobg_clothes.png"
                                className="w-full h-full object-cover"
                                alt="Background removal preview"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mb-6"></div>

                    {/* High Resolution Toggle */}
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0F172A]">High Resolution</span>
                            <span className="text-[11px] text-[#64748B] mt-0.5">Process image in full quality</span>
                        </div>
                        <div
                            onClick={() => onUpdate('removeBg', { highResolution: !removeBg.highResolution })}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${removeBg.highResolution ? 'bg-[#4D96FF]' : 'bg-[#E2E8F0]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${removeBg.highResolution ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mb-6"></div>
                </div>

                {/* Apply Button */}
                <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                    {renderActionButton(
                        () => onRemoveBg && onRemoveBg({
                            mode: 'General',
                            backgroundColor: 'transparent',
                            clipping: false,
                            car: false,
                            padding: null,
                            prompt: '',
                            highResolution: removeBg.highResolution
                        }),
                        'Remove Background',
                        5,
                        { toolId: 'remove-bg' },
                        isGenerating
                    )}
                    {generationError && tool.id === 2 && (
                        <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                    )}
                    {!activeImage && !isGenerating && (
                        <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                    )}
                </div>
            </div>
        );
    }

    //Specific UI for "AI Photoshoot" (ID 3) - Now using Mystic Generator
    if (tool.id === 3) {
        return (
            <MysticGenerator
                onBack={onBack}
                onSuccess={onMysticSuccess}
                onStart={onStart}
                activeImage={activeImage}
                onRemoveBg={onRemoveBg}
                onUpload={onUpload}
                onOpenAssetModal={onOpenAssetModal}
                settings={settings}
                onUpdate={onUpdate}
                onImprovePrompt={onImprovePrompt}
                isGenerating={isGenerating}
                generationError={generationError}
                user={user}
                onRefreshCredits={onRefreshCredits}
                renderActionButton={renderActionButton}
            />
        );
    }

    //Specific UI for "AI backgrounds (templates)" (ID 4)
    if (tool.id === 4) {
        return (
            <BackgroundTemplatesPanel
                onBack={onBack}
                settings={settings}
                onUpdate={onUpdate}
                onGenerate={onGenerate}
                onImprovePrompt={onImprovePrompt}
                isGenerating={isGenerating}
                generationError={generationError}
                activeImage={activeImage}
                renderActionButton={renderActionButton}
            />
        );
    }

    //Specific UI for "Erase brush" (ID 5)
    if (tool.id === 5) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#1E293B]">Erase Brush</h3>
                </div>
                <div className="p-6 flex flex-col items-center justify-center flex-1 text-center">
                    <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4 text-[#94A3B8]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h4 className="text-[#1E293B] font-bold mb-2">Coming Soon</h4>
                    <p className="text-[#64748B] text-sm">This tool uses a specialized AI model that is currently being integrated.</p>

                    <button
                        disabled={true}
                        className="mt-6 w-full py-4 font-bold rounded-2xl transition-all shadow-sm text-[13px] flex items-center justify-center gap-2 bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                    >
                        <span>Check back later</span>
                    </button>
                </div>
            </div>
        );
    }

    //Specific UI for "AI Edit" (ID 6)
    if (tool.id === 6) {
        const { aiEdit } = settings;
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    {/* <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#64748B] transition-all hover:scale-110 active:scale-95 border border-[#F1F5F9]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F8FF] rounded-full border border-[#4D96FF]/10">
                            <SparkleIcon/>
                            <span className="text-[10px] font-black text-[#4D96FF] uppercase tracking-wider">Experimental</span>
                        </div>
                    </div> */}

                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">AI Edit</h3>
                    <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Make instant, AI-powered changes to your images</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                    {/* Text Description */}
                    <div className="space-y-3 mt-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-bold text-[#0F172A]">Describe what you want to change</span>
                            <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">{(aiEdit.prompt || '').length}/1000</span>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={aiEdit.prompt || ''}
                                onChange={(e) => onUpdate('aiEdit', { prompt: e.target.value })}
                                placeholder="e.g. Turn the sky blue, add clouds..."
                                className="w-full h-28 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm"
                            />
                            <button
                                onClick={() => onImprovePrompt && onImprovePrompt('aiEdit', aiEdit.prompt, 'image')}
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
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                    {renderActionButton(
                        () => activeImage && onStart && onStart({
                            type: 'ai-edit',
                            prompt: aiEdit.prompt,
                            imageCount: aiEdit.imageCount,
                        }),
                        'Apply AI Edit',
                        5,
                        { toolId: 'ai-edit' },
                        isGenerating
                    )}
                    {generationError && tool.id === 6 && (
                        <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                    )}
                    {!activeImage && !isGenerating && (
                        <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                    )}
                </div>
            </div>
        );
    }

    //Specific UI for "Add shadows" (ID 7)
    if (tool.id === 7) {
        const { shadows } = settings;
        const ASPECT_RATIOS = [
            { id: 'square_1_1', label: '1:1', icon: 'M3 3h18v18H3z' },
            { id: 'portrait_2_3', label: '2:3', icon: 'M7 3h10v18H7z' },
            { id: 'traditional_3_4', label: '3:4', icon: 'M6 3h12v18H6z' },
            { id: 'social_story_9_16', label: '9:16', icon: 'M8 3h8v18H8z' },
            { id: 'standard_3_2', label: '3:2', icon: 'M3 6h18v12H3z' },
            { id: 'classic_4_3', label: '4:3', icon: 'M3 5h18v14H3z' },
            { id: 'widescreen_16_9', label: '16:9', icon: 'M3 8h18v8H3z' },
        ];

        return (
            <div className="flex flex-col h-full bg-white font-tight">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Add Shadows</h3>
                    <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Place your product and generate realistic shadows</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar focus:outline-none">
                    {/* Canvas Area */}
                    <div className="mb-6 mt-4">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Place your product on canvas</h4>
                        </div>
                        <div className="w-full aspect-square border-2 border-dashed border-[#F1F5F9] bg-[#F8FAFC] rounded-2xl relative overflow-hidden shadow-sm group hover:border-[#4D96FF]/30 transition-all">
                            {/* Checkered pattern background */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/checkerboard-cross.png')]"></div>
                            {/* Display active image if available */}
                            {activeImage && (
                                <img
                                    src={activeImage}
                                    alt="Product"
                                    className="absolute inset-0 w-full h-full object-contain z-10 p-4 drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            {!activeImage && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] mb-3 border border-[#F1F5F9]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">No image selected</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shadow Types */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Shadow style</h4>
                            <span className="text-gray-400 cursor-help" title="Choose the direction of the shadow">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'Auto', name: 'Auto', img: '/add_shadow/shadow-generation-auto-chair-406b224d26bcb6212dc83fffbebe4c43.webp' },
                                { id: 'Front', name: 'Front', img: '/add_shadow/shadow_generation_front-fba5f92ff55af3d9d7bd28cac7ab9e32.jpg' },
                                { id: 'Flat', name: 'Flat', img: '/add_shadow/shadow_generation_flat-77b14ea5bdb48b26b6667677c06ee690.jpg' }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onUpdate('shadows', { type: item.id })}
                                    className="flex flex-col gap-2 cursor-pointer group"
                                >
                                    <div className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${shadows.type === item.id
                                        ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10 shadow-lg'
                                        : 'border-[#F1F5F9] hover:border-[#4D96FF]/30'
                                        }`}>
                                        <img
                                            src={item.img}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                        />
                                    </div>
                                    <span className={`text-[10px] text-center tracking-wider px-1 ${shadows.type === item.id ? 'text-[#0F172A] font-semibold' : 'text-[#64748B] font-medium'
                                        }`}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mb-6"></div>

                    {/* Aspect Ratio */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Aspect ratio</h4>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => onUpdate('shadows', { aspectRatio: ratio.id })}
                                    className={`shrink-0 flex flex-col items-center gap-2 p-2.5 min-w-[56px] rounded-xl transition-all border-2 ${shadows.aspectRatio === ratio.id
                                        ? 'bg-white border-[#4D96FF] shadow-md text-[#4D96FF]'
                                        : 'bg-[#F8FAFC] border-transparent text-[#64748B] hover:bg-[#F1F5F9]'
                                        }`}
                                >
                                    <div className={`w-6 h-6 flex items-center justify-center ${shadows.aspectRatio === ratio.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}`}>
                                        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                                            <path d={ratio.icon} />
                                        </svg>
                                    </div>
                                    <span className={`text-[10px] font-bold ${shadows.aspectRatio === ratio.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                        {ratio.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                    {renderActionButton(
                        () => onAddShadows && onAddShadows({
                            shadowType: shadows.type,
                            aspectRatio: shadows.aspectRatio
                        }),
                        'Apply Shadows',
                        5,
                        { toolId: 'ai-shadows' },
                        isGenerating
                    )}
                    {generationError && tool.id === 7 && (
                        <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                    )}
                    {!activeImage && !isGenerating && (
                        <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                    )}
                </div>
            </div>
        );
    }

    //File input ref for reference image upload (used in tool ID 8)
    //Specific UI for "Fix light & colors" (ID 8) - Using Seedream v4 Edit
    if (tool.id === 8) {
        const { lightFix = {} } = settings;
        const prompt = lightFix.prompt || '';
        const aspectRatio = lightFix.aspectRatio || 'square_1_1';
        const fixLightFileInputRef = fixLightRefInputRef;

        const ASPECT_RATIOS = [
            { id: 'square_1_1', label: '1:1', icon: 'M3 3h18v18H3z' },
            { id: 'portrait_2_3', label: '2:3', icon: 'M7 3h10v18H7z' },
            { id: 'traditional_3_4', label: '3:4', icon: 'M6 3h12v18H6z' },
            { id: 'social_story_9_16', label: '9:16', icon: 'M8 3h8v18H8z' },
            { id: 'standard_3_2', label: '3:2', icon: 'M3 6h18v12H3z' },
            { id: 'classic_4_3', label: '4:3', icon: 'M3 5h18v14H3z' },
            { id: 'widescreen_16_9', label: '16:9', icon: 'M3 8h18v8H3z' },
        ];

        const handleRefUpload = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    onUpdate('lightFix', { ...lightFix, referenceImage: file, referencePreview: ev.target.result });
                };
                reader.readAsDataURL(file);
            }
        };

        const removeRefImage = () => {
            if (fixLightFileInputRef.current) fixLightFileInputRef.current.value = '';
            onUpdate('lightFix', {
                referenceImage: null,
                referencePreview: null
            });
        }

        return (
            <div className="flex flex-col h-full bg-white font-tight">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Fix Light & Colors</h3>
                    <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Adjust colors and brightness, apply HDR, and more</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar focus:outline-none">
                    {/* Canvas Area (Consistent with Tool 7) */}
                    <div className="mb-6 mt-4">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Place your product on canvas</h4>
                        </div>
                        <div className="w-full aspect-square border-2 border-dashed border-[#F1F5F9] bg-[#F8FAFC] rounded-2xl relative overflow-hidden shadow-sm group hover:border-[#4D96FF]/30 transition-all">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/checkerboard-cross.png')]"></div>
                            {activeImage && (
                                <img
                                    src={activeImage}
                                    alt="Product"
                                    className="absolute inset-0 w-full h-full object-contain z-10 p-4 drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            {!activeImage && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] mb-3 border border-[#F1F5F9]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">No image selected</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lighting Description */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Lighting Description (Optional)</h4>
                            <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">{(prompt || '').length}/1000</span>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={prompt}
                                onChange={(e) => onUpdate('lightFix', { ...lightFix, prompt: e.target.value })}
                                placeholder="Describe the lighting you want (e.g., golden hour, studio light)..."
                                className="w-full h-28 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm"
                            />
                            <button
                                onClick={() => onImprovePrompt && onImprovePrompt('lightFix', prompt, 'image')}
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

                    {/* Reference Image */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-[#0F172A] mb-3 px-1">Reference Light Source (Optional)</h4>
                        {!lightFix.referencePreview ? (
                            <div
                                onClick={() => fixLightFileInputRef.current?.click()}
                                className="border-2 border-dashed border-[#F1F5F9] bg-[#F8FAFC] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#4D96FF]/40 hover:bg-[#F5F8FF]/30 transition-all group overflow-hidden"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] group-hover:text-[#4D96FF] transition-all mb-3 border border-[#F1F5F9] group-hover:scale-110">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <h4 className="text-sm font-bold text-[#0F172A] mb-1">Upload reference</h4>
                                <p className="text-[11px] text-[#94A3B8] font-medium text-center px-4">Match lighting from another image</p>
                                <input type="file" ref={fixLightFileInputRef} className="hidden" accept="image/*" onChange={handleRefUpload} />
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#F1F5F9] group shadow-sm">
                                <img src={lightFix.referencePreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={removeRefImage}
                                        className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Aspect Ratio */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Aspect ratio</h4>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => onUpdate('lightFix', { ...lightFix, aspectRatio: ratio.id })}
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
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                    {renderActionButton(
                        () => onFixLight && onFixLight({
                            prompt,
                            aspectRatio,
                            referenceImage: lightFix.referenceImage
                        }),
                        'Apply Adjustment',
                        10,
                        { toolId: 'fix-light' },
                        isGenerating,
                        user,
                        onRefreshCredits
                    )}
                </div>
            </div>
        );
    }

    //Specific UI for "Resize & Expand" (ID 9)
    if (tool.id === 9) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#1E293B]">Resize & Outpaint</h3>
                </div>
                <div className="p-6 flex flex-col items-center justify-center flex-1 text-center">
                    <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4 text-[#94A3B8]">
                        <div className="w-8 h-8 bg-[#94A3B8] mask-icon" style={{ WebkitMaskImage: 'url(/site_icons/icon-7.svg)', maskImage: 'url(/site_icons/icon-7.svg)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }}></div>
                    </div>
                    <h4 className="text-[#1E293B] font-bold mb-2">Coming Soon</h4>
                    <p className="text-[#64748B] text-sm">Resize and Outpaint features are being updated for better quality.</p>

                    <button
                        disabled={true}
                        className="mt-6 w-full py-4 font-bold rounded-2xl transition-all shadow-sm text-[13px] flex items-center justify-center gap-2 bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                    >
                        <span>Check back later</span>
                    </button>
                </div>
            </div>
        );
    }

    //Specific UI for "Add text" (ID 11)
    if (tool.id === 11) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#1E293B]">Add Text</h3>
                </div>
                <div className="p-6 flex flex-col items-center justify-center flex-1 text-center">
                    <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4 text-[#94A3B8]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <h4 className="text-[#1E293B] font-bold mb-2">Coming Soon</h4>
                    <p className="text-[#64748B] text-sm">The Add Text tool is being upgraded for more creative control.</p>

                    <button
                        disabled={true}
                        className="mt-6 w-full py-4 font-bold rounded-2xl transition-all shadow-sm text-[13px] flex items-center justify-center gap-2 bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                    >
                        <span>Check back later</span>
                    </button>
                </div>
            </div>
        );
    }

    //Specific UI for "AI Fashion Models" (ID 12)
    if (tool.id === 12) {
        const { fashion } = settings;
        const currentStep = fashion.step || 1;

        const goToStep = (step) => onUpdate('fashion', { step });

        //Helper to render Step 1: Product Selection
        const renderStep1 = () => {
            const outfitOptions = [
                { id: 'No', label: 'No' },
                { id: 'Add bottoms', label: 'bottoms' },
                { id: 'Add tops', label: 'tops' }
            ];

            return (
                <div className="flex flex-col h-full">
                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                        <p className="text-gray-500 text-[11px] font-medium mb-4">
                            Upload the items you want to generate on a model.
                        </p>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h4 className="text-sm font-bold text-[#0F172A]">Main Product</h4>
                            </div>
                            <div
                                onClick={() => onUpload('productImage')}
                                className="w-full aspect-[4/3] border border-[#F1F5F9] rounded-2xl bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center cursor-pointer group hover:border-[#4D96FF]/30 transition-all shadow-sm"
                            >
                                {fashion.productImage || activeImage ? (
                                    <img
                                        src={fashion.productImage instanceof File ? URL.createObjectURL(fashion.productImage) : (fashion.productImage || activeImage)}
                                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                                        alt="Main Product"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Click to upload product</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Complete Outfit */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-[#0F172A] mb-4 block">Do you need to complete outfit?</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {outfitOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => onUpdate('fashion', {
                                            outfit: option.id,
                                            topImage: null,
                                            bottomImage: null
                                        })}
                                        className={`py-4 rounded-[20px] font-bold text-[12px] border-2 transition-all ${fashion.outfit === option.id
                                            ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-gray-200 scale-[1.02]'
                                            : 'bg-white text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Dynamic Asset Selection based on outfit choice */}
                        {fashion.outfit !== 'No' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-sm font-bold text-[#0F172A]">
                                        Select {fashion.outfit === 'Add bottoms' ? 'Bottom' : 'Top'}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Suggested Assets */}
                                    {(fashion.outfit === 'Add bottoms' ? fashionAssets.bottoms : fashionAssets.tops).slice(0, 3).map((asset) => (
                                        <div
                                            key={asset.id}
                                            onClick={() => onUpdate('fashion', fashion.outfit === 'Add bottoms' ? { bottomImage: asset.url } : { topImage: asset.url })}
                                            className={`relative aspect-square bg-white border-2 rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 ${(fashion.outfit === 'Add bottoms' ? fashion.bottomImage : fashion.topImage) === asset.url
                                                ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10 shadow-lg scale-105'
                                                : 'border-[#F1F5F9] hover:border-[#4D96FF]/30 hover:scale-105 shadow-sm'
                                                }`}
                                        >
                                            <img src={asset.url} className="w-full h-full object-contain p-2" />
                                            {(fashion.outfit === 'Add bottoms' ? fashion.bottomImage : fashion.topImage) === asset.url && (
                                                <div className="absolute top-2 right-2 bg-[#4D96FF] text-white rounded-full p-1 shadow-md">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {/* Upload Custom */}
                                    <div
                                        onClick={() => onUpload(fashion.outfit === 'Add bottoms' ? 'bottomImage' : 'topImage')}
                                        className="aspect-square border-2 border-dashed border-[#F1F5F9] bg-[#F8FAFC] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#4D96FF]/40 hover:bg-[#F5F8FF]/30 transition-all group overflow-hidden shadow-sm hover:scale-105"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] group-hover:text-[#4D96FF] transition-all border border-[#F1F5F9]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 px-1">
                            <p className="text-[11px] text-[#94A3B8] font-medium leading-relaxed italic">
                                Note: If no items are selected, matching pieces will be generated automatically to complete the look.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-[#F8FAFC] pb-16 lg:pb-6">
                        <button
                            onClick={() => goToStep(2)}
                            disabled={!activeImage && !fashion.productImage}
                            className={`w-full py-4 font-bold rounded-2xl transition-all shadow-xl text-[13px] flex items-center justify-center gap-2 group ${(!activeImage && !fashion.productImage)
                                ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                                : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] shadow-blue-100'
                                }`}
                        >
                            <span>Continue</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                        </button>
                    </div>
                </div >
            );
        };

        //Helper to render Step 2: Model Selection
        const renderStep2 = () => {
            const modelTypes = [
                { id: 'WeShoot', label: 'Weshoot models' },
                { id: 'Custom', label: 'Custom model' }
            ];

            return (
                <div className="flex flex-col h-full bg-white font-sans">
                    {/* Tab Toggle */}
                    <div className="px-5 py-3">
                        <div className="flex gap-2">
                            {modelTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => onUpdate('fashion', {
                                        modelType: type.id,
                                        selectedModel: null,
                                        selectedModelImage: null,
                                        selectedStructureImage: null,
                                        customModelImage: null
                                    })}
                                    className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border-2 ${fashion.modelType === type.id
                                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-black/10'
                                        : 'bg-[#F5F8FF] text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar focus:outline-none">
                        {fashion.modelType === 'WeShoot' ? (
                            <div className="space-y-6">
                                {/* Categories */}
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                                    {fashionAssets.categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            onClick={() => onUpdate('fashion', { selectedCategory: cat.id, selectedModel: null })}
                                            className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group ${fashion.selectedCategory === cat.id ? '' : 'opacity-70 hover:opacity-100'}`}
                                        >
                                            <div className={`w-16 h-12 rounded-lg overflow-hidden transition-all border-2 bg-[#F5F8FF] ${fashion.selectedCategory === cat.id
                                                ? 'border-[#4D96FF] shadow-md'
                                                : 'border-transparent group-hover:border-[#4D96FF]/30'
                                                }`}>
                                                <img src={cat.thumbnail} className="w-full h-full object-cover" alt={cat.name} />
                                            </div>
                                            <span className={`text-[10px] font-bold transition-colors ${fashion.selectedCategory === cat.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-gray-50 mb-4"></div>

                                {/* Model Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {fashionAssets.models.map((model) => (
                                        <div
                                            key={model.id}
                                            onClick={() => onUpdate('fashion', { selectedModel: model.id, selectedModelImage: model.url })}
                                            className={`aspect-[3/4] bg-[#F8FAFC] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group relative hover:shadow-lg ${fashion.selectedModel === model.id
                                                ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10 shadow-lg scale-[1.02]'
                                                : 'border-[#F5F8FF] hover:border-[#4D96FF]/30'
                                                }`}
                                        >
                                            <img src={model.url} className="w-full h-full object-cover p-0" alt="Model" />
                                            {fashion.selectedModel === model.id && (
                                                <div className="absolute top-2 right-2 bg-[#4D96FF] text-white rounded-full p-1 shadow-md">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <div
                                    onClick={() => onUpload('customModelImage')}
                                    className="relative border-2 border-dashed border-[#E2E8F0] rounded-2xl bg-[#FAFBFC] hover:border-[#4D96FF]/40 hover:bg-[#F5F8FF]/30 transition-all group cursor-pointer overflow-hidden min-h-[300px] flex items-center justify-center"
                                >
                                    {fashion.customModelImage ? (
                                        <div className="w-full h-full p-4 flex flex-col items-center">
                                            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-2 border-white">
                                                <img src={fashion.customModelImage instanceof File ? URL.createObjectURL(fashion.customModelImage) : fashion.customModelImage} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#4D96FF]">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="mt-4 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors">Replace Model Image</button>
                                        </div>
                                    ) : (
                                        <div className="p-8 flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#F1F5F9]">
                                                <svg className="w-6 h-6 text-[#94A3B8] group-hover:text-[#4D96FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold text-[#0F172A] mb-1">Upload your model</h4>
                                            <p className="text-[11px] text-[#94A3B8] font-medium px-6 leading-relaxed">Recommended: Clear full-body shot with good lighting</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-[#F8FAFC] flex gap-3">
                        <button
                            onClick={() => goToStep(1)}
                            className="flex-1 py-4 bg-white border border-[#F1F5F9] text-[#64748B] font-bold rounded-2xl text-[13px] hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => goToStep(3)}
                            disabled={!fashion.selectedModel && !fashion.customModelImage}
                            className={`flex-[2] py-4 font-bold rounded-2xl transition-all shadow-xl text-[13px] flex items-center justify-center gap-2 group ${(!fashion.selectedModel && !fashion.customModelImage)
                                ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                                : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] shadow-blue-100'
                                }`}
                        >
                            <span>Select Model</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                        </button>
                    </div>
                </div>
            );
        };

        //Helper to render Step 3: Generation Review & Settings
        const renderStep3 = () => {
            const ASPECT_RATIOS = [
                { id: 'square_1_1', label: '1:1', icon: 'M3 3h18v18H3z' },
                { id: 'portrait_2_3', label: '2:3', icon: 'M7 3h10v18H7z' },
                { id: 'traditional_3_4', label: '3:4', icon: 'M6 3h12v18H6z' },
                { id: 'social_story_9_16', label: '9:16', icon: 'M8 3h8v18H8z' },
                { id: 'standard_3_2', label: '3:2', icon: 'M3 6h18v12H3z' },
                { id: 'classic_4_3', label: '4:3', icon: 'M3 5h18v14H3z' },
                { id: 'widescreen_16_9', label: '16:9', icon: 'M3 8h18v8H3z' },
            ];

            return (
                <div className="flex flex-col h-full bg-white font-tight">
                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                        {/* Model & Reference Section */}
                        <div className="mb-8">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em] mb-3 block">Model Structure</span>
                            <div className="aspect-[3/4] rounded-[24px] overflow-hidden bg-[#F8FAFC] border-2 border-[#F1F5F9] mb-4 shadow-sm group">
                                <img
                                    src={
                                        fashion.selectedStructureImage ||
                                        (fashion.customModelImage
                                            ? (fashion.customModelImage instanceof File ? URL.createObjectURL(fashion.customModelImage) : fashion.customModelImage)
                                            : fashion.selectedModelImage
                                        )
                                    }
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt="Selected Structure"
                                />
                            </div>

                            {/* Structure Grid - SHOW ALL STRUCTURES */}
                            {fashionAssets.structures.length > 0 && (
                                <div className="grid grid-cols-4 gap-2.5 mb-2">
                                    {fashionAssets.structures.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => onUpdate('fashion', { selectedStructureImage: s.url })}
                                            className={`aspect-square rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer hover:shadow-md ${fashion.selectedStructureImage === s.url
                                                ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10 shadow-lg scale-95'
                                                : 'border-[#F8FAFC] opacity-70 hover:opacity-100 hover:border-[#4D96FF]/30'
                                                }`}
                                        >
                                            <img src={s.url} className="w-full h-full object-cover" alt="Structure option" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Products Preview */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Attached Products</span>
                                <span className="text-[9px] font-bold text-[#4D96FF] bg-[#F5F8FF] px-2 py-0.5 rounded-full">
                                    {[fashion.productImage, fashion.topImage, fashion.bottomImage].filter(Boolean).length} Items
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border-2 border-[#F1F5F9] overflow-hidden hover:border-[#4D96FF]/30 transition-all p-1">
                                    <img src={fashion.productImage instanceof File ? URL.createObjectURL(fashion.productImage) : (fashion.productImage || activeImage)} className="w-full h-full object-contain" alt="Main Product" />
                                </div>
                                {fashion.topImage && (
                                    <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border-2 border-[#F1F5F9] overflow-hidden hover:border-[#4D96FF]/30 transition-all p-1">
                                        <img src={fashion.topImage instanceof File ? URL.createObjectURL(fashion.topImage) : fashion.topImage} className="w-full h-full object-contain" alt="Top" />
                                    </div>
                                )}
                                {fashion.bottomImage && (
                                    <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border-2 border-[#F1F5F9] overflow-hidden hover:border-[#4D96FF]/30 transition-all p-1">
                                        <img src={fashion.bottomImage instanceof File ? URL.createObjectURL(fashion.bottomImage) : fashion.bottomImage} className="w-full h-full object-contain" alt="Bottom" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Model Provider */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">AI Model Provider</span>
                            </div>
                            <div className="flex bg-[#F1F5F9] p-1.5 rounded-[22px] border border-[#E2E8F0]">
                                {[
                                    { id: 'freepik', label: 'Freepik' },
                                    { id: 'claid', label: 'Claid' }
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => onUpdate('fashion', { provider: p.id })}
                                        className={`flex-1 py-3 text-[13px] font-black rounded-[18px] transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative ${fashion.provider === p.id
                                            ? 'bg-white text-[#0F172A] shadow-md shadow-[#4D96FF]/5 scale-[1.02]'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>{p.label}</span>

                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Extra Instructions - AI EDIT STYLE */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center px-1 mb-3">
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Instructions & Style</span>
                                <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">{(fashion.prompt || '').length}/1000</span>
                            </div>
                            <div className="relative group">
                                <textarea
                                    value={fashion.prompt}
                                    onChange={(e) => onUpdate('fashion', { prompt: e.target.value })}
                                    className="w-full h-28 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm"
                                    placeholder="Describe the background, scene, vibe, or model pose for this fashion shoot..."
                                />
                                <button
                                    onClick={() => onImprovePrompt && onImprovePrompt('fashion', fashion.prompt || 'Professional fashion photoshoot, studio lighting, high-end editorial style', 'image')}
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

                        {/* Aspect Ratio - ADD SHADOWS STYLE */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Aspect ratio</span>
                            </div>
                            <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                                {ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => onUpdate('fashion', { aspectRatio: ratio.id })}
                                        className={`shrink-0 flex flex-col items-center gap-2 p-2.5 min-w-[60px] rounded-2xl transition-all border-2 ${fashion.aspectRatio === ratio.id
                                            ? 'bg-white border-[#4D96FF] shadow-md text-[#4D96FF]'
                                            : 'bg-[#F8FAFC] border-transparent text-[#64748B] hover:bg-[#F1F5F9]'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center ${fashion.aspectRatio === ratio.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}`}>
                                            <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                                                <path d={ratio.icon} />
                                            </svg>
                                        </div>
                                        <span className={`text-[10px] font-bold ${fashion.aspectRatio === ratio.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                            {ratio.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer - VERTICAL BUTTONS */}
                    <div className="p-6 bg-[#F8FAFC] flex flex-col gap-3">
                        {renderActionButton(
                            () => onFashionGenerate && onFashionGenerate(fashion),
                            'Genrate Fashionshoot',
                            13,
                            { toolId: 'ai-fashion' },
                            isGenerating
                        )}
                        <button
                            onClick={() => goToStep(2)}
                            disabled={isGenerating}
                            className="w-full py-4 bg-white border border-[#F1F5F9] text-[#64748B] font-bold rounded-2xl text-[13px] hover:bg-gray-50 hover:text-[#0F172A] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            Back to Model Selection
                        </button>
                    </div>
                </div>
            );
        };

        const steps = [
            { id: 1, title: 'Upload your Clothing' },
            { id: 2, title: 'Select a Model' },
            { id: 3, title: 'Photo Settings' }
        ];

        return (
            <div className="flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    {/* <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#64748B] transition-all hover:scale-110 active:scale-95 border border-[#F1F5F9]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F8FF] rounded-full border border-[#4D96FF]/10">
                                <SparkleIcon/>
                                <span className="text-[10px] font-black text-[#4D96FF] uppercase tracking-wider">Magic Tool</span>
                            </div>
                        </div>
                    </div> */}

                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">{steps.find(s => s.id === currentStep).title}</h3>
                    {/* Step Indicator dots */}
                    <div className="flex gap-1.5 mt-3">
                        {steps.map(s => (
                            <div key={s.id} className={`h - 1.5 rounded-full transition-all duration-500 ${s.id === currentStep ? 'w-8 bg-[#4D96FF]' : 'w-2 bg-[#E2E8F0]'} `}></div>
                        ))}
                    </div>
                </div>

                {/* Progress-based Content */}
                <div className="flex-1 overflow-hidden">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>
            </div>
        );
    }

    //Specific UI for "Image to video" (ID 13)
    if (tool.id === 13) {
        const { video } = settings;
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    {/* <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#64748B] transition-all hover:scale-110 active:scale-95 border border-[#F1F5F9]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F8FF] rounded-full border border-[#4D96FF]/10">
                            <SparkleIcon/>
                            <span className="text-[10px] font-black text-[#4D96FF] uppercase tracking-wider">Magic Tool</span>
                        </div>
                    </div> */}

                    <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Image To Video</h3>
                    <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Animate your image</p>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">

                    {/* Canvas Area */}
                    <div className="mb-8 mt-2">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Input Image Preview</span>
                        </div>
                        <div className="w-full aspect-square bg-[#F8FAFC] border-2 border-[#F1F5F9] rounded-[32px] relative overflow-hidden shadow-sm group hover:border-[#4D96FF]/30 transition-all duration-500">
                            {/* Subtle geometric pattern background */}
                            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                            {/* Display active image if available */}
                            {activeImage ? (
                                <div className="absolute inset-0 p-6 flex items-center justify-center">
                                    <img
                                        src={activeImage}
                                        alt="Product"
                                        className="max-w-full max-h-full object-contain z-10 drop-shadow-2xl group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-white">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#F8FAFC] shadow-inner flex items-center justify-center text-[#94A3B8] mb-4 border border-[#F1F5F9]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">No Image Selected</span>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Select an image from history to animate</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Prompt Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center px-1 mb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Prompt</span>
                            <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">{(video.prompt || '').length}/1000</span>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={video.prompt}
                                onChange={(e) => onUpdate('video', { prompt: e.target.value })}
                                placeholder="Animate Your Image..."
                                className="w-full h-32 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm custom-scrollbar"
                            />
                            <button
                                onClick={() => onImprovePrompt && onImprovePrompt('video', video.prompt || 'Professional cinematic lighting, smooth 4k animation, high-end editorial motion', 'video')}
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

                    {/* Animation Duration */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Animation Duration</span>
                        </div>
                        <div className="flex bg-[#F1F5F9] p-1.5 rounded-[22px] border border-[#E2E8F0]">
                            {['5s', '10s'].map((d) => {
                                const isRestricted = d === '10s' && user?.plan?.slug === 'free';
                                return (
                                    <button
                                        key={d}
                                        onClick={() => !isRestricted && onUpdate('video', { duration: d })}
                                        className={`flex-1 py-3 text-[13px] font-black rounded-[18px] transition-all duration-300 flex items-center justify-center gap-2 relative ${video.duration === d
                                            ? 'bg-white text-[#0F172A] shadow-md shadow-[#4D96FF]/5 scale-[1.02]'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                            } ${isRestricted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        <svg className={`w-4 h-4 transition-colors ${video.duration === d ? 'text-[#4D96FF]' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {d}
                                        {isRestricted && (
                                            <div className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#4D96FF] text-white text-[8px] font-black rounded-lg shadow-sm uppercase tracking-tighter">Pro</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-[#F8FAFC]">
                    {renderActionButton(
                        () => onGenerateVideo && onGenerateVideo({
                            duration: video.duration,
                            motion: video.motion,
                            style: video.style,
                            seed: video.seed || -1
                        }),
                        `Apply Animation (${video.duration === '10s' ? '85' : '45'}CR)`,
                        video.duration === '10s' ? 85 : 45,
                        {
                            proOnly: video.duration === '10s' && user?.plan?.slug === 'free',
                            toolId: 'ai-video',
                            duration: video.duration
                        },
                        isGenerating
                    )}
                    {generationError && (
                        <p className="text-[11px] text-red-500 mt-4 text-center font-bold px-4 flex items-center justify-center gap-2 animate-bounce">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {generationError}
                        </p>
                    )}
                    {!activeImage && !isGenerating && (
                        <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                    )}
                </div>
            </div>
        );
    }

    //Specific UI for "Blur background" (ID 10)
    if (tool.id === 10) {
        return (
            <BlurBackgroundPanel
                onBack={onBack}
                settings={settings}
                onUpdate={onUpdate}
                onGenerate={onGenerate}
                isGenerating={isGenerating}
                generationError={generationError}
                activeImage={activeImage}
                renderActionButton={renderActionButton}
            />
        );
    }

    //Default UI for other tools
    return (
        <div className="flex flex-col h-full">
            {/* Header with back button */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="font-semibold text-gray-900">{tool.title}</h3>
            </div>

            {/* Tool image */}
            <div className="p-4">
                <div className="w-full aspect-video rounded-lg bg-gray-100 overflow-hidden mb-4">
                    <img src={tool.image} alt={tool.title} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200'} />
                </div>
            </div>

            {/* Tool description (placeholder) */}
            <div className="px-4 flex-1">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Use this tool to enhance your images with professional-grade editing capabilities.
                    Select an image from your creations to get started.
                </p>

                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Settings</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Auto-enhance</span>
                            <div className="w-10 h-5 bg-purple-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Quality</span>
                            <select className="text-sm border border-gray-200 rounded px-2 py-1">
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply button */}
            <div className="p-4 border-t border-gray-100">
                <button className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                    Apply {tool.title}
                </button>
            </div>
        </div>
    );
};

//Helper component for category cards
const CategoryCard = ({ title, image, active }) => (
    <div className="flex flex-col items-center gap-2.5 cursor-pointer group">
        <div className={`w-full aspect-[4/5] rounded-[20px] overflow-hidden relative border-2 transition-all duration-300 ${active ? 'border-[#4D96FF] shadow-lg shadow-blue-100' : 'border-white group-hover:border-[#E2E8F0]'}`}>
            <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} />

            {/* Split View Effect */}
            <div className="absolute inset-0 flex pointer-events-none">
                <div className="w-1/2 h-full bg-black/5 backdrop-blur-[1px]"></div>
                <div className="w-1/2 h-full bg-transparent"></div>
            </div>
            {/* Split Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>

            {/* Checkmark for Active */}
            {active && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#4D96FF] rounded-full flex items-center justify-center shadow-lg transform scale-110">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}
        </div>
        <span className={`text-[11px] font-bold tracking-tight transition-colors ${active ? 'text-[#0F172A]' : 'text-[#64748B] group-hover:text-[#0F172A]'}`}>{title}</span>
    </div>
);

//Image card for sidebar (square)
const UploadedImageCard = ({ image, isActive, onClick, onDelete, onToggleFavorite, onToggleDislike }) => (
    <div
        onClick={onClick}
        className={`relative group cursor-pointer rounded-[20px] overflow-hidden transition-all duration-500 premium-shadow ${isActive ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-95 shadow-inner' : 'hover:scale-[1.02] hover:-translate-y-1'}`}
    >
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
            {image.type === 'video' ? (
                <video
                    src={image.url}
                    className={`w-full h-full object-cover transition-all duration-700 ${image.isPending ? 'blur-2xl grayscale opacity-30 scale-110' : ''} `}
                    muted
                    playsInline
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                    }}
                />
            ) : (
                <img
                    src={image.url}
                    alt=""
                    className={`w-full h-full object-cover transition-all duration-700 ${image.isPending ? 'blur-2xl grayscale opacity-30 scale-110' : ''} `}
                />
            )}

            {/* Status Overlays */}
            {image.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm z-10">
                    <div className="w-6 h-6 border-3 border-[#4D96FF]/20 border-t-[#4D96FF] rounded-full animate-spin"></div>
                </div>
            )}

            {image.type === 'video' && !image.isPending && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1 z-10">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    <span className="text-[9px] text-white font-black uppercase tracking-widest">Video</span>
                </div>
            )}

            {/* Status Icons (Favorite/Dislike) */}
            {!image.isPending && (
                <div className="absolute bottom-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => onToggleDislike && onToggleDislike(image.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all hover:scale-110 ${image.is_disliked ? 'bg-red-500 text-white' : 'bg-white/40 text-white hover:bg-white hover:text-red-500'}`}
                        title={image.is_disliked ? "Remove dislike" : "Dislike"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => onToggleFavorite && onToggleFavorite(image.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all hover:scale-110 ${image.is_favorite ? 'bg-pink-500 text-white' : 'bg-white/40 text-white hover:bg-white hover:text-pink-500'}`}
                        title={image.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill={image.is_favorite ? "currentColor" : "none"} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={image.is_favorite ? 0 : 2} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>

        {/* Delete Button */}
        {!image.isPending && image.id && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                }}
                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 active:scale-90"
                title="Remove item"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        )}

        {/* Active Highlight Overlay */}
        {isActive && (
            <div className="absolute inset-0 border-2 border-[#4D96FF]/20 rounded-[20px] pointer-events-none"></div>
        )}
    </div>
);

//Toolbar Button Component
const ToolbarButton = ({ icon, label, onClick, disabled, variant = 'default' }) => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200";
    const variants = {
        default: "bg-white border border-[#F1F5F9] text-[#64748B] hover:bg-[#F5F8FF] hover:border-[#4D96FF]/30 hover:text-[#4D96FF] shadow-sm",
        primary: "bg-[#4D96FF] text-white hover:bg-[#3b82f6] shadow-md shadow-blue-200/50",
        danger: "bg-white border border-red-100 text-red-500 hover:bg-red-50 shadow-sm",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:-translate-y-0.5'} `}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {label && <span>{label}</span>}
        </button>
    );
};

const EditorPage = () => {
    const [selectedToolId, setSelectedToolId] = useState(null);

    //Tool Settings State
    const [toolSettings, setToolSettings] = useState({
        upscale: {
            resolution: '2',
            category: 'General',
            flavor: 'photo',
            sharpen: 7,
            smart_grain: 7,
            ultra_detail: 30,
            faceRestore: false
        },
        removeBg: { mode: 'General', bgType: 'transparent', category: 'General', padding: false, paddingVal: 10, shadow: false, color: '#ffffff', clipping: false, car: false, prompt: '', highResolution: false, timeout: 300000 },//Increase to 5 minutes for background removal
        photoshoot: { bgRemoval: false, aspectRatio: 'square_1_1', generationMode: 'Precise', prompt: '', imageCount: 1 },
        backgrounds: { templateTab: 'weshoot', templateCategory: 'Studio' },
        erase: { brushSize: 50, feathering: 0, preserveProduct: true },
        aiEdit: { prompt: '', imageCount: 1 },
        shadows: { type: 'Auto', bg: 'Transparent', aspectRatio: 'square_1_1', color: '#ffffff' },
        lightFix: { prompt: '', strength: 50, aspectRatio: 'square_1_1', seed: '' },//Seedream v4 Edit: prompt, guidance_scale (mapped from strength), aspect_ratio, seed, reference_images
        resize: { fit: 'Crop', preset: 'Instagram', width: 1080, height: 1080, ratio: '1:1' },
        blurBackground: { type: 'General', level: 'Medium', style: 'Regular', aspectRatio: 'square_1_1' },
        blur: { category: 'General', level: 'Medium', type: 'Regular' },
        text: {
            style: 'None', fontFamily: 'Manrope', fontSize: 64, fontWeight: 'Bold',
            lineHeight: 1.2, letterSpacing: 0, align: 'center',
            bold: false, italic: false, underline: false, strikethrough: false,
            color: '#000000', borderColor: 'transparent', borderWidth: 0,
            bgColor: 'transparent', bgOpacity: 100
        },
        fashion: {
            step: 1,
            outfit: 'No',
            productImage: null,
            topImage: null,
            bottomImage: null,
            modelType: 'WeShoot',//WeShoot or Custom
            selectedCategory: 'females',
            selectedModel: null,
            selectedModelImage: null,
            selectedStructureImage: null,
            customModelImage: null,
            prompt: '',
            resolution: 'default',
            aspectRatio: 'square_1_1',
            imageCount: 1,
            provider: 'freepik' // 'freepik' or 'claid'
        },
        video: { prompt: '', duration: '5s' }
    });

    const updateToolSettings = (tool, updates) => {
        setToolSettings(prev => ({
            ...prev,
            [tool]: { ...prev[tool], ...updates }
        }));
    };

    /**
     * Centralized polling helper for asynchronous AI tasks
     */
    const pollTask = async (taskId, sourceIndex, toolName, extraParams = {}) => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 120; // 6 minutes at 3s intervals

            const poll = async () => {
                try {
                    const statusRes = await api.get(`/generator/mystic-status/${taskId}`);
                    if (statusRes.data.success && statusRes.data.data.status === 'COMPLETED') {
                        const finalUrl = statusRes.data.data.url;
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        const fullUrl = finalUrl.startsWith('http') ? finalUrl : `${baseUrl.replace(/\/$/, '')}${finalUrl.startsWith('/') ? finalUrl : '/' + finalUrl}`;

                        setUploadedImages(prev => {
                            const newImages = prev.map((img, i) =>
                                i === sourceIndex ? { ...img, isPending: false } : img
                            );
                            const id = statusRes.data.data.generationId;
                            // Avoid duplicate if history already fetched it
                            if (newImages.some(img => String(img.id) === String(id))) return newImages;

                            return [{
                                url: fullUrl,
                                isPending: false,
                                id: id,
                                tool: toolName,
                                tool_name: toolName,
                                type: toolName === 'image-to-video' ? 'video' : 'image',
                                ...extraParams
                            }, ...newImages];
                        });
                        setActiveImageIndex(0);
                        refreshUser();
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 1500);
                        // setIsGenerating(false); // Removed: handled by the caller awaiting pollTask
                        resolve(fullUrl);
                    } else if (statusRes.data.data.status === 'FAILED') {
                        setGenerationError('Operation failed. Please try again.');
                        setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
                        // setIsGenerating(false); // Removed: handled by the caller awaiting pollTask
                        reject(new Error('Operation failed'));
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(poll, 3000);
                    } else {
                        setGenerationError('Operation timed out.');
                        setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
                        // setIsGenerating(false); // Removed: handled by the caller awaiting pollTask
                        reject(new Error('Operation timed out'));
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(poll, 3000);
                    } else {
                        setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
                        // setIsGenerating(false); // Removed: handled by the caller awaiting pollTask
                        reject(err);
                    }
                }
            };
            poll();
        });
    };
    const [deletingImageId, setDeletingImageId] = useState(null);

    // Mobile Responsive State
    const [mobileTab, setMobileTab] = useState('canvas'); // 'tools', 'canvas', 'history'
    const [assetModal, setAssetModal] = useState({ isOpen: false, type: null });

    const handleAssetSelect = (url) => {
        const type = assetModal.type;
        if (type === 'Inspiration') {
            updateToolSettings('photoshoot', { inspirationImage: url });
        } else if (type === 'Background') {
            updateToolSettings('photoshoot', { backgroundImage: url });
        } else if (type === 'Product swap') {
            updateToolSettings('photoshoot', { swapImage: url });
        }
        setAssetModal({ ...assetModal, isOpen: false });
    };

    const [showPricing, setShowPricing] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [historyStack, setHistoryStack] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [uploadContext, setUploadContext] = useState(null);
    const [fashionAssets, setFashionAssets] = useState({
        image: '/img/editor/magic.svg',
        credits: 10,
        active: true,
        categories: [],
        models: [],
        structures: [],
        bottoms: [],
        tops: []
    });

    useEffect(() => {
        if (selectedToolId === 12) {
            const fetchFashionData = async () => {
                try {
                    //Fetch categories
                    const catRes = await api.get('/generator/fashion-assets');
                    //Fetch tops/bottoms
                    const topsRes = await api.get('/generator/fashion-assets?category=top');
                    const bottomsRes = await api.get('/generator/fashion-assets?category=bottom');

                    setFashionAssets(prev => ({
                        ...prev,
                        categories: catRes.data.data,
                        tops: topsRes.data.data,
                        bottoms: bottomsRes.data.data
                    }));

                    //Set initial category models
                    const modelsRes = await api.get(`/generator/fashion-assets?category=${toolSettings.fashion.selectedCategory}`);
                    setFashionAssets(prev => ({ ...prev, models: modelsRes.data.data }));

                } catch (err) {
                    console.error('Error fetching fashion assets:', err);
                }
            };
            fetchFashionData();
        }
    }, [selectedToolId]);

    //Handle Category/Model Change
    useEffect(() => {
        if (selectedToolId === 12 && toolSettings.fashion.selectedCategory) {
            const fetchModels = async () => {
                const res = await api.get(`/generator/fashion-assets?category=${toolSettings.fashion.selectedCategory}`);
                setFashionAssets(prev => ({ ...prev, models: res.data.data }));

                //When category changes, reset selected model to avoid showing models from previous category
                updateToolSettings('fashion', {
                    selectedModel: null,
                    selectedModelImage: null,
                    selectedStructureImage: null
                });
            };
            fetchModels();
        }
    }, [toolSettings.fashion.selectedCategory, selectedToolId]);

    useEffect(() => {
        if (selectedToolId === 12 && toolSettings.fashion.selectedModel) {
            const fetchStructures = async () => {
                const res = await api.get(`/generator/fashion-assets?category=${toolSettings.fashion.selectedCategory}&modelId=${toolSettings.fashion.selectedModel}`);
                setFashionAssets(prev => ({ ...prev, structures: res.data.data }));

                //If structures are found, automatically select the first one as default
                if (res.data.success && res.data.data.length > 0) {
                    updateToolSettings('fashion', { selectedStructureImage: res.data.data[0].url });
                }
            };
            fetchStructures();
        }
    }, [toolSettings.fashion.selectedModel, selectedToolId, toolSettings.fashion.selectedCategory]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState('Creations');
    const [generatedImages, setGeneratedImages] = useState([]);
    const [generationError, setGenerationError] = useState(null);
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);

    const fileInputRef = useRef(null);
    const sidebarInputRef = useRef(null);
    const location = useLocation();
    const { user, logout, refreshUser } = useAuth();
    const historyFetchedRef = useRef(false);

    //Fetch user history on mount or when filter changes
    useEffect(() => {
        const fetchUserHistory = async () => {
            //Avoid double fetch on mount if already fetched but allow re-fetch on filter toggle
            if (!user?.email || (historyFetchedRef.current && !isRefreshingHistory)) return;

            try {
                //Pass onlyFavorites param
                const response = await getGenerationHistory({ limit: 50, onlyFavorites });

                if (response.success && response.data) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

                    if (!Array.isArray(response.data)) {
                        console.warn('[EditorPage] History data is not an array. Type:', typeof response.data);
                        console.log('[EditorPage] Full Response Data:', JSON.stringify(response.data, null, 2));
                        //Attempt to handle if data is wrapped in 'rows' or 'data'
                        if (response.data && Array.isArray(response.data.rows)) {
                            console.log('[EditorPage] Found nested rows array, using that.');
                            response.data = response.data.rows;
                        } else if (response.data && Array.isArray(response.data.data)) {
                            console.log('[EditorPage] Found nested data array, using that.');
                            response.data = response.data.data;
                        } else {
                            return;
                        }
                    }

                    const historicalImages = response.data.map(item => {
                        const url = item.image_url;
                        return {
                            id: item.id,
                            url: url.startsWith('http')
                                ? url
                                : `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : '/' + url}`,
                            type: item.tool_name === 'image-to-video' ? 'video' : 'image',
                            //Add new fields
                            is_favorite: item.is_favorite,
                            is_disliked: item.is_disliked,
                            parameters: item.parameters,
                            tool_name: item.tool_name
                        };
                    });

                    setUploadedImages(prev => {
                        const localPending = prev.filter(img => img.isPending);

                        // Standardize keys for comparison
                        const existingIds = new Set(prev.filter(img => img.id).map(img => String(img.id)));

                        if (onlyFavorites) {
                            // If filter is ON, we must keep LOCAL items that might still be processing or just finished
                            // but also filter history items
                            const localRecent = prev.filter(img => !img.isPending && !existingIds.has(String(img.id)));
                            return [...localPending, ...localRecent, ...historicalImages.map(img => ({ ...img, isPending: false }))];
                        }

                        // If filter is OFF (standard), merge
                        const newImages = historicalImages
                            .filter(img => !existingIds.has(String(img.id)))
                            .map(img => ({ ...img, isPending: false }));

                        // Update existing images with new fields if they exist (status sync)
                        const updatedPrev = prev.map(pImg => {
                            const match = historicalImages.find(hImg => String(hImg.id) === String(pImg.id));
                            return match ? { ...pImg, ...match } : pImg;
                        });

                        return [...updatedPrev, ...newImages];
                    });
                }
            } catch (err) {
                console.error('[EditorPage] Failed to fetch history:', err);
            } finally {
                historyFetchedRef.current = true;
                setIsRefreshingHistory(false);
            }
        };

        fetchUserHistory();
    }, [user?.email, onlyFavorites, isRefreshingHistory]);

    //Track if we've successfully parsed the initial URL hash
    const hasInitializedHash = useRef(false);

    //-- DEEP LINKING LOGIC --
    //Synchronize State -> URL Hash
    useEffect(() => {
        //DO NOT update the hash until we've attempted to restore from it
        if (!hasInitializedHash.current) return;

        const tool = TOOLS.find(t => t.id === selectedToolId);
        const slug = tool?.slug || '';
        const activeImage = activeImageIndex !== null ? uploadedImages[activeImageIndex] : null;
        const imgId = activeImage?.id || '';

        const params = new URLSearchParams();
        if (slug) params.set('operation', slug);
        if (imgId) params.set('img', imgId);

        const newHash = params.toString() ? `#${params.toString()} ` : '';
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', `${window.location.pathname}${newHash} `);
        }
    }, [selectedToolId, activeImageIndex, uploadedImages]);

    //Synchronize URL Hash -> State (Restore on mount/history load/hash change)
    useEffect(() => {
        const parseHashAndRestoreState = () => {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                hasInitializedHash.current = true;
                return;
            }

            const params = new URLSearchParams(hash);
            const operation = params.get('operation');
            const imgId = params.get('img');
            const prompt = params.get('prompt');

            if (operation) {
                const tool = TOOLS.find(t => t.slug === operation);
                if (tool && tool.id !== selectedToolId) {
                    setSelectedToolId(tool.id);
                }

                // If specialized prompt is provided, pre-fill it in the relevant tool
                if (prompt) {
                    if (operation === 'photoshoot') {
                        updateToolSettings('photoshoot', { prompt });
                    } else if (operation === 'ai-edit') {
                        updateToolSettings('aiEdit', { prompt });
                    }
                }
            }

            if (imgId) {
                if (uploadedImages.length > 0) {
                    const index = uploadedImages.findIndex(img => String(img.id) === String(imgId));
                    if (index !== -1 && index !== activeImageIndex) {
                        setActiveImageIndex(index);
                        //Once we've found and set the image, we can safely allow state updates to sync back to hash
                        hasInitializedHash.current = true;
                    } else if (historyFetchedRef.current) {
                        //If history is fully loaded and we still didn't find the image, give up and allow sync
                        hasInitializedHash.current = true;
                    }
                } else if (historyFetchedRef.current) {
                    //No images found at all after fetch
                    hasInitializedHash.current = true;
                }
            } else {
                //No image ID in hash, we're done initializing (only tool to restore)
                hasInitializedHash.current = true;
            }
        };

        parseHashAndRestoreState();
        window.addEventListener('hashchange', parseHashAndRestoreState);
        return () => window.removeEventListener('hashchange', parseHashAndRestoreState);
    }, [uploadedImages, user?.email]);

    //Get selected tool object
    const selectedTool = TOOLS.find(t => t.id === selectedToolId);

    //Get first letter of name or email for profile
    const getInitial = () => {
        if (user?.full_name && user.full_name.trim()) {
            return user.full_name.trim()[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };
    //Handle AI Fashion Model generation
    const handleFashionGenerate = async (options) => {
        if (!user) {
            setShowPricing(true);
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Mark source image as pending
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (sourceIndex !== null && newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            const formData = new FormData();

            //Helper to handle both File objects and URLs
            const resolveImage = async (val, key) => {
                if (!val) return;
                if (val instanceof File) {
                    formData.append(key, val);
                } else if (typeof val === 'string' && val.startsWith('blob:')) {
                    const blob = await fetch(val).then(r => r.blob());
                    formData.append(key, blob, `${key}.png`);
                } else if (typeof val === 'string') {
                    formData.append(key, val);
                }
            };

            await resolveImage(options.productImage || activeImage, 'productImage');
            await resolveImage(options.topImage, 'topImage');
            await resolveImage(options.bottomImage, 'bottomImage');
            await resolveImage(options.customModelImage || options.selectedModelImage, 'modelImage');

            formData.append('modelStructureImage', options.selectedStructureImage || '');
            formData.append('prompt', options.prompt || '');
            formData.append('resolution', options.resolution || 'default');
            formData.append('aspectRatio', options.aspectRatio || '1:1');
            formData.append('imageCount', options.imageCount || 1);
            formData.append('provider', options.provider || 'freepik');

            const response = await api.post('/generator/fashion-generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = response.data.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                // Start Polling (using centralized pollTask)
                await pollTask(taskId, sourceIndex, 'ai_fashion_models');
            } else if (resultUrl) {
                // Fallback for immediate results
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                const fullUrl = resultUrl.startsWith('http') ? resultUrl : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                setUploadedImages(prev => {
                    const newImages = prev.map((img, i) =>
                        i === sourceIndex ? { ...img, isPending: false } : img
                    );
                    const id = resultData.generationId || resultData.assetId;
                    if (newImages.some(img => String(img.id) === String(id))) return newImages;

                    return [{
                        url: fullUrl,
                        isPending: false,
                        id: id,
                        type: 'image',
                        tool_name: 'ai_fashion_models'
                    }, ...newImages];
                });
                setActiveImageIndex(0);
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 1500);
                setIsGenerating(false);
            } else {
                throw new Error('No task ID or result URL returned');
            }
        } catch (err) {
            console.error('Fashion Generation Error:', err);
            setGenerationError(err.message || 'Failed to start generation');
            setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAIGenerate = async (options) => {
        //Special handling for AI Backgrounds (Tool ID 4)
        if (selectedToolId === 4) {
            const { backgrounds } = toolSettings;
            const { selectedTemplate, prompt, creativity, customBackground } = backgrounds;

            if (!activeImage) {
                setGenerationError('Please upload a product image first');
                return;
            }
            if (!selectedTemplate && !customBackground) {
                setGenerationError('Please select a background template or upload your own');
                return;
            }

            setIsGenerating(true);
            setGenerationError(null);

            const sourceIndex = activeImageIndex;
            //Set active image to pending (blur/scan effect)
            setUploadedImages(prev => {
                const newImages = [...prev];
                if (newImages[sourceIndex]) {
                    newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
                }
                return newImages;
            });
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 1500);

            try {
                //Convert active image to Blob/File
                const response = await fetch(activeImage, { headers: { 'ngrok-skip-browser-warning': '1' } });
                const blob = await response.blob();
                const file = new File([blob], "product.png", { type: "image/png" });

                const result = await generateBackgroundRealism({
                    image: file,
                    templateUrl: customBackground ? null : selectedTemplate?.url,
                    backgroundFile: customBackground,
                    prompt: prompt,
                    creativity: creativity,
                    imageCount: backgrounds.imageCount
                });

                if (result.success) {
                    // Refresh credits immediately since deduction already happened in backend
                    refreshUser();

                    const resultData = result.data || {};
                    const taskId = resultData.taskId || resultData.task_id;
                    const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                    if (taskId) {
                        // Start polling for the async task
                        await pollTask(taskId, sourceIndex, 'bg-seedream');
                    } else if (resultUrl) {
                        // Fallback for immediate results
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        const finalImageUrl = resultUrl.startsWith('http')
                            ? resultUrl
                            : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                        setUploadedImages(prev => {
                            const newImages = prev.map((img, i) =>
                                i === sourceIndex ? { ...img, isPending: false } : img
                            );
                            const id = resultData.generationId || resultData.assetId;
                            if (newImages.some(img => String(img.id) === String(id))) return newImages;

                            return [{
                                url: finalImageUrl,
                                isPending: false,
                                id: id,
                                type: 'image',
                                tool_name: 'bg-seedream'
                            }, ...newImages];
                        });
                        setActiveImageIndex(0);
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 1500);
                        setIsGenerating(false);
                    } else {
                        throw new Error('No task ID or result URL returned');
                    }
                } else {
                    throw new Error(result.message || 'Generation failed');
                }
            } catch (error) {
                console.error('AI Background error:', error);
                setGenerationError(error.message || 'Failed to generate background');
                setUploadedImages(prev =>
                    prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
                );
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        //Special handling for AI Edit (Tool ID 6)
        if (options.type === 'ai-edit') {
            const { prompt, imageCount } = options;
            if (!prompt) {
                setGenerationError('Please describe the changes you want to make');
                return;
            }

            setIsGenerating(true);
            setGenerationError(null);

            const sourceIndex = activeImageIndex;
            //Set active image to pending (blur/scan effect)
            setUploadedImages(prev => {
                const newImages = [...prev];
                if (newImages[sourceIndex]) {
                    newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
                }
                return newImages;
            });
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 1500);

            try {
                //Convert active image to Blob/File
                const response = await fetch(activeImage, { headers: { 'ngrok-skip-browser-warning': '1' } });
                const blob = await response.blob();
                const file = new File([blob], "edit_source.png", { type: "image/png" });

                const formData = new FormData();
                formData.append('image', file);
                formData.append('prompt', prompt);
                formData.append('imageCount', imageCount || 1);

                const apiRes = await api.post('/generator/edit-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (apiRes.data.success) {
                    // Refresh credits immediately since deduction already happened in backend
                    refreshUser();

                    const resultData = apiRes.data.data || {};
                    const taskId = resultData.taskId || resultData.task_id;
                    const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                    if (taskId) {
                        // Start polling for the async task
                        await pollTask(taskId, sourceIndex, 'ai-edit');
                    } else if (resultUrl) {
                        // Fallback for immediate results
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        let finalUrl = resultUrl;
                        if (!finalUrl.startsWith('http')) {
                            finalUrl = `${baseUrl.replace(/\/$/, '')}${finalUrl.startsWith('/') ? finalUrl : '/' + finalUrl} `;
                        }

                        setUploadedImages(prev => {
                            const newImages = prev.map((img, i) =>
                                i === sourceIndex ? { ...img, isPending: false } : img
                            );
                            return [{ url: finalUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                        });
                        setActiveImageIndex(0);
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 1500);
                        setIsGenerating(false);
                    } else {
                        throw new Error('No task ID or result URL returned');
                    }
                } else {
                    throw new Error(apiRes.data.message || 'Edit failed');
                }

            } catch (error) {
                console.error('AI Edit error:', error);
                setGenerationError(error.message || 'Failed to process edit');
                setUploadedImages(prev =>
                    prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
                );
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        //Blur Background (Tool ID 10)
        if (selectedToolId === 10) {
            if (!activeImage) {
                setGenerationError('Please upload an image first');
                return;
            }

            const sourceUrl = activeImage;
            setIsGenerating(true);
            setGenerationError(null);

            const sourceIndex = activeImageIndex;
            //Set active image to pending (blur/scan effect)
            setUploadedImages(prev => {
                const newImages = [...prev];
                if (newImages[sourceIndex]) {
                    newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
                }
                return newImages;
            });
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 1500);

            try {
                //Convert active image to Blob/File
                const response = await fetch(sourceUrl, { headers: { 'ngrok-skip-browser-warning': '1' } });
                const blob = await response.blob();
                const file = new File([blob], "blur_source.png", { type: "image/png" });

                const result = await blurBackground({
                    image: file,
                    type: toolSettings.blurBackground.type,
                    level: toolSettings.blurBackground.level,
                    style: toolSettings.blurBackground.style,
                    aspectRatio: toolSettings.blurBackground.aspectRatio
                });

                if (result.success) {
                    // Refresh credits immediately since deduction already happened in backend
                    refreshUser();

                    const resultData = result.data || {};
                    const taskId = resultData.taskId || resultData.task_id;
                    const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

                    if (taskId) {
                        // Start polling for the async task
                        await pollTask(taskId, sourceIndex, 'blur-background');
                    } else if (resultUrl) {
                        // Fallback for immediate results
                        const finalImageUrl = resultUrl.startsWith('http')
                            ? resultUrl
                            : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl} `;

                        setUploadedImages(prev => {
                            const newImages = prev.map((img, i) =>
                                i === sourceIndex ? { ...img, isPending: false } : img
                            );
                            return [{ url: finalImageUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                        });
                        setActiveImageIndex(0);
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 1500);
                        setIsGenerating(false);
                    } else {
                        throw new Error('No task ID or result URL returned');
                    }
                } else {
                    throw new Error(result.message || 'Blur background failed');
                }
            } catch (error) {
                console.error('Blur Background error:', error);
                setGenerationError(error.message || 'Failed to apply blur');
                setUploadedImages(prev =>
                    prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
                );
            } finally {
                setIsGenerating(false);
            }
            return;
        }



        const { prompt } = options;
        if (!prompt) {
            setGenerationError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedImages([]);

        try {
            //Upload product image if it's a local blob
            if (options.productImage && options.productImage.startsWith('blob:')) {
                try {
                    const blob = await fetch(options.productImage).then(r => r.blob());
                    const formData = new FormData();
                    formData.append('file', blob, 'product_canvas.png');

                    const uploadRes = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (uploadRes.data.success) {
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        options.productImage = `${baseUrl}${uploadRes.data.url}`;
                    }
                } catch (uploadErr) {
                    console.error("Failed to upload active image:", uploadErr);
                    //Proceed anyway? Or fail? proceeding might allow text-to-image
                }
            }

            const response = await generateAIImage(options);

            if (response.success && response.data?.images) {
                setGeneratedImages(response.data.images);

                //Also add generated images to the editor
                response.data.images.forEach(img => {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const imageUrl = `${baseUrl}${img.url}`;
                    handleImageUpload(imageUrl);
                    refreshUser();
                });

                //If we implemented a general placeholder for this, we'd remove it here.
                //But for generate (text-to-image), we usually just wait. 
                //Let's add a generic "Loading" placeholder for text-to-image too.
            } else {
                setGenerationError(response.message || 'Generation failed');
            }
        } catch (error) {
            console.error('AI Generation error:', error);
            setGenerationError(error.message || 'Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle AI Upscale
    const handleAIUpscale = async (options) => {
        if (!uploadedImages[activeImageIndex]) {
            setGenerationError('Please upload an image first');
            return;
        }

        const sourceUrl = uploadedImages[activeImageIndex].url;
        setIsGenerating(true);
        setGenerationError(null);

        //Set active image to pending (blur/scan effect)
        const sourceIndex = activeImageIndex;
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            const response = await fetch(sourceUrl, {
                headers: {
                    'ngrok-skip-browser-warning': '1'
                }
            });
            const blob = await response.blob();
            const file = new File([blob], "image.png", { type: "image/png" });

            const result = await upscaleAIImage({
                ...options,
                image: file
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'upscale');
                } else if (resultUrl) {
                    // Fallback for immediate results
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const finalImageUrl = resultUrl.startsWith('http')
                        ? resultUrl
                        : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        const id = resultData.generationId || resultData.assetId;
                        if (newImages.some(img => String(img.id) === String(id))) return newImages;

                        return [{
                            url: finalImageUrl,
                            isPending: false,
                            id: id,
                            type: 'image',
                            tool_name: 'upscale'
                        }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Upscale failed');
            }

        } catch (error) {
            console.error('Upscale error:', error);
            setGenerationError(error.message || 'Failed to upscale image');
            setUploadedImages(prev =>
                prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
            );
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Remove Background
    const handleRemoveBackground = async (options) => {
        const currentActiveIndex = activeImageIndex;
        if (currentActiveIndex === null || !uploadedImages[currentActiveIndex]) {
            setGenerationError('Please upload an image first');
            return;
        }

        const sourceUrl = uploadedImages[currentActiveIndex].url;
        console.log(`[Remove BG] Applying removing background to image at index ${currentActiveIndex}: ${sourceUrl}`);

        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = currentActiveIndex;
        //Mark source image as pending
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            //Convert current image URL to Blob/File
            const response = await fetch(sourceUrl, {
                headers: {
                    'ngrok-skip-browser-warning': '1'
                }
            });
            const blob = await response.blob();
            const file = new File([blob], "image.png", { type: "image/png" });

            const result = await removeBackground({
                ...options,
                image: file
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'remove-bg');
                } else if (resultUrl) {
                    // Fallback for immediate results
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const finalImageUrl = resultUrl.startsWith('http')
                        ? resultUrl
                        : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        const id = resultData.generationId || resultData.assetId;
                        if (newImages.some(img => String(img.id) === String(id))) return newImages;

                        return [{
                            url: finalImageUrl,
                            isPending: false,
                            id: id,
                            type: 'image',
                            tool_name: 'remove-bg'
                        }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Remove background failed');
            }

        } catch (error) {
            console.error('Remove BG error:', error);
            setGenerationError(error.message || 'Failed to remove background');
            //Reset pending on source
            setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Add Shadows
    const handleAddShadows = async (options) => {
        if (!activeImage) {
            setGenerationError('Please upload an image first');
            return;
        }

        //Capture source URL from the currently displayed active image
        const sourceUrl = activeImage;

        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Set active image to pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            //Convert current image URL to Blob/File
            const response = await fetch(sourceUrl, {
                headers: {
                    'ngrok-skip-browser-warning': '1'
                }
            });
            const blob = await response.blob();
            const file = new File([blob], "shadow_source.png", { type: "image/png" });

            const result = await addShadows({
                ...options,
                image: file
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'add-shadows');
                } else if (resultUrl) {
                    // Fallback for immediate results
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const finalImageUrl = resultUrl.startsWith('http')
                        ? resultUrl
                        : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        return [{ url: finalImageUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Shadow generation failed');
            }
        } catch (error) {
            console.error('Add Shadows error:', error);
            setGenerationError(error.message || 'Failed to add shadows');
            //Reset pending
            setUploadedImages(prev =>
                prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
            );
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Resize & Expand
    const handleResizeExpand = async (options) => {
        if (!activeImage) {
            setGenerationError('Please upload an image first');
            return;
        }

        const sourceUrl = activeImage;
        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Set active image to pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        console.log('[handleResizeExpand] Starting...', { sourceUrl, options });

        try {
            //Convert current image URL to Blob/File
            const timestamp = Date.now();
            const uniqueId = Math.random().toString(36).substring(7);
            let file;

            if (sourceUrl.startsWith('blob:') || sourceUrl.startsWith('data:')) {
                const cacheBustUrl = sourceUrl.includes('?')
                    ? `${sourceUrl}&_t=${timestamp}&_r=${uniqueId}`
                    : `${sourceUrl}?_t=${timestamp}&_r=${uniqueId}`;
                const response = await fetch(cacheBustUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                const blob = await response.blob();
                const fileName = `resize_source_${timestamp}_${uniqueId}.png`;
                file = new File([blob], fileName, { type: "image/png", lastModified: timestamp });
            } else {
                try {
                    let fetchUrl = sourceUrl;
                    if (sourceUrl.includes('/uploads/')) {
                        const urlParts = sourceUrl.split('/uploads/');
                        fetchUrl = `/uploads/${urlParts[1]}`;
                    }
                    const separator = fetchUrl.includes('?') ? '&' : '?';
                    const cacheBustUrl = `${fetchUrl}${separator}_t=${timestamp}&_r=${uniqueId}`;
                    const response = await fetch(cacheBustUrl, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    });
                    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                    const blob = await response.blob();
                    const fileName = `resize_source_${timestamp}_${uniqueId}.png`;
                    file = new File([blob], fileName, { type: "image/png", lastModified: timestamp });
                } catch (fetchErr) {
                    console.error("Direct fetch failed", fetchErr);
                    throw new Error(`Failed to load image: ${fetchErr.message}`);
                }
            }

            //Get original image dimensions
            const img = new Image();
            img.src = sourceUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;

            const result = await resizeExpand({
                image: file,
                mode: options.mode || 'Crop',
                targetWidth: options.targetWidth,
                targetHeight: options.targetHeight,
                prompt: options.prompt,
                originalWidth,
                originalHeight,
                left: options.left,
                right: options.right,
                top: options.top,
                bottom: options.bottom
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'resize_expand');
                } else if (resultUrl) {
                    // Immediate result (Crop/Resize/Canvas modes)
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const fullUrl = resultUrl.startsWith('http')
                        ? resultUrl
                        : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        return [{ url: fullUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Resize/Expand failed');
            }
        } catch (error) {
            console.error('Resize Expand error:', error);
            setGenerationError(error.message || 'Failed to resize/expand image');
            setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Image to Video
    const handleGenerateVideo = async (videoSettings) => {
        if (!activeImage) {
            setGenerationError('Please select an image first');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Set active image to pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            //Convert activeImage to file
            const response = await fetch(activeImage, {
                headers: { 'ngrok-skip-browser-warning': '1' }
            });
            const blob = await response.blob();
            const file = new File([blob], 'image.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);
            formData.append('duration', parseInt(videoSettings.duration?.replace('s', '') || '5'));
            formData.append('prompt', videoSettings.prompt || '');
            formData.append('cfg_scale', 0.5);

            const result = await api.post('/generator/image-to-video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (result.data.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const videoUrl = resultData.url || resultData.videoUrl;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'image-to-video', { type: 'video' });
                } else if (videoUrl) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const fullUrl = videoUrl.startsWith('http') ? videoUrl : `${baseUrl.replace(/\/$/, '')}${videoUrl.startsWith('/') ? videoUrl : '/' + videoUrl}`;

                    //Add new image and reset pending on original
                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        return [{
                            url: fullUrl,
                            isPending: false,
                            id: resultData.generationId || resultData.assetId,
                            type: 'video',
                            tool: 'image-to-video',
                            tool_name: 'image-to-video'
                        }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                }
            }
        } catch (error) {
            console.error('[Image to Video] Error:', error);
            setGenerationError(error.response?.data?.message || error.message || 'Video generation failed');
            //Reset pending on error
            setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Fix Light & Colors
    const handleFixLight = async (options) => {
        //Get the current active image directly from the array to ensure we have the latest
        const currentActiveImage = activeImageIndex !== null && uploadedImages[activeImageIndex]
            ? uploadedImages[activeImageIndex].url
            : null;

        if (!currentActiveImage) {
            setGenerationError('Please upload an image first');
            return;
        }

        const sourceUrl = currentActiveImage;
        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Set active image to pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        console.log('[handleFixLight] Starting...', {
            sourceUrl,
            activeImageIndex,
            totalImages: uploadedImages.length,
            currentImageUrl: sourceUrl.substring(0, 100),
            options: { ...options, referenceImage: options.referenceImage ? 'File Present' : 'None' }
        });

        try {
            //Convert current image URL to Blob/File
            //Use cache-busting to ensure we always get the latest image
            const timestamp = Date.now();
            const uniqueId = Math.random().toString(36).substring(7);
            let file;

            if (sourceUrl.startsWith('blob:') || sourceUrl.startsWith('data:')) {
                //For blob/data URLs, fetch with cache-busting
                const cacheBustUrl = sourceUrl.includes('?')
                    ? `${sourceUrl}&_t=${timestamp}&_r=${uniqueId}`
                    : `${sourceUrl}?_t=${timestamp}&_r=${uniqueId}`;
                const response = await fetch(cacheBustUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                const blob = await response.blob();
                const fileName = `relight_source_${timestamp}_${uniqueId}.png`;
                file = new File([blob], fileName, { type: "image/png", lastModified: timestamp });

                //Calculate a simple hash of the blob to verify it's different
                const blobHash = await blob.arrayBuffer().then(buf => {
                    const arr = new Uint8Array(buf);
                    let hash = 0;
                    for (let i = 0; i < Math.min(100, arr.length); i++) {
                        hash = ((hash << 5) - hash) + arr[i];
                        hash = hash & hash;
                    }
                    return Math.abs(hash).toString(36).substring(0, 8);
                });

                console.log('[handleFixLight] Loaded image from blob/data URL:', {
                    fileName,
                    size: blob.size,
                    type: blob.type,
                    blobHash,
                    sourceUrl: sourceUrl.substring(0, 50) + '...',
                    timestamp
                });
            } else {
                try {
                    //If it's a remote URL from our server (contains/uploads/), force relative path to use proxy
                    let fetchUrl = sourceUrl;
                    if (sourceUrl.includes('/uploads/')) {
                        const urlParts = sourceUrl.split('/uploads/');
                        fetchUrl = `/uploads/${urlParts[1]}`;
                    }

                    //Add cache-busting query parameters
                    const separator = fetchUrl.includes('?') ? '&' : '?';
                    const cacheBustUrl = `${fetchUrl}${separator}_t=${timestamp}&_r=${uniqueId}`;

                    //Fetch with cache-busting headers
                    const response = await fetch(cacheBustUrl, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    });
                    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                    const blob = await response.blob();
                    const fileName = `relight_source_${timestamp}_${uniqueId}.png`;
                    file = new File([blob], fileName, { type: "image/png", lastModified: timestamp });

                    //Calculate a simple hash of the blob to verify it's different
                    const blobHash = await blob.arrayBuffer().then(buf => {
                        const arr = new Uint8Array(buf);
                        let hash = 0;
                        for (let i = 0; i < Math.min(100, arr.length); i++) {
                            hash = ((hash << 5) - hash) + arr[i];
                            hash = hash & hash;
                        }
                        return Math.abs(hash).toString(36).substring(0, 8);
                    });

                    console.log('[handleFixLight] Loaded image from URL:', {
                        fileName,
                        size: blob.size,
                        type: blob.type,
                        blobHash,
                        sourceUrl: fetchUrl.substring(0, 50) + '...',
                        timestamp
                    });
                } catch (fetchErr) {
                    console.error("Direct fetch failed", fetchErr);
                    throw new Error(`Failed to load image: ${fetchErr.message}. If using ngrok, ensure the tunnel is active.`);
                }
            }

            //Handle reference image if it's a file
            let referenceImageFile = options.referenceImage;

            //Log image file info before sending - calculate hash to verify uniqueness
            const fileHash = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const arr = new Uint8Array(e.target.result);
                    let hash = 0;
                    for (let i = 0; i < Math.min(200, arr.length); i++) {
                        hash = ((hash << 5) - hash) + arr[i];
                        hash = hash & hash;
                    }
                    resolve(Math.abs(hash).toString(36).substring(0, 12));
                };
                reader.readAsArrayBuffer(file);
            });

            console.log('[handleFixLight] Sending image file:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                fileHash,
                sourceUrl: sourceUrl.substring(0, 100),
                activeImageIndex,
                totalUploadedImages: uploadedImages.length
            });

            const result = await fixLightColors({
                ...options,
                image: file,
                referenceImage: referenceImageFile,
                _timestamp: Date.now(),//Add timestamp to ensure uniqueness
                _fileHash: fileHash//Add hash to track which image
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'fix_light');
                } else if (resultUrl) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const fullUrl = resultUrl.startsWith('http') ? resultUrl : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    //Add new image and reset pending on original
                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        return [{ url: fullUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                    });
                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Fix light failed');
            }
        } catch (error) {
            console.error('Fix Light error:', error);
            setGenerationError(error.message || 'Failed to fix light and colors');
            setUploadedImages(prev => prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img));
        } finally {
            setIsGenerating(false);
        }
    };

    //Handle Add Text
    const handleAddText = async (options) => {
        if (!activeImage) {
            setGenerationError('Please select an image first');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        const sourceIndex = activeImageIndex;
        //Set active image to pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);

        try {
            //Convert current image URL to Blob/File
            const response = await fetch(activeImage, {
                headers: { 'ngrok-skip-browser-warning': '1' }
            });
            const blob = await response.blob();
            const file = new File([blob], "text_source.png", { type: "image/png" });

            const result = await addText({
                ...options,
                image: file
            });

            if (result.success) {
                // Refresh credits immediately since deduction already happened in backend
                refreshUser();

                const resultData = result.data || {};
                const taskId = resultData.taskId || resultData.task_id;
                const resultUrl = resultData.url || resultData.file_url || resultData.imageUrl || resultData.image_url;

                if (taskId) {
                    // Start polling for the async task
                    await pollTask(taskId, sourceIndex, 'add-text');
                } else if (resultUrl) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const finalImageUrl = resultUrl.startsWith('http')
                        ? resultUrl
                        : `${baseUrl.replace(/\/$/, '')}${resultUrl.startsWith('/') ? resultUrl : '/' + resultUrl}`;

                    //Add new image and reset pending on original
                    setUploadedImages(prev => {
                        const newImages = prev.map((img, i) =>
                            i === sourceIndex ? { ...img, isPending: false } : img
                        );
                        return [{ url: finalImageUrl, isPending: false, id: resultData.generationId || resultData.assetId }, ...newImages];
                    });

                    setActiveImageIndex(0);
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1500);
                    setIsGenerating(false);
                } else {
                    throw new Error('No task ID or result URL returned');
                }
            } else {
                throw new Error(result.message || 'Add text failed');
            }
        } catch (error) {
            console.error('Add Text error:', error);
            setGenerationError(error.message || 'Failed to add text');
            //Reset pending
            setUploadedImages(prev =>
                prev.map((img, i) => i === sourceIndex ? { ...img, isPending: false } : img)
            );
        } finally {
            setIsGenerating(false);
        }
    };


    const handleToggleFavorite = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await api.patch(`/generator/history/${id}/favorite`);
            if (res.data.success) {
                setUploadedImages(prev => prev.map(img =>
                    img.id === id ? { ...img, is_favorite: res.data.is_favorite } : img
                ));
            }
        } catch (err) {
            console.error('Toggle favorite error:', err);
        }
    };

    const handleToggleDislike = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await api.patch(`/generator/history/${id}/dislike`);
            if (res.data.success) {
                setUploadedImages(prev => prev.map(img =>
                    img.id === id ? { ...img, is_disliked: res.data.is_disliked } : img
                ));
            }
        } catch (err) {
            console.error('Toggle dislike error:', err);
        }
    };

    /**
       * Handle Improve Prompt
       */
    const handleImprovePrompt = async (toolKey, currentPrompt, type = 'image') => {
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationError(null);

        try {
            console.log(`[EditorPage] Calling improvePrompt for ${toolKey}`, { currentPrompt, type });
            const result = await improvePrompt(currentPrompt, type);

            if (result.success && result.improvedPrompt) {
                console.log(`[EditorPage] Prompt improved for ${toolKey}:`, result.improvedPrompt);
                updateToolSettings(toolKey, { prompt: result.improvedPrompt });
            } else {
                throw new Error(result.message || 'Failed to improve prompt');
            }
        } catch (error) {
            console.error('[Improve Prompt Error]:', error);
            setGenerationError(error.message || 'An error occurred while improving prompt');
        } finally {
            setIsGenerating(false);
        }
    };

    //Check if image was passed from dashboard
    useEffect(() => {
        if (location.state?.uploadedImage) {
            handleImageUpload(location.state.uploadedImage);
        }
    }, [location.state]);

    //Get image dimensions when active image changes
    useEffect(() => {
        if (activeImageIndex !== null && uploadedImages[activeImageIndex]) {
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.src = uploadedImages[activeImageIndex].url;
        }
    }, [activeImageIndex, uploadedImages]);

    const handleImageUpload = (imageUrl, isPending = false, id = null) => {
        const imageObj = {
            url: imageUrl,
            isPending,
            id,
            type: imageUrl.endsWith('.mp4') || imageUrl.includes('video') ? 'video' : 'image'
        };
        setUploadedImages(prev => {
            if (id && prev.some(img => String(img.id) === String(id))) return prev;
            return [imageObj, ...prev];
        });
        setActiveImageIndex(0);
        setIsScanning(true);

        //Add to history
        setHistoryStack(prev => [...prev.slice(0, historyIndex + 1), imageUrl]);
        setHistoryIndex(prev => prev + 1);

        //Always clear scanning state after 1.5s, regardless of isPending
        //This allows the blurred loading state to take over for pending images
        setTimeout(() => {
            setIsScanning(false);
            refreshUser();
        }, 1500);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (uploadContext && uploadContext.startsWith('fashion.')) {
                const field = uploadContext.split('.')[1];
                updateToolSettings('fashion', { [field]: file });
                setUploadContext(null);
            } else {
                try {
                    setIsScanning(true);
                    const response = await uploadToHistory(file);
                    if (response.success && response.data?.url) {
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                        const finalImageUrl = response.data.url.startsWith('http')
                            ? response.data.url
                            : `${baseUrl.replace(/\/$/, '')}${response.data.url.startsWith('/') ? response.data.url : '/' + response.data.url}`;

                        handleImageUpload(finalImageUrl, false, response.data.generationId);
                    }
                } catch (error) {
                    console.error('Upload Error:', error);
                    setGenerationError(error.message || 'Failed to upload image');
                } finally {
                    setIsScanning(false);
                }
            }
        }
        e.target.value = '';
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            try {
                setIsScanning(true);
                const response = await uploadToHistory(file);
                if (response.success && response.data?.url) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const finalImageUrl = response.data.url.startsWith('http')
                        ? response.data.url
                        : `${baseUrl.replace(/\/$/, '')}${response.data.url.startsWith('/') ? response.data.url : '/' + response.data.url}`;

                    handleImageUpload(finalImageUrl, false, response.data.generationId);
                }
            } catch (error) {
                console.error('Upload Error:', error);
                setGenerationError(error.message || 'Failed to upload image');
            } finally {
                setIsScanning(false);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < historyStack.length - 1) {
            setHistoryIndex(prev => prev + 1);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 25));
    };

    //Callback for Mystic Generator success
    const handleMysticSuccess = (imageUrl, generationId) => {
        console.log('[EditorPage] Mystic generation success! URL:', imageUrl, 'ID:', generationId);

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const finalImageUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `${baseUrl.replace(/\/$/, '')}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;

        //Prepend result and clear pending states on all images (since we no longer use a generic placeholder for Mystic)
        setUploadedImages(prev => {
            const newImages = prev.map(img => ({ ...img, isPending: false }));
            if (newImages.some(img => String(img.id) === String(generationId))) return newImages;
            return [{
                url: finalImageUrl,
                isPending: false,
                id: generationId,
                type: 'image',
                tool_name: 'ai-photoshoot'
            }, ...newImages];
        });
        //Set as active image (index 0 since we either replaced or prepended it)
        setActiveImageIndex(0);
        refreshUser();
        console.log('[EditorPage] Set active image index to 0');
    };

    //Callback for Mystic Generator start
    const handleMysticStart = (data) => {
        if (data && data.type === 'ai-edit') {
            handleAIGenerate(data);
            return;
        }

        const sourceIndex = activeImageIndex;
        //Mark active image as pending (blur/scan effect)
        setUploadedImages(prev => {
            const newImages = [...prev];
            if (sourceIndex !== null && newImages[sourceIndex]) {
                newImages[sourceIndex] = { ...newImages[sourceIndex], isPending: true };
            }
            return newImages;
        });
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);
    };

    const handleDownload = async (format) => {
        if (activeImage) {
            const isVideo = activeImageObject?.type === 'video';
            const defaultFormat = isVideo ? 'mp4' : 'png';
            const finalFormat = format || defaultFormat;
            const prefix = isVideo ? 'video' : 'image';

            try {
                const response = await fetch(activeImage);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${prefix}-${Date.now()}.${finalFormat}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                //Clean up the blob URL
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            } catch (err) {
                console.error('[EditorPage] Download failed:', err);
                //Fallback to direct link if fetch fails
                const link = document.createElement('a');
                link.href = activeImage;
                link.target = '_blank';
                link.download = `${prefix}.${finalFormat}`;
                link.click();
            }
        }
        setShowDownloadMenu(false);
    };

    const handleDelete = () => {
        if (activeImageIndex !== null) {
            const newImages = uploadedImages.filter((_, i) => i !== activeImageIndex);
            setUploadedImages(newImages);
            setActiveImageIndex(newImages.length > 0 ? 0 : null);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!activeImage) return;

        setIsSavingTemplate(true);
        try {
            //Navigate to AI backgrounds tool (ID 4) with the current image
            setSelectedToolId(4);
            //Set to My Templates tab and upload the image
            updateToolSettings('backgrounds', {
                templateTab: 'my',
                uploadedImage: activeImage,
                customBackground: activeImage
            });
        } catch (err) {
            console.error('[EditorPage] Save template error:', err);
        } finally {
            setTimeout(() => setIsSavingTemplate(false), 500);
        }
    };

    const handleAnimate = async () => {
        if (!activeImage) return;

        setIsAnimating(true);
        try {
            //Navigate to Image to Video tool (ID 13) with the current image
            setSelectedToolId(13);
            //The video tool will automatically use the active image
        } catch (err) {
            console.error('[EditorPage] Animate error:', err);
        } finally {
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    const handleDeleteGeneration = (id) => {
        setDeletingImageId(id);
    };

    const confirmDeleteGeneration = async () => {
        if (!deletingImageId) return;
        const id = deletingImageId;

        try {
            const response = await api.delete(`/generator/user-generations/${id}`);
            if (response.data.success) {
                setUploadedImages(prev => prev.filter(img => img.id !== id));
                // If the active image was deleted, reset index
                if (activeImageIndex !== null && uploadedImages[activeImageIndex]?.id === id) {
                    setActiveImageIndex(null);
                }
                setDeletingImageId(null);
            } else {
                alert('Failed to delete generation');
            }
        } catch (err) {
            console.error('[EditorPage] Delete error:', err);
            alert('Error deleting generation');
        }
    };

    const handleToolSelect = (toolId) => {
        setSelectedToolId(toolId);
        setMobileTab('canvas');
    };



    const activeImage = activeImageIndex !== null ? uploadedImages[activeImageIndex]?.url : null;
    const activeImageObject = activeImageIndex !== null ? uploadedImages[activeImageIndex] : null;
    const isActiveImagePending = activeImageIndex !== null ? uploadedImages[activeImageIndex]?.isPending : false;

    //Group tools for rendering
    const group1Tools = TOOLS.filter(t => t.group === 1);
    const group2Tools = TOOLS.filter(t => t.group === 2);
    const group3Tools = TOOLS.filter(t => t.group === 3);

    return (
        <div className="h-screen flex flex-col bg-[#F5F8FF] overflow-hidden font-['Manrope'] editor-main-layout">
            <style>{`
                body {
                    font-family: 'Manrope', sans-serif;
                }
                
                h1, h2, h3, h4, .font-tight {
                    font-family: 'Sora', sans-serif;
                }

                @keyframes scan-line {
                    0% { top: 100%; }
                    100% { top: -5%; }
                }
                .animate-scan-line {
                    animation: scan-line 1.5s ease-in-out forwards;
                }
                .checkerboard-bg {
                    background-image: 
                        linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                    background-color: #f8fafc;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .premium-shadow {
                    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
                }
                @keyframes dot-pulse {
                    0%, 100% { transform: scale(0.6); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                .dot-loading {
                    animation: dot-pulse 1.2s infinite ease-in-out;
                }
                .dot-delay-1 { animation-delay: 0.2s; }
                .dot-delay-2 { animation-delay: 0.4s; }
                .dot-delay-3 { animation-delay: 0.6s; }
                .dot-delay-4 { animation-delay: 0.8s; }
                .dot-delay-5 { animation-delay: 1.0s; }
                @keyframes button-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(77, 150, 255, 0); }
                    50% { box-shadow: 0 0 25px 8px rgba(77, 150, 255, 0.8); }
                }
                .animate-button-glow {
                    animation: button-glow 3s infinite ease-in-out;
                }
                @keyframes border-flow {
                    from { background-position: 0% 0%; }
                    to { background-position: 100% 0%; }
                }
                .animate-border-flow {
                    position: relative;
                    border: 6px solid #F1F5F9;
                    border-radius: 1rem;
                    isolation: isolate;
                    overflow: visible;
                }
                .animate-border-flow::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: inherit;
                    padding: 6px;
                    background: linear-gradient(90deg, transparent 20%, #4D96FF 50%, transparent 80%);
                    background-size: 200% 100%;
                    animation: border-flow 2s ease-in-out infinite alternate;
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
            `}</style>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

            {/* Header */}
            <header className="h-16 px-3 lg:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-[60] border-b border-[#F1F5F9]/80">
                <div className="flex items-center gap-2 lg:gap-6">
                    <Link to="/" className="p-2 lg:p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg lg:rounded-xl text-[#64748B] transition-all hover:scale-105 active:scale-95">
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </Link>
                    <div className="hidden lg:flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 text-[13px] text-[#64748B] font-medium">
                            <Link to="/dashboard" className="hover:text-[#4D96FF] transition-colors">Dashboard</Link>
                            <svg className="w-3 h-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            <button
                                onClick={() => setSelectedToolId(null)}
                                className="text-[#0F172A] hover:text-[#4D96FF] transition-colors font-semibold"
                            >
                                Studio - all tools
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Credits Display - Now visible on mobile with compact styling */}
                    <div className="flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 bg-[#F8FAFC] rounded-lg lg:rounded-xl border-2 border-[#FFFFFF] shadow-sm">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4 text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="text-[10px] lg:text-xs font-bold text-[#0F172A]">
                            {(user?.credits?.total_credits ?? 0) - (user?.credits?.used_credits ?? 0)}
                            <span className="hidden lg:inline text-[#64748B] font-medium ml-0.5"> Credits left</span>
                        </span>
                    </div>

                    {/* Upgrade Button - Different text on mobile */}
                    <button
                        onClick={() => setShowPricing(true)}
                        className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-1.5 lg:py-2 bg-[#4D96FF] text-white text-[10px] lg:text-xs font-bold rounded-xl lg:rounded-2xl hover:bg-[#3b82f6] transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-200/20 border-2 border-[#FFFFFF]"
                    >
                        <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        <span className="lg:hidden">Upgrade</span>
                        <span className="hidden lg:inline">Add Credits</span>
                    </button>

                    <div className="hidden lg:block w-px h-6 bg-[#F1F5F9]"></div>

                    <div className="flex items-center gap-3 pl-1">
                        <ProfileDropdown
                            user={user}
                            onSettingsClick={() => window.location.href = '/dashboard?tab=settings'}
                            onLogout={logout}
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-0 lg:p-4 gap-0 lg:gap-4 relative editor-main-content">
                {/* Unified Sidebar Container */}
                <div className={`
                    w-full lg:w-[22rem] flex flex-col bg-white/60 backdrop-blur-xl lg:rounded-[24px] border-r lg:border border-white overflow-hidden premium-shadow transition-all duration-300 editor-left-sidebar
                    ${mobileTab === 'tools' ? 'flex' : 'hidden lg:flex'}
                `}>
                    {selectedTool ? (
                        /* Tool Detail View Container */
                        <div className="flex flex-1 overflow-hidden">
                            {/* Navigation Rail */}
                            <div className="w-[88px] flex-none flex flex-col bg-white border-r border-[#F1F5F9] overflow-y-auto no-scrollbar py-4">
                                <div className="flex flex-col gap-2 px-2">
                                    {/* Back to Home Button Removed */}
                                    {/* <div className="h-px bg-gray-100 mx-2 mb-2"></div> */}

                                    {TOOLS.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedToolId(t.id)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${selectedToolId === t.id
                                                ? 'bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100'
                                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                                }`}
                                            title={t.title}
                                        >
                                            <div
                                                className={`w-6 h-6 transition-all ${selectedToolId === t.id ? '' : ''}`}
                                                style={{
                                                    maskImage: `url(${t.icon})`,
                                                    WebkitMaskImage: `url(${t.icon})`,
                                                    maskSize: 'contain',
                                                    WebkitMaskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    WebkitMaskPosition: 'center',
                                                    backgroundColor: selectedToolId === t.id ? '#4D96FF' : '#94A3B8'
                                                }}
                                            />
                                            <span className="text-[9px] font-medium text-center leading-tight max-w-full truncate px-1">
                                                {t.shortName}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                <ToolDetailsPanel
                                    tool={selectedTool}
                                    onBack={() => setSelectedToolId(null)}
                                    settings={toolSettings}
                                    onUpdate={updateToolSettings}
                                    onGenerate={handleAIGenerate}
                                    onUpscale={handleAIUpscale}
                                    onMysticSuccess={handleMysticSuccess}
                                    onStart={handleMysticStart}
                                    onRemoveBg={handleRemoveBackground}
                                    onAddShadows={handleAddShadows}
                                    onFixLight={handleFixLight}
                                    onResizeExpand={handleResizeExpand}
                                    onOpenAssetModal={(type) => setAssetModal({ isOpen: true, type })}
                                    activeImage={activeImage}
                                    imageSize={imageSize}
                                    isGenerating={isGenerating}
                                    generatedImages={generatedImages}
                                    generationError={generationError}
                                    onUpload={(field) => {
                                        setUploadContext(field ? `fashion.${field}` : null);
                                        fileInputRef.current?.click();
                                    }}
                                    onFashionGenerate={handleFashionGenerate}
                                    onGenerateVideo={handleGenerateVideo}
                                    onAddText={handleAddText}
                                    onImprovePrompt={handleImprovePrompt}
                                    fashionAssets={fashionAssets}
                                    user={user}
                                    onRefreshCredits={refreshUser}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Unified List View */
                        <div className="flex flex-col flex-1 overflow-hidden bg-white/40">
                            {/* Header Removed as requested */}
                            <div className="flex-1 overflow-y-auto no-scrollbar py-6">
                                {/* Retouch & Fix group */}
                                <div className="px-2">
                                    {group1Tools.map(tool => (
                                        <StudioToolRow
                                            key={tool.id}
                                            tool={tool}
                                            onClick={() => handleToolSelect(tool.id)}
                                        />
                                    ))}
                                </div>

                                {/* Separator */}
                                <div className="h-px bg-gray-200 mx-4 my-2 opacity-50"></div>

                                {/* Dynamic Editing group */}
                                <div className="px-2">
                                    {group2Tools.map(tool => (
                                        <StudioToolRow
                                            key={tool.id}
                                            tool={tool}
                                            onClick={() => handleToolSelect(tool.id)}
                                        />
                                    ))}
                                </div>

                                {/* Separator */}
                                <div className="h-px bg-gray-200 mx-4 my-2 opacity-50"></div>

                                {/* Pro Generations group */}
                                <div className="px-2">
                                    {group3Tools.map(tool => (
                                        <StudioToolRow
                                            key={tool.id}
                                            tool={tool}
                                            onClick={() => handleToolSelect(tool.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Canvas Area (Center) */}
                <div className={`flex-1 flex flex-col lg:overflow-hidden overflow-y-auto relative editor-canvas-area ${mobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'}`}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Mobile Switcher Bar (Top Row) */}
                    <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-[#F1F5F9] shrink-0 z-30">
                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Creations</span>
                        {/* History/Video Toggle */}
                        <div className="flex items-center gap-1 shrink-0 p-1 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                            <button
                                onClick={() => setActiveSidebarTab('Creations')}
                                className={`px-3 py-1.5 rounded-[8px] text-[9px] font-black transition-all ${activeSidebarTab === 'Creations' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-[#64748B] hover:bg-white'}`}
                            >
                                HISTORY
                            </button>
                            <button
                                onClick={() => setActiveSidebarTab('Videos')}
                                className={`px-3 py-1.5 rounded-[8px] text-[9px] font-black transition-all ${activeSidebarTab === 'Videos' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-[#64748B] hover:bg-white'}`}
                            >
                                VIDEOS
                            </button>
                        </div>
                    </div>

                    {/* Mobile Creations Thumbnails (Bottom Row) */}
                    <div className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border-b overflow-x-auto no-scrollbar shrink-0 shadow-sm z-30 min-h-[80px]">
                        {/* Horizontal Scroll of Thumbnails */}
                        <div className="flex gap-2 w-full items-center">
                            {uploadedImages.length > 0 ? (
                                uploadedImages
                                    .map((img, originalIndex) => ({ ...img, originalIndex }))
                                    .filter(image =>
                                        activeSidebarTab === 'Videos'
                                            ? image.type === 'video'
                                            : image.type !== 'video'
                                    )
                                    .map((image) => (
                                        <div
                                            key={image.id || image.url || image.originalIndex}
                                            onClick={() => setActiveImageIndex(image.originalIndex)}
                                            className={`
                                                relative shrink-0 w-14 h-14 rounded-[12px] overflow-hidden border-2 transition-all shadow-sm
                                                ${activeImageIndex === image.originalIndex ? 'border-[#4D96FF] scale-105 shadow-md' : 'border-[#F1F5F9] opacity-80'}
                                            `}
                                        >
                                            <img src={image.url} alt="" className="w-full h-full object-cover" />
                                            {image.isPending && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                                                    <div className="w-3 h-3 border-2 border-[#4D96FF]/20 border-t-[#4D96FF] rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <div className="w-full text-center text-[10px] text-[#94A3B8] font-black uppercase tracking-widest py-2 italic opacity-50">
                                    No {activeSidebarTab === 'Videos' ? 'Videos' : 'Images'} Found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Show active image in center for editing, or upload zone if no image */}
                    {activeImage ? (
                        <div className="flex-1 flex flex-col lg:overflow-hidden">
                            {/* Full-Width Toolbar */}
                            <div className="lg:relative sticky top-0 z-[55] flex flex-wrap items-center justify-between px-2 sm:px-3 lg:px-6 py-1.5 lg:py-3 bg-white/80 backdrop-blur-xl border-b border-white lg:shadow-md gap-y-2 gap-x-1.5 sm:gap-x-2 lg:gap-0 overflow-visible no-scrollbar shrink-0">
                                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 lg:flex-none py-0.5 lg:py-1">
                                    {/* Interactive Controls for Remove Background */}
                                    {selectedToolId === 2 && toolSettings.removeBg?.mode === 'Interactive' && (
                                        <>
                                            <div className="flex gap-1 mr-1.5 border-r border-[#F1F5F9] pr-1.5 shrink-0">
                                                <button
                                                    onClick={() => updateToolSettings('removeBg', { tool: 'add' })}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${toolSettings.removeBg.tool === 'add' ? 'bg-green-100 text-green-600 shadow-inner' : 'hover:bg-green-50 text-green-500'}`}
                                                    title="Add to selection"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => updateToolSettings('removeBg', { tool: 'remove' })}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${toolSettings.removeBg.tool === 'remove' ? 'bg-red-100 text-red-600 shadow-inner' : 'hover:bg-red-50 text-red-500'}`}
                                                    title="Remove from selection"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                                </button>
                                            </div>
                                        </>
                                    )}



                                    {/* Action Buttons Container - Scrollable on mobile */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Save as Template Button */}
                                        <button
                                            onClick={handleSaveAsTemplate}
                                            disabled={isSavingTemplate}
                                            className="flex items-center gap-2 px-3 lg:px-4 h-9 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#0F172A] hover:text-[#4D96FF] transition-all border-2 border-[#FFFFFF] shadow-sm text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isSavingTemplate ? (
                                                <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div></div>
                                            ) : (
                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg><span className="hidden md:inline">Save as Template</span></>
                                            )}
                                        </button>

                                        {/* Animate Button */}
                                        <button
                                            onClick={handleAnimate}
                                            disabled={isAnimating}
                                            className="flex items-center gap-2 px-3 lg:px-4 h-9 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#0F172A] hover:text-[#4D96FF] transition-all border-2 border-[#FFFFFF] shadow-sm text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isAnimating ? (
                                                <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div><div className="w-1.5 h-1.5 bg-[#0F172A] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div></div>
                                            ) : (
                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="hidden md:inline">Animate</span></>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Fullscreen Zoom Control */}
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="w-12 h-9 flex items-center justify-center bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#0F172A] hover:text-[#4D96FF] transition-all border-2 border-[#FFFFFF] shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </button>

                                    <div className="w-px h-6 bg-[#F1F5F9] mx-1"></div>

                                    {/* Download Popover */}
                                    <div className="relative group/download">
                                        <button
                                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#4D96FF] text-white text-xs font-bold rounded-xl hover:bg-[#3b82f6] transition-all shadow-md shadow-blue-100/50 border-2 border-[#F5F8FF]"
                                        >
                                            <span>Download</span>
                                            <svg className={`w-3.5 h-3.5 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                        </button>

                                        {showDownloadMenu && (
                                            <div className="absolute top-full mt-2 right-0 bg-white border border-[#F1F5F9] rounded-2xl shadow-2xl py-2 z-[100] min-w-[120px] overflow-hidden premium-shadow">
                                                {(activeImageObject?.type === 'video' ? ['mp4', 'mkv'] : ['png', 'jpg', 'webp']).map(format => (
                                                    <button
                                                        key={format}
                                                        onClick={() => handleDownload(format)}
                                                        className="w-full px-4 py-2 text-left text-xs font-bold text-[#64748B] hover:text-[#4D96FF] hover:bg-[#F5F8FF] transition-colors uppercase tracking-wider"
                                                    >
                                                        {format}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleDelete}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all border border-red-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 min-h-[40vh] lg:min-h-0 checkerboard-bg flex items-start justify-center p-8 lg:p-12 lg:overflow-auto overflow-visible no-scrollbar relative">
                                <div
                                    className="relative premium-shadow transition-transform duration-300 ease-out"
                                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                >
                                    {activeImageObject?.type === 'video' ? (
                                        <div className="relative group/canvas overflow-hidden rounded-[24px]">
                                            <video
                                                src={activeImage}
                                                controls
                                                autoPlay
                                                loop
                                                muted
                                                onLoadedData={() => setIsVideoLoading(false)}
                                                onLoadStart={() => setIsVideoLoading(true)}
                                                className={`max-w-none shadow-2xl transition-all duration-700 ${isActiveImagePending || isVideoLoading ? 'blur-2xl scale-110 opacity-30' : 'scale-100 opacity-100'}`}
                                                style={{ maxHeight: '72vh', maxWidth: '100%' }}
                                            />
                                            {(isActiveImagePending || isVideoLoading) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-12 h-12 border-4 border-[#4D96FF]/20 border-t-[#4D96FF] rounded-full animate-spin"></div>
                                                        <span className="text-[#0F172A] text-[13px] font-bold tracking-tight">
                                                            {isActiveImagePending ? 'Processing Logic...' : 'Buffering Preview...'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative group/canvas overflow-hidden rounded-[24px]">
                                            <img
                                                src={activeImage}
                                                alt="Editing"
                                                className={`max-w-none shadow-2xl transition-all duration-700 ${isActiveImagePending && !isScanning ? 'blur-2xl scale-110 opacity-50 shadow-none' : 'scale-100 opacity-100'}`}
                                                style={{ maxHeight: '72vh', maxWidth: '100%' }}
                                            />
                                            {/* Centered Loading Spinner for Pending State (after scan) */}
                                            {isActiveImagePending && !isScanning && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="flex flex-col items-center gap-6">
                                                        <div className="flex gap-2">
                                                            <div className="w-2 h-2 bg-black rounded-full dot-loading"></div>
                                                            <div className="w-2 h-2 bg-black rounded-full dot-loading dot-delay-1"></div>
                                                            <div className="w-2 h-2 bg-black rounded-full dot-loading dot-delay-2"></div>
                                                            <div className="w-2 h-2 bg-black rounded-full dot-loading dot-delay-3"></div>
                                                            <div className="w-2 h-2 bg-black rounded-full dot-loading dot-delay-4"></div>
                                                        </div>
                                                        <span className="text-black text-[13px] font-black tracking-[0.2em] uppercase">let the magic happen</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Favorites & Dislike Controls */}
                                            {!isActiveImagePending && (
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/canvas:opacity-100 transition-opacity z-20">
                                                    <button
                                                        onClick={(e) => handleToggleDislike(activeImageObject.id, e)}
                                                        className={`p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 ${activeImageObject.is_disliked ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-black/40 text-white hover:bg-white hover:text-red-500 border border-white/10'}`}
                                                        title={activeImageObject.is_disliked ? "Remove dislike" : "Dislike"}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleToggleFavorite(activeImageObject.id, e)}
                                                        className={`p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 ${activeImageObject.is_favorite ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-black/40 text-white hover:bg-white hover:text-pink-500 border border-white/10'}`}
                                                        title={activeImageObject.is_favorite ? "Remove from favorites" : "Add to favorites"}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill={activeImageObject.is_favorite ? "currentColor" : "none"} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeImageObject.is_favorite ? 0 : 2} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Applied Ops Info */}
                                            {!isActiveImagePending && activeImageObject?.tool_name && (
                                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white pl-2.5 pr-1.5 py-1.5 rounded-xl text-[10px] font-bold tracking-wider opacity-0 group-hover/canvas:opacity-100 transition-opacity flex items-center gap-2 z-20 border border-white/10 shadow-lg">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#4D96FF] shadow-[0_0_8px_rgba(77,150,255,0.8)]"></div>
                                                    <span className="opacity-90">{activeImageObject.tool_name}</span>
                                                    <div className="relative group/info cursor-help">
                                                        <svg className="w-3.5 h-3.5 text-white/60 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

                                                        <div className="absolute bottom-full left-0 mb-3 w-64 p-3 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 text-gray-300 rounded-xl text-[10px] hidden group-hover/info:block z-50 pointer-events-none shadow-2xl origin-bottom-left animate-in fade-in zoom-in duration-200">
                                                            <div className="text-white font-bold mb-2 border-b border-white/10 pb-1">Applied Parameters</div>
                                                            <pre className="whitespace-pre-wrap font-mono text-[9px] leading-relaxed opacity-80">
                                                                {JSON.stringify(activeImageObject.parameters || {}, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resolution Badge */}
                                            {!isActiveImagePending && (
                                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold tracking-wider opacity-0 group-hover/canvas:opacity-100 transition-opacity border border-white/10 shadow-lg">
                                                    {imageSize.width} x {imageSize.height} PX
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Scan line animation overlay */}
                                    {isScanning && (
                                        <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none z-10">
                                            <div className="absolute inset-x-0 h-3 bg-gradient-to-b from-transparent via-[#4D96FF] to-transparent animate-scan-line shadow-[0_0_30px_10px_rgba(77,150,255,0.4)] opacity-80"></div>
                                        </div>
                                    )}
                                </div>

                                {isScanning && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-30">
                                        <div className="w-5 h-5 border-3 border-[#4D96FF]/20 border-t-[#4D96FF] rounded-full animate-spin"></div>
                                        <p className="text-[13px] text-[#0F172A] font-bold">Analyzing structure...</p>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Tool Details (Bottom Section) */}
                            {selectedTool && (
                                <div className="lg:hidden shrink-0 bg-white border-t border-[#F1F5F9] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px] pb-28">
                                    <ToolDetailsPanel
                                        tool={selectedTool}
                                        onBack={() => setSelectedToolId(null)}
                                        settings={toolSettings}
                                        onUpdate={updateToolSettings}
                                        onGenerate={handleAIGenerate}
                                        onUpscale={handleAIUpscale}
                                        onMysticSuccess={handleMysticSuccess}
                                        onStart={handleMysticStart}
                                        onRemoveBg={handleRemoveBackground}
                                        onAddShadows={handleAddShadows}
                                        onFixLight={handleFixLight}
                                        onResizeExpand={handleResizeExpand}
                                        onOpenAssetModal={(type) => setAssetModal({ isOpen: true, type })}
                                        activeImage={activeImage}
                                        imageSize={imageSize}
                                        isGenerating={isGenerating}
                                        generatedImages={generatedImages}
                                        generationError={generationError}
                                        onUpload={(field) => {
                                            setUploadContext(field ? `fashion.${field}` : null);
                                            fileInputRef.current?.click();
                                        }}
                                        onFashionGenerate={handleFashionGenerate}
                                        onGenerateVideo={handleGenerateVideo}
                                        onAddText={handleAddText}
                                        onImprovePrompt={handleImprovePrompt}
                                        fashionAssets={fashionAssets}
                                        user={user}
                                        onRefreshCredits={refreshUser}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 p-4 lg:p-8 flex items-center justify-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`w-full max-w-4xl border-[3px] border-dashed rounded-[32px] lg:rounded-[40px] flex flex-col items-center justify-center text-center py-10 px-4 lg:p-20 cursor-pointer transition-all duration-500 overflow-hidden relative group ${isDragging
                                    ? 'border-[#4D96FF] bg-[#F5F8FF] scale-[1.02] shadow-2xl shadow-blue-100'
                                    : 'border-[#E2E8F0] bg-white/50 backdrop-blur-sm hover:border-[#4D96FF]/40 hover:bg-[#F8FAFC]'}`}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute top-[-10%] right-[-5%] w-32 h-32 lg:w-64 lg:h-64 bg-blue-100 rounded-full blur-[60px] lg:blur-[80px]"></div>
                                    <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 lg:w-64 lg:h-64 bg-purple-100 rounded-full blur-[60px] lg:blur-[80px]"></div>
                                </div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative h-24 w-60 flex items-center justify-center mb-8">
                                        {/* Left Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="absolute w-16 h-16 transition-all duration-700 opacity-0 group-hover:opacity-40 group-hover:-translate-x-16 group-hover:-rotate-12"
                                            alt=""
                                        />
                                        {/* Right Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="absolute w-16 h-16 transition-all duration-700 opacity-0 group-hover:opacity-40 group-hover:translate-x-16 group-hover:rotate-12"
                                            alt=""
                                        />
                                        {/* Main Central Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="relative w-20 h-20 z-10 transition-all duration-500 opacity-30 group-hover:opacity-100 group-hover:scale-110"
                                            alt=""
                                        />
                                    </div>

                                    <h2 className="text-xl lg:text-3xl font-black text-[#0F172A] mb-2 lg:mb-3 font-tight tracking-tight">
                                        <span className="lg:hidden">Tap to upload image</span>
                                        <span className="hidden lg:inline">Drag & drop images here</span>
                                    </h2>
                                    <p className="text-[#94A3B8] font-bold text-sm lg:text-lg mb-6 lg:mb-10">
                                        or <span className="text-[#4D96FF] decoration-2 underline-offset-4 hover:underline">browse files</span>
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-3 lg:gap-4 p-2 bg-white/40 backdrop-blur-md rounded-[24px] lg:rounded-[28px] border border-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                                        {[
                                            { id: "fd9b2b68-1932-47d2-a144-7829bbe53b7c", url: "img/photo-1563729784474-d77dbb933a9e.jfif" },
                                            { id: "88860b29-eef7-4712-b5e1-7dcd41bb0203", url: "img/photo-1516975080664-ed2fc6a32937.jfif" },
                                            { id: "e6d30b6f-7718-473d-9852-6a7f80517861", url: "img/photo-1620916566398-39f1143ab7be.jfif" },
                                            { id: "9875e523-7724-42f8-9a3c-589606d87e0b", url: "img/photo-1485955900006-10f4d324d411.jfif" }
                                        ].map((item, idx) => (
                                            <div
                                                key={item.id}
                                                categoryCardonClick={() => handleImageUpload(item.url)}
                                                className="w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] rounded-[16px] lg:rounded-[20px] bg-white overflow-hidden cursor-pointer hover:ring-4 ring-[#4D96FF] transition-all duration-300 hover:scale-[1.1] hover:-rotate-2 border border-[#F1F5F9] premium-shadow"
                                            >
                                                <img src={item.url} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className={`
                    w-full lg:w-80 flex flex-col bg-white/60 backdrop-blur-xl lg:rounded-[24px] border-l lg:border border-white overflow-hidden premium-shadow transition-all duration-300 editor-right-sidebar
                    ${mobileTab === 'history' ? 'flex' : 'hidden lg:flex'}
                `}>
                    <div className="flex items-center gap-2 px-6 h-16 border-b border-[#F1F5F9]/80 bg-white/40">
                        <button
                            onClick={() => setActiveSidebarTab('Creations')}
                            className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${activeSidebarTab === 'Creations' ? 'bg-[#0F172A] text-white shadow-md shadow-gray-200/50 border-2 border-[#FFFFFF]' : 'text-[#64748B] hover:bg-white hover:text-[#0F172A] hover:shadow-sm'}`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('Videos')}
                            className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${activeSidebarTab === 'Videos' ? 'bg-[#0F172A] text-white shadow-md shadow-gray-200/50 border-2 border-[#FFFFFF]' : 'text-[#64748B] hover:bg-white hover:text-[#0F172A] hover:shadow-sm'}`}
                        >
                            Videos
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto no-scrollbar">

                        <input
                            type="file"
                            ref={sidebarInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => sidebarInputRef.current?.click()}
                            className="w-full py-4 border-2 border-dashed border-[#E2E8F0] rounded-[20px] text-[13px] font-bold text-[#64748B] hover:border-[#4D96FF] hover:bg-[#F5F8FF] hover:text-[#4D96FF] transition-all mb-8 flex items-center justify-center gap-2 group active:scale-95"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            New Upload
                        </button>

                        <div className="flex items-center justify-between mb-8 px-2">
                            <span className="text-[11px] text-[#94A3B8] font-black uppercase tracking-wider">Library</span>
                            <div
                                className="flex items-center gap-2 group cursor-pointer"
                                onClick={() => {
                                    setOnlyFavorites(!onlyFavorites);
                                    setIsRefreshingHistory(true);
                                }}
                            >
                                <span className={`text-[11px] font-bold group-hover:text-[#0F172A] ${onlyFavorites ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>Favourites Only</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${onlyFavorites ? 'bg-pink-500' : 'bg-[#E2E8F0] group-hover:bg-[#CBD5E1]'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${onlyFavorites ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Images Grid */}
                        {uploadedImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {uploadedImages
                                    .map((img, originalIndex) => ({ ...img, originalIndex }))
                                    .filter(image =>
                                        activeSidebarTab === 'Videos'
                                            ? image.type === 'video'
                                            : image.type !== 'video'
                                    )
                                    .map((image) => (
                                        <UploadedImageCard
                                            key={image.id || image.url || image.originalIndex}
                                            image={image}
                                            isActive={activeImageIndex === image.originalIndex}
                                            onClick={() => setActiveImageIndex(image.originalIndex)}
                                            onDelete={handleDeleteGeneration}
                                            onToggleFavorite={handleToggleFavorite}
                                            onToggleDislike={handleToggleDislike}
                                        />
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 opacity-40">
                                <div className="w-16 h-16 bg-[#F8FAFC] rounded-[24px] flex items-center justify-center mb-4 border border-[#F1F5F9]">
                                    <svg className="w-8 h-8 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="text-sm font-bold text-[#64748B]">No items yet</p>
                            </div>
                        )}
                    </div>


                </div>
            </div >

            <AssetSelectionModal
                isOpen={assetModal.isOpen}
                onClose={() => setAssetModal({ ...assetModal, isOpen: false })}
                onSelect={handleAssetSelect}
                title={`Select ${assetModal.type} Image`}
            />

            {/* Fullscreen Preview Layer */}
            {
                isFullscreen && activeImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-in fade-in duration-300">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-all group"
                        >
                            <svg className="w-8 h-8 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center p-6" onClick={() => setIsFullscreen(false)}>
                            <div className="relative group/preview flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                {activeImageObject?.type === 'video' ? (
                                    <video
                                        src={activeImage}
                                        controls
                                        autoPlay
                                        loop
                                        className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500"
                                    />
                                ) : (
                                    <img
                                        src={activeImage}
                                        alt="Fullscreen Preview"
                                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <DeleteImageModal
                isOpen={!!deletingImageId}
                onClose={() => setDeletingImageId(null)}
                onConfirm={confirmDeleteGeneration}
            />

            {/* Mobile Bottom Navigation */}
            <div className={`lg:hidden fixed bottom-1 left-4 right-4 h-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[28px] shadow-2xl z-50 flex items-center justify-around px-2 mb-2 transition-all duration-300 ${showPricing ? 'blur-sm' : ''}`}>
                <button
                    onClick={() => setMobileTab('tools')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${mobileTab === 'tools' ? 'text-[#4D96FF] bg-blue-50/50' : 'text-[#94A3B8]'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tools</span>
                </button>
                <button
                    onClick={() => setMobileTab('canvas')}
                    className={`relative flex flex-col items-center gap-1 p-3 -mt-8 rounded-full border-4 border-[#F5F8FF] transition-all shadow-lg ${mobileTab === 'canvas' ? 'bg-[#4D96FF] text-white scale-110' : 'bg-white text-[#94A3B8]'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <button
                    onClick={() => setMobileTab('history')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${mobileTab === 'history' ? 'text-[#4D96FF] bg-blue-50/50' : 'text-[#94A3B8]'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
                </button>
            </div>
        </div >
    );
};

export default EditorPage;

