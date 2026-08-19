/**
 * Dashboard Page
 * Main application interface after login - Premium Redesign
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import PricingModal from '../components/modals/PricingModal';
import { useAuth } from '../context/AuthContext';
import { getBackgroundTemplates } from '../services/aiService';
import UsageView from '../components/dashboard/UsageView';
import ProfileDropdown from '../components/common/ProfileDropdown';
import ChatWidget from '../components/chat/ChatWidget';

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-6 py-4 rounded-[18px] transition-all duration-300 border-2 border-transparent ${active
            ? 'bg-[#4D96FF] text-white shadow-[rgba(44,121,255,0.3)_0px_8px_20px] border-[#F5F8FF]'
            : 'text-[#64748B] hover:bg-[#F5F8FF] hover:text-[#4D96FF]'
            }`}
    >
        <span className={`${active ? 'text-white' : 'text-current'} transition-colors`}>{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
);

const Section = ({ title, children, viewAll }) => (
    <div className="mb-14">
        <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{title}</h3>
            {viewAll && (
                <button className="text-sm text-[#4D96FF] hover:text-[#3B82F6] font-bold transition-colors">
                    View all
                </button>
            )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {children}
        </div>
    </div>
);

const Card = ({ image, video, title, badge }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log('Video play interrupted', e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className="group flex flex-col items-center cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-white border border-[#F1F5F9] shadow-[rgba(234,238,248,0.3)_0px_8px_20px] transition-all duration-500">
                <img
                    src={image}
                    alt={title}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered && video ? 'opacity-0' : 'opacity-100'}`}
                />
                {video && (
                    <video
                        ref={videoRef}
                        src={video}
                        loop
                        muted
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}
                {badge && (
                    <span className="absolute top-3 left-3 bg-[#4D96FF] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg z-20">
                        {badge}
                    </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
            </div>
            <p className="mt-4 text-sm font-bold text-[#475569] text-center w-full truncate px-2">{title}</p>
        </div>
    );
};

const QuickStartCard = ({ image, video, title, badge }) => (
    <Card image={image} video={video} title={title} badge={badge} />
);

// Delete Confirmation Modal
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    const [confirmText, setConfirmText] = useState('');
    if (!isOpen) return null;
    const isDeleteEnabled = confirmText === 'Delete';

    return (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-md mx-4 shadow-2xl border border-[#F1F5F9]">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Delete Account</h2>
                <p className="text-[#64748B] mb-6 leading-relaxed">
                    This action is <span className="font-bold text-red-500 underline decoration-red-200">permanent</span>.
                    All your data and projects will be gone forever.
                </p>
                <p className="text-sm font-bold text-[#94A3B8] mb-4 uppercase tracking-wider">
                    Type <span className="font-mono bg-red-50 text-red-500 px-2 py-0.5 rounded-md">Delete</span> to confirm:
                </p>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'Delete' to confirm"
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none mb-6 font-medium transition-all"
                    autoFocus
                />
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-[#F1F5F9] text-[#475569] font-bold rounded-[20px] hover:bg-[#E2E8F0] transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isDeleteEnabled || isDeleting}
                        className={`flex-1 px-6 py-4 rounded-[20px] font-bold transition-all ${isDeleteEnabled && !isDeleting
                            ? 'bg-red-500 text-white shadow-[0_8px_16px_rgba(239,68,68,0.3)] hover:bg-red-600'
                            : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'
                            }`}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplateRow = ({ categoryName }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef(null);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const tempRes = await getBackgroundTemplates(categoryName);
                if (tempRes.success) {
                    setTemplates(tempRes.data);
                    // Check scroll after state updates and DOM renders
                    setTimeout(checkScroll, 100);
                }
            } catch (error) {
                console.error(`Failed to fetch templates for ${categoryName}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, [categoryName]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
            // Re-check after animation
            setTimeout(checkScroll, 500);
        }
    };

    if (loading) return (
        <div className="mb-14 h-[200px] flex items-center justify-center bg-gray-50/30 rounded-[32px] animate-pulse border border-[#F1F5F9]">
            <div className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Loading {categoryName}...</div>
        </div>
    );

    if (templates.length === 0) return null;

    return (
        <div className="mb-14 group/section relative animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{categoryName}</h3>
                    <span className="px-3 py-1 bg-[#F5F8FF] text-[#4D96FF] text-[9px] font-black rounded-lg uppercase tracking-widest border border-[#4D96FF]/10">
                        TEMPLATES
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`w-9 h-9 rounded-full bg-white border border-[#F1F5F9] flex items-center justify-center transition-all shadow-sm ${!canScrollLeft ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-[#F5F8FF] hover:border-[#4D96FF]/30'}`}
                    >
                        <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`w-9 h-9 rounded-full bg-white border border-[#F1F5F9] flex items-center justify-center transition-all shadow-sm ${!canScrollRight ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-[#F5F8FF] hover:border-[#4D96FF]/30'}`}
                    >
                        <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {templates.map((template) => (
                    <div key={template.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                        <div className="relative aspect-square rounded-[20px] overflow-hidden bg-[#F8FAFC] border border-[#F1F5F9] shadow-[rgba(234,238,248,0.2)_0px_4px_12px] group transition-all duration-500 cursor-pointer">
                            <img src={template.url} alt={template.name} className="w-full h-full object-cover transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-4 w-full text-center">
                            <p className="text-xs font-bold text-[#475569] truncate px-2">{template.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TemplateSections = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getBackgroundTemplates();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch template categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return null;

    return (
        <div className="mt-20 border-t border-[#F1F5F9] pt-14">
            <div className="flex items-center gap-4 mb-10">
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">AI backgrounds (templates)</h3>
                <span className="px-3 py-1 bg-[#4D96FF] text-white text-[10px] font-black rounded-lg uppercase tracking-widest">PRE-MADE</span>
            </div>
            {categories.map(cat => (
                <TemplateRow key={cat.id} categoryName={cat.name} />
            ))}
            <style dangerouslySetInnerHTML={{ __html: '.no-scrollbar::-webkit-scrollbar { display: none; }' }} />
        </div>
    );
};

// Billing View
const BillingView = () => {
    return (
        <div className="billing-view max-w-[1400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Billing & Invoices</h2>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-black text-sm hover:bg-[#1E293B] transition-all shadow-lg shadow-[#0F172A]/10 group">
                    <span>Manage in Stripe</span>
                    <svg className="w-4 h-4 translate-y-[-1px] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </button>
            </div>

            {/* On-Demand Usage Card */}
            <div className="bg-white rounded-[32px] md:rounded-[40px] border border-[#F1F5F9] p-6 md:p-10 mb-8 shadow-[rgba(15,23,42,0.04)_0px_20px_40px_-10px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] mb-2 tracking-tight">On-Demand Usage</h3>
                        <p className="text-[#94A3B8] font-bold text-sm">Jan 9, 2026 - Feb 9, 2026</p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl cursor-pointer hover:bg-white hover:border-[#4D96FF]/30 transition-all group">
                        <span className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">Cycle Starting Jan 9, 2026</span>
                        <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="mb-10">
                    <span className="text-4xl font-black text-[#0F172A] tracking-tighter">$0.00</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#F8FAFC]">
                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Type</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Tokens</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Cost</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Qty</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC] font-bold">
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-[#94A3B8] text-sm italic">
                                    No usage recorded in the current cycle.
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-[#F8FAFC]">
                                <td colSpan={4} className="pt-8 text-sm font-black text-[#0F172A] uppercase tracking-wider">Subtotal:</td>
                                <td className="pt-8 text-right text-lg font-black text-[#0F172A]">$0.00</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Invoices Card */}
            <div className="bg-white rounded-[32px] md:rounded-[40px] border border-[#F1F5F9] p-6 md:p-10 shadow-[rgba(15,23,42,0.04)_0px_20px_40px_-10px]">
                <h3 className="text-xl font-black text-[#0F172A] mb-8 md:mb-10 tracking-tight">Invoices</h3>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-[#F8FAFC] rounded-3xl flex items-center justify-center mb-6 border border-[#F1F5F9]">
                        <svg className="w-10 h-10 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-[#94A3B8] font-bold text-lg">No invoices found.</p>
                </div>
            </div>
        </div>
    );
};

// Account Settings View
const AccountSettingsView = ({ user, onDeleteClick }) => {
    const isGoogleUser = user?.avatar_url && user.avatar_url.includes('googleusercontent.com');
    const { getSessions, revokeSession } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    const fetchSessions = async () => {
        try {
            const res = await getSessions();
            if (res.success) setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (sessionId) => {
        try {
            const res = await revokeSession(sessionId);
            if (res.success) {
                setSessions(sessions.filter(s => s.id !== sessionId));
            }
        } catch (err) {
            console.error('Failed to revoke session:', err);
        }
    };

    return (
        <div className="account-settings-view max-w-3xl px-1 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-8 tracking-tight">Account Settings</h2>

            {/* Account Info Section */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-[#F1F5F9] p-6 md:p-8 mb-8 shadow-[rgba(234,238,248,0.3)_0px_8px_24px]">
                <h3 className="text-lg font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#4D96FF] rounded-full"></span>
                    Account Information
                </h3>

                <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-center justify-between py-4 border-b border-[#F8FAFC]">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Email</p>
                            <p className="text-[#0F172A] font-bold text-base md:text-lg truncate">{user?.email || 'No email'}</p>
                        </div>
                    </div>

                    {/* Google Account */}
                    {isGoogleUser && (
                        <div className="flex items-center gap-4 py-4 border-b border-[#F8FAFC]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Connected Account</p>
                                <p className="text-[#0F172A] font-bold text-lg">Google Workspace</p>
                            </div>
                        </div>
                    )}

                    {/* Full Name */}
                    <div className="flex items-center justify-between py-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Full Name</p>
                            <p className="text-[#0F172A] font-bold text-base md:text-lg truncate">{user?.full_name || 'Not set'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Plan Section */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-[#F1F5F9] p-6 md:p-8 mb-8 shadow-[rgba(234,238,248,0.3)_0px_8px_24px]">
                <h3 className="text-lg font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#4D96FF] rounded-full"></span>
                    Current Plan
                </h3>

                <div className="space-y-6">
                    {/* Plan Name */}
                    <div className="flex items-center justify-between py-4 border-b border-[#F8FAFC]">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Subscription Plan</p>
                            <p className="text-[#0F172A] font-bold text-base md:text-lg">
                                {user?.plan?.name || 'Free trial'}
                            </p>
                        </div>
                        <Link
                            to="/pricing"
                            className="ml-4 px-4 py-2 bg-[#4D96FF] text-white text-sm font-bold rounded-xl hover:bg-[#3b82f6] transition-all active:scale-95"
                        >
                            Upgrade
                        </Link>
                    </div>

                    {/* Credits */}
                    <div className="flex items-center justify-between py-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Credits</p>
                            <p className="text-[#0F172A] font-bold text-base md:text-lg">
                                {user?.credits ? `${user.credits.total_credits - user.credits.used_credits} / ${user.credits.total_credits}` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Sessions Section */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-[#F1F5F9] p-6 md:p-8 mb-8 shadow-[rgba(234,238,248,0.3)_0px_8px_24px]">
                <h3 className="text-lg font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#4D96FF] rounded-full"></span>
                    Active Sessions
                </h3>

                <div className="space-y-4">
                    {loadingSessions ? (
                        <div className="py-4 animate-pulse space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-gray-50 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm font-bold text-[#94A3B8] text-center py-6">No active sessions found.</p>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] group hover:border-[#4D96FF]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm text-[#64748B]">
                                        {session.device_type === 'Mobile' ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-[#0F172A] text-sm tracking-tight">{session.device_type} • {session.browser}</p>
                                        </div>
                                        <p className="text-xs font-bold text-[#94A3B8] mt-1">
                                            {session.ip_address} • Created {new Date(session.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-black text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all uppercase tracking-widest shadow-sm bg-white"
                                >
                                    Revoke
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <p className="mt-6 text-[11px] font-bold text-[#94A3B8] italic">
                    Session revocation may take up to 10 minutes to complete globally.
                </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-[24px] md:rounded-[32px] border border-red-100 p-6 md:p-8 shadow-[rgba(239,68,68,0.05)_0px_8px_24px]">
                <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-[#EF4444]/70 mb-6 font-medium">
                    Deleting your account is permanent. All images and settings will be lost.
                </p>
                <button
                    onClick={onDeleteClick}
                    className="px-8 py-4 bg-red-500 text-white font-bold rounded-[20px] hover:bg-red-600 shadow-[rgba(239,68,68,0.2)_0px_8px_16px] transition-all"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};


const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [showPricing, setShowPricing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user, logout, deleteAccount, refreshUser } = useAuth();

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const tabMap = {
                'settings': 'Account Settings',
                'billing': 'Billing',
                'usage': 'Usage',
                'dashboard': 'Dashboard',
                'editor': 'Editing Studio'
            };
            if (tabMap[tabParam]) {
                setActiveTab(tabMap[tabParam]);
            }
        } else if (location.state?.tab) {
            // Fallback to state if no query param (backward compatibility)
            setActiveTab(location.state.tab);
        }
    }, [searchParams, location.state]);

    useEffect(() => {
        refreshUser();
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => navigate('/editor', { state: { uploadedImage: event.target.result } });
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => navigate('/editor', { state: { uploadedImage: event.target.result } });
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount();
            if (result.success) navigate('/login');
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // Mobile Sidebar Logic
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const toggleSidebar = () => setShowMobileSidebar(!showMobileSidebar);
    const closeSidebar = () => setShowMobileSidebar(false);

    // Close sidebar when route changes or tab changes
    useEffect(() => {
        closeSidebar();
    }, [location.pathname, activeTab]);

    return (
        <div className="dashboard-page h-screen bg-[#F5F8FF] flex flex-col overflow-hidden font-tight">
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
            />

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] md:hidden transition-all duration-300 ${showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            />

            <div className="flex flex-1 overflow-hidden p-4 gap-4 relative">
                {/* Sidebar - Floating & Rounded - Responsive Updates */}
                <div className={`
                    fixed md:relative inset-y-0 left-0 z-[50] md:z-auto
                    w-[280px] bg-white rounded-[40px] md:rounded-[40px]
                    flex flex-col shadow-[rgba(15,23,42,0.08)_0px_20px_40px_-10px] border border-[#F1F5F9]
                    transform transition-transform duration-300 ease-in-out
                    ${showMobileSidebar ? 'translate-x-0 m-4 h-[calc(100%-32px)]' : '-translate-x-[110%] md:translate-x-0'}
                    md:transform-none md:m-0 md:h-auto
                `}>
                    <div className="h-20 flex items-center px-10 justify-between">
                        <Link to="/" className="flex items-center gap-1.5">
                            <img src="/site_icons/black_logo.webp" alt="WeShoot" className="h-14" />
                        </Link>
                        {/* Mobile Close Button */}
                        <button onClick={closeSidebar} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto mt-2">
                        <div className="space-y-2">
                            <SidebarItem
                                active={activeTab === 'Dashboard'}
                                onClick={() => setActiveTab('Dashboard')}
                                label="Dashboard"
                                icon={<img src="/site_icons/dashboard.svg" className={`w-6 h-6 ${activeTab === 'Dashboard' ? 'brightness-0 invert' : ''}`} alt="" />}
                            />
                            <SidebarItem
                                active={activeTab === 'Editing Studio'}
                                onClick={() => navigate('/editor')}
                                label="Editing Studio"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
                            />

                            <SidebarItem
                                active={activeTab === 'Usage'}
                                onClick={() => setActiveTab('Usage')}
                                label="Usage"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            />
                            <SidebarItem
                                active={activeTab === 'Billing'}
                                onClick={() => setActiveTab('Billing')}
                                label="Billing"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                            />
                            <SidebarItem
                                active={activeTab === 'Account Settings'}
                                onClick={() => setActiveTab('Account Settings')}
                                label="Account Settings"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            />
                        </div>
                    </div>

                    <div className="p-8 border-t border-[#F8FAFC]">
                        <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-500 font-bold px-4 py-4 w-full rounded-[20px] hover:bg-red-50 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[40px] shadow-[rgba(15,23,42,0.08)_0px_20px_40px_-10px] border border-[#F1F5F9]">
                    {/* Floating Header */}
                    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#F8FAFC] flex items-center justify-between px-6 md:px-10 gap-4 md:gap-6 z-20 sticky top-0 relative">
                        {/* Logo mobile (Left) */}
                        <Link to="/" className="flex items-center md:hidden">
                            <img src="/site_icons/black_logo.webp" alt="WeShoot" className="h-10" />
                        </Link>

                        {/* Right Content */}
                        <div className="flex items-center gap-6 ml-auto">
                            <div className="flex items-center gap-2 px-6 py-2.5 bg-[#4D96FF] border-4 border-[#F5F8FF] text-white text-xs font-black rounded-full shadow-sm hide-mobile">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                CORE CREDITS: {(user?.credits?.total_credits ?? 50) - (user?.credits?.used_credits ?? 0)} / {user?.credits?.total_credits ?? 50}
                            </div>

                            <button
                                onClick={() => setShowPricing(true)}
                                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#4D96FF] text-[#0F172A] text-xs font-black rounded-full shadow-[rgba(0,0,0,0.05)_0px_8px_20px] hover:bg-[#F8FAFC] transition-all transform hover:scale-105"
                            >
                                <img src="/site_icons/fire.svg" className="w-4 h-4" style={{ filter: 'invert(58%) sepia(87%) saturate(2462%) hue-rotate(196deg) brightness(101%) contrast(101%)' }} alt="" />
                                <span>Upgrade Plan</span>
                            </button>

                            <div className="w-px h-8 bg-[#F1F5F9] hide-mobile"></div>

                            <ProfileDropdown
                                user={user}
                                onSettingsClick={() => setActiveTab('Account Settings')}
                                onLogout={handleLogout}
                            />

                            {/* Mobile Toggle Button (Right) */}
                            <button
                                onClick={toggleSidebar}
                                className="md:hidden w-11 h-11 flex items-center justify-center rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:border-[#4D96FF] active:scale-95 transition-all shadow-sm overflow-hidden"
                            >
                                <img src="/site_icons/menu (1).png" alt="Menu" className="w-6 h-6 object-contain" />
                            </button>
                        </div>
                    </header>

                    {/* Mobile Utilities Bar */}
                    <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-[#F1F5F9] shrink-0">
                        <button
                            onClick={() => setShowPricing(true)}
                            className="flex items-center gap-2 text-[#4D96FF] font-black text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                        >
                            <img src="/site_icons/fire.svg" className="w-3.5 h-3.5" style={{ filter: 'invert(58%) sepia(87%) saturate(2462%) hue-rotate(196deg) brightness(101%) contrast(101%)' }} alt="" />
                            Upgrade Plan
                        </button>
                        <div className="flex items-center gap-2 text-[#64748B] font-black text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-[#F1F5F9] shadow-sm">
                            <span className="w-1.5 h-1.5 bg-[#4D96FF] rounded-full"></span>
                            Credits: {(user?.credits?.total_credits ?? 50) - (user?.credits?.used_credits ?? 0)} / {user?.credits?.total_credits ?? 50}
                        </div>
                    </div>

                    {/* Scrollable Area */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                        {activeTab === 'Account Settings' ? (
                            <AccountSettingsView
                                user={user}
                                onDeleteClick={() => setShowDeleteModal(true)}
                            />
                        ) : activeTab === 'Usage' ? (
                            <div className="max-w-[1400px] mx-auto">
                                <h2 className="text-3xl font-black text-[#0F172A] mb-8 tracking-tight">Usage Statistics</h2>
                                <UsageView />
                            </div>
                        ) : activeTab === 'Billing' ? (
                            <div className="max-w-[1400px] mx-auto px-1 md:px-0">
                                <BillingView />
                            </div>
                        ) : (
                            <div className="max-w-[1400px] mx-auto">
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                                {/* Hero Dropzone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`rounded-[32px] md:rounded-[40px] border-[3px] border-dashed p-8 md:p-16 mb-8 md:mb-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 group relative overflow-hidden ${isDragging
                                        ? 'border-[#4D96FF] bg-[#F5F8FF]'
                                        : 'border-[#E2E8F0] bg-white hover:border-[#4D96FF]/30 hover:bg-[#F8FAFC]'
                                        }`}
                                >
                                    <div className="relative h-24 w-60 flex items-center justify-center mb-6">
                                        {/* Left Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="absolute w-16 h-16 transition-all duration-700 opacity-0 group-hover:opacity-40 group-hover:-translate-x-16 group-hover:-rotate-12"
                                            alt=""
                                        />
                                        {/* Right Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="absolute w-16 h-16 transition-all duration-700 opacity-0 group-hover:opacity-40 group-hover:translate-x-16 group-hover:rotate-12"
                                            alt=""
                                        />
                                        {/* Main Central Icon */}
                                        <img
                                            src="/site_icons/img.svg"
                                            className="relative w-20 h-20 z-10 transition-all duration-500 opacity-30 group-hover:opacity-100 group-hover:scale-110"
                                            alt=""
                                        />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] mb-2">
                                        Drag & drop images here
                                    </h3>
                                    <p className="text-[#94A3B8] font-bold text-base md:text-lg mb-8">
                                        or <span className="text-[#4D96FF] decoration-2 underline-offset-4 hover:underline">browse files</span>
                                    </p>
                                    <div className="flex gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">
                                        <span>JPG</span>•<span>PNG</span>•<span>WEBP</span>•<span>HEIC</span>
                                    </div>
                                </div>

                                {/* Quick Start */}
                                <div className="mb-14">
                                    <div className="flex items-center gap-4 mb-8">
                                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Quick start</h3>
                                        <span className="px-3 py-1 bg-[#4D96FF] text-white text-[10px] font-black rounded-lg uppercase tracking-widest animate-pulse">
                                            POPULAR
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                        <QuickStartCard
                                            title="Remove background"
                                            image="/img/tools/remove_bg.png"
                                            video="/video/tools/remove_bg-f6045fe63f17a1a42b07ff97ce4e20af.mp4"
                                        />
                                        <QuickStartCard
                                            title="AI Photoshoot"
                                            image="/img/tools/ai_backgrounds.png"
                                            video="/video/tools/ai_backgrounds-fdd35ebda59e84353c036a434a4f8b95.mp4"
                                        />
                                        <QuickStartCard
                                            title="Enhance quality"
                                            image="/img/tools/enhance.png"
                                            video="/video/tools/enhance-79352e8350856988951c624229a2e74b.mp4"
                                            badge={<span>NEW ✨</span>}
                                        />
                                    </div>
                                </div>

                                <Section title="New tools" viewAll>
                                    <Card
                                        title="AI Fashion Models"
                                        image="/img/tools/ai_fashion_model.png"
                                        video="/video/tools/ai_fashion_models-321de5f2b3d65f613e2b45ce82c75bc6.mp4"
                                        badge="NEW"
                                    />
                                    <Card
                                        title="Image to video"
                                        image="/img/tools/ai_video.png"
                                        video="/video/tools/ai_video-11e0376230967ea53fa7a142188998bd.mp4"
                                        badge="HOT"
                                    />
                                    <Card
                                        title="Expand image"
                                        image="/img/tools/expand.png"
                                        video="/video/tools/expand-5f39db8b877304a7b2debaebade2a59d.mp4"
                                    />
                                    <Card
                                        title="AI Edit"
                                        image="/img/tools/ai_edit.png"
                                        video="/video/tools/ai_edit-d82b4d7d7114e1660f912fb8e4415daa.mp4"
                                    />
                                </Section>

                                <Section title="Other tools" viewAll>
                                    <Card
                                        title="Erase brush"
                                        image="/img/tools/fix_with_brush.png"
                                        video="/video/tools/fix_with_brush-5ab90e0c96ae972f2b7bc8f128c04f4e.mp4"
                                    />
                                    <Card
                                        title="Blur background"
                                        image="/img/tools/blur_bg.png"
                                        video="/video/tools/blur_bg-c465df0a3e42e62c377248577f113018.mp4"
                                    />
                                    <Card
                                        title="Correct colors"
                                        image="/img/tools/correct_colors.png"
                                        video="/video/tools/correct_colors-6015fdc4875e825450a591ea9e0da1da.mp4"
                                    />
                                    <Card
                                        title="Add shadows"
                                        image="/img/tools/add_shadows.png"
                                        video="/video/tools/add_shadows-50963f4a0a94c073d504468d8e2b119e.mp4"
                                    />
                                    <Card
                                        title="Add text"
                                        image="/img/tools/text.png"
                                        video="/video/tools/text-7af5cb5e2ba079eea587726626af54c2.mp4"
                                    />
                                </Section>
                                <TemplateSections />
                            </div>
                        )}
                    </main>
                </div>
            </div>


            <style dangerouslySetInnerHTML={{
                __html: `
                .font-tight { font-family: 'Sora', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}} />
            {/* Chat Widget */}
            <ChatWidget />
        </div>
    );
};

export default DashboardPage;

