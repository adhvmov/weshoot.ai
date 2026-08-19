import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const EarlyAccessModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            setLoading(true);
            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/dashboard/early-access/request`, {
                    email: email.toLowerCase()
                });
                setSubmitted(true);
                setTimeout(() => {
                    setEmail('');
                    setSubmitted(false);
                    onClose();
                }, 2500);
            } catch (error) {
                console.error('Failed to submit request:', error);
                // Still show success to user
                setSubmitted(true);
                setTimeout(() => {
                    setEmail('');
                    setSubmitted(false);
                    onClose();
                }, 2500);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[48px] shadow-2xl max-w-md w-full p-12 relative animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <h2 className="text-4xl font-black text-[#0F172A] mb-2">
                        Get <span className="text-[#4D96FF]">Access</span>
                    </h2>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-[24px] py-4 px-6 text-sm font-medium outline-none focus:border-[#4D96FF] focus:ring-4 focus:ring-[#4D96FF]/10 transition-all"
                                required
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#4D96FF] text-white font-black py-4 rounded-[24px] text-sm uppercase tracking-wider hover:shadow-[0_12px_24px_rgba(77,150,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Get Early Access'}
                            </button>
                        </form>
                    ) : (
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-lg font-bold text-gray-600">Request submitted!</p>
                            <p className="text-sm text-gray-500 mt-2">We'll notify you soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EarlyAccessModal;
