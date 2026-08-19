/**
 * Badge Component
 * Small label/tag component
 */

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    // Variant styles
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-purple-100 text-purple-700',
        secondary: 'bg-pink-100 text-pink-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        gradient: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
        dark: 'bg-gray-900 text-white',
        outline: 'bg-transparent border border-gray-300 text-gray-700',
    };

    // Size styles
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
