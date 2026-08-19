/**
 * Redesigned Visual Assets Section
 * Black background, smooth sliding infinite carousel with neighbors preview and dots below
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const VisualAssetsSection = () => {
    const tabs = [
        { name: 'Product', image: '/img/switch_buttons/Product.webp' },
        { name: 'Lifestyle', image: '/img/switch_buttons/Lifestyle.webp' },
        { name: 'Food', image: '/img/switch_buttons/Food.webp' },
        { name: 'Cars', image: '/img/switch_buttons/Cars.webp' },
        { name: 'People', image: '/img/switch_buttons/People.webp' }
    ];

    // To create an infinite loop effect, we prepend the last item and append the first item
    const displayTabs = [tabs[tabs.length - 1], ...tabs, tabs[0]];
    const [activeIndex, setActiveIndex] = useState(0); // This is the index relative to the original 'tabs'
    const [isTransitioning, setIsTransitioning] = useState(true);
    const transitionTimeout = useRef(null);

    const handleIndexChange = useCallback((newIndex) => {
        setIsTransitioning(true);
        setActiveIndex(newIndex);
    }, []);

    const nextSlide = useCallback(() => {
        handleIndexChange(activeIndex + 1);
    }, [activeIndex, handleIndexChange]);

    // Handle the "jump" for infinite looping
    useEffect(() => {
        if (activeIndex === tabs.length) {
            // We are at the 'First' clone (idx 5 in tabs, idx 6 in displayTabs)
            transitionTimeout.current = setTimeout(() => {
                setIsTransitioning(false);
                setActiveIndex(0);
            }, 700); // Match CSS transition duration
        } else if (activeIndex === -1) {
            // We are at the 'Last' clone
            transitionTimeout.current = setTimeout(() => {
                setIsTransitioning(false);
                setActiveIndex(tabs.length - 1);
            }, 700);
        }
        return () => clearTimeout(transitionTimeout.current);
    }, [activeIndex, tabs.length]);

    // Auto-switch every 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 10000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="pt-12 md:pt-24 pb-0 md:pb-32 bg-[#000000] overflow-hidden">
            <div className="max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="text-center mb-16 px-4">
                    <p className="text-[#4D96FF] font-semibold text-base md:text-xl mb-3 md:mb-4">
                        Everything you need to grow online.
                    </p>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        Power Your Business
                    </h2>
                </div>

                {/* Categories Switcher */}
                <div className="flex justify-center mb-10 md:mb-20 px-4 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="inline-flex bg-[#000812] p-1.5 rounded-[18px] md:rounded-[24px] shrink-0">
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab.name}
                                onClick={() => handleIndexChange(idx)}
                                className={`px-4 md:px-10 py-2 md:py-4 rounded-[14px] md:rounded-[20px] text-xs md:text-lg font-bold transition-all duration-500 whitespace-nowrap ${(activeIndex === idx || (activeIndex === -1 && idx === tabs.length - 1) || (activeIndex === tabs.length && idx === 0))
                                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                    : 'text-[#888888] hover:text-white'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carousel with Neighbors and Smooth Slide */}
                <div className="relative w-full h-[220px] md:h-[500px] lg:h-[600px]">
                    {/* Track Container */}
                    <div className="absolute inset-0 overflow-visible">
                        <div
                            className={`absolute top-0 flex ${isTransitioning ? 'transition-all duration-700 ease-in-out' : ''}`}
                            style={{
                                left: '50%',
                                transform: `translateX(calc(-1 * ( ((${activeIndex} + 1) * (var(--slide-width) + var(--gap))) + (var(--slide-width) / 2) )))`,
                                '--slide-width': '84vw', // Responsive width captured in CSS variables below
                                '--gap': '16px',
                                gap: 'var(--gap)'
                            }}
                        >
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                :root {
                                    --slide-width: 80vw;
                                    --gap: 16px;
                                }
                                @media (min-width: 768px) {
                                    :root {
                                        --slide-width: 70vw;
                                        --gap: 24px;
                                    }
                                }
                                @media (min-width: 1024px) {
                                    :root {
                                        --slide-width: 60vw;
                                        --gap: 32px;
                                    }
                                }
                                @media (min-width: 1440px) {
                                    :root {
                                        --slide-width: 900px;
                                        --gap: 40px;
                                    }
                                }
                            `}} />

                            {displayTabs.map((tab, idx) => {
                                // Calculate if this specific slide in displayTabs is the "active" one visually
                                const isVisualActive = (idx === activeIndex + 1);

                                return (
                                    <div
                                        key={`${tab.name}-${idx}`}
                                        className={`relative shrink-0 transition-all duration-700 rounded-[20px] md:rounded-[40px] overflow-hidden ${isVisualActive ? 'opacity-100 shadow-[0_0_60px_rgba(255,255,255,0.05)] scale-100' : 'opacity-40 scale-[0.92]'
                                            }`}
                                        style={{
                                            width: 'var(--slide-width)',
                                            height: '100%'
                                        }}
                                    >
                                        <img
                                            src={tab.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Pagination Dots Under the Image */}
                <div className="hidden md:flex justify-center items-center gap-2.5 mt-10 md:mt-16">
                    {tabs.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleIndexChange(idx)}
                            className={`rounded-full transition-all duration-500 p-0 border-none outline-none flex-none ${(activeIndex === idx || (activeIndex === -1 && idx === tabs.length - 1) || (activeIndex === tabs.length && idx === 0))
                                ? 'bg-white w-10 md:w-16 h-1 md:h-2'
                                : 'bg-white/30 w-1.5 md:w-2.5 h-1 md:h-2 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VisualAssetsSection;
