import { useState } from 'react';

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

const PricingModal = ({ isOpen, onClose }) => {
    const [isYearly, setIsYearly] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center max-h-[98vh] w-full max-w-[800px] px-2 md:px-4">
                <div className="bg-white rounded-[32px] shadow-2xl w-full flex flex-col border-[6px] md:border-[12px] border-[#F5F8FF] overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="pt-6 md:pt-10 px-6 md:px-10 pb-2 text-center">
                        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-2">Grow your business</h2>
                        <p className="text-[#64748B] text-sm md:text-base font-medium italic">Upgrade to one of our paid plans</p>
                    </div>

                    <div className="px-6 md:px-10 pb-8 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Desktop Toggle */}
                        <div className="hidden md:flex items-center justify-center gap-4 mb-10 mt-4 h-8 animate-in fade-in slide-in-from-top-1 duration-500">
                            <span className={`text-[13px] font-bold tracking-tight transition-colors ${!isYearly ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>Billed monthly</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="w-14 h-8 bg-[#0F172A] rounded-full p-1 transition-all hover:scale-105 active:scale-95 focus:outline-none ring-4 ring-transparent hover:ring-[#4D96FF]/10 shrink-0 border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-[13px] font-bold tracking-tight flex items-center gap-2 transition-colors ${isYearly ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                                Billed yearly
                                <span className="px-2.5 py-0.5 bg-[#4D96FF]/10 text-[#4D96FF] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#4D96FF]/20 shadow-sm animate-pulse-slow">Save up to $60</span>
                            </span>
                        </div>

                        {/* Mobile Tab Switcher */}
                        <div className="flex md:hidden bg-[#F8FAFC] border border-[#F1F5F9] p-1.5 rounded-2xl mb-8 mt-2 mx-auto max-w-[300px] animate-in slide-in-from-bottom-2 duration-500">
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-[#0F172A] text-white shadow-xl shadow-gray-200/50' : 'text-[#94A3B8] hover:text-[#0F172A]'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${isYearly ? 'bg-[#0F172A] text-white shadow-xl shadow-gray-200/50' : 'text-[#94A3B8] hover:text-[#0F172A]'}`}
                            >
                                Yearly
                                {isYearly && (
                                    <span className="absolute -top-3 -right-2 px-2 py-0.5 bg-[#4D96FF] text-white text-[8px] font-black rounded-full border-2 border-white shadow-sm">SAVE UP TO $60</span>
                                )}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mb-8">
                            {/* Essentials Plan */}
                            <div className="bg-[#F8FAFC] border-2 border-[#F1F5F9] rounded-[24px] p-6 md:p-8 hover:border-[#4D96FF]/30 transition-all group flex flex-col relative overflow-hidden">
                                <h3 className="text-xl font-black text-[#0F172A] mb-1">Essentials</h3>
                                <p className="text-[13px] font-medium text-[#64748B] mb-6">Perfect for simple editing and generations</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-[#0F172A] tracking-tight">${isYearly ? '9' : '12'}</span>
                                    <span className="text-[13px] font-bold text-[#64748B] tracking-tight">/ month</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckIcon className="w-3 h-3 text-[#4D96FF]" />
                                        </div>
                                        <span className="text-[13px] font-bold text-[#475569]">450 credits to use on any operation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckIcon className="w-3 h-3 text-[#4D96FF]" />
                                        </div>
                                        <span className="text-[13px] font-bold text-[#475569]">Powerful toolset for image editing</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckIcon className="w-3 h-3 text-[#4D96FF]" />
                                        </div>
                                        <span className="text-[13px] font-bold text-[#475569]">Standard resolution (up to 2K)</span>
                                    </li>
                                </ul>

                                <button className="w-full py-4 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-2xl font-black text-[13px] hover:border-[#4D96FF] hover:bg-[#F5F8FF] hover:text-[#4D96FF] transition-all transform active:scale-95 shadow-sm">
                                    Subscribe Now
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="bg-white border-4 border-[#4D96FF] rounded-[24px] p-6 md:p-8 shadow-xl shadow-blue-500/10 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-[#4D96FF] text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg">
                                    Most Popular
                                </div>

                                <h3 className="text-xl font-black text-[#0F172A] mb-1">Pro Plan</h3>
                                <p className="text-[13px] font-medium text-[#64748B] mb-6">Ideal for advanced editing and customizations</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-[#0F172A] tracking-tight">${isYearly ? '24' : '29'}</span>
                                    <span className="text-[13px] font-bold text-[#64748B] tracking-tight">/ month</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#4D96FF] flex items-center justify-center shrink-0 shadow-md">
                                            <PlusIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[13px] font-black text-[#0F172A]">1,400 credits for any operation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#4D96FF] flex items-center justify-center shrink-0 shadow-md">
                                            <PlusIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[13px] font-black text-[#0F172A]">Full access to all Premium Tools</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#4D96FF] flex items-center justify-center shrink-0 shadow-md">
                                            <PlusIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[13px] font-black text-[#0F172A]">3x history preservation limit</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#4D96FF] flex items-center justify-center shrink-0 shadow-md">
                                            <PlusIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[13px] font-black text-[#0F172A]">Higher resolution up to 64 MP</span>
                                    </li>
                                </ul>

                                <button className="w-full py-4 bg-[#4D96FF] text-white rounded-2xl font-black text-[13px] hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 animate-button-glow">
                                    Get Started Pro
                                </button>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-[13px] font-bold text-[#64748B]">
                                Explore all features in detail on our <a href="/pricing" className="text-[#4D96FF] hover:underline">Pricing Page</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* External Close Button */}
                <button
                    onClick={onClose}
                    className="mt-4 md:mt-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl border-2 border-[#F5F8FF] shadow-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:scale-110 active:scale-95 transition-all duration-300 z-[100]"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default PricingModal;
