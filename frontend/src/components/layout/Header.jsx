

/**
 * Header Component
 * Redesigned with Glassmorphism, Mega Menu, and Premium Aesthetic
 * Refinements: Centered Links, Blue Button Border, Small Bottom Light Pill, White Lighting Border
 */
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiteStatusContext } from '../../App';
import { TOOLS } from '../../constants/tools';

// Chevron Icons
const ChevronDown = () => (
    <img src="/site_icons/chevron-down-outline.svg" alt="chevron-down" className="w-3 h-3 ml-1 transition-transform duration-300" />
);

const ChevronUp = () => (
    <img src="/site_icons/chevron-up-outline.svg" alt="chevron-up" className="w-3 h-3 ml-1 transition-transform duration-300" />
);

const SparkleIcon = () => (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-1">
        <path d="M5.26931 2.56773L3.86057 2.85449C3.76515 2.8739 3.69655 2.95778 3.69623 3.05549C3.6959 3.15321 3.76408 3.23766 3.85935 3.25756L5.25552 3.55006L5.54286 4.96347C5.56227 5.05914 5.64596 5.12794 5.7431 5.12811H5.74359C5.84056 5.12811 5.92424 5.05996 5.94415 4.96462L6.23663 3.56308L7.64291 3.27353C7.73769 3.25404 7.80603 3.17041 7.80669 3.0731C7.80718 2.9758 7.73981 2.89143 7.64503 2.87087L6.25628 2.56888L5.95981 1.16316C5.93974 1.06807 5.85614 1 5.75925 1H5.75876C5.66194 1.00025 5.57826 1.06872 5.55869 1.16406L5.26931 2.56773ZM5.63022 3.33521C5.61382 3.2547 5.55134 3.19163 5.47125 3.17492L4.91851 3.05902L5.48324 2.9441C5.5635 2.9278 5.62663 2.86473 5.64318 2.78413L5.76153 2.20971L5.88273 2.78446C5.89945 2.86383 5.96095 2.92583 6.03998 2.94303L6.60806 3.06655L6.02244 3.18712C5.94251 3.20358 5.87988 3.26624 5.86316 3.34651L5.74636 3.90628L5.63022 3.33521ZM14.0737 3.39655C14.4767 2.99514 14.4793 2.3417 14.0797 1.93703C13.68 1.53237 13.0293 1.52974 12.6264 1.93114L10.149 4.39906L11.5964 5.86447L14.0737 3.39655ZM10.8895 6.59351L9.44216 5.1281L1.30395 13.2352C0.901006 13.6367 0.898356 14.2901 1.29804 14.6948C1.69771 15.0994 2.34837 15.1021 2.75132 14.7007L10.8895 6.59351ZM11.0539 10.0787L12.4626 9.79191L12.752 8.38825C12.7716 8.29291 12.8553 8.22443 12.9521 8.22419H12.9526C13.0495 8.22419 13.1331 8.29225 13.1531 8.38735L13.4496 9.79306L14.8383 10.0951C14.9331 10.1156 15.0005 10.2 15 10.2973C14.9993 10.3946 14.931 10.4782 14.8362 10.4977L13.4299 10.7873L13.1375 12.1888C13.1176 12.2841 13.0339 12.3523 12.9369 12.3523H12.9364C12.8393 12.3521 12.7566 12.2833 12.7362 12.1877L12.4488 10.7742L11.0527 10.4817C10.9574 10.4618 10.8892 10.3774 10.8895 10.2797C10.8899 10.182 10.9585 10.0981 11.0539 10.0787ZM12.6646 10.3991C12.7447 10.4158 12.8071 10.4789 12.8235 10.5594L12.9397 11.1305L13.0565 10.5707C13.0732 10.4904 13.1358 10.4278 13.2158 10.4113L13.8014 10.2907L13.2333 10.1672C13.1543 10.15 13.0928 10.088 13.076 10.0086L12.9548 9.43389L12.8365 10.0083C12.8199 10.0889 12.7568 10.152 12.6766 10.1683L12.1118 10.2832L12.6646 10.3991ZM7.56563 13.1362L6.86126 13.2795C6.81355 13.2892 6.77925 13.3312 6.77909 13.38C6.77893 13.4289 6.81302 13.4711 6.86065 13.4811L7.55874 13.6273L7.70241 14.334C7.71212 14.3819 7.75396 14.4163 7.80253 14.4163H7.80277C7.85126 14.4163 7.8931 14.3823 7.90305 14.3346L8.04929 13.6338L8.75243 13.4891C8.79982 13.4793 8.834 13.4375 8.83432 13.3888C8.83457 13.3402 8.80088 13.298 8.75349 13.2877L8.05912 13.1367L7.91088 12.4339C7.90085 12.3863 7.85905 12.3523 7.8106 12.3523H7.81036C7.76195 12.3524 7.72011 12.3867 7.71032 12.4343L7.56563 13.1362ZM7.74609 13.5199C7.73789 13.4796 7.70665 13.4481 7.6666 13.4398L7.39023 13.3818L7.6726 13.3243C7.71273 13.3162 7.74429 13.2847 7.75257 13.2444L7.81174 12.9571L7.87234 13.2445C7.8807 13.2842 7.91145 13.3152 7.95097 13.3238L8.23501 13.3856L7.9422 13.4459C7.90224 13.4541 7.87092 13.4854 7.86256 13.5256L7.80416 13.8054L7.74609 13.5199Z" />
    </svg>
);

const NavLink = ({ children, isActive, onClick, hasDropdown }) => (
    <div className="relative group/link px-1 py-4 cursor-pointer" onMouseEnter={onClick}>
        <div className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {children}
            {hasDropdown && (isActive ? <ChevronUp /> : <ChevronDown />)}
        </div>
        {/* Bottom Blue Light Effect - Centered Neon Glow */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-[2px] bg-[#4D96FF] rounded-full shadow-[0_0_12px_2px_rgba(77,150,255,0.8),0_0_20px_4px_rgba(77,150,255,0.4)] transition-all duration-300 opacity-0 group-hover/link:opacity-100 ${isActive ? 'opacity-100' : ''}`}></div>
    </div>
);

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const siteStatus = useContext(SiteStatusContext);

    // Handle scroll effect for floating header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setActiveDropdown(null);
        setIsMenuOpen(false);
    }, [location]);

    const handleMouseEnter = (name) => {
        if (window.innerWidth >= 768) {
            setActiveDropdown(name);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth >= 768) {
            setActiveDropdown(null);
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex justify-center px-4 ${isScrolled ? 'pt-4' : 'pt-6'
                }`}
        >
            <div
                className={`w-full max-w-7xl mx-auto transition-all duration-300 relative flex items-center justify-between ${isScrolled
                    ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)] rounded-[24px] px-6 py-2'
                    : 'bg-white/50 backdrop-blur-md border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.3)] rounded-[32px] px-8 py-3'
                    }`}
            >
                {/* Logo - Absolute Left */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img src="/site_icons/black_logo.webp" alt="WeShoot" className="h-14" />
                    </Link>
                </div>

                {/* Desktop Navigation - Absolute Center */}
                <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
                    {/* Tools Mega Menu */}
                    <div
                        className="relative"
                        onMouseEnter={() => handleMouseEnter('Tools')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <NavLink
                            isActive={activeDropdown === 'Tools'}
                            hasDropdown={true}
                        >
                            Tools
                        </NavLink>

                        {/* Mega Menu Dropdown */}
                        <div
                            className={`absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-[800px] transition-all duration-300 ${activeDropdown === 'Tools'
                                ? 'opacity-100 translate-y-0 visible z-50'
                                : 'opacity-0 translate-y-2 invisible -z-10'
                                }`}
                        >
                            <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 p-6 ring-1 ring-black/5">
                                <div className="grid grid-cols-3 gap-3">
                                    {TOOLS.map((tool) => (
                                        siteStatus?.isClosed && !siteStatus?.hasAccess ? (
                                            <button
                                                key={tool.id}
                                                onClick={(e) => { e.preventDefault(); siteStatus.showEarlyAccessModal(); }}
                                                className="flex items-start p-3 rounded-2xl hover:bg-[#F5F8FF] transition-all duration-200 group/tool border border-transparent hover:border-blue-100/50 text-left w-full"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors ${activeDropdown === 'Tools' ? 'bg-blue-50 text-[#4D96FF] group-hover/tool:bg-white group-hover/tool:shadow-sm' : 'bg-gray-50'}`}>
                                                    <div
                                                        className="w-5 h-5"
                                                        style={{
                                                            maskImage: `url(${tool.icon})`,
                                                            WebkitMaskImage: `url(${tool.icon})`,
                                                            maskSize: 'contain',
                                                            WebkitMaskSize: 'contain',
                                                            maskRepeat: 'no-repeat',
                                                            WebkitMaskRepeat: 'no-repeat',
                                                            maskPosition: 'center',
                                                            WebkitMaskPosition: 'center',
                                                            backgroundColor: '#4D96FF'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-gray-900 group-hover/tool:text-gray-900 transition-colors">
                                                            {tool.title}
                                                        </h4>
                                                        {tool.isNew && (
                                                            <span className="flex items-center bg-[#4D96FF]/10 text-[#4D96FF] px-1.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide">
                                                                <SparkleIcon />
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-400 mt-0.5 max-w-[180px] leading-tight group-hover/tool:text-gray-500">
                                                        {tool.description}
                                                    </p>
                                                </div>
                                            </button>
                                        ) : (
                                            <Link
                                                key={tool.id}
                                                to={tool.path}
                                                className="flex items-start p-3 rounded-2xl hover:bg-[#F5F8FF] transition-all duration-200 group/tool border border-transparent hover:border-blue-100/50"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors ${activeDropdown === 'Tools' ? 'bg-blue-50 text-[#4D96FF] group-hover/tool:bg-white group-hover/tool:shadow-sm' : 'bg-gray-50'
                                                    }`}>
                                                    <div
                                                        className="w-5 h-5"
                                                        style={{
                                                            maskImage: `url(${tool.icon})`,
                                                            WebkitMaskImage: `url(${tool.icon})`,
                                                            maskSize: 'contain',
                                                            WebkitMaskSize: 'contain',
                                                            maskRepeat: 'no-repeat',
                                                            WebkitMaskRepeat: 'no-repeat',
                                                            maskPosition: 'center',
                                                            WebkitMaskPosition: 'center',
                                                            backgroundColor: '#4D96FF'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-gray-900 group-hover/tool:text-gray-900 transition-colors">
                                                            {tool.title}
                                                        </h4>
                                                        {tool.isNew && (
                                                            <span className="flex items-center bg-[#4D96FF]/10 text-[#4D96FF] px-1.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide">
                                                                <SparkleIcon />
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-400 mt-0.5 max-w-[180px] leading-tight group-hover/tool:text-gray-500">
                                                        {tool.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Link */}
                    <NavLink hasDropdown={false}>
                        {siteStatus?.isClosed && !siteStatus?.hasAccess ? (
                            <button onClick={() => siteStatus.showEarlyAccessModal()}>Gallery</button>
                        ) : (
                            <Link to="/prompts">Gallery</Link>
                        )}
                    </NavLink>

                    {/* Pricing Link */}
                    <NavLink hasDropdown={false}>
                        {siteStatus?.isClosed && !siteStatus?.hasAccess ? (
                            <button onClick={() => siteStatus.showEarlyAccessModal()}>Pricing</button>
                        ) : (
                            <Link to="/pricing">Pricing</Link>
                        )}
                    </NavLink>
                </nav>

                {/* Right Side Actions - Absolute Right */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    {siteStatus?.isClosed && siteStatus?.isAuthenticated && !siteStatus?.hasAccess ? (
                        // User is logged in but not whitelisted - show early access
                        <button
                            onClick={() => siteStatus.showEarlyAccessModal()}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[16px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px]"
                        >
                            Get Early Access
                        </button>
                    ) : (
                        // Site open OR user not logged in - show normal buttons
                        <Link
                            to={user ? "/dashboard" : "/login?signup=true"}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-200 bg-[#4D96FF] border-[3px] border-[#9AC5FF] rounded-[16px] shadow-[rgba(58,137,253,0.75)_0px_8px_16px_-4px] hover:opacity-95 hover:shadow-[rgba(58,137,253,0.9)_0px_10px_20px_-4px]"
                        >
                            {user ? "Dashboard" : "Sign up"}
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ml-auto flex items-center justify-center"
                >
                    <img src="/site_icons/menu (1).png" alt="Menu" className="w-6 h-6 object-contain" />
                </button>
            </div>

            {/* Mobile Menu - Full Screen Overlay */}
            {/* Mobile Menu - Full Screen Overlay */}
            {/* Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/50 z-[90] transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className={`md:hidden fixed top-4 bottom-4 w-[300px] bg-white z-[95] shadow-2xl rounded-[32px] border border-[#F1F5F9] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'left-4 opacity-100' : '-left-full opacity-0 pointer-events-none'}`}>
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#F8FAFC]">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-1.5">
                        <img src="/site_icons/black_logo.webp" alt="WeShoot" className="h-12" />
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Menu Content */}
                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {/* Section Label */}
                    <div className="px-4 py-2">
                        <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-wider">Top Tools</span>
                    </div>

                    {/* Limited Tools List */}
                    {TOOLS.slice(0, 5).map((tool) => (
                        <Link
                            key={tool.id}
                            to={tool.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-4 rounded-[20px] transition-all group ${location.pathname === tool.path ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}
                        >
                            <div
                                className={`w-6 h-6 flex-shrink-0 transition-colors ${location.pathname === tool.path ? 'bg-white' : 'bg-[#64748B] group-hover:bg-[#0F172A]'}`}
                                style={{
                                    maskImage: `url(${tool.icon})`,
                                    WebkitMaskImage: `url(${tool.icon})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center'
                                }}
                            />
                            <span className="font-bold text-sm tracking-tight">{tool.title}</span>
                            {tool.isNew && <span className="ml-auto bg-[#4D96FF] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">NEW</span>}
                        </Link>
                    ))}

                    {/* Show All Tools Button */}
                    <Link
                        to="/editor"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-4 rounded-[20px] bg-[#F5F8FF] text-[#4D96FF] font-black text-xs uppercase tracking-widest hover:bg-[#EEF4FF] transition-all border border-[#4D96FF]/10 mt-2"
                    >
                        <span>Show all tools</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>

                    <div className="h-px bg-[#F8FAFC] my-4 mx-4" />

                    {/* Other Links */}
                    <Link
                        to="/prompts"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-4 rounded-[20px] transition-all ${location.pathname === '/prompts' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-bold text-sm">Gallery</span>
                    </Link>

                    <Link
                        to="/pricing"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-4 rounded-[20px] transition-all ${location.pathname === '/pricing' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        <span className="font-bold text-sm">Pricing</span>
                    </Link>
                </div>

                {/* Menu Footer */}
                <div className="p-6 border-t border-[#F8FAFC]">
                    {siteStatus?.isClosed && siteStatus?.isAuthenticated && !siteStatus?.hasAccess ? (
                        // User logged in but not whitelisted
                        <button
                            onClick={() => { setIsMenuOpen(false); siteStatus.showEarlyAccessModal(); }}
                            className="flex items-center justify-center w-full h-14 text-sm font-black text-white bg-[#4D96FF] border-[4px] border-[#F5F8FF] rounded-[24px] shadow-lg hover:opacity-90 transition-all uppercase tracking-widest"
                        >
                            Get Early Access
                        </button>
                    ) : (
                        // Site open OR user not logged in
                        <Link
                            to={user ? "/dashboard" : "/login?signup=true"}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center w-full h-14 text-sm font-black text-white bg-[#4D96FF] border-[4px] border-[#F5F8FF] rounded-[24px] shadow-lg hover:opacity-90 transition-all uppercase tracking-widest"
                        >
                            {user ? "Dashboard" : "Get Started"}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

