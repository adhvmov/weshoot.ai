import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { useAuth } from '../context/AuthContext';

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const MinusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
    </svg>
);

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(true);
    const { user } = useAuth();

    const plans = [
        {
            name: "Free trial",
            description: "Explore the product's capabilities",
            price: "Free",
            priceSuffix: "/ 50 credits",
            features: [
                "50 credits to use on any operation",
                "Access to all Standard tools",
                "Basic AI operations"
            ],
            buttonText: "Subscribe",
            isPopular: false,
            color: "bg-white",
            borderColor: "border-[#F1F5F9]",
            buttonStyle: "bg-[#0F172A] text-white hover:bg-[#1e293b]"
        },
        {
            name: "Essentials",
            description: "Perfect for simple editing and generations",
            price: isYearly ? "9" : "12",
            pricePrefix: "$",
            priceSuffix: "/ month",
            features: [
                "450 credits to use on any operation",
                "Powerful toolset for image editing",
                "Standard resolution (up to 2K)"
            ],
            buttonText: "Subscribe Now",
            isPopular: false,
            color: "bg-[#F8FAFC]",
            borderColor: "border-[#F1F5F9]",
            buttonStyle: "bg-white border-2 border-[#E2E8F0] text-[#0F172A] hover:border-[#4D96FF] hover:bg-[#F5F8FF] hover:text-[#4D96FF]"
        },
        {
            name: "Pro Plan",
            description: "Ideal for advanced editing and customizations",
            price: isYearly ? "24" : "29",
            pricePrefix: "$",
            priceSuffix: "/ month",
            features: [
                "1,400 credits for any operation",
                "Full access to all Premium Tools",
                "3x history preservation limit",
                "Higher resolution up to 4K"
            ],
            buttonText: "Get Started Pro",
            isPopular: true,
            color: "bg-white",
            borderColor: "border-[#4D96FF]",
            buttonStyle: "bg-[#4D96FF] text-white hover:bg-[#3b82f6] shadow-blue-500/20 shadow-lg animate-button-glow"
        },
        {
            name: "Business",
            description: "Scaleable plans custom to your company's needs",
            price: "Custom",
            priceSuffix: "/ month",
            features: [
                "Advanced API workflows",
                "Custom SLAs and setup",
                "Dedicated support and onboarding",
                "Early access to beta tools and research"
            ],
            features: [
                "Advanced API workflows",
                "Custom SLAs and setup",
                "Dedicated support and onboarding",
                "Early access to beta tools and research"
            ],
            buttonText: "Contact Sales",
            link: "/custom-request",
            isPopular: false,
            color: "bg-[#EEF2FF]",
            borderColor: "border-[#E0E7FF]",
            buttonStyle: "bg-[#0F172A] text-white hover:bg-[#1e293b]"
        }
    ];

    const comparisonData = [
        {
            feature: "Improve quality",
            free: { primary: "2", secondary: "0", label: "2K / 4K" },
            essentials: { primary: "30", secondary: "15", label: "2K / 4K" },
            pro: { primary: "100", secondary: "60", label: "2K / 4K" },
            business: "∞",
            note: "Max operations (12-18 credits)"
        },
        { feature: "Remove background", free: "5", essentials: "70", pro: "∞", business: "∞", note: "Max operations (5 credits)" },
        { feature: "AI Photoshoot", free: "5", essentials: "60", pro: "200", business: "∞", note: "Max generations (5 credits)" },
        { feature: "AI Background", free: "5", essentials: "60", pro: "200", business: "∞", note: "Max generations (5 credits)" },
        { feature: "AI Fashion", free: "2", essentials: "40", pro: "120", business: "∞", note: "Max generations (13 credits)" },
        {
            feature: "AI Video",
            free: { primary: "0", secondary: "0", label: "5s / 10s" },
            essentials: { primary: "6", secondary: "2", label: "5s / 10s" },
            pro: { primary: "20", secondary: "8", label: "5s / 10s" },
            business: "∞",
            note: "Max generations (45-85 credits)"
        },
        { feature: "AI Edit", free: "5", essentials: "60", pro: "200", business: "∞", note: "Max generations (5 credits)" },
        { feature: "Outpaint (extend) image", free: "Coming Soon", essentials: "Coming Soon", pro: "Coming Soon", business: "Coming Soon", note: "New tools arriving soon!" },
        { feature: "AI Shadows", free: "5", essentials: "60", pro: "200", business: "∞", note: "Max generations (5 credits)" },
        { feature: "Fix light & colors", free: "3", essentials: "40", pro: "120", business: "∞", note: "Max operations (10 credits)" },
        { feature: "Blur Background", free: "3", essentials: "40", pro: "120", business: "∞", note: "Max operations (5 credits)" },
        { feature: "Upload your own assets", free: true, essentials: true, pro: true, business: true, note: "Customize your generation" },
        { feature: "Export to popular formats", free: true, essentials: false, pro: true, business: "Custom", note: "Instagram stories, Shopify products, and more" },
        { feature: "Browse history", free: "24 hours", essentials: "1 month", pro: "3 months", business: "Custom", note: "Track your image generation history" },
        { feature: "API starter pack", free: "Yes", essentials: "Yes", pro: "Yes", business: "Yes", note: "50 credits to explore our API" },
        { feature: "Upload images", free: "Up to 10 MB / 48 MP", essentials: "Up to 10 MB / 24 MP", pro: "Up to 20 MB / 48 MP", business: "Custom", note: "Restriction on the size of uploaded images" },
        { feature: "Download images", free: "Up to 128 MP", essentials: "Up to 64 MP", pro: "Up to 128 MP", business: "Up to 559 MP", note: "Restriction on the size of downloaded images" },
        { feature: "Chat support", free: true, essentials: false, pro: true, business: true },
        { feature: "Tech support", free: false, essentials: false, pro: true, business: true },
        { feature: "Dedicated Customer success", free: false, essentials: false, pro: false, business: true },
        { feature: "Early access to beta tools and research", free: false, essentials: false, pro: false, business: true },
    ];

    const renderCell = (value) => {
        if (value === true) return <div className="w-5 h-5 rounded-full bg-[#4D96FF] flex items-center justify-center mx-auto"><CheckIcon className="w-3 h-3 text-white" /></div>;
        if (value === false) return <div className="flex justify-center"><MinusIcon className="w-4 h-4 text-[#CBD5E1]" /></div>;

        if (typeof value === 'object' && value.primary) {
            return (
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[13px] font-bold text-[#0F172A]">{value.primary} / {value.secondary}</span>
                    <span className="text-[9px] font-black text-[#64748B] uppercase tracking-tighter opacity-70">{value.label}</span>
                </div>
            );
        }

        return <span className="text-[13px] font-bold text-[#0F172A]">{value}</span>;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-44 pb-32 px-4">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4D96FF]/10 text-[#4D96FF] text-[12px] font-black uppercase tracking-wider mb-6">
                        Pricing Plans
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight mb-6">
                        Grow your business with <span className="italic font-serif text-[#4D96FF]">WeShoot</span>
                    </h1>
                    <p className="text-xl text-[#64748B] font-medium max-w-2xl mx-auto mb-10">
                        Choose the perfect plan for your creative needs. From individuals to large-scale enterprises.
                    </p>

                    {/* Desktop Toggle */}
                    <div className="hidden md:flex items-center justify-center gap-4">
                        <span className={`text-[14px] font-bold tracking-tight transition-colors ${!isYearly ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>Billed monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-8 bg-[#0F172A] rounded-full relative transition-all hover:scale-105 active:scale-95 focus:outline-none ring-4 ring-transparent hover:ring-[#4D96FF]/10"
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-[14px] font-bold tracking-tight flex items-center gap-2 transition-colors ${isYearly ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                            Billed yearly
                            <span className="px-2.5 py-0.5 bg-[#4D96FF]/10 text-[#4D96FF] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#4D96FF]/20 shadow-sm">Save up to $60</span>
                        </span>
                    </div>

                    {/* Mobile Tab Switcher */}
                    <div className="flex md:hidden bg-[#F8FAFC] border border-[#F1F5F9] p-1.5 rounded-2xl mx-auto max-w-[300px]">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-[#0F172A] text-white shadow-xl shadow-gray-200/50' : 'text-[#94A3B8] hover:text-[#0F172A]'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${isYearly ? 'bg-[#0F172A] text-white shadow-xl shadow-gray-200/50' : 'text-[#94A3B8] hover:text-[#0F172A]'}`}
                        >
                            Yearly
                            {isYearly && (
                                <span className="absolute -top-3 -right-2 px-2 py-0.5 bg-[#4D96FF] text-white text-[8px] font-black rounded-full border-2 border-white shadow-sm">SAVE UP TO $60</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`${plan.color} border-[12px] border-[#F5F8FF] ${plan.isPopular ? 'ring-4 ring-[#4D96FF]/20 mt-[-10px] mb-[10px]' : ''} rounded-[32px] p-8 transition-all hover:scale-[1.02] duration-300 flex flex-col relative overflow-hidden group shadow-sm`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 bg-[#4D96FF] text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-black text-[#0F172A] mb-1">{plan.name}</h3>
                                <p className="text-[13px] font-medium text-[#64748B] mb-8">{plan.description}</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    {plan.pricePrefix && <span className="text-xl font-black text-[#0F172A]">{plan.pricePrefix}</span>}
                                    <span className="text-5xl font-black text-[#0F172A] tracking-tighter">{plan.price}</span>
                                    <span className="text-[13px] font-bold text-[#64748B] tracking-tight">{plan.priceSuffix}</span>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm ${plan.isPopular ? 'bg-[#4D96FF]' : 'bg-white border border-[#E2E8F0]'}`}>
                                                {plan.isPopular ? <PlusIcon className="w-3 h-3 text-white" /> : <CheckIcon className="w-3 h-3 text-[#4D96FF]" />}
                                            </div>
                                            <span className={`text-[13px] ${plan.isPopular ? 'font-black text-[#0F172A]' : 'font-bold text-[#475569]'}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.link ? (
                                    <Link
                                        to={plan.link}
                                        className={`w-full py-4 rounded-2xl font-black text-[13px] transition-all transform active:scale-95 block text-center ${plan.buttonStyle}`}
                                    >
                                        {plan.buttonText}
                                    </Link>
                                ) : plan.name === "Free trial" ? (
                                    // Free trial plan: Show "Subscribed" if logged in, "Try Now" with login link if not
                                    user ? (
                                        <button className="w-full py-4 rounded-2xl font-black text-[13px] transition-all transform active:scale-95 bg-[#10B981] text-white flex items-center justify-center gap-2 cursor-default" disabled>
                                            <CheckIcon className="w-5 h-5" />
                                            Subscribed
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            className={`w-full py-4 rounded-2xl font-black text-[13px] transition-all transform active:scale-95 block text-center ${plan.buttonStyle}`}
                                        >
                                            Try Now
                                        </Link>
                                    )
                                ) : (
                                    <button className={`w-full py-4 rounded-2xl font-black text-[13px] transition-all transform active:scale-95 ${plan.buttonStyle}`}>
                                        {plan.buttonText}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add-On Credits Section */}
                <div className="max-w-4xl mx-auto mb-32">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-wider mb-4">
                            🔥 Custom Plans
                        </div>
                        <h2 className="text-3xl font-black text-[#0F172A]">Add-On Credits</h2>
                        <p className="text-[#64748B] font-medium mt-2">Need more? Top up your account with extra credits anytime.</p>
                    </div>

                    <div className="bg-white rounded-[32px] border-2 border-[#F1F5F9] overflow-hidden shadow-xl">
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]">
                            {[
                                { credits: "100 cr", price: "$4" },
                                { credits: "500 cr", price: "$18" },
                                { credits: "2000 cr", price: "$60" }
                            ].map((addon, i) => (
                                <div key={i} className="p-8 flex flex-col items-center justify-center hover:bg-[#F8FAFC] transition-colors group">
                                    <div className="text-2xl font-black text-[#0F172A] mb-2 group-hover:scale-110 transition-transform">{addon.credits}</div>
                                    <div className="text-4xl font-black text-[#4D96FF] tracking-tighter mb-6">{addon.price}</div>
                                    <button className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#1e293b] active:scale-95 transition-all">
                                        Buy Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-[#0F172A] mb-4">Compare all features</h2>
                        <p className="text-[#64748B] font-medium italic">Detailed comparison of our plans and capabilities</p>
                    </div>

                    <div className="bg-white rounded-[32px] border-2 border-[#F1F5F9] overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F8FAFC]">
                                        <th className="py-6 px-8 text-[13px] font-black text-[#0F172A] uppercase tracking-widest">Key features</th>
                                        <th className="py-6 px-4 text-center text-[13px] font-black text-[#0F172A] uppercase tracking-widest">Free trial</th>
                                        <th className="py-6 px-4 text-center text-[13px] font-black text-[#0F172A] uppercase tracking-widest">Essentials</th>
                                        <th className="py-6 px-4 text-center text-[13px] font-black text-[#0F172A] uppercase tracking-widest">Pro</th>
                                        <th className="py-6 px-8 text-center text-[13px] font-black text-[#0F172A] uppercase tracking-widest">Business</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F5F9]">
                                    {comparisonData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                                            <td className="py-6 px-8">
                                                <div className="font-bold text-[#0F172A] text-[15px]">{row.feature}</div>
                                                {row.note && <div className="text-[11px] text-[#64748B] font-medium mt-1">{row.note}</div>}
                                            </td>
                                            <td className="py-6 px-4 text-center">{renderCell(row.free)}</td>
                                            <td className="py-6 px-4 text-center">{renderCell(row.essentials)}</td>
                                            <td className="py-6 px-4 text-center">{renderCell(row.pro)}</td>
                                            <td className="py-6 px-8 text-center">{renderCell(row.business)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-[12px] text-[#64748B] font-medium space-x-4">
                        <span>*Prices might be subject to change</span>
                        <span>**Detailed pricing tiers can be found <a href="#" className="text-[#4D96FF] hover:underline">here</a></span>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PricingPage;
