import { Header, Footer } from '../components/layout';

const TermsOfServicePage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-44 pb-32 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-[#64748B] font-medium mb-12">
                        Last updated: January 18, 2026
                    </p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">1. Acceptance of Terms</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                By accessing and using WeShoot ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">2. Description of Service</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                WeShoot is an AI-powered image generation and editing platform that provides the following services:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li>AI Photoshoot generation</li>
                                <li>AI Fashion model generation</li>
                                <li>Image upscaling and enhancement</li>
                                <li>Background removal and replacement</li>
                                <li>AI-powered image editing</li>
                                <li>Image to video conversion</li>
                                <li>Shadow addition and lighting adjustments</li>
                                <li>Other image manipulation tools as described on our platform</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">3. User Accounts</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                To access certain features of the Service, you may be required to create an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li>Provide accurate, current, and complete information during registration</li>
                                <li>Maintain and update your account information to keep it accurate and current</li>
                                <li>Maintain the security of your password and account</li>
                                <li>Be responsible for all activities that occur under your account</li>
                                <li>Notify us immediately of any unauthorized use of your account</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">4. Credits and Subscriptions</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Our Service operates on a credit-based system with the following plans:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li><strong>Free Trial:</strong> 50 credits to explore the platform</li>
                                <li><strong>Essentials Plan:</strong> 500 credits monthly ($8/month yearly, $10/month monthly)</li>
                                <li><strong>Pro Plan:</strong> 1,500 credits monthly ($23/month yearly, $27/month monthly)</li>
                                <li><strong>Business Plan:</strong> Custom credits and pricing</li>
                            </ul>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                Credits are consumed based on the operations performed. Unused credits may expire according to your plan. Subscription fees are non-refundable except as required by law.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">5. Intellectual Property Rights</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>Your Content:</strong> You retain all rights to the images you upload to our Service. By uploading content, you grant us a limited license to process, store, and display your content solely for the purpose of providing the Service.
                            </p>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>Generated Content:</strong> Images generated using our AI tools are owned by you, subject to our Acceptable Use Policy. However, you acknowledge that similar outputs may be generated for other users using similar inputs.
                            </p>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                <strong>Our Platform:</strong> The Service, including its original content, features, and functionality, is owned by WeShoot and is protected by international copyright, trademark, and other intellectual property laws.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">6. Acceptable Use Policy</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                You agree not to use the Service to:
                            </p>
                            <ul className="list-disc pl-6 text-[#475569] space-y-2 mb-4">
                                <li>Generate illegal, harmful, or offensive content</li>
                                <li>Violate any intellectual property rights</li>
                                <li>Generate deepfakes or misleading content without proper disclosure</li>
                                <li>Upload images of individuals without their consent</li>
                                <li>Attempt to reverse engineer or exploit our AI models</li>
                                <li>Resell or redistribute our Service without authorization</li>
                                <li>Use automated systems to abuse or overload our servers</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">7. Limitation of Liability</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                To the maximum extent permitted by law, WeShoot shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">8. Changes to Terms</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">9. Termination</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-[#0F172A] mb-4">10. Contact Information</h2>
                            <p className="text-[#475569] leading-relaxed mb-4">
                                If you have any questions about these Terms, please contact us at:
                            </p>
                            <p className="text-[#475569] leading-relaxed">
                                Email: support@weshoot.ai<br />
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

export default TermsOfServicePage;
