/**
 * Footer Component
 * Minimal fixed footer with color adaptation
 */
const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-3 pointer-events-none mix-blend-difference">
            <div className="flex justify-between items-center w-full flex-nowrap">
                {/* Left: Copyright */}
                <div className="pointer-events-auto flex items-center transform translate-y-[0.5px] md:translate-y-0">
                    <p className="text-[12px] md:text-[15px] font-black text-white tracking-tight uppercase whitespace-nowrap leading-none">
                        © WeShoot
                    </p>
                </div>

                {/* Right: Social Icons */}
                <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
                    {/* Instagram */}
                    <a href="https://www.instagram.com/weshoot.ai?igsh=MWN5cDc5NGpubGN0cQ==" className="flex items-center hover:scale-110 transition-transform duration-300" aria-label="Instagram">
                        <img src="/site_icons/logo-instagram.svg" alt="Instagram" className="w-[18px] h-[18px] md:w-5 md:h-5 block" style={{ filter: 'brightness(0) invert(1)' }} />
                    </a>
                    {/* TikTok */}
                    <a href="https://www.tiktok.com/@weshoot.ai?_r=1&_t=ZS-93B75YS2nw8" className="flex items-center hover:scale-110 transition-transform duration-300" aria-label="TikTok">
                        <img src="/site_icons/logo-tiktok.svg" alt="TikTok" className="w-[18px] h-[18px] md:w-5 md:h-5 block" style={{ filter: 'brightness(0) invert(1)' }} />
                    </a>
                    {/* Facebook */}
                    <a href="https://www.facebook.com/share/1AoYq44osu/" className="flex items-center hover:scale-110 transition-transform duration-300" aria-label="Facebook">
                        <img src="/site_icons/logo-facebook.svg" alt="Facebook" className="w-[18px] h-[18px] md:w-5 md:h-5 block" style={{ filter: 'brightness(0) invert(1)' }} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

