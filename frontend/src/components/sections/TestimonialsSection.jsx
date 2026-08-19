/**
 * Testimonials Section
 * Customer reviews and testimonials
 */
import { SectionTitle, Badge } from '../common';

const TestimonialsSection = () => {
    // Testimonials data
    const testimonials = [
        {
            id: 1,
            content: "WeShoot has completely transformed our product photography workflow. We've reduced our photo editing time by 80% and the quality is incredible.",
            author: 'Sarah Johnson',
            role: 'E-commerce Manager',
            company: 'Fashion Forward',
            avatar: null,
            rating: 5,
        },
        {
            id: 2,
            content: "The AI background generation is mind-blowing. Our products look like they were shot in a professional studio with expensive setups.",
            author: 'Michael Chen',
            role: 'Founder',
            company: 'Tech Gadgets Co',
            avatar: null,
            rating: 5,
        },
        {
            id: 3,
            content: "We process thousands of images monthly. WeShoot's batch processing saved us countless hours and improved consistency across all our listings.",
            author: 'Emily Rodriguez',
            role: 'Operations Director',
            company: 'Home Essentials',
            avatar: null,
            rating: 5,
        },
    ];

    // Company logos
    const companies = [
        'Shopify',
        'Amazon',
        'Etsy',
        'eBay',
        'WooCommerce',
        'BigCommerce',
    ];

    return (
        <section className="py-20 md:py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <SectionTitle
                    badge={<Badge variant="primary">Testimonials</Badge>}
                    title={
                        <>
                            Loved by
                            <br />
                            <span className="gradient-text">thousands</span>
                        </>
                    }
                    subtitle="See what our customers have to say about their experience with WeShoot."
                />

                {/* Testimonials Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                                    <p className="text-sm text-gray-500">
                                        {testimonial.role} at {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Company Logos */}
                <div className="mt-20">
                    <p className="text-center text-sm text-gray-500 mb-8">
                        Trusted by leading e-commerce brands
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {companies.map((company) => (
                            <div
                                key={company}
                                className="text-gray-400 font-bold text-xl md:text-2xl hover:text-gray-600 transition-colors cursor-default"
                            >
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
