import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus('');

        try {
            await forgotPassword(email);
            setStatus('Reset code sent! Redirecting to verify...');
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1500);
        } catch (err) {
            console.error('Forgot password error:', err);
            const msg = err.response?.data?.message || 'Unable to connect to service. Please try again later.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const gradientTextStyle = {
        background: 'linear-gradient(90deg, #000000 0%, #4D96FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block'
    };

    return (
        <div className="h-screen w-full relative overflow-hidden flex items-center justify-center font-sans tracking-tight bg-white">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700"
                style={{
                    backgroundImage: 'url("/img/A_serene_and_futuristic_nature_background_designed_for_an_AI_powered_product_image_generation_websit.png")',
                    filter: 'blur(10px) brightness(0.95)',
                    transform: 'scale(1.05)'
                }}
            />

            {/* Centered Modal Container */}
            <div className="relative z-10 w-full max-w-[540px] px-6 py-12 animate-fadeInUp">

                {/* Outermost Glass Border */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-4 border border-white/10 shadow-2xl">

                    {/* Inner White Card */}
                    <div className="bg-white rounded-[32px] p-10 shadow-xl space-y-8">

                        {/* Header */}
                        <div className="text-center space-y-3">
                            <h2 className="font-bold tracking-tight m-0 text-4xl leading-tight">
                                <span style={gradientTextStyle}>
                                    Forgot password?
                                </span>
                            </h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[320px] mx-auto">
                                No worries, we'll send you reset instructions to your inbox.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-[14px] border border-red-100 text-center animate-slide-down">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {status && (
                            <div className="p-3 bg-green-50 text-green-600 text-xs rounded-[14px] border border-green-100 text-center animate-slide-down">
                                {status}
                            </div>
                        )}

                        {/* Form */}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full h-[58px] flex justify-center items-center bg-[#4D96FF] rounded-[16px] text-white font-bold text-base shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset code'}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="text-center pt-4">
                            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#4D96FF] hover:underline transition-all">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Return to login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
