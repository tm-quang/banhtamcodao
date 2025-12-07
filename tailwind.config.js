/** @type {import('tailwindcss').Config} */
module.exports = {
  // THAY ĐỔI QUAN TRỌNG NẰM Ở ĐÂY
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Quét tất cả các file trong thư mục src
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6F30',      // Cam
        'secondary': '#222629',    // Đen/Xám đậm
        'accent': '#007BFF',       // Xanh dương
        'light': '#ffffff',         // Trắng
      },
      fontFamily: {
        'sans': ['var(--font-roboto)', 'Roboto', 'sans-serif'], // Mặc định là Roboto
        'roboto': ['var(--font-roboto)', 'Roboto', 'sans-serif'],
        'lobster': ['var(--font-lobster)', 'Lobster', 'cursive'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px',
        },
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom, 0px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wishlist-bounce': 'wishlistBounce 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wishlistBounce: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(0.9)' },
          '75%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};