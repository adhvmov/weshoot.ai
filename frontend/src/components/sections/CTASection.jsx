/**
 * CTA Section (Bottom)
 * "Still not sure? Just try it already. It's free"
 */
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="relative py-24 md:py-32 bg-white overflow-hidden">
            {/* Background Gradients in Corners */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#E0F2FE] opacity-[0.4] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#DBEAFE] opacity-[0.3] rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                {/* Badge/Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4D96FF]/10 rounded-lg mb-8 border border-[#4D96FF]/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <img
                        src="/site_icons/icon-20.svg"
                        alt=""
                        className="w-5 h-5"
                        style={{
                            filter: 'invert(56%) sepia(39%) saturate(4687%) hue-rotate(199deg) brightness(101%) contrast(105%)'
                        }}
                    />
                    <span className="text-[#4D96FF] text-sm font-bold uppercase tracking-wider">Try WeShoot AI</span>
                </div>

                {/* Main Heading */}
                <div className="max-w-4xl mx-auto space-y-4 mb-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-[1.05] tracking-tight">
                        Still not sure?
                        <br />
                        <span className="italic font-serif text-[#4D96FF]">Just try it already.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Remove backgrounds, fix lights, resize products, generate backgrounds - all for free.
                    </p>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in zoom-in duration-700 delay-300">
                    <Link
                        to="/login?signup=true"
                        className="inline-flex items-center justify-center px-10 py-4 text-base font-black text-white transition-all duration-300 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[20px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px] hover:scale-105 active:scale-95 min-w-[200px]"
                    >
                        Get Started Now
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="mt-16 flex items-center gap-8 opacity-40 grayscale grayscale-50">
                    <img src="/img/brand_logo_1.svg" alt="" className="h-6 md:h-8" />
                    <img src="/img/brand_logo_2.svg" alt="" className="h-6 md:h-8" />
                    <img src="/img/brand_logo_3.svg" alt="" className="h-6 md:h-8" />
                </div>
            </div>
        </section>
    );
};

export default CTASection;

