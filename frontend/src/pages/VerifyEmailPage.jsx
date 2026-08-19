import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

const VerifyEmailPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendVerification } = useAuth();

    const email = new URLSearchParams(location.search).get('email');

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleCodeChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);

        const lastIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastIndex].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const codeString = code.join('');
        if (codeString.length !== 6) return;

        setError('');
        setStatus('');
        setLoading(true);

        try {
            await verifyEmail(email, codeString);
            setStatus('Verification successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setStatus('');
        setResending(true);
        try {
            await resendVerification(email);
            setStatus('Verification code resent! Please check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setResending(false);
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
                            <h2 className="font-bold tracking-tight m-0 text-3xl leading-tight">
                                <span style={gradientTextStyle}>
                                    Check your email
                                </span>
                            </h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">
                                We've sent a 6-digit verification code to <br />
                                <span className="font-bold text-black">{email}</span>
                            </p>
                        </div>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-[14px] border border-red-100 text-center animate-slide-down">
                                {error}
                            </div>
                        )}

                        {status && (
                            <div className="p-3 bg-green-50 text-green-600 text-xs rounded-[14px] border border-green-100 text-center animate-slide-down">
                                {status}
                            </div>
                        )}

                        {/* Form */}
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            value={code[index]}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-[14%] h-14 sm:h-20 text-center text-2xl sm:text-3xl font-black bg-[#F5F8FF] border-2 border-transparent rounded-[12px] sm:rounded-[16px] text-black focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                        />
                                    ))}
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-1">Enter verification code</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.join('').length !== 6}
                                className="w-full h-[58px] flex justify-center items-center bg-[#4D96FF] rounded-[16px] text-white font-bold text-base shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Identity'}
                            </button>
                        </form>

                        {/* Footer Actions */}
                        <div className="pt-4 space-y-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-500">
                                <span>Didn't receive code?</span>
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="font-bold text-[#4D96FF] hover:underline disabled:text-gray-300 transition-all px-1"
                                >
                                    {resending ? 'Sending...' : 'Resend Code'}
                                </button>
                            </div>

                            <div className="pt-2">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#4D96FF] hover:underline transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Return to login</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Security Badge */}
                <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">
                    Secure 256-bit Encrypted Verification
                </p>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
