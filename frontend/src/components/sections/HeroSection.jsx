
/**
 * Hero Section
 * Redesigned with Left Text Content and Right Scrolling Images
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Row 1 Images - 12 items
const ROW_1_IMAGES = [
    '/img/prompt_img/tumbler_1_min_34bcae2163.png',
    '/img/prompt_img/armchair_2_min_ec8eb362ae.png',
    '/img/prompt_img/bag_1_min_e658f15f7a.png',
    '/img/prompt_img/butter_2_min_53804c91bc.png',
    '/img/prompt_img/can_1_min_2cc88e17b2.png',
    '/img/prompt_img/can_2_min_6eabb7f749.png',
    '/img/prompt_img/toy_3_min_f1ffab6f3a.png',
    '/img/prompt_img/sneaker_2_min_a7ca6bd400.png',
    '/img/prompt_img/necklace_2_min_b22093079b.png',
    '/img/prompt_img/lipstick_2_min_7ab353b07d.png',
    '/img/prompt_img/shampoo_2_min_5c5c353d8f.png',
    '/img/prompt_img/candle_3_min_7fc297c809.png'
];

// Row 2 Images - 12 items
const ROW_2_IMAGES = [
    '/img/prompt_img/lamp_1_min_620de4badf.png',
    '/img/prompt_img/bag_3_min_3830e4b2f7.png',
    '/img/prompt_img/can_3_min_e0c5d88012.png',
    '/img/prompt_img/candle_1_min_ffe1b39ff1.png',
    '/img/prompt_img/chair_1_min_7ef7ec285d.png',
    '/img/prompt_img/tumbler_3_min_cb6d8e02d9.png',
    '/img/prompt_img/sneaker_3_min_f04f7e55be.png',
    '/img/prompt_img/toy_2_min_0db18329b1.png',
    '/img/prompt_img/necklace_3_min_093d34ec71.png',
    '/img/prompt_img/shampoo_1_min_6d742a9405.png',
    '/img/prompt_img/armchair_1_min_bd4d0f0e23.png',
    '/img/prompt_img/lipstick_1_min_3ef4b3a089.png'
];

const ScrollingColumn = ({ images, speed = "slow", offset = false }) => {
    // Duplicate images to create seamless loop
    const displayImages = [...images, ...images];

    return (
        <div className={`relative flex flex-col gap-4 w-1/2 overflow-hidden h-[600px] ${offset ? 'mt-8' : ''}`}>
            <div className={`flex flex-col gap-4 animate-scroll-vertical ${speed === 'fast' ? 'duration-[40s]' : 'duration-[60s]'}`}>
                {displayImages.map((src, idx) => (
                    <div key={idx} className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                        <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            {/* Overlay Gradients */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F5F8FF] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F8FF] to-transparent z-10 pointer-events-none"></div>
        </div>
    );
};

const HeroSection = ({ siteStatus }) => {
    const [userCount, setUserCount] = useState(2100);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await api.get('/auth/user-count');
                if (response.data.success && response.data.count > 0) {
                    setUserCount(response.data.count);
                }
            } catch (error) {
                console.error('Failed to fetch user count:', error);
            }
        };

        fetchUserCount();
    }, []);

    const handleCTAClick = (e, defaultPath) => {
        if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
            e.preventDefault();
            siteStatus.showEarlyAccessModal();
        }
    };

    return (
        <section className="relative w-full bg-[#F5F8FF] overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 px-4">
            {/* Container - Aligned with Header max-w-7xl */}
            <div className="w-full max-w-7xl mx-auto px-0">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Side - Content (50%) */}
                    <div className="hero-content w-full lg:w-1/2 text-left space-y-8 z-10">
                        {/* Notify / Tag */}
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            <div className="flex -space-x-2">
                                <img src="/img/prompt_img/tumbler_1_min_34bcae2163.png" className="w-6 h-6 rounded-full border border-white" alt="" />
                                <img src="/img/prompt_img/sneaker_2_min_a7ca6bd400.png" className="w-6 h-6 rounded-full border border-white" alt="" />
                                <img src="/img/prompt_img/bag_1_min_e658f15f7a.png" className="w-6 h-6 rounded-full border border-white" alt="" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Join {userCount.toLocaleString()} users to create images.</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold tracking-tight text-[#0F172A] leading-[1.1]">
                            Bring Your Ideas<br />
                            to Life with<br />
                            <span className="italic font-serif text-[#4D96FF]">WeShoot AI</span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Describe anything you can imagine, and let our AI turn it into photoshoot, high-quality images.
                        </p>

                        <div className="hero-buttons flex flex-wrap gap-4 pt-2">
                            {/* Primary Button */}
                            <Link
                                to="/login?signup=true"
                                onClick={handleCTAClick}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[16px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px] min-w-[160px]"
                            >
                                Start Creating
                            </Link>

                            {/* Secondary Button */}
                            <Link
                                to="/pricing"
                                onClick={handleCTAClick}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 bg-transparent border border-gray-200 rounded-[16px] hover:bg-white/50 hover:border-gray-300 transition-all duration-200 min-w-[160px]"
                            >
                                subscribe
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Image Scroll (50%) */}
                    <div className="w-full lg:w-1/2 flex gap-4 h-[500px] sm:h-[600px] relative">
                        <ScrollingColumn images={ROW_1_IMAGES} speed="slow" />
                        <ScrollingColumn images={ROW_2_IMAGES} speed="slow" offset={true} />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
