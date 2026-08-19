import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F8FF] flex flex-col items-center justify-center p-6 font-tight relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4D96FF]/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4D96FF]/5 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[40px] shadow-[rgba(15,23,42,0.1)_0px_40px_100px_-20px] border border-[#F1F5F9] p-10 relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F5F8FF] rounded-[24px] mb-6 shadow-sm border border-[#E2E8F0] group transition-all duration-500 hover:scale-110">
                            <Shield className="w-10 h-10 text-[#4D96FF] group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">
                            WESHOOT<span className="text-[#4D96FF]">.ADMIN</span>
                        </h1>
                        <p className="text-[#64748B] font-bold text-sm tracking-tight px-4">
                            Business Control Center. Please enter your credentials to manage the ecosystem.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-50 border border-red-100/50 rounded-3xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                            <div className="w-5 h-5 bg-red-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                <span className="text-[10px] font-black text-white">!</span>
                            </div>
                            <p className="text-red-600 text-[13px] font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-4">
                                Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 pl-14 pr-6 text-sm font-bold text-[#0F172A] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF]/30 transition-all placeholder:text-[#CBD5E1]"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-4">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#4D96FF] transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 pl-14 pr-6 text-sm font-bold text-[#0F172A] outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF]/30 transition-all placeholder:text-[#CBD5E1]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#4D96FF] hover:bg-[#2C79FF] disabled:bg-[#CBD5E1] text-white font-black py-4.5 rounded-[22px] transition-all shadow-[rgba(77,150,255,0.3)_0px_20px_40px_-5px] hover:shadow-[rgba(77,150,255,0.4)_0px_25px_50px_-5px] disabled:shadow-none flex items-center justify-center gap-3 relative overflow-hidden group py-4 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm uppercase tracking-widest font-black">Authorized Entry</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[#94A3B8] font-bold text-[11px] uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Secure SSL Encrypted Session
                </p>
            </div>
        </div>
    );
};

export default AdminLoginPage;
