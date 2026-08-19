/**
 * Product Suite Section
 * "Photography suite specifically trained to elevate your products"
 */
import { useState, useEffect, useRef } from 'react';

const ProductSuiteSection = () => {
    const [activeOption, setActiveOption] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [showCustomCursor, setShowCustomCursor] = useState(false);
    const headerRef = useRef(null);

    // Content options with images
    const options = [
        {
            id: 0,
            title: 'Our AI is trained on product photography and preserves logos, branding and product shapes',
            image: '/img/1.webp'
        },
        {
            id: 1,
            title: 'We provide advanced control with specific brand approved backgrounds and colors',
            image: '/img/2.webp'
        },
        {
            id: 2,
            title: 'We automatically adjust product quality and light for the best result',
            image: '/img/3.webp'
        }
    ];

    // Track mouse position within header area
    useEffect(() => {
        const handleMouseMove = (e) => {
            setCursorPosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section
            className="py-20 md:py-32 relative overflow-hidden"
            style={{
                background: 'linear-gradient(to bottom, #E0F2FE 0%, #F5F8FF 25%, #FFFFFF 50%, #F5F8FF 75%, #DBEAFE 100%)'
            }}
        >
            {/* Custom Cursor - Only in header area */}
            {showCustomCursor && (
                <div
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: `${cursorPosition.x}px`,
                        top: `${cursorPosition.y}px`,
                        transform: 'translate(0, 0)'
                    }}
                >
                    <div className="relative">
                        {/* Cursor SVG */}
                        <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6 absolute"
                            style={{ fill: 'black', left: 0, top: 0 }}
                        >
                            <path d="M3 2L21 12L13 14L11 22Z" />
                        </svg>

                        {/* Bubble */}
                        <div
                            className="absolute px-4 py-2 rounded-full text-sm font-medium shadow-lg whitespace-nowrap"
                            style={{
                                left: '32px',
                                top: '0px',
                                background: '#dfff9c',
                                color: '#000',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                            }}
                        >
                            you
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative Cursors and Badges - Desktop Only */}
            <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
                {/* Top right cursor and badge */}
                <div className="absolute top-20 right-[20%] animate-float">
                    <div className="relative w-fit">
                        {/* Cursor SVG */}
                        <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6 absolute"
                            style={{ fill: 'black' }}
                        >
                            <path d="M3 2L21 12L13 14L11 22Z" />
                        </svg>

                        {/* Bubble */}
                        <div
                            className="ml-8 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                            style={{
                                background: '#C8E6C9',
                                color: '#000',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                            }}
                        >
                            ECommerce Manager
                        </div>
                    </div>
                </div>

                {/* Bottom left cursor and badge */}
                <div className="absolute top-[45%] left-[15%] animate-float" style={{ animationDelay: '1s' }}>
                    <div className="relative w-fit">
                        {/* Cursor SVG */}
                        <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6 absolute"
                            style={{ fill: 'black' }}
                        >
                            <path d="M3 2L21 12L13 14L11 22Z" />
                        </svg>

                        {/* Bubble */}
                        <div
                            className="ml-8 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                            style={{
                                background: '#BBDEFB',
                                color: '#000',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                            }}
                        >
                            Director, Content Operations
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-0">
                {/* Section Header - Custom cursor area */}
                <div
                    ref={headerRef}
                    className="text-center max-w-4xl mx-auto mb-20 cursor-none"
                    onMouseEnter={() => setShowCustomCursor(true)}
                    onMouseLeave={() => setShowCustomCursor(false)}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Photography suite{' '}
                        <span
                            className="inline-block"
                            style={{
                                background: 'linear-gradient(90deg, #000000 0%, #4D96FF 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            specifically
                        </span>
                        <br />
                        trained to elevate your products
                    </h2>
                    <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                        With the same uploaded photos, WeShoot AI performs better than alternatives. Why? Because we only do product photography. Our team of engineers, programmers, and AI experts are solely focused on optimizing towards studio quality you're proud to use in professional settings.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left - Interactive Text Options */}
                    <div className="space-y-8 max-w-md">
                        {options.map((option, idx) => (
                            <div
                                key={option.id}
                                onClick={() => setActiveOption(idx)}
                                className="relative pl-5 cursor-pointer group"
                            >
                                {/* Vertical Line Indicator - Only visible when active */}
                                {activeOption === idx && (
                                    <div className="absolute left-0 top-0 w-0.5 h-full bg-black rounded-full" />
                                )}

                                <p
                                    className={`text-base leading-relaxed transition-colors duration-300 ${activeOption === idx ? 'text-gray-900 font-medium' : 'text-gray-400'
                                        }`}
                                >
                                    {option.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right - Image Display */}
                    <div className="relative">
                        {/* Main Image with Transition - No background, no shadow */}
                        <div className="relative rounded-2xl overflow-hidden">
                            {options.map((option, idx) => (
                                <img
                                    key={option.id}
                                    src={option.image}
                                    alt={`Product photography example ${idx + 1}`}
                                    className={`w-full h-auto transition-opacity duration-500 ${activeOption === idx ? 'opacity-100' : 'opacity-0 absolute inset-0'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </section>
    );
};

export default ProductSuiteSection;
