/**
 * FAQ Section
 * Frequently Asked Questions - Redesigned
 */
import { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div
            className={`transition-all duration-500 rounded-[20px] border px-6 md:px-10 bg-white overflow-hidden ${isOpen ? 'border-[#4D96FF]/30 shadow-lg' : 'border-[#F5F8FF]'
                }`}
        >
            <button
                className="w-full py-3 md:py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={onToggle}
            >
                <span className="text-lg md:text-xl font-bold text-[#0F172A] pr-4">{question}</span>
                <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-500 bg-[#4D96FF] border-[2px] border-[#9AC5FF] rounded-lg shadow-[rgba(58,137,253,0.3)_0px_8px_16px] ${isOpen ? 'scale-105' : 'hover:scale-105'
                    }`}>
                    <img
                        src={isOpen ? "/site_icons/icon-2.svg" : "/site_icons/plus.svg"}
                        alt={isOpen ? "Close" : "Open"}
                        className="w-3 h-3 md:w-4 md:h-4 brightness-0 invert"
                    />
                </div>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-5xl">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(-1);

    const faqs = [
        {
            question: "What is WeShoot AI and how does it work?",
            answer: "WeShoot is an AI-powered visual editing platform that transforms raw product photos into professional, studio-quality assets. Our AI handles background removal, lighting correction, and detail enhancement automatically, saving you hours of manual editing."
        },
        {
            question: "What can I build with WeShoot AI?",
            answer: "You can generate hundreds of high-converting visual assets for e-commerce, advertising, and social media. This includes lifestyle shots, catalog images with consistent backgrounds, and creative product compositions for any industry."
        },
        {
            question: "How does WeShoot AI's pricing work?",
            answer: "We offer flexible credit-based plans tailored to your needs. You can choose from monthly subscriptions or pay-as-you-go options, ensuring you only pay for the images you actually generate and download."
        },
        {
            question: "Do I need design or coding experience to use WeShoot AI?",
            answer: "Not at all. WeShoot is designed for everyone—builders, marketers, and business owners. Our intuitive dashboard makes it easy to process images with one click, and our robust API is available for developers wanting to automate at scale."
        }
    ];

    return (
        <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#FFFFFF] to-[#FFFFFF] overflow-hidden">

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <p className="text-[#4D96FF] font-semibold text-base md:text-lg mb-4">
                        Frequently Asked Questions
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight">
                        Still have questions about <span className="italic font-serif text-[#4D96FF]">WeShoot AI</span>?
                    </h2>
                </div>

                {/* FAQ List */}
                <div className="space-y-4 md:space-y-6 w-full mx-auto">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            {...faq}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;

