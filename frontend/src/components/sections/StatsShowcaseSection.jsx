/**
 * Stats Showcase Section
 * Redesigned with full background image and stats overlays
 */
const StatsShowcaseSection = () => {
    return (
        <section
            className="relative px-0 md:px-4 lg:px-6 pb-6 mt-10"
            style={{
                background: 'linear-gradient(90deg, #000000 0%, #4D96FF 50%, #000000 100%)'
            }}
        >
            {/* Main Background Container */}
            <div
                className="relative min-h-[600px] md:min-h-[850px] w-full rounded-b-[24px] md:rounded-b-[32px] rounded-t-none overflow-hidden"
            >
                {/* Responsive Background Image */}
                <div className="absolute inset-0 z-0">
                    {/* Mobile Background */}
                    <img
                        src="/img/big-image-background-mobile.png"
                        alt="Stats background mobile"
                        className="block md:hidden w-full h-full object-cover"
                    />
                    {/* Desktop Background */}
                    <img
                        src="/img/bg_product.png"
                        alt="Stats background desktop"
                        className="hidden md:block w-full h-full object-cover"
                    />
                    {/* Gradient Overlays for better depth and text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-1/3"></div>
                </div>

                {/* Content Overlay - Centered within max-w-7xl to match site margins */}
                <div className="relative z-10 w-full h-full min-h-[600px] md:min-h-[850px] flex flex-col pt-12 md:pt-20 lg:pt-24">
                    <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-0 h-full flex flex-col gap-10 lg:gap-12">

                        {/* Top Label - Badge Style */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                <img
                                    src="/site_icons/icon-20.svg"
                                    alt="AI Icon"
                                    className="w-5 h-5 md:w-6 md:h-6 brightness-0 invert"
                                />
                            </div>
                            <span className="text-white text-sm md:text-base font-semibold tracking-tight uppercase opacity-90">
                                Building generative AI
                            </span>
                        </div>

                        {/* Stats - Clean Typography without boxes */}
                        <div className="flex flex-col gap-2 md:gap-4">
                            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight drop-shadow-sm">
                                support customers
                            </h2>
                            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight drop-shadow-sm">
                                free images edited
                            </h2>
                            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight drop-shadow-sm">
                                building AI video
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsShowcaseSection;

