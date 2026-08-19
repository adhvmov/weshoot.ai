import { useState, useEffect } from 'react';
import { getBackgroundTemplates } from '../../services/aiService';

const SparkleIcon = () => (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
        <path d="M5.26931 2.56773L3.86057 2.85449C3.76515 2.8739 3.69655 2.95778 3.69623 3.05549C3.6959 3.15321 3.76408 3.23766 3.85935 3.25756L5.25552 3.55006L5.54286 4.96347C5.56227 5.05914 5.64596 5.12794 5.7431 5.12811H5.74359C5.84056 5.12811 5.92424 5.05996 5.94415 4.96462L6.23663 3.56308L7.64291 3.27353C7.73769 3.25404 7.80603 3.17041 7.80669 3.0731C7.80718 2.9758 7.73981 2.89143 7.64503 2.87087L6.25628 2.56888L5.95981 1.16316C5.93974 1.06807 5.85614 1 5.75925 1H5.75876C5.66194 1.00025 5.57826 1.06872 5.55869 1.16406L5.26931 2.56773ZM5.63022 3.33521C5.61382 3.2547 5.55134 3.19163 5.47125 3.17492L4.91851 3.05902L5.48324 2.9441C5.5635 2.9278 5.62663 2.86473 5.64318 2.78413L5.76153 2.20971L5.88273 2.78446C5.89945 2.86383 5.96095 2.92583 6.03998 2.94303L6.60806 3.06655L6.02244 3.18712C5.94251 3.20358 5.87988 3.26624 5.86316 3.34651L5.74636 3.90628L5.63022 3.33521ZM14.0737 3.39655C14.4767 2.99514 14.4793 2.3417 14.0797 1.93703C13.68 1.53237 13.0293 1.52974 12.6264 1.93114L10.149 4.39906L11.5964 5.86447L14.0737 3.39655ZM10.8895 6.59351L9.44216 5.1281L1.30395 13.2352C0.901006 13.6367 0.898356 14.2901 1.29804 14.6948C1.69771 15.0994 2.34837 15.1021 2.75132 14.7007L10.8895 6.59351ZM11.0539 10.0787L12.4626 9.79191L12.752 8.38825C12.7716 8.29291 12.8553 8.22443 12.9521 8.22419H12.9526C13.0495 8.22419 13.1331 8.29225 13.1531 8.38735L13.4496 9.79306L14.8383 10.0951C14.9331 10.1156 15.0005 10.2 15 10.2973C14.9993 10.3946 14.931 10.4782 14.8362 10.4977L13.4299 10.7873L13.1375 12.1888C13.1176 12.2841 13.0339 12.2841 12.9369 12.3523H12.9364C12.8393 12.3521 12.7566 12.2833 12.7362 12.1877L12.4488 10.7742L11.0527 10.4817C10.9574 10.4618 10.8892 10.3774 10.8895 10.2797C10.8899 10.182 10.9585 10.0981 11.0539 10.0787ZM12.6646 10.3991C12.7447 10.4158 12.8071 10.4789 12.8235 10.5594L12.9397 11.1305L13.0565 10.5707C13.0732 10.4904 13.1358 10.4278 13.2158 10.4113L13.8014 10.2907L13.2333 10.1672C13.1543 10.15 13.0928 10.088 13.076 10.0086L12.9548 9.43389L12.8365 10.0083C12.8199 10.0889 12.7568 10.152 12.6766 10.1683L12.1118 10.2832L12.6646 10.3991ZM7.56563 13.1362L6.86126 13.2795C6.81355 13.2892 6.77925 13.3312 6.77909 13.38C6.77893 13.4289 6.81302 13.4711 6.86065 13.4811L7.55874 13.6273L7.70241 14.334C7.71212 14.3819 7.75396 14.4163 7.80253 14.4163H7.80277C7.85126 14.4163 7.8931 14.3823 7.90305 14.3346L8.04929 13.6338L8.75243 13.4891C8.79982 13.4793 8.834 13.4375 8.83432 13.3888C8.83457 13.3402 8.80088 13.298 8.75349 13.2877L8.05912 13.1367L7.91088 12.4339C7.90085 12.3863 7.85905 12.3523 7.8106 12.3523H7.81036C7.76195 12.3524 7.72011 12.3867 7.71032 12.4343L7.56563 13.1362ZM7.74609 13.5199C7.73789 13.4796 7.70665 13.4481 7.6666 13.4398L7.39023 13.3818L7.6726 13.3243C7.71273 13.3162 7.74429 13.2847 7.75257 13.2444L7.81174 12.9571L7.87234 13.2445C7.8807 13.2842 7.91145 13.3152 7.95097 13.3238L8.23501 13.3856L7.9422 13.4459C7.90224 13.4541 7.87092 13.4854 7.86256 13.5256L7.80416 13.8054L7.74609 13.5199Z" />
    </svg>
);

const BackgroundTemplatesPanel = ({ onBack, settings, onUpdate, onGenerate, onImprovePrompt, isGenerating, generationError, activeImage, renderActionButton }) => {
    const { backgrounds } = settings;
    const [categories, setCategories] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial State defaults if not set
    useEffect(() => {
        const updates = {};
        if (!backgrounds.creativity) updates.creativity = 'Medium';
        if (!backgrounds.imageCount) updates.imageCount = 4;
        if (!backgrounds.templateTab) updates.templateTab = 'weshoot';
        if (!backgrounds.templateCategory && categories.length > 0) {
            updates.templateCategory = categories[0].name;
        }

        if (Object.keys(updates).length > 0) {
            onUpdate('backgrounds', { ...backgrounds, ...updates });
        }
    }, [categories.length]);

    const [activeTab, setActiveTab] = useState(backgrounds.templateTab || 'weshoot'); // 'weshoot' or 'my'

    // Sync activeTab with settings when templateTab changes
    useEffect(() => {
        if (backgrounds.templateTab && backgrounds.templateTab !== activeTab) {
            setActiveTab(backgrounds.templateTab);
        }
    }, [backgrounds.templateTab]);

    // Fetch Categories on mount
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await getBackgroundTemplates();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCats();
    }, []);

    // Fetch Templates when category changes
    useEffect(() => {
        const fetchTemps = async () => {
            if (!backgrounds.templateCategory || activeTab !== 'weshoot') return;
            setLoading(true);
            try {
                const res = await getBackgroundTemplates(backgrounds.templateCategory);
                if (res.success) {
                    setTemplates(res.data);
                }
            } catch (error) {
                console.error("Failed to load templates", error);
            }
            setLoading(false);
        };
        fetchTemps();
    }, [backgrounds.templateCategory, activeTab]);

    // Handle Template Selection
    const handleTemplateClick = (template) => {
        onUpdate('backgrounds', { ...backgrounds, selectedTemplate: template, customBackground: null });
    };

    // Handle Custom Background Upload
    const handleCustomBackground = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpdate('backgrounds', {
                ...backgrounds,
                customBackground: file,
                selectedTemplate: { url: URL.createObjectURL(file), name: 'Custom Upload' }
            });
        }
    };

    // Handle Back from Detail View
    const handleCloseDetail = () => {
        onUpdate('backgrounds', { ...backgrounds, selectedTemplate: null, customBackground: null });
    };

    // Render Detail View
    if (backgrounds.selectedTemplate) {
        return (
            <div className="flex flex-col h-full bg-white font-sans">
                {/* Premium Header */}
                <div className="px-6 pt-8 pb-4">
                    <button
                        onClick={handleCloseDetail}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors mb-4 group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        <span className="text-sm font-bold">Back to all templates</span>
                    </button>

                    {/* <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight">Generate Background</h3> */}
                    {/* <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed">Customize your generation parameters.</p> */}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                    {/* Selected Template Preview */}
                    <div className="mb-6 bg-gray-50 border border-gray-100 rounded-lg p-2 flex justify-center">
                        <img
                            src={backgrounds.selectedTemplate.url}
                            alt="Selected Template"
                            className="h-32 object-contain rounded-md shadow-sm"
                        />
                    </div>

                    {/* Creativity Level */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-[#0F172A] mb-3 px-1">Creativity level</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => onUpdate('backgrounds', { ...backgrounds, creativity: level })}
                                    className={`py-3 text-xs font-bold rounded-xl transition-all border-2 ${backgrounds.creativity === level
                                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-black/10'
                                        : 'bg-[#F5F8FF] text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h4 className="text-sm font-bold text-[#0F172A]">Discribe the scene</h4>
                            <span className="text-[10px] font-black text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{(backgrounds.prompt || '').length} / 2048</span>
                        </div>

                        {backgrounds.creativity === 'Low' ? (
                            <div className="w-full h-28 border border-[#F1F5F9] rounded-2xl bg-[#F8FAFC] p-4 flex items-center justify-center text-center">
                                <p className="text-sm text-[#94A3B8] font-medium italic">Prompt is not available for Low creativity level</p>
                            </div>
                        ) : (
                            <div className="relative group">
                                <textarea
                                    value={backgrounds.prompt || ''}
                                    onChange={(e) => onUpdate('backgrounds', { ...backgrounds, prompt: e.target.value })}
                                    placeholder="Describe the scene..."
                                    maxLength={2048}
                                    className="w-full h-28 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/5 focus:border-[#4D96FF]/30 resize-none transition-all placeholder:text-[#94A3B8] pr-12 shadow-sm"
                                />
                                <button
                                    onClick={() => onImprovePrompt && onImprovePrompt('backgrounds', backgrounds.prompt, 'image')}
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
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#F8FAFC]">
                    {renderActionButton ? (
                        renderActionButton(
                            () => onGenerate && onGenerate(),
                            'Generate Scene',
                            5,
                            { toolId: 'ai-background' },
                            isGenerating
                        )
                    ) : (
                        <button
                            onClick={() => onGenerate && onGenerate()}
                            disabled={isGenerating}
                            className={`w-full py-4 font-bold rounded-2xl transition-all shadow-xl text-[13px] flex items-center justify-center gap-2 group animate-button-glow ${isGenerating
                                ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                                : 'bg-[#4D96FF] text-white hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] shadow-blue-100'
                                }`}
                        >
                            {isGenerating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <div className="w-5 h-5 bg-white mask-icon group-hover:scale-110 transition-transform" style={{ WebkitMaskImage: 'url(/site_icons/icon-6.svg)', maskImage: 'url(/site_icons/icon-6.svg)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskSize: 'contain', maskSize: 'contain' }}></div>
                            )}
                            <span>{isGenerating ? 'Processing...' : 'Generate Scene'}</span>
                        </button>
                    )}
                    {generationError && (
                        <p className="text-[11px] text-red-500 mt-3 text-center font-bold px-4">{generationError}</p>
                    )}
                </div>
            </div>
        );
    }

    // Render Grid/List View
    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Premium Header */}
            <div className="px-6 pt-8 pb-4">
                <h3 className="text-xl font-[900] text-[#0F172A] leading-tight font-tight tracking-tight text-center">AI backgrounds</h3>
                <p className="text-[#64748B] text-[13px] mt-1.5 font-medium leading-relaxed text-center">Place products into beautiful scenes</p>
            </div>

            {/* Tab Toggle */}
            <div className="px-5 py-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setActiveTab('weshoot');
                            onUpdate('backgrounds', { ...backgrounds, templateTab: 'weshoot' });
                        }}
                        className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border-2 ${activeTab === 'weshoot' ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-black/10' : 'bg-[#F5F8FF] text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'}`}
                    >
                        Our templates
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('my');
                            onUpdate('backgrounds', { ...backgrounds, templateTab: 'my' });
                        }}
                        className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border-2 ${activeTab === 'my' ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-black/10' : 'bg-[#F5F8FF] text-[#64748B] border-[#F5F8FF] hover:border-[#4D96FF]/20'}`}
                    >
                        My templates
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
                {activeTab === 'weshoot' ? (
                    <>
                        {/* Categories */}
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-2">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => onUpdate('backgrounds', { ...backgrounds, templateCategory: cat.name })}
                                    className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group ${backgrounds.templateCategory === cat.name ? '' : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-16 h-12 rounded-lg overflow-hidden transition-all border-2 bg-[#F5F8FF] ${backgrounds.templateCategory === cat.name
                                        ? 'border-[#4D96FF] shadow-md'
                                        : 'border-[#F5F8FF] group-hover:border-[#4D96FF]/30'
                                        }`}>
                                        <img
                                            src={cat.thumbnail || '/img/placeholder_cat.jpg'}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold transition-colors ${backgrounds.templateCategory === cat.name
                                        ? 'text-[#0F172A]'
                                        : 'text-[#64748B]'
                                        }`}>
                                        {cat.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gray-50 mb-4"></div>

                        {/* Templates Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => handleTemplateClick(template)}
                                        className="aspect-square bg-[#F8FAFC] rounded-2xl overflow-hidden border-2 border-[#F5F8FF] hover:border-[#4D96FF] cursor-pointer transition-all group relative hover:shadow-lg"
                                    >
                                        <img
                                            src={template.url}
                                            className="w-full h-full object-cover"
                                            alt={template.name}
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                                {templates.length === 0 && !loading && (
                                    <div className="col-span-2 text-center text-[#94A3B8] text-sm py-10">
                                        No templates found in this category.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-4">
                        {/* Show uploaded image if exists */}
                        {backgrounds.customBackground || backgrounds.uploadedImage ? (
                            <div className="space-y-4">
                                <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="text-sm font-bold text-gray-900">Uploaded Template</h4>
                                        <button
                                            onClick={() => onUpdate('backgrounds', { ...backgrounds, customBackground: null, uploadedImage: null, selectedTemplate: null })}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                                        <img
                                            src={typeof backgrounds.customBackground === 'string' ? backgrounds.customBackground : backgrounds.uploadedImage}
                                            alt="Uploaded template"
                                            className="w-full h-48 object-contain rounded"
                                        />
                                    </div>
                                    <button
                                        onClick={() => onUpdate('backgrounds', {
                                            ...backgrounds,
                                            selectedTemplate: {
                                                url: typeof backgrounds.customBackground === 'string' ? backgrounds.customBackground : backgrounds.uploadedImage,
                                                name: 'Custom Upload'
                                            }
                                        })}
                                        className="w-full mt-3 py-3 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-all"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-[#E2E8F0] rounded-2xl bg-[#FAFBFC] hover:border-[#4D96FF]/40 hover:bg-[#F5F8FF]/30 transition-all group cursor-pointer overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCustomBackground}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#F1F5F9]">
                                        <svg className="w-6 h-6 text-[#94A3B8] group-hover:text-[#4D96FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0F172A] mb-1">Upload composition image</h4>
                                    <p className="text-[11px] text-[#94A3B8] font-medium">Support JPG, PNG or HEIC (max. 5MB)</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackgroundTemplatesPanel;

