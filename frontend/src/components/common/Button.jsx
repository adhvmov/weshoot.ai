/**
 * Button Component
 * Reusable button with multiple variants
 */
import { Link } from 'react-router-dom';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    href,
    to,
    className = '',
    icon,
    iconPosition = 'right',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variants = {
        primary: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-900 rounded-full',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-500 rounded-full',
        gradient: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 focus:ring-purple-500 rounded-full shadow-lg hover:shadow-xl',
        outline: 'bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white focus:ring-gray-900 rounded-full',
        ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 rounded-lg',
        white: 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white rounded-full shadow-lg',
        dark: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 rounded-full',
    };

    // Size styles
    const sizes = {
        xs: 'px-3 py-1.5 text-xs',
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3 text-base',
        xl: 'px-10 py-4 text-lg',
    };

    // Combine all styles
    const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    // Icon element
    const iconElement = icon && (
        <span className={`${iconPosition === 'left' ? 'mr-2' : 'ml-2'} ${loading ? 'opacity-0' : ''}`}>
            {icon}
        </span>
    );

    // Loading spinner
    const loadingSpinner = loading && (
        <svg
            className="absolute animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    // Content with possible loading state
    const content = (
        <>
            {loading && loadingSpinner}
            <span className={`flex items-center ${loading ? 'opacity-0' : ''}`}>
                {iconPosition === 'left' && iconElement}
                {children}
                {iconPosition === 'right' && iconElement}
            </span>
        </>
    );

    // Render as Link (react-router)
    if (to) {
        return (
            <Link to={to} className={buttonStyles} {...props}>
                {content}
            </Link>
        );
    }

    // Render as anchor tag
    if (href) {
        return (
            <a href={href} className={buttonStyles} {...props}>
                {content}
            </a>
        );
    }

    // Render as button
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${buttonStyles} relative`}
            {...props}
        >
            {content}
        </button>
    );
};

export default Button;
