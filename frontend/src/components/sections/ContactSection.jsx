import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
    ChevronDown,
    Check,
    Lightbulb,
    CircleDollarSign,
    LifeBuoy,
    MessagesSquare,
    Handshake
} from 'lucide-react';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({
        submitting: false,
        submitted: false,
        error: null
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const subjects = [
        { id: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="w-4 h-4" /> },
        { id: 'Custom Pricing', label: 'Custom Pricing', icon: <CircleDollarSign className="w-4 h-4" /> },
        { id: 'Technical Support', label: 'Technical Support', icon: <LifeBuoy className="w-4 h-4" /> },
        { id: 'General Inquiry', label: 'General Inquiry', icon: <MessagesSquare className="w-4 h-4" /> },
        { id: 'Partnership', label: 'Partnership', icon: <Handshake className="w-4 h-4" /> }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ submitting: true, submitted: false, error: null });

        try {
            await api.post('/contact/submit', formData);
            setStatus({ submitting: false, submitted: true, error: null });
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                message: ''
            });
        } catch (err) {
            console.error('Contact submission error:', err);
            setStatus({
                submitting: false,
                submitted: false,
                error: err.response?.data?.message || 'Something went wrong. Please try again.'
            });
        }
    };

    if (status.submitted) {
        return (
            <section className="py-24 md:py-32 bg-gradient-to-b from-[#FFFFFF] to-[#f1f0f1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white p-12 rounded-[32px] shadow-xl border border-[#F1F5F9] max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">Request sent!</h2>
                        <p className="text-[#64748B] text-lg mb-8">
                            Thank you for your message, we will contact you shortly.
                            <br />Need a new request?
                        </p>
                        <button
                            onClick={() => setStatus({ ...status, submitted: false })}
                            className="bg-[#0F172A] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#1e293b] transition-all"
                        >
                            Refill form
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 md:py-32 bg-gradient-to-b from-[#FFFFFF] to-[#f1f0f1] relative overflow-hidden">
            {/* Background blobs for "light" feel */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-[#EEF2FF] rounded-full blur-[100px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#F5F8FF] rounded-full blur-[80px] opacity-40 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
                    {/* Left content */}
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
                            Build it to <br />
                            <span className="text-[#4D96FF] italic font-serif">your needs</span>
                        </h2>
                        <p className="text-[#64748B] text-xl leading-relaxed max-w-lg mb-8">
                            Looking for a tailored fix? Whether you're in need of custom limits, exploring new territory, or searching for a sweet deal, just drop us a line.
                        </p>
                    </div>

                    {/* Right content - Form */}
                    <div className="lg:w-1/2">
                        <div className="bg-[#F8FAFC] p-8 md:p-10 rounded-[32px] border border-[#F1F5F9] shadow-sm">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-bold text-[#0F172A] ml-1">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#4D96FF] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-bold text-[#0F172A] ml-1">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="name@domain.com"
                                            className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#4D96FF] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-bold text-[#0F172A] ml-1">Phone (optional)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+20 123 456 7898"
                                            className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#4D96FF] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="text-sm font-bold text-[#0F172A] ml-1">Company</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="weshoot Company"
                                            className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#4D96FF] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-bold text-[#0F172A] ml-1">How Can We Help You?</label>
                                    <div className="relative" ref={dropdownRef}>
                                        <div
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full px-5 py-4 rounded-xl border ${isDropdownOpen ? 'border-[#4D96FF] ring-2 ring-[#4D96FF]/10' : 'border-[#E2E8F0]'} bg-white cursor-pointer transition-all flex items-center justify-between group`}
                                        >
                                            <span className={`text-sm ${formData.subject ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}>
                                                {formData.subject ? subjects.find(s => s.id === formData.subject)?.label : 'Select an option'}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-[#94A3B8] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#4D96FF]' : 'group-hover:text-[#64748B]'}`} />
                                        </div>

                                        {isDropdownOpen && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#F1F5F9] rounded-2xl shadow-xl shadow-[#0F172A]/5 overflow-hidden z-50">
                                                <div className="p-2">
                                                    {subjects.map((subject) => (
                                                        <div
                                                            key={subject.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, subject: subject.id }));
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${formData.subject === subject.id
                                                                ? 'bg-[#F5F8FF] text-[#4D96FF]'
                                                                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={formData.subject === subject.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}>
                                                                    {subject.icon}
                                                                </span>
                                                                <span className="text-sm font-medium">{subject.label}</span>
                                                            </div>
                                                            {formData.subject === subject.id && <Check className="w-4 h-4" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-[#0F172A] ml-1">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        placeholder="Tell us what you need. Please, be as detailed as you can."
                                        className="w-full px-5 py-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#4D96FF] focus:border-transparent outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <p className="text-[10px] text-[#94A3B8] leading-tight">
                                    By clicking "Send us your message", you agree to our <a href="/privacy" className="underline hover:text-[#4D96FF]">Privacy Policy</a>. We will process your data for the purpose of maintaining a professional contact.
                                </p>

                                {status.error && (
                                    <p className="text-red-500 text-sm font-medium">{status.error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status.submitting}
                                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all ${status.submitting ? 'bg-[#4D96FF]/70 cursor-not-allowed' : 'bg-[#4D96FF] hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {status.submitting ? 'Sending...' : 'Send us your message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
