/**
 * Card Component
 * Reusable card container with hover effects
 */

const Card = ({
    children,
    className = '',
    variant = 'default',
    hover = true,
    padding = 'md',
    onClick,
    ...props
}) => {
    // Variant styles
    const variants = {
        default: 'bg-white border border-gray-100',
        dark: 'bg-gray-900 border border-gray-800',
        gradient: 'bg-gradient-to-br from-purple-600 to-pink-500',
        glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
        outline: 'bg-transparent border-2 border-gray-200',
    };

    // Padding styles
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    // Hover styles
    const hoverStyles = hover
        ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1'
        : '';

    // Click styles
    const clickStyles = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`rounded-2xl overflow-hidden ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${clickStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
