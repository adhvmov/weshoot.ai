/**
 * Before/After Section
 * Photography suite section with interactive image display
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

const BeforeAfterSection = () => {
    const [activeOption, setActiveOption] = useState(0);

    // Content options
    const options = [
        {
            id: 0,
            title: 'AI-enhanced visuals',
            description: 'Transform ordinary photos into professional product shots',
            image: '/img/1.webp' // Current/first image
        },
        {
            id: 1,
            title: 'Smart background removal',
            description: 'Perfect cutouts in seconds with intelligent edge detection',
            image: '/img/2.webp'
        },
        {
            id: 2,
            title: 'Automated color correction',
            description: 'Get consistent, vibrant colors across your entire catalog',
            image: '/img/3.webp'
        }
    ];

    return (
        <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Gradient Background */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #F5F8FF 0%, #E0E7FF 30%, #DDD6FE 60%, #F3E8FF 100%)'
                }}
            />

            {/* Floating Mouse Cursors */}
            <div className="absolute top-12 right-[15%] hidden lg:flex items-center gap-3 animate-float">
                <svg className="w-6 h-6 text-gray-800 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3v18l7-5 4 8 3-2-4-8h8L3 3z" />
                </svg>
                <div className="px-4 py-2 bg-[#C8E6C9] rounded-full text-sm font-medium text-gray-800 shadow-lg">
                    ECommerce Manager
                </div>
            </div>

            <div className="absolute bottom-32 left-[12%] hidden lg:flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                <svg className="w-6 h-6 text-gray-800 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3v18l7-5 4 8 3-2-4-8h8L3 3z" />
                </svg>
                <div className="px-4 py-2 bg-[#BBDEFB] rounded-full text-sm font-medium text-gray-800 shadow-lg">
                    Director, Content Operations
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        Photography suite{' '}
                        <span
                            className="inline-block"
                            style={{
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)',
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
                    <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
                        With the same uploaded photos, WeShoot AI performs better than alternatives. Why? Because we only do product photography. Our team of engineers, programmers, and AI experts are solely focused on optimizing towards studio quality you're proud to use in professional settings.
                    </p>
                </div>

                {/* Interactive Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

                    {/* Left: Image Display */}
                    <div className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white">
                            {options.map((option, idx) => (
                                <img
                                    key={option.id}
                                    src={option.image}
                                    alt={option.title}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${activeOption === idx ? 'opacity-100' : 'opacity-0 absolute inset-0'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Text Options */}
                    <div className="space-y-8">
                        {options.map((option, idx) => (
                            <div
                                key={option.id}
                                onClick={() => setActiveOption(idx)}
                                className="relative pl-8 cursor-pointer group"
                            >
                                {/* Vertical Line Indicator */}
                                <div
                                    className={`absolute left-0 top-0 w-1 h-full rounded-full transition-all duration-300 ${activeOption === idx
                                        ? 'bg-gradient-to-b from-[#8B5CF6] via-[#6366F1] to-[#3B82F6]'
                                        : 'bg-gray-300'
                                        }`}
                                />

                                <div>
                                    <h3
                                        className={`text-2xl md:text-3xl font-bold mb-2 transition-colors duration-300 ${activeOption === idx ? 'text-gray-900' : 'text-gray-400'
                                            }`}
                                    >
                                        {option.title}
                                    </h3>
                                    <p
                                        className={`text-base transition-colors duration-300 ${activeOption === idx ? 'text-gray-600' : 'text-gray-400'
                                            }`}
                                    >
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* CTA Button */}
                <div className="mt-16 text-center">
                    <Link
                        to="/login?signup=true"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[16px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px]"
                    >
                        Start creating for free
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterSection;
