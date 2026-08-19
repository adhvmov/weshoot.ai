
/**
 * Features Section
 * "Your all-in-one AI photo studio" section
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Sidebar Icons order: 14, 6, 7, 4, 8, 5, 9, 16, 13
const SIDEBAR_ICONS = [
    '/site_icons/icon-14.svg',
    '/site_icons/icon-6.svg',
    '/site_icons/icon-7.svg',
    '/site_icons/icon-4.svg',
    '/site_icons/icon-8.svg',
    '/site_icons/icon-5.svg',
    '/site_icons/icon-9.svg',
    '/site_icons/icon-11.svg',
    '/site_icons/icon-13.svg'
];

// Feature Cards Data
const FEATURES = [
    {
        id: 1,
        title: 'AI fashion models',
        description: 'Turn a single photo of your apparel into professional model shots',
        thumbnail: '/img/tools/ai_fashion_model.png',
        video: '/video/tools/ai_fashion_models-321de5f2b3d65f613e2b45ce82c75bc6.mp4',
        link: '/editor#operation=fashion'
    },
    {
        id: 2,
        title: 'AI video',
        description: 'Turn still images into eye-catching video clips for social media or product demos.',
        thumbnail: '/img/tools/ai_video.png',
        video: '/video/tools/ai_video-11e0376230967ea53fa7a142188998bd.mp4',
        link: '/editor#operation=video'
    },
    {
        id: 3,
        title: 'AI backgrounds (templates)',
        description: 'Place your items into engaging scenes using our library or your custom backgrounds.',
        thumbnail: '/img/tools/ai_backgrounds_template.png',
        video: '/video/tools/ai_backgrounds_template-b1471ce71b1c759e55e82d0f58703f76.mp4',
        link: '/editor#operation=backgrounds'
    },
    {
        id: 4,
        title: 'AI backgrounds',
        description: 'Create stunning product photoshoots from your text descriptions.',
        thumbnail: '/img/tools/ai_backgrounds.png',
        video: '/video/tools/ai_backgrounds-fdd35ebda59e84353c036a434a4f8b95.mp4',
        link: '/editor#operation=photoshoot'
    },
    {
        id: 5,
        title: 'Remove Background',
        description: 'Instantly create clean, consistent product shots by erasing bg’s and setting ideal padding.',
        thumbnail: '/img/tools/remove_bg.png',
        video: '/video/tools/remove_bg-f6045fe63f17a1a42b07ff97ce4e20af.mp4',
        link: '/editor#operation=remove_bg'
    },
    {
        id: 6,
        title: 'Improve quality & Upscale',
        description: 'Sharpen details and boost resolution for crisp images everywhere.',
        thumbnail: '/img/tools/enhance.png',
        video: '/video/tools/enhance-79352e8350856988951c624229a2e74b.mp4',
        link: '/editor/#operation=upscale'
    },
    {
        id: 7,
        title: 'Fix light & colors',
        description: 'Brighten dark or faded images for a professional look.',
        thumbnail: '/img/tools/correct_colors.png',
        video: '/video/tools/correct_colors-6015fdc4875e825450a591ea9e0da1da.mp4',
        link: '/editor#operation=light-fix'
    }
];

const FeatureCard = ({ feature, siteStatus }) => {
    const videoRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Video play warning:", e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className="flex-shrink-0 w-[300px] h-[480px] bg-[#2d2e30] rounded-xl overflow-hidden group border border-[#333] snap-start flex flex-col p-3"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Media Container - Taller to show full image, with padding and radius */}
            <div className="relative h-[280px] bg-[#000] overflow-hidden flex-shrink-0 rounded-lg">
                {/* Thumbnail */}
                <img
                    src={feature.thumbnail}
                    alt={feature.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Video */}
                <video
                    ref={videoRef}
                    src={feature.video}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                    muted
                    loop
                    playsInline
                />
            </div>

            {/* Content */}
            <div className="px-2 pb-2 flex flex-col flex-1">
                <h3 className="text-[#F5F8FF] text-lg font-bold mb-2 mt-4">{feature.title}</h3>
                <p className="text-gray-400 text-[13px] leading-relaxed mb-auto">
                    {feature.description}
                </p>
                <Link
                    to={feature.link || '/login'}
                    onClick={(e) => {
                        if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
                            e.preventDefault();
                            siteStatus.showEarlyAccessModal();
                        }
                    }}
                    className="inline-flex items-center gap-2 text-[#4D96FF] text-xs font-semibold hover:opacity-80 transition-opacity mt-4 uppercase tracking-wide"
                >
                    Try tool
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

const MoreToolsCard = ({ siteStatus }) => {
    return (
        <div className="flex-shrink-0 w-[300px] h-[480px] bg-[#2d2e30] rounded-xl overflow-hidden border border-[#333] flex flex-col items-center justify-center p-6 text-center snap-start">
            {/* Smaller Icon */}
            <div className="w-6 h-6 mb-6">
                <img src="/site_icons/icon-45.svg" alt="More tools" className="w-full h-full" />
            </div>

            <h3 className="text-[#F5F8FF] text-xl font-bold mb-2">10+ more tools</h3>
            <p className="text-gray-400 text-[13px] mb-8">are waiting in WeShoot Studio.</p>

            <Link
                to="/login?signup=true"
                onClick={(e) => {
                    if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
                        e.preventDefault();
                        siteStatus.showEarlyAccessModal();
                    }
                }}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[16px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px]"
            >
                Test for free
            </Link>
        </div>
    );
};

const FeaturesSection = ({ siteStatus }) => {
    const handleCTAClick = (e) => {
        if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
            e.preventDefault();
            siteStatus.showEarlyAccessModal();
        }
    };

    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10); // buffer
        }
    };

    useEffect(() => {
        checkScroll();
        const ref = scrollContainerRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (ref) {
                ref.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const cardWidth = 320; // card 300 + gap 20
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="relative py-24 md:py-32 bg-[#0d0d0d] overflow-hidden">
            {/* Gradient Transition from Hero */}
            <div
                className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 70% 100% at 50% -50%, #F5F8FF 0%, #bae6fd 30%, #4D96FF 60%, transparent 100%)',
                    opacity: 0.8
                }}
            ></div>

            {/* Header Aligned Container */}
            <div className="w-full max-w-7xl mx-auto px-0 relative">

                {/* Section Header */}
                <div className="px-4 mb-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4D96FF]/10 rounded-lg mb-6 border border-[#4D96FF]/20">
                        <img
                            src="/site_icons/icon-20.svg"
                            alt=""
                            className="w-5 h-5"
                            style={{
                                filter: 'invert(56%) sepia(39%) saturate(4687%) hue-rotate(199deg) brightness(101%) contrast(105%)'
                            }}
                        />
                        <span className="text-[#F5F8FF] text-sm font-medium">Tools</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        Your all-in-one AI
                        <br />
                        photo studio
                    </h2>

                    <p className="text-gray-400 text-base leading-relaxed max-w-xl mt-6">
                        Simplify your product photography with tools that handle everything. Combine into simple and fast workflows to get the desired results in seconds.
                    </p>
                </div>

                {/* Studio Interface Mockup (Full Width in Container) */}
                <div className="relative mx-4 lg:mx-0">
                    <div className="bg-[#0f0f0f] rounded-2xl overflow-hidden border border-[#333] h-[600px] flex flex-col">
                        {/* Window Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333] bg-[#141414] flex-shrink-0">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                            </div>
                            <span className="text-gray-500 text-xs font-medium ml-3">WeShoot AI Studio</span>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Sidebar - Specific Icons with Dividers and Blue Filter */}
                            <div className="hidden md:flex flex-col border-r border-[#333] bg-[#111] w-[70px] items-center">
                                {SIDEBAR_ICONS.map((icon, index) => (
                                    <div key={index} className="flex-1 w-full flex items-center justify-center border-b border-[#333] last:border-b-0">
                                        <img
                                            src={icon}
                                            alt=""
                                            className="w-6 h-6"
                                            style={{
                                                filter: 'invert(56%) sepia(39%) saturate(4687%) hue-rotate(199deg) brightness(101%) contrast(105%)'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Main Carousel Area - Persistent Left Padding */}
                            <div className="flex-1 overflow-hidden relative bg-[#111] flex flex-col justify-center pl-6">

                                {/* Scroll Container - Native Scroll for Touch/Drag */}
                                <div
                                    className="w-full h-full overflow-x-auto snap-x snap-mandatory flex items-center pr-8 no-scrollbar"
                                    ref={scrollContainerRef}
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    <div className="flex gap-5">
                                        {FEATURES.map((feature) => (
                                            <div key={feature.id}>
                                                <FeatureCard feature={feature} siteStatus={siteStatus} />
                                            </div>
                                        ))}
                                        <MoreToolsCard siteStatus={siteStatus} />
                                        {/* Spacer for last card visibility */}
                                        <div className="w-24 flex-shrink-0"></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right Edge Fade Overlay - Absolute over the container to hide borders */}
                    <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#0d0d0d] to-transparent z-10 pointer-events-none rounded-r-2xl"></div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-center gap-4 mt-12">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`w-10 h-10 rounded-full bg-[#2d2e30] flex items-center justify-center text-white transition-all
                            ${!canScrollLeft ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#3d3e40] cursor-pointer'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`w-10 h-10 rounded-full bg-[#2d2e30] flex items-center justify-center text-white transition-all
                            ${!canScrollRight ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#3d3e40] cursor-pointer'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

            </div>
        </section>
    );
};

export default FeaturesSection;

