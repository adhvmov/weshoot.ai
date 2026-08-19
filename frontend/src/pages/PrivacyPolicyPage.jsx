import { Header, Footer } from '../components/layout';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-44 pb-32 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-[#64748B] font-medium mb-12">
                        Last updated: January 18, 2026
                    </p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">1. Introduction</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                WeShoot ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered image generation and editing platform.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">2. Information We Collect</h2>

                            <h3 className="text-xl font-bold text-[#0F172A] mb-3 mt-6">2.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Account Information:</strong> Name, email address, password, and billing information</li>
                                <li><strong>User Content:</strong> Images you upload to our platform for processing</li>
                                <li><strong>Communication Data:</strong> Messages you send us through support channels</li>
                                <li><strong>Payment Information:</strong> Credit card information processed through secure payment providers</li>
                            </ul>

                            <h3 className="text-xl font-bold text-[#0F172A] mb-3 mt-6">2.2 Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Usage Data:</strong> Features used, operations performed, credits consumed</li>
                                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                                <li><strong>Log Data:</strong> Access times, pages viewed, errors encountered</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">3. How We Use Your Information</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We use the collected information for the following purposes:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Service Provision:</strong> To process your images using our AI models and deliver results</li>
                                <li><strong>Account Management:</strong> To create and maintain your account</li>
                                <li><strong>Billing:</strong> To process payments and manage subscriptions</li>
                                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models (using aggregated, anonymized data)</li>
                                <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
                                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">4. How We Handle Your Images</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>Image Processing:</strong> Images you upload are processed by our AI models to provide the requested services (upscaling, background removal, generation, etc.).
                            </p>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>Storage:</strong> Your uploaded and generated images are stored temporarily for the duration specified by your subscription plan:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li>Free Trial: 24 hours</li>
                                <li>Essentials Plan: 1 month</li>
                                <li>Pro Plan: 3 months</li>
                                <li>Business Plan: Custom retention period</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>AI Training:</strong> We do not use your uploaded images to train or improve our AI models without your explicit consent.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">5. Information Sharing and Disclosure</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We may share your information in the following situations:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Service Providers:</strong> Third-party companies that help us provide our services (cloud hosting, payment processing, analytics)</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">6. Data Security</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We implement industry-standard security measures to protect your information:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li>Encryption in transit (HTTPS/TLS)</li>
                                <li>Encryption at rest for stored data</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication</li>
                                <li>Secure payment processing (PCI DSS compliant)</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">7. Your Privacy Rights</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                                <li><strong>Deletion:</strong> Request deletion of your data</li>
                                <li><strong>Portability:</strong> Request transfer of your data</li>
                                <li><strong>Objection:</strong> Object to certain processing activities</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                To exercise these rights, please contact us at privacy@weshoot.ai
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">8. Cookies and Tracking Technologies</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We use cookies and similar technologies for:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Essential Cookies:</strong> Required for the platform to function</li>
                                <li><strong>Analytics Cookies:</strong> To understand how users interact with our service</li>
                                <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                You can control cookies through your browser settings, but disabling certain cookies may limit functionality.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">9. Third-Party Services</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Our platform integrates with the following third-party services:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Freepik API:</strong> For AI image generation capabilities</li>
                                <li><strong>Claid API:</strong> For image enhancement services</li>
                                <li><strong>Payment Processors:</strong> For secure payment handling</li>
                                <li><strong>Cloud Storage:</strong> For image storage and delivery</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                These services have their own privacy policies, and we recommend reviewing them.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">10. International Data Transfers</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">11. Children's Privacy</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">12. Changes to This Privacy Policy</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our Service. Your continued use after such changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">13. Contact Us</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                If you have questions about this Privacy Policy or our privacy practices, please contact us:
                            </p>
                            <p className="text-[#475569] leading-relaxed">
                                Email: privacy@weshoot.ai<br />
                                Support Email: support@weshoot.ai<br />
                                Address: [Your Company Address]
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
