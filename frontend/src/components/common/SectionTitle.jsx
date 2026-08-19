/**
 * Section Title Component
 * Consistent heading styles for sections
 */

const SectionTitle = ({
    title,
    subtitle,
    badge,
    align = 'center',
    size = 'lg',
    className = '',
    titleClassName = '',
    subtitleClassName = '',
    dark = false,
}) => {
    // Alignment styles
    const alignments = {
        left: 'text-left',
        center: 'text-center mx-auto',
        right: 'text-right ml-auto',
    };

    // Size styles for title
    const titleSizes = {
        sm: 'text-2xl md:text-3xl',
        md: 'text-3xl md:text-4xl',
        lg: 'text-4xl md:text-5xl lg:text-6xl',
        xl: 'text-5xl md:text-6xl lg:text-7xl',
    };

    // Color styles
    const titleColor = dark ? 'text-white' : 'text-gray-900';
    const subtitleColor = dark ? 'text-gray-300' : 'text-gray-600';

    return (
        <div className={`max-w-3xl ${alignments[align]} ${className}`}>
            {badge && (
                <div className={`mb-4 ${align === 'center' ? 'flex justify-center' : ''}`}>
                    {badge}
                </div>
            )}
            <h2
                className={`${titleSizes[size]} font-bold tracking-tight ${titleColor} ${titleClassName}`}
            >
                {title}
            </h2>
            {subtitle && (
                <p
                    className={`mt-4 md:mt-6 text-lg md:text-xl ${subtitleColor} ${subtitleClassName}`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default SectionTitle;
