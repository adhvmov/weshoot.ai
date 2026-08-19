/**
 * Backgrounds Section
 * Dark themed "Photorealistic backgrounds" section
 */
import { Button, Badge } from '../common';

const BackgroundsSection = () => {
    // Background categories
    const categories = [
        { name: 'Studio', count: 150 },
        { name: 'Lifestyle', count: 200 },
        { name: 'Nature', count: 180 },
        { name: 'Abstract', count: 120 },
        { name: 'Custom', count: '∞' },
    ];

    return (
        <section className="py-20 md:py-32 bg-gray-900 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content */}
                    <div>
                        <Badge variant="gradient" className="mb-6">
                            Background Generation
                        </Badge>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                            Photorealistic
                            <br />
                            <span className="gradient-text-pink">backgrounds</span>
                            <br />
                            for your products
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-md">
                            Generate stunning, photorealistic backgrounds that perfectly complement your products.
                            Choose from hundreds of templates or create custom scenes with AI.
                        </p>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="px-4 py-2 bg-white/10 rounded-full text-sm text-white hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    {category.name} <span className="text-white/60">({category.count})</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            to="/generate"
                            variant="gradient"
                            size="lg"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            }
                        >
                            Try it free
                        </Button>
                    </div>

                    {/* Image showcase */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Main large image */}
                            <div className="col-span-2 aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Product mock */}
                                    <div className="w-32 h-48 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-500"></div>
                                </div>
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                                {/* Label */}
                                <div className="absolute bottom-4 left-4">
                                    <span className="text-xs text-white/60">Generated Background</span>
                                    <p className="text-white font-medium">Modern Kitchen</p>
                                </div>
                            </div>

                            {/* Smaller images */}
                            <div className="aspect-square bg-gradient-to-br from-purple-800 to-purple-600 rounded-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-20 bg-white/20 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="text-xs text-white/80">Studio Light</span>
                                </div>
                            </div>

                            <div className="aspect-square bg-gradient-to-br from-amber-800 to-orange-600 rounded-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-20 bg-white/20 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="text-xs text-white/80">Warm Sunset</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating stats card */}
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">500+</p>
                                    <p className="text-sm text-gray-500">Background templates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BackgroundsSection;
