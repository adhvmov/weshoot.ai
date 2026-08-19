import { useState } from 'react';

const SparkleIcon = () => (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
        <path d="M5.26931 2.56773L3.86057 2.85449C3.76515 2.8739 3.69655 2.95778 3.69623 3.05549C3.6959 3.15321 3.76408 3.23766 3.85935 3.25756L5.25552 3.55006L5.54286 4.96347C5.56227 5.05914 5.64596 5.12794 5.7431 5.12811H5.74359C5.84056 5.12811 5.92424 5.05996 5.94415 4.96462L6.23663 3.56308L7.64291 3.27353C7.73769 3.25404 7.80603 3.17041 7.80669 3.0731C7.80718 2.9758 7.73981 2.89143 7.64503 2.87087L6.25628 2.56888L5.95981 1.16316C5.93974 1.06807 5.85614 1 5.75925 1H5.75876C5.66194 1.00025 5.57826 1.06872 5.55869 1.16406L5.26931 2.56773ZM5.63022 3.33521C5.61382 3.2547 5.55134 3.19163 5.47125 3.17492L4.91851 3.05902L5.48324 2.9441C5.5635 2.9278 5.62663 2.86473 5.64318 2.78413L5.76153 2.20971L5.88273 2.78446C5.89945 2.86383 5.96095 2.92583 6.03998 2.94303L6.60806 3.06655L6.02244 3.18712C5.94251 3.20358 5.87988 3.26624 5.86316 3.34651L5.74636 3.90628L5.63022 3.33521ZM14.0737 3.39655C14.4767 2.99514 14.4793 2.3417 14.0797 1.93703C13.68 1.53237 13.0293 1.52974 12.6264 1.93114L10.149 4.39906L11.5964 5.86447L14.0737 3.39655ZM10.8895 6.59351L9.44216 5.1281L1.30395 13.2352C0.901006 13.6367 0.898356 14.2901 1.29804 14.6948C1.69771 15.0994 2.34837 15.1021 2.75132 14.7007L10.8895 6.59351ZM11.0539 10.0787L12.4626 9.79191L12.752 8.38825C12.7716 8.29291 12.8553 8.22443 12.9521 8.22419H12.9526C13.0495 8.22419 13.1331 8.29225 13.1531 8.38735L13.4496 9.79306L14.8383 10.0951C14.9331 10.1156 15.0005 10.2 15 10.2973C14.9993 10.3946 14.931 10.4782 14.8362 10.4977L13.4299 10.7873L13.1375 12.1888C13.1176 12.2841 13.0339 12.3523 12.9369 12.3523H12.9364C12.8393 12.3521 12.7566 12.2833 12.7362 12.1877L12.4488 10.7742L11.0527 10.4817C10.9574 10.4618 10.8892 10.3774 10.8895 10.2797C10.8899 10.182 10.9585 10.0981 11.0539 10.0787ZM12.6646 10.3991C12.7447 10.4158 12.8071 10.4789 12.8235 10.5594L12.9397 11.1305L13.0565 10.5707C13.0732 10.4904 13.1358 10.4278 13.2158 10.4113L13.8014 10.2907L13.2333 10.1672C13.1543 10.15 13.0928 10.088 13.076 10.0086L12.9548 9.43389L12.8365 10.0083C12.8199 10.0889 12.7568 10.152 12.6766 10.1683L12.1118 10.2832L12.6646 10.3991ZM7.56563 13.1362L6.86126 13.2795C6.81355 13.2892 6.77925 13.3312 6.77909 13.38C6.77893 13.4289 6.81302 13.4711 6.86065 13.4811L7.55874 13.6273L7.70241 14.334C7.71212 14.3819 7.75396 14.4163 7.80253 14.4163H7.80277C7.85126 14.4163 7.8931 14.3823 7.90305 14.3346L8.04929 13.6338L8.75243 13.4891C8.79982 13.4793 8.834 13.4375 8.83432 13.3888C8.83457 13.3402 8.80088 13.298 8.75349 13.2877L8.05912 13.1367L7.91088 12.4339C7.90085 12.3863 7.85905 12.3523 7.8106 12.3523H7.81036C7.76195 12.3524 7.72011 12.3867 7.71032 12.4343L7.56563 13.1362ZM7.74609 13.5199C7.73789 13.4796 7.70665 13.4481 7.6666 13.4398L7.39023 13.3818L7.6726 13.3243C7.71273 13.3162 7.74429 13.2847 7.75257 13.2444L7.81174 12.9571L7.87234 13.2445C7.8807 13.2842 7.91145 13.3152 7.95097 13.3238L8.23501 13.3856L7.9422 13.4459C7.90224 13.4541 7.87092 13.4854 7.86256 13.5256L7.80416 13.8054L7.74609 13.5199Z" />
    </svg>
);

const ASPECT_RATIOS = [
    { id: 'square_1_1', label: '1:1', icon: 'M3 3h18v18H3z' },
    { id: 'portrait_2_3', label: '2:3', icon: 'M7 3h10v18H7z' },
    { id: 'traditional_3_4', label: '3:4', icon: 'M6 3h12v18H6z' },
    { id: 'social_story_9_16', label: '9:16', icon: 'M8 3h8v18H8z' },
    { id: 'standard_3_2', label: '3:2', icon: 'M3 6h18v12H3z' },
    { id: 'classic_4_3', label: '4:3', icon: 'M3 5h18v14H3z' },
    { id: 'widescreen_16_9', label: '16:9', icon: 'M3 8h18v8H3z' },
];

const BlurBackgroundPanel = ({ onBack, settings, onUpdate, onGenerate, isGenerating, generationError, activeImage, renderActionButton }) => {
    const { blurBackground } = settings;

    // Blur type options with thumbnails
    const blurTypes = [
        { id: 'General', name: 'General', thumbnail: '/blur_background/blur_general-3d68713e22625294771fe993f04857fd.jpg' },
        { id: 'Product', name: 'Product', thumbnail: '/blur_background/blur_product-a46cceffa90b5523085c1d225c7cf529.jpg' },
        { id: 'Car', name: 'Car', thumbnail: '/blur_background/blur_car-439996dbdcf60460f96cbcf244cd1ebd.jpg' },
        { id: 'Car Plate', name: 'Car Plate', thumbnail: '/blur_background/blur_carplate-2c29762eeb302acee27a7d071ede2fbf.jpg' }
    ];

    // Blur level options with thumbnails
    const blurLevels = [
        { id: 'High', name: 'High', thumbnail: '/blur_background/High_illustration.jfif' },
        { id: 'Medium', name: 'Medium', thumbnail: '/blur_background/Medium_illustration.jfif' },
        { id: 'Low', name: 'Low', thumbnail: '/blur_background/Low_illustration.jfif' }
    ];

    // Blur style options with thumbnails
    const blurStyles = [
        { id: 'Regular', name: 'Regular', thumbnail: '/blur_background/Low_illustration.jfif' },
        { id: 'Lens', name: 'Lens', thumbnail: '/blur_background/Lens_illustration.jfif' }
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F8FF] rounded-full border border-[#4D96FF]/10">
                        <SparkleIcon />
                        <span className="text-[10px] font-black text-[#4D96FF] uppercase tracking-wider">Magic Tool</span>
                    </div>
                </div> */}

                <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Blur Background</h3>
                <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Blurs image background or car plate</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                {/* Blur Type Selection */}
                <div className="mb-8 mt-4">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 block">Blur type</span>
                    <div className="grid grid-cols-2 gap-3">
                        {blurTypes.map(type => (
                            <div
                                key={type.id}
                                onClick={() => onUpdate('blurBackground', { ...blurBackground, type: type.id })}
                                className={`aspect-square bg-[#F8FAFC] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group relative ${blurBackground.type === type.id
                                    ? 'border-[#4D96FF] shadow-lg shadow-blue-100'
                                    : 'border-transparent hover:border-[#F1F5F9]'
                                    }`}
                            >
                                <img
                                    src={type.thumbnail}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={type.name}
                                    loading="lazy"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                                    <span className="text-[12px] text-white font-bold">{type.name}</span>
                                </div>
                                {blurBackground.type === type.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#4D96FF] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blur Level Selection */}
                <div className="mb-8">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 block">Blur level</span>
                    <div className="grid grid-cols-3 gap-3">
                        {blurLevels.map(level => (
                            <div
                                key={level.id}
                                onClick={() => onUpdate('blurBackground', { ...blurBackground, level: level.id })}
                                className={`cursor-pointer transition-all active:scale-95`}
                            >
                                <div className={`aspect-square bg-[#F8FAFC] rounded-2xl overflow-hidden border-2 mb-2 transition-all ${blurBackground.level === level.id
                                    ? 'border-[#4D96FF] shadow-lg shadow-blue-100'
                                    : 'border-transparent hover:border-[#F1F5F9]'
                                    }`}>
                                    <img
                                        src={level.thumbnail}
                                        className={`w-full h-full object-cover transition-all duration-500 ${blurBackground.level === level.id ? 'scale-110' : ''}`}
                                        alt={level.name}
                                        loading="lazy"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                    />
                                </div>
                                <span className={`text-[11px] font-bold block text-center transition-colors ${blurBackground.level === level.id ? 'text-[#4D96FF]' : 'text-[#64748B]'
                                    }`}>
                                    {level.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blur Style Selection */}
                <div className="mb-8">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 block">Blur style</span>
                    <div className="grid grid-cols-2 gap-3">
                        {blurStyles.map(style => (
                            <div
                                key={style.id}
                                onClick={() => onUpdate('blurBackground', { ...blurBackground, style: style.id })}
                                className={`cursor-pointer transition-all active:scale-95`}
                            >
                                <div className={`aspect-[3/2] bg-[#F8FAFC] rounded-2xl overflow-hidden border-2 mb-2 transition-all ${blurBackground.style === style.id
                                    ? 'border-[#4D96FF] shadow-lg shadow-blue-100'
                                    : 'border-transparent hover:border-[#F1F5F9]'
                                    }`}>
                                    <img
                                        src={style.thumbnail}
                                        className={`w-full h-full object-cover transition-all duration-500 ${blurBackground.style === style.id ? 'scale-110' : ''}`}
                                        alt={style.name}
                                        loading="lazy"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                    />
                                </div>
                                <span className={`text-[11px] font-bold block text-center transition-colors ${blurBackground.style === style.id ? 'text-[#4D96FF]' : 'text-[#64748B]'
                                    }`}>
                                    {style.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aspect Ratio */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <h4 className="text-[14px] font-bold text-[#0F172A]">Aspect ratio</h4>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => onUpdate('blurBackground', { ...blurBackground, aspectRatio: ratio.id })}
                                className={`shrink-0 flex flex-col items-center gap-2 p-2.5 min-w-[56px] rounded-xl transition-all border-2 ${blurBackground.aspectRatio === ratio.id
                                    ? 'bg-white border-[#4D96FF] shadow-md text-[#4D96FF]'
                                    : 'bg-[#F8FAFC] border-transparent text-[#64748B] hover:bg-[#F1F5F9]'
                                    }`}
                            >
                                <div className={`w-6 h-6 flex items-center justify-center ${blurBackground.aspectRatio === ratio.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}`}>
                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                                        <path d={ratio.icon} />
                                    </svg>
                                </div>
                                <span className={`text-[10px] font-bold ${blurBackground.aspectRatio === ratio.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                    {ratio.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#F8FAFC]">
                {renderActionButton ? (
                    renderActionButton(
                        () => onGenerate && onGenerate({}),
                        'Apply Blur',
                        5,
                        { toolId: 'blur-background' },
                        isGenerating
                    )
                ) : (
                    <button
                        onClick={() => onGenerate && onGenerate({})}
                        disabled={isGenerating || !activeImage}
                        className={`w-full py-4 font-bold rounded-2xl transition-all shadow-xl text-[13px] flex items-center justify-center gap-2 group animate-button-glow ${isGenerating || !activeImage
                            ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                            : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] shadow-blue-100'
                            }`}
                    >
                        {isGenerating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <div className="w-5 h-5 bg-white mask-icon group-hover:scale-110 transition-transform" style={{ WebkitMaskImage: 'url(/site_icons/icon-19.svg)', maskImage: 'url(/site_icons/icon-19.svg)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }}></div>
                        )}
                        <span>{isGenerating ? 'Processing...' : 'Apply Blur'}</span>
                    </button>
                )}
                {generationError && (
                    <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                )}
                {!activeImage && !isGenerating && (
                    <p className="text-[10px] text-[#94A3B8] mt-3 text-center font-bold uppercase tracking-widest">Select an image to start</p>
                )}
            </div>
        </div>
    );
};

export default BlurBackgroundPanel;

