import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const ResponsiveCard = ({ 
    children, 
    className = '', 
    padding = 'p-6', 
    hover = true,
    gradient = false,
    onClick = null
}) => {
    const { theme } = useContext(ThemeContext);

    const baseClasses = `
        rounded-lg shadow-lg transition-all duration-200
        ${theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }
        ${hover ? 'hover:shadow-xl hover:scale-[1.02]' : ''}
        ${gradient && theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
            : gradient && theme === 'light'
            ? 'bg-gradient-to-br from-white to-gray-50'
            : ''
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${padding}
        ${className}
    `;

    const CardComponent = onClick ? 'button' : 'div';

    return (
        <CardComponent 
            className={baseClasses}
            onClick={onClick}
        >
            {children}
        </CardComponent>
    );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ children, cols = 1, gap = 'gap-6' }) => {
    const gridClasses = `
        grid
        grid-cols-1
        ${cols >= 2 ? 'md:grid-cols-2' : ''}
        ${cols >= 3 ? 'lg:grid-cols-3' : ''}
        ${cols >= 4 ? 'xl:grid-cols-4' : ''}
        ${gap}
    `;

    return (
        <div className={gridClasses}>
            {children}
        </div>
    );
};

// Responsive Container
export const ResponsiveContainer = ({ children, maxWidth = 'max-w-7xl' }) => {
    return (
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {children}
        </div>
    );
};

// Mobile-friendly Button
export const ResponsiveButton = ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    onClick,
    className = ''
}) => {
    const { theme } = useContext(ThemeContext);

    const baseClasses = `
        inline-flex items-center justify-center
        font-medium rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
    `;

    const variants = {
        primary: `
            ${theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' 
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            }
        `,
        secondary: `
            ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
            }
        `,
        danger: `
            ${theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
            }
        `,
        outline: `
            ${theme === 'dark'
                ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }
        `
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseClasses}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
        >
            {loading && (
                <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
            )}
            {children}
        </button>
    );
};

// Mobile-friendly Input
export const ResponsiveInput = ({ 
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`${className}`}>
            {label && (
                <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                )}
                <input
                    className={`
                        w-full rounded-lg border px-4 py-3
                        ${Icon ? 'pl-10' : ''}
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-colors duration-200
                        ${theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }
                        ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Touch-friendly Table
export const ResponsiveTable = ({ 
    headers, 
    data, 
    actions = [],
    keyField = 'id',
    emptyMessage = 'No data available'
}) => {
    const { theme } = useContext(ThemeContext);

    if (!data || data.length === 0) {
        return (
            <div className={`text-center py-12 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {data.map((row, index) => (
                    <ResponsiveCard key={row[keyField] || index}>
                        {headers.map((header, headerIndex) => (
                            <div key={headerIndex} className="flex justify-between items-center py-2">
                                <span className={`font-medium ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {header.label}
                                </span>
                                <span>
                                    {header.render ? header.render(row) : row[header.key]}
                                </span>
                            </div>
                        ))}
                        {actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {actions.map((action, actionIndex) => (
                                    <ResponsiveButton
                                        key={actionIndex}
                                        size="sm"
                                        variant={action.variant || 'secondary'}
                                        onClick={() => action.onClick(row)}
                                    >
                                        {action.icon && <action.icon className="mr-1" />}
                                        {action.label}
                                    </ResponsiveButton>
                                ))}
                            </div>
                        )}
                    </ResponsiveCard>
                ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                {header.label}
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {data.map((row, index) => (
                        <tr key={row[keyField] || index} className={`hover:${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            {headers.map((header, headerIndex) => (
                                <td key={headerIndex} className="px-6 py-4 whitespace-nowrap">
                                    {header.render ? header.render(row) : row[header.key]}
                                </td>
                            ))}
                            {actions.length > 0 && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        {actions.map((action, actionIndex) => (
                                            <ResponsiveButton
                                                key={actionIndex}
                                                size="sm"
                                                variant={action.variant || 'secondary'}
                                                onClick={() => action.onClick(row)}
                                            >
                                                {action.icon && <action.icon className="mr-1" />}
                                                {action.label}
                                            </ResponsiveButton>
                                        ))}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResponsiveCard;
