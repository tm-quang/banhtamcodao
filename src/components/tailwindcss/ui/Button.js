/**
 * Button component với Tailwind CSS
 */
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  startIcon,
  endIcon,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border-0 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      style={{ 
        border: 'none !important', 
        outline: 'none !important',
        borderWidth: '0 !important',
        borderStyle: 'none !important',
        boxShadow: 'none'
      }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-semibold
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        !border-0 !border-none !outline-none
        hover:!border-0 active:!border-0 focus:!border-0
        [&]:border-0 [&]:outline-none
        ${variants[variant]}
        ${sizes[size]}
      `.trim() + (className ? ` ${className}` : '')}
      disabled={disabled || loading}
      onMouseDown={(e) => {
        e.currentTarget.style.setProperty('border', 'none', 'important');
        e.currentTarget.style.setProperty('outline', 'none', 'important');
        e.currentTarget.style.setProperty('border-width', '0', 'important');
        e.currentTarget.style.setProperty('box-shadow', 'none', 'important');
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.setProperty('border', 'none', 'important');
        e.currentTarget.style.setProperty('outline', 'none', 'important');
      }}
      onFocus={(e) => {
        e.currentTarget.style.setProperty('border', 'none', 'important');
        e.currentTarget.style.setProperty('outline', 'none', 'important');
      }}
      onBlur={(e) => {
        e.currentTarget.style.setProperty('border', 'none', 'important');
        e.currentTarget.style.setProperty('outline', 'none', 'important');
      }}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
        </>
      )}
    </button>
  );
}

