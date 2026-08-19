import { useState, useRef, useEffect } from 'react';

const ProfileDropdown = ({ user, onSettingsClick, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getInitial = () => {
        if (user?.full_name && user.full_name.trim()) return user.full_name.trim()[0].toUpperCase();
        if (user?.email) return user.email[0].toUpperCase();
        return 'U';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-11 h-11 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center cursor-pointer ml-3 relative hover:border-[#4D96FF] transition-all duration-300 shadow-sm"
            >
                <div className="w-8 h-8 rounded-[10px] bg-[#4D96FF] flex items-center justify-center text-white font-black text-xs">
                    {getInitial()}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[28px] shadow-[rgba(15,23,42,0.15)_0px_20px_40px_-5px] border border-[#F1F5F9] py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-6 py-4 border-b border-[#F8FAFC]">
                        <p className="text-sm font-black text-[#0F172A] truncate">{user?.full_name || 'User'}</p>
                        <p className="text-xs font-bold text-[#94A3B8] truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-2 px-2">
                        {onSettingsClick && (
                            <button
                                onClick={() => { onSettingsClick(); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#4D96FF] rounded-[16px] transition-all"
                            >
                                <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </button>
                        )}
                        <button
                            onClick={() => { onLogout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[16px] transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
