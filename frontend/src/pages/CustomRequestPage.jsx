import { useState, useRef, useEffect } from 'react';
import { Header, Footer } from '../components/layout';
import api from '../services/api';
import {
    ChevronDown,
    Check,
    Briefcase,
    User,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomRequestPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        userType: '',
        creditsNeeded: '',
        message: ''
    });

    const [status, setStatus] = useState({
        submitting: false,
        submitted: false,
        error: null
    });

    const [isUserTypeOpen, setIsUserTypeOpen] = useState(false);
    const userTypeRef = useRef(null);

    const userTypes = [
        { id: 'company', label: 'Company', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'freelance', label: 'Freelance', icon: <User className="w-4 h-4" /> },
        { id: 'other', label: 'Other', icon: <Users className="w-4 h-4" /> }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userTypeRef.current && !userTypeRef.current.contains(event.target)) {
                setIsUserTypeOpen(false);
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
            await api.post('/contact/custom-request', formData);
            setStatus({ submitting: false, submitted: true, error: null });
        } catch (err) {
            console.error('Custom request submission error:', err);
            setStatus({
                submitting: false,
                submitted: false,
                error: err.response?.data?.message || 'Something went wrong. Please try again.'
            });
        }
    };

    if (status.submitted) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-black text-[#0F172A] mb-4">Request Sent!</h2>
                        <p className="text-[#64748B] text-lg mb-8">
                            We've received your custom credit request. Our team will review your needs and get back to you shortly with a personalized plan.
                        </p>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center px-8 py-4 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-[#1e293b] transition-all"
                        >
                            Back to Pricing
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col lg:flex-row pt-24 lg:pt-0">
                {/* Left Side - Image */}
                <div className="hidden lg:block lg:w-1/2 relative h-screen sticky top-0">
                    <img
                        src="/img/render.jpg"
                        alt="Creative Workspace"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-end p-16">
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-white">
                    <div className="w-full max-w-xl">
                        <div className="mb-10 lg:mt-24">
                            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-3">Custom Credit Plan</h1>
                            <p className="text-[#64748B] text-lg">Tell us about your needs and we'll build the perfect plan for you.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-bold text-[#0F172A]">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-[#0F172A]">Work Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@company.com"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-bold text-[#0F172A]">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="company" className="text-sm font-bold text-[#0F172A]">Company Name</label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Acme Inc."
                                        className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#0F172A]">I am a...</label>
                                    <div className="relative" ref={userTypeRef}>
                                        <div
                                            onClick={() => setIsUserTypeOpen(!isUserTypeOpen)}
                                            className={`w-full px-5 py-4 rounded-xl border-2 ${isUserTypeOpen ? 'border-[#4D96FF] ring-4 ring-[#4D96FF]/10' : 'border-[#E2E8F0]'} bg-white cursor-pointer transition-all flex items-center justify-between group`}
                                        >
                                            <span className={`text-sm font-medium ${formData.userType ? 'text-[#0F172A]' : 'text-gray-400'}`}>
                                                {formData.userType ? userTypes.find(t => t.id === formData.userType)?.label : 'Select Type'}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isUserTypeOpen ? 'rotate-180 text-[#4D96FF]' : 'group-hover:text-gray-600'}`} />
                                        </div>

                                        {isUserTypeOpen && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#F1F5F9] rounded-2xl shadow-xl shadow-[#0F172A]/10 overflow-hidden z-50">
                                                <div className="p-2">
                                                    {userTypes.map((type) => (
                                                        <div
                                                            key={type.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, userType: type.id }));
                                                                setIsUserTypeOpen(false);
                                                            }}
                                                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${formData.userType === type.id
                                                                ? 'bg-[#F5F8FF] text-[#4D96FF]'
                                                                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={formData.userType === type.id ? 'text-[#4D96FF]' : 'text-[#94A3B8]'}>
                                                                    {type.icon}
                                                                </span>
                                                                <span className="text-sm font-medium">{type.label}</span>
                                                            </div>
                                                            {formData.userType === type.id && <Check className="w-4 h-4" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="creditsNeeded" className="text-sm font-bold text-[#0F172A]">Monthly Credits Needed</label>
                                    <input
                                        type="text"
                                        id="creditsNeeded"
                                        name="creditsNeeded"
                                        value={formData.creditsNeeded}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. 5000"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-bold text-[#0F172A]">Additional Details</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell us more about your use case..."
                                    className="w-full px-5 py-4 rounded-xl border-2 border-[#E2E8F0] focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 outline-none transition-all placeholder:text-gray-400 resize-none font-medium"
                                ></textarea>
                            </div>

                            {status.error && (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {status.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status.submitting}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all ${status.submitting ? 'bg-[#4D96FF]/70 cursor-not-allowed' : 'bg-[#4D96FF] hover:bg-[#3b82f6] hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {status.submitting ? 'Sending Request...' : 'Send Request'}
                            </button>

                            <p className="text-center text-xs text-[#94A3B8]">
                                By submitting this form, you agree to our <Link to="/privacy" className="text-[#4D96FF] hover:underline">Privacy Policy</Link>.
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomRequestPage;
