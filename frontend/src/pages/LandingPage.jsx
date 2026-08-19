import { useContext } from 'react';
import { Header, Footer } from '../components/layout';
import { Link } from 'react-router-dom';
import { SiteStatusContext } from '../App';
import {
    HeroSection,
    FeaturesSection,
    ProductSuiteSection,
    StatsShowcaseSection,
    OnboardSellersSection,
    VisualAssetsSection,
    FAQSection,
    ContactSection,
} from '../components/sections';

const LandingPage = () => {
    const siteStatus = useContext(SiteStatusContext);

    return (
        <div className="min-h-screen bg-white">
            {/* Header/Navigation */}
            <Header />

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <HeroSection siteStatus={siteStatus} />

                {/* Features Section - Dark studio mockup */}
                <FeaturesSection siteStatus={siteStatus} />

                {/* Product Suite Section - Gradient background */}
                <ProductSuiteSection siteStatus={siteStatus} />

                {/* Stats Showcase Section */}
                <StatsShowcaseSection siteStatus={siteStatus} />

                {/* Onboard Sellers Section */}
                <OnboardSellersSection siteStatus={siteStatus} />

                {/* Visual Assets Section */}
                <VisualAssetsSection siteStatus={siteStatus} />

                {/* FAQ Section */}
                <FAQSection siteStatus={siteStatus} />

                {/* Contact Us Section */}
                <ContactSection />

                {/* New Image Footer Section - No margin, footer_img.png background */}
                <section className="w-full">
                    <img
                        src="/img/footer_img.png"
                        alt="Footer Image"
                        className="w-full block"
                    />
                </section>

                {/* Legal Links Bar */}
                <section className="w-full py-2 md:py-4 bg-[#F5F8FF] hidden md:block">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 md:gap-8">
                        <Link
                            to="/terms"
                            onClick={(e) => {
                                if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
                                    e.preventDefault();
                                    siteStatus.showEarlyAccessModal();
                                }
                            }}
                            className="text-[10px] md:text-sm font-medium text-[#0F172A] hover:text-[#4D96FF] transition-colors"
                        >
                            Terms of service
                        </Link>
                        <span className="text-[#CBD5E1] text-[10px] md:text-sm">•</span>
                        <Link
                            to="/privacy"
                            onClick={(e) => {
                                if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
                                    e.preventDefault();
                                    siteStatus.showEarlyAccessModal();
                                }
                            }}
                            className="text-[10px] md:text-sm font-medium text-[#0F172A] hover:text-[#4D96FF] transition-colors"
                        >
                            Privacy policy
                        </Link>
                    </div>
                </section>
            </main>

            {/* Fixed Minimal Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
