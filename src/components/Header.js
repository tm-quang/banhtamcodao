'use client';

import Link from 'next/link';
import { Menu, X, LogIn, LogOut, Settings, Shield, User as UserIcon, Facebook, Twitter, Heart, Handbag, Home, SquareMenu, FileText, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import { useWishlist } from '@/context/WishlistContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, isCartAnimating, openMiniCart } = useCart();
  const { wishlistCount, isWishlistAnimating } = useWishlist();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef(null);
  const userMenuRef = useRef(null);

  /**
   * Các trang có header trong suốt khi chưa cuộn: trang chủ, menu (có hero), contact (có background image)
   */
  const transparentHeaderPaths = ['/', '/menu', '/contact', '/order-tracking', '/login', '/register', '/account'];
  const isTransparentPage = transparentHeaderPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    setIsScrolled(!isTransparentPage || window.scrollY > 50);
    if (isTransparentPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname, isTransparentPage]);

  useEffect(() => {
    if (isMenuOpen) {
      // Lưu scroll position hiện tại
      const scrollY = window.scrollY;
      // Prevent scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Khôi phục scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Đóng user menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && userMenuRef.current) {
        // Kiểm tra nếu click không phải vào popup menu và không phải vào button toggle
        const clickedInsideMenu = userMenuRef.current.contains(event.target);
        const clickedOnToggleButton = event.target.closest('button[onClick*="handleUserMenuToggle"]') !== null;
        
        if (!clickedInsideMenu && !clickedOnToggleButton) {
          setIsUserMenuOpen(false);
        }
      }
    };

    if (isUserMenuOpen) {
      // Sử dụng setTimeout để tránh đóng ngay khi mở
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isUserMenuOpen]);

  const totalItems = isClient ? (cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0) : 0;
  const [flashCartCount, setFlashCartCount] = useState(false);
  const [flashWishlistCount, setFlashWishlistCount] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    setFlashCartCount(true);
    const t = setTimeout(() => setFlashCartCount(false), 700);
    return () => clearTimeout(t);
  }, [totalItems, isClient]);

  useEffect(() => {
    if (!isClient) return;
    setFlashWishlistCount(true);
    const t = setTimeout(() => setFlashWishlistCount(false), 700);
    return () => clearTimeout(t);
  }, [wishlistCount, isClient]);

  /**
   * Logic màu nền header:
   * - Trang chủ: trong suốt khi chưa cuộn, #FFFBF7 khi cuộn
   * - Trang contact: trong suốt với text trắng (vì có background image tối)
   * - Các trang khác: #FFFBF7 ngay từ đầu
   */
  const isContactPage = pathname === '/contact';
  const textColorClass = isContactPage ? 'text-white' : 'text-black';
  const bgClass = isTransparentPage && !isScrolled ? 'bg-transparent' : 'bg-[#FFFBF7]';
  /**
   * Shadow: khi có nền dùng shadow nhẹ, khi trong suốt không có shadow
   */
  const shadowClass = bgClass === 'bg-transparent' ? '' : 'shadow-sm';
  const headerClass = `fixed top-0 w-full z-50 ${textColorClass} transition-colors duration-500 ease-in-out ${bgClass} ${shadowClass} h-14 md:h-16`;

  const navLinks = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/menu', label: 'Thực đơn', icon: SquareMenu },
    { href: '/order-tracking', label: 'Tra cứu đơn hàng', icon: FileText },
    { href: '/contact', label: 'Liên hệ', icon: MessageCircle },
  ];

  const handleCartIconClick = (e) => {
    e.preventDefault();
    openMiniCart();
  }

  const handleUserMenuToggle = (e) => {
    e.preventDefault();
    setIsUserMenuOpen(prev => !prev);
  }

  const handleUserMenuClose = () => {
    setIsUserMenuOpen(false);
  }

  return (
    <>
      <header className={headerClass} ref={headerRef}>
        <div className="max-w-[1200px] mx-auto flex h-full justify-between items-center px-2">
          <div className="w-48">
            <Link href="/">
              <img
                src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                alt="Bánh Tằm Cô Đào Logo" width={180} height={40}
                loading="eager"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-7">
              <Link href="/" className={`relative group transition-colors py-2 ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} font-lobster text-2xl`}>
                <span className="relative z-10">Trang chủ</span>
                <span className={`absolute left-0 -bottom-0.5 h-0.5 w-0 ${isContactPage ? 'bg-white' : 'bg-primary'} transition-all duration-300 group-hover:w-full`}></span>
              </Link>
              <Link href="/menu" className={`relative group transition-colors py-2 ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} font-lobster text-2xl`}>
                <span className="relative z-10">Thực đơn</span>
                <span className={`absolute left-0 -bottom-0.5 h-0.5 w-0 ${isContactPage ? 'bg-white' : 'bg-primary'} transition-all duration-300 group-hover:w-full`}></span>
              </Link>
              <Link href="/order-tracking" className={`relative group transition-colors py-2 ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} font-lobster text-2xl`}>
                <span className="relative z-10">Đơn hàng</span>
                <span className={`absolute left-0 -bottom-0.5 h-0.5 w-0 ${isContactPage ? 'bg-white' : 'bg-primary'} transition-all duration-300 group-hover:w-full`}></span>
              </Link>
              <Link href="/contact" className={`relative group transition-colors py-2 ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} font-lobster text-2xl`}>
                <span className="relative z-10">Liên hệ</span>
                <span className={`absolute left-0 -bottom-0.5 h-0.5 w-0 ${isContactPage ? 'bg-white' : 'bg-primary'} transition-all duration-300 group-hover:w-full`}></span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 px-1">
            <div className="hidden md:block">
              <SearchBar isContactPage={isContactPage} />
            </div>
            <Link
              href="/wishlist"
              className={`relative ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} transition-colors p-1 ${isWishlistAnimating ? 'animate-wishlist-bounce' : ''}`}
              aria-label={`Danh sách yêu thích, ${wishlistCount} sản phẩm`}
            >
              <Heart size={24} className={isContactPage ? 'text-white' : ''} />
              {isClient && wishlistCount > 0 && (
                <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${flashWishlistCount ? 'animate-cart-count-flash' : ''}`}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={handleCartIconClick}
                className={`cursor-pointer relative ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} transition-colors p-1 hidden md:inline-flex ${isCartAnimating ? 'animate-cart-bounce' : ''}`}
                aria-label={`Mở xem nhanh giỏ hàng, ${totalItems} sản phẩm`}
                style={{ transformOrigin: 'center' }}
              >
                <Handbag size={24} className={isContactPage ? 'text-white' : ''} />
                {isClient && totalItems > 0 && (
                  <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${flashCartCount && totalItems > 0 ? 'animate-cart-count-flash' : ''}`}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            <div className="relative hidden md:block">
              {user ? (
                <button onClick={handleUserMenuToggle} className={`cursor-pointer ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} transition-colors p-1`}>
                  <UserIcon size={24} className={isContactPage ? 'text-white' : ''} />
                </button>
              ) : (
                <Link href="/login" className={`${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} transition-colors p-1`}>
                  <UserIcon size={24} className={isContactPage ? 'text-white' : ''} />
                </Link>
              )}

              {user && isUserMenuOpen && (
                <div 
                  ref={userMenuRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border z-50 text-secondary"
                >
                  <div className="p-4 border-b">
                    <p className="font-bold">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                  </div>
                  <nav className="p-2">
                    <Link 
                      href="/account" 
                      onClick={handleUserMenuClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-3xl hover:bg-gray-100 transition-colors"
                    >
                      <Settings size={16} /> Thông tin tài khoản
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        onClick={handleUserMenuClose}
                        className="flex items-center gap-3 px-3 py-2 rounded-3xl hover:bg-gray-100 transition-colors"
                      >
                        <Shield size={16} /> Quản trị Website
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleUserMenuClose();
                        logout();
                      }} 
                      className="cursor-pointer w-full text-left flex items-center gap-3 px-3 py-2 rounded-3xl hover:bg-gray-100 text-red-600 transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </nav>
                </div>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`cursor-pointer md:hidden ${isContactPage ? 'hover:text-white/80' : 'hover:text-primary'} transition-colors relative z-[110] p-2`}>
              <div className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isMenuOpen ? <X size={28} className={isContactPage ? 'text-white' : ''} /> : <Menu size={28} className={isContactPage ? 'text-white' : ''} />}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm z-[90] transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-gradient-to-b from-white via-[#FFFBF7] to-white shadow-[4px_0_24px_rgba(0,0,0,0.12)] z-[100] flex flex-col transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header với logo và close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/60 flex-shrink-0 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent backdrop-blur-sm">
          <Link 
            href="/" 
            onClick={() => setIsMenuOpen(false)} 
            className="hover:opacity-80 transition-all duration-200 hover:scale-105"
          >
            <img 
              src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png" 
              alt="Bánh Tằm Cô Đào Logo" 
              width={180} 
              height={38}
              className="drop-shadow-sm"
            />
          </Link>
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="cursor-pointer text-gray-500 hover:text-primary hover:bg-primary/10 p-2.5 rounded-full transition-all duration-200 active:scale-95"
            aria-label="Đóng menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              
              return (
                <li key={link.href} style={{ animationDelay: `${index * 50}ms` }}>
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)} 
                    className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-md shadow-primary/10' 
                        : 'text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/8 hover:to-primary/3'
                    } active:scale-[0.97]`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary scale-110' 
                        : 'text-gray-500 group-hover:text-primary group-hover:scale-110'
                    }`}>
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    
                    {/* Label */}
                    <span className={`text-base font-semibold tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-primary' : 'text-gray-800 group-hover:text-primary'
                    }`}>
                      {link.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    )}

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                  </Link>
                </li>
              );
            })}

            {/* Admin Link */}
            {user?.role === 'admin' && (
              <li style={{ animationDelay: `${navLinks.length * 50}ms` }}>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    pathname.startsWith('/admin')
                      ? 'bg-gradient-to-r from-purple-500/15 to-purple-500/5 text-purple-600 shadow-md shadow-purple-500/10' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/8 hover:to-purple-500/3'
                  } active:scale-[0.97]`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${
                    pathname.startsWith('/admin')
                      ? 'text-purple-600 scale-110' 
                      : 'text-gray-500 group-hover:text-purple-600 group-hover:scale-110'
                  }`}>
                    <Shield size={22} strokeWidth={2} />
                  </div>
                  <span className={`text-base font-semibold tracking-wide transition-colors duration-300 ${
                    pathname.startsWith('/admin') ? 'text-purple-600' : 'text-gray-800 group-hover:text-purple-600'
                  }`}>
                    Admin
                  </span>
                  {pathname.startsWith('/admin') && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            )}

            {/* Login Link (khi chưa đăng nhập) */}
            {!user && (
              <li style={{ animationDelay: `${navLinks.length * 50}ms` }}>
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    pathname.startsWith('/login') || pathname.startsWith('/register')
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-md shadow-primary/10' 
                      : 'text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/8 hover:to-primary/3'
                  } active:scale-[0.97]`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${
                    pathname.startsWith('/login') || pathname.startsWith('/register')
                      ? 'text-primary scale-110' 
                      : 'text-gray-500 group-hover:text-primary group-hover:scale-110'
                  }`}>
                    <LogIn size={22} strokeWidth={2} />
                  </div>
                  <span className={`text-base font-semibold tracking-wide transition-colors duration-300 ${
                    pathname.startsWith('/login') || pathname.startsWith('/register') ? 'text-primary' : 'text-gray-800 group-hover:text-primary'
                  }`}>
                    Đăng nhập
                  </span>
                  {(pathname.startsWith('/login') || pathname.startsWith('/register')) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Header;