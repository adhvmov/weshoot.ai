import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Verify Code, 2: Reset Password
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyResetCode, resetPassword } = useAuth();

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

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        const codeString = code.join('');
        if (codeString.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            await verifyResetCode(email, codeString);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(email, code.join(''), newPassword);
            setStatus('Password changed successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
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
                            <h2 className="font-bold tracking-tight m-0 text-3xl leading-tight">
                                <span style={gradientTextStyle}>
                                    {step === 1 ? 'Verify identity' : 'Set new password'}
                                </span>
                            </h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">
                                {step === 1
                                    ? `Checking the code sent to ${email}`
                                    : 'Almost there! Create a secure new password.'}
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

                        {step === 1 ? (
                            <form className="space-y-8" onSubmit={handleVerifyCode}>
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
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-1">Enter 6-digit code</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || code.join('').length !== 6}
                                    className="w-full h-[58px] flex justify-center items-center bg-[#4D96FF] rounded-[16px] text-white font-bold text-base shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm code'}
                                </button>
                            </form>
                        ) : (
                            <form className="space-y-5" onSubmit={handleResetPassword}>
                                <div className="space-y-2 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoFocus
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 inset-y-0 flex items-center text-gray-400 hover:text-[#4D96FF] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="space-y-2 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !newPassword}
                                    className="w-full h-[58px] flex justify-center items-center bg-[#4D96FF] rounded-[16px] text-white font-bold text-base shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save new password'}
                                </button>
                            </form>
                        )}

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

export default ResetPasswordPage;
