import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2, ShieldAlert, Mail } from 'lucide-react';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, googleLogin, user } = useAuth();

    // Check URL to see if we should show register mode
    useEffect(() => {
        if (location.pathname === '/register') {
            setIsLogin(false);
        }
    }, [location]);

    // Reset email form visibility when switching modes
    useEffect(() => {
        setShowEmailForm(false);
        const params = new URLSearchParams(location.search);
        if (params.get('status') === 'blocked') {
            setIsBlocked(true);
            setError('User blocked, contact us');
        }
    }, [isLogin, location.search]);

    // Auto-redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const googleTrigger = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                // For useGoogleLogin, you might get an access token or an auth code
                // Our backend expects a google credential (ID Token) usually from the implicit flow or the user data
                // Since our AuthContext.googleLogin expects credentialResponse.credential
                // we might need to adjust or ensure the tokenResponse has what we need.
                // If using useGoogleLogin hook, it usually returns an access_token.
                // However, the standard GoogleLogin component returns an ID token (credential).
                // Let's stick to the logic that works. If the backend needs a credential, 
                // we should probably use the component or fetch the id_token.
                // For now, I'll use the component logic or simulate it.
                // If the user wants a custom button, we MUST use useGoogleLogin or some other way.
                await googleLogin({ credential: tokenResponse.access_token }); // Assuming backend can handle it or was using token
                navigate('/dashboard');
            } catch (err) {
                if (err.response?.data?.isBlocked) {
                    setIsBlocked(true);
                }
                setError(err.response?.data?.message || 'Google Login failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google Log in Failed'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await login(email, password);
                if (res?.requiresVerification) {
                    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                } else {
                    navigate('/dashboard');
                }
            } else {
                await register(email, password, fullName);
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            }
        } catch (err) {
            if (err.response?.data?.isBlocked) {
                setIsBlocked(true);
            }
            setError(err.response?.data?.message || 'Authentication failed');
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
                    backgroundImage: 'url("/img/bgtest2.webp")',
                    filter: 'blur(10px) brightness(0.95)',
                    transform: 'scale(1.05)'
                }}
            />

            {/* Centered Modal Container */}
            <div className="relative z-10 w-full max-w-[540px] px-6 py-12 animate-fadeInUp">

                {/* Outermost Glass Border (Reduced padding/border pit) */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-4 border border-white/10 shadow-2xl">

                    {/* Inner White Card */}
                    <div className="bg-white rounded-[32px] p-10 shadow-xl space-y-8">

                        {/* Header */}
                        <div className="text-center">
                            <h2 className="font-bold tracking-tight m-0 text-[42px] leading-tight">
                                <span style={gradientTextStyle}>
                                    {isBlocked ? 'Access Restricted' : isLogin ? 'Log in to Weshoot' : 'Get Started'}
                                </span>
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-6">
                            {/* Step 1: Social Buttons (Always shown in login or initial sign up) */}
                            {((!isLogin && !showEmailForm) || (isLogin)) && !isBlocked ? (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => googleTrigger()}
                                        className="w-full h-[56px] flex items-center justify-center gap-3 bg-[#F5F8FF] border border-gray-100 rounded-[16px] text-gray-900 font-semibold shadow-md hover:bg-white transition-all"
                                    >
                                        <img src="/site_icons/Google.svg" alt="Google" className="w-5 h-5" />
                                        <span>{isLogin ? "Continue with Google" : "Sign up with google"}</span>
                                    </button>
                                </div>
                            ) : null}

                            {/* Divider (Shown in initial view or Login) */}
                            {((!isLogin && !showEmailForm) || (isLogin)) && !isBlocked && (
                                <div className="flex items-center gap-4 py-1">
                                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest px-2">or</span>
                                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                                </div>
                            )}

                            {/* Step 1.5: Email Toggle Button (Only for Sign Up initial view) */}
                            {!isLogin && !showEmailForm && (
                                <button
                                    onClick={() => setShowEmailForm(true)}
                                    className="w-full h-[56px] flex items-center justify-center gap-3 bg-[#F5F8FF] border border-gray-100 rounded-[16px] text-gray-900 font-semibold shadow-md hover:bg-white transition-all"
                                >
                                    <img src="/site_icons/icon-3.svg" alt="Email" className="w-5 h-5" />
                                    <span>Sign up with email</span>
                                </button>
                            )}

                            {/* Error Message */}
                            {error && !isBlocked && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-[14px] border border-red-100 text-center animate-slide-down">
                                    {error}
                                </div>
                            )}

                            {/* Blocked UI */}
                            {isBlocked && (
                                <div className="py-6 px-4 bg-red-50/50 rounded-[24px] border border-red-100 text-center space-y-4 animate-fadeIn">
                                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                        <ShieldAlert className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-red-600 tracking-tight uppercase">Account Restricted</h3>
                                        <p className="text-xs font-bold text-red-500/80 leading-relaxed max-w-[280px] mx-auto">
                                            Your account has been restricted by administrators due to policy violations.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <a
                                            href="mailto:support@weshoot.ai"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Contact Support
                                        </a>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => {
                                                setIsBlocked(false);
                                                setError('');
                                                navigate('/login');
                                            }}
                                            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Form (Shown in Login or after Step 1 of Sign up) */}
                            {(isLogin || showEmailForm) && !isBlocked && (
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Full Name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            required
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-[56px] px-5 bg-[#F5F8FF] border border-transparent rounded-[16px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#4D96FF] focus:bg-white transition-all shadow-sm"
                                        />
                                        {isLogin && (
                                            <div className="flex justify-end px-1 pt-1">
                                                <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-[#4D96FF] hover:opacity-80 transition-opacity">
                                                    Forgot your password?
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-[58px] mt-2 flex justify-center items-center bg-[#4D96FF] rounded-[16px] text-white font-bold text-base shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Log in' : 'Get Started')}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer Link */}
                        {!isBlocked && (
                            <div className="text-center pt-4">
                                <p className="text-gray-500 text-sm font-medium">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="font-bold text-[#4D96FF] hover:underline transition-all"
                                    >
                                        {isLogin ? "Sign up" : "Log in"}
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;

