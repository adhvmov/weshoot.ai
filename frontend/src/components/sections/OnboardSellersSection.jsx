/**
 * How It Works Section (Redesigned)
 * Consolidates Improve Conversions, Onboard Sellers, and Instantly Edit
 */
import { Link } from 'react-router-dom';

const HowItWorksSection = ({ siteStatus }) => {
    const steps = [
        {
            id: 1,
            title: "Improve conversions with polished product shots",
            description: "Edit and generate high-converting creatives for catalogs, marketing and ad campaigns. Turn a single product photo into numerous unique, realistic and appealing visuals that engage your customers.",
            image: "/img/Img_1.webp"
        },
        {
            id: 2,
            title: "Onboard sellers faster with 80% reduction in editing costs",
            description: "Our AI automatically checks and edits images to any platform requirements in just 2-3 seconds time. That ensures catalog consistency and speeds up onboarding 5x cheaper than traditional editing services.",
            image: "/img/Img_2.webp"
        },
        {
            id: 3,
            title: "Instantly edit thousands of images in brand style",
            description: "Create unique images in your brand style. Our AI is trained to recognize and preserve product details, logos and replicate backgrounds via API.",
            image: "/img/Img_3.webp"
        }
    ];

    return (
        <section className="relative py-24 md:py-32 bg-white overflow-hidden">
            {/* Background Gradients in Corners */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#E0F2FE] opacity-[0.4] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#DBEAFE] opacity-[0.3] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DBEAFE] opacity-[0.3] rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#E0F2FE] opacity-[0.4] rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 lg:px-0 relative z-10">
                {/* Header with Get Started Button */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-0">
                    <div className="max-w-4xl">
                        <span className="text-[#4D96FF] font-semibold text-xl mb-4 block">How It Works</span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F172A] leading-tight">
                            Redesign and edit your products in minutes
                        </h2>
                    </div>
                    <div>
                        <Link
                            to="/login?signup=true"
                            onClick={(e) => {
                                if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
                                    e.preventDefault();
                                    siteStatus.showEarlyAccessModal();
                                }
                            }}
                            className="inline-flex items-center justify-center px-10 py-3 text-sm font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[14px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px] min-w-[180px]"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.id} className="group">
                            {/* Image Container with #F5F8FF border */}
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-[8px] border-[#F5F8FF] shadow-sm mb-8 bg-[#F5F8FF]">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-base leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
