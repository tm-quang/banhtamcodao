'use client';

import Link from 'next/link';
import { Menu, X, LogIn, LogOut, Settings, Shield, CircleUser, ShoppingCart, User as UserIcon, Facebook, Twitter, Heart, Handbag, Home, SquareMenu, FileText, MessageCircle, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { useWishlist } from '@/context/WishlistContext';
import Image from 'next/image';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, isCartAnimating, openMiniCart } = useCart();
  const { wishlistCount, isWishlistAnimating } = useWishlist();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [isMobileSearchLoading, setIsMobileSearchLoading] = useState(false);
  const [isMobileSearchDropdownOpen, setIsMobileSearchDropdownOpen] = useState(false);
  const [mobileSearchSelectedIndex, setMobileSearchSelectedIndex] = useState(-1);
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const mobileSearchAbortRef = useRef(null);
  const mobileSearchCacheRef = useRef(new Map());

  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const placeholders = [
      "Tìm kiếm món ngon...",
      "Bánh Tằm Bì thơm béo...",
      "Bánh Tằm Bì Xíu Mại...",
      "Xíu Mại trứng muối...",
      "Trà tắc hạt chia..."
    ];
    
    const currentText = placeholders[placeholderIndex];
    const typingSpeed = isDeleting ? 40 : 80;
    const delay = !isDeleting && charIndex === currentText.length 
      ? 2000 
      : isDeleting && charIndex === 0 
        ? 500 
        : typingSpeed;

    const timeoutId = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setCurrentPlaceholder(currentText.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setCurrentPlaceholder(currentText.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [charIndex, isDeleting, placeholderIndex]);

  const [displayedPhone, setDisplayedPhone] = useState('');
  
  useEffect(() => {
    const fullPhone = "0933 960 788";
    let currentIdx = 0;
    let deleting = false;
    let timeoutId;

    const type = () => {
      if (!deleting) {
        setDisplayedPhone(fullPhone.slice(0, currentIdx + 1));
        currentIdx++;
        if (currentIdx === fullPhone.length) {
          deleting = true;
          timeoutId = setTimeout(type, 3000);
        } else {
          timeoutId = setTimeout(type, 150);
        }
      } else {
        setDisplayedPhone(fullPhone.slice(0, currentIdx - 1));
        currentIdx--;
        if (currentIdx === 0) {
          deleting = false;
          timeoutId = setTimeout(type, 500);
        } else {
          timeoutId = setTimeout(type, 50);
        }
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, []);

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

  // Đóng mobile search khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileSearchOpen && mobileSearchContainerRef.current) {
        // Kiểm tra nếu click không phải vào search container và không phải vào button toggle
        const clickedInsideSearch = mobileSearchContainerRef.current.contains(event.target);
        const clickedOnToggleButton = event.target.closest('button[onClick*="handleMobileSearchToggle"]') !== null;

        if (!clickedInsideSearch && !clickedOnToggleButton) {
          setIsMobileSearchOpen(false);
          setMobileSearchQuery('');
          setMobileSearchResults([]);
          setIsMobileSearchDropdownOpen(false);
          setMobileSearchSelectedIndex(-1);
        }
      }
    };

    if (isMobileSearchOpen) {
      // Sử dụng setTimeout để tránh đóng ngay khi mở
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isMobileSearchOpen]);

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
  const textColorClass = 'text-black'; // Thống nhất dùng chữ đen cho tất cả các trang
  const bgClass = isTransparentPage && !isScrolled ? 'bg-transparent' : 'bg-[#FFF5EB]/90 backdrop-blur-md';
  /**
   * Shadow: khi có nền dùng shadow nhẹ, khi trong suốt không có shadow
   */
  const shadowClass = bgClass === 'bg-transparent' ? '' : '';
  const headerClass = `fixed top-0 w-full z-50 ${textColorClass} transition-all duration-500 ease-in-out ${bgClass} ${shadowClass} h-14 md:h-16`;

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

  // Hàm tìm kiếm sản phẩm
  const performMobileSearch = useCallback(async (searchQuery) => {
    // Sử dụng cache để tránh fetch lại
    const cached = mobileSearchCacheRef.current.get(searchQuery);
    if (cached) {
      setMobileSearchResults(cached);
      return;
    }

    // Hủy request trước đó
    if (mobileSearchAbortRef.current) {
      mobileSearchAbortRef.current.abort();
    }
    const controller = new AbortController();
    mobileSearchAbortRef.current = controller;

    setIsMobileSearchLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`, { signal: controller.signal });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const items = data.products || [];
      mobileSearchCacheRef.current.set(searchQuery, items);
      setMobileSearchResults(items);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setMobileSearchResults([]);
      }
    } finally {
      setIsMobileSearchLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const q = mobileSearchQuery.trim();
      if (q.length > 1) {
        performMobileSearch(q);
        setIsMobileSearchDropdownOpen(true);
      } else {
        setMobileSearchResults([]);
        setIsMobileSearchLoading(false);
        setIsMobileSearchDropdownOpen(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [mobileSearchQuery, performMobileSearch]);

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(prev => {
      if (!prev) {
        // Mở search, focus vào input sau khi render
        setTimeout(() => {
          mobileSearchInputRef.current?.focus();
        }, 100);
      } else {
        // Đóng search, clear query
        setMobileSearchQuery('');
        setMobileSearchResults([]);
        setIsMobileSearchDropdownOpen(false);
        setMobileSearchSelectedIndex(-1);
      }
      return !prev;
    });
  }

  const handleMobileSearchInputChange = (e) => {
    setMobileSearchQuery(e.target.value);
    setIsMobileSearchDropdownOpen(true);
    setMobileSearchSelectedIndex(-1);
  }

  const handleMobileSearchKeyDown = (e) => {
    if (!isMobileSearchDropdownOpen || mobileSearchResults.length === 0) {
      if (e.key === 'Enter' && mobileSearchQuery.trim()) {
        handleMobileSearchSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setMobileSearchSelectedIndex(prev =>
          prev < mobileSearchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMobileSearchSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (mobileSearchSelectedIndex >= 0 && mobileSearchSelectedIndex < mobileSearchResults.length) {
          handleMobileProductClick(mobileSearchResults[mobileSearchSelectedIndex]);
        } else if (mobileSearchQuery.trim()) {
          handleMobileSearchSubmit(e);
        }
        break;
      case 'Escape':
        setIsMobileSearchDropdownOpen(false);
        setMobileSearchSelectedIndex(-1);
        break;
    }
  }

  const handleMobileProductClick = (product) => {
    router.push(`/product/${product.slug}`);
    setIsMobileSearchOpen(false);
    setMobileSearchQuery('');
    setMobileSearchResults([]);
    setIsMobileSearchDropdownOpen(false);
    setMobileSearchSelectedIndex(-1);
  }

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(mobileSearchQuery)}`);
      setIsMobileSearchOpen(false);
      setMobileSearchQuery('');
      setMobileSearchResults([]);
      setIsMobileSearchDropdownOpen(false);
      setMobileSearchSelectedIndex(-1);
    }
  }

  return (
    <>
      <header className={headerClass} ref={headerRef}>
        <div className="page-container flex h-full justify-between items-center">

          {/* Mobile Menu Icon - Left */}
          {!isMobileSearchOpen && (
            <div className="flex md:hidden items-center w-10 flex-shrink-0">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer hover:text-primary transition-colors w-10 h-10 flex items-center justify-start relative z-[110] text-inherit">
                <div className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>
              </button>
            </div>
          )}

          {/* Logo hoặc Search Field trên mobile */}
          <div
            ref={mobileSearchContainerRef}
            className={`relative transition-all duration-300 ${isMobileSearchOpen ? 'flex-1 w-full z-10' : 'flex-1 flex justify-center md:flex-none md:justify-start md:w-48'}`}
          >
            {isMobileSearchOpen ? (
              <div className="w-full">
                <form onSubmit={handleMobileSearchSubmit} className="w-full">
                  <div className="relative">
                    <input
                      ref={mobileSearchInputRef}
                      type="text"
                      value={mobileSearchQuery}
                      onChange={handleMobileSearchInputChange}
                      onKeyDown={handleMobileSearchKeyDown}
                      onFocus={() => {
                        if (mobileSearchQuery.trim().length > 1) {
                          setIsMobileSearchDropdownOpen(true);
                        }
                      }}
                      placeholder={currentPlaceholder || "Tìm kiếm món ăn..."}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={handleMobileSearchToggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isMobileSearchLoading && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>

                {/* Dropdown kết quả tìm kiếm */}
                {isMobileSearchDropdownOpen && mobileSearchQuery.trim().length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[70vh] overflow-hidden flex flex-col">
                    <div className="overflow-y-auto flex-1 p-2">
                      {isMobileSearchLoading ? (
                        <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                      ) : mobileSearchResults.length > 0 ? (
                        <>
                          {mobileSearchResults.map((product, index) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              onClick={() => handleMobileProductClick(product)}
                              className={`block rounded-xl ${index === mobileSearchSelectedIndex ? 'bg-gray-100 ring-1 ring-primary/10' : ''}`}
                            >
                              <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-gray-100">
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <Image
                                    src={product.image_url || '/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-lg shadow-sm"
                                    sizes="48px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-secondary group-hover:text-primary transition-colors truncate">{product.name}</h4>
                                  <p className="text-xs text-gray-500 truncate">{product.category_name}</p>
                                  <p className="text-sm font-bold text-primary mt-0.5">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price || product.price)}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào</div>
                      )}
                    </div>
                    {mobileSearchResults.length > 0 && (
                      <div className="border-t border-gray-200 p-2 bg-gray-50">
                        <button
                          onClick={handleMobileSearchSubmit}
                          className="w-full text-center py-2 text-sm text-primary font-medium hover:bg-orange-50 rounded-lg transition-colors "
                        >
                          Xem tất cả kết quả cho &quot;{mobileSearchQuery}&quot;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link href="/" className="flex items-center justify-center md:justify-start">
                {/* Mobile Logo */}
                <img
                  src="/images/banner-logo/banhtamcodao-logo.png"
                  alt="Bánh Tằm Cô Đào Logo"
                  className="h-20 w-auto object-contain md:hidden drop-shadow-sm mt-8"
                  loading="eager"
                />
                {/* Desktop Logo */}
                <img
                  src="/images/banner-logo/banhtamcodao-logo.png"
                  alt="Bánh Tằm Cô Đào Logo"
                  className="hidden md:block h-24 w-auto drop-shadow-sm mt-12"
                  loading="eager"
                />
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-4">
              <Link 
                href="/" 
                className={`relative px-4 py-1.5 rounded-full font-lobster text-2xl transition-all duration-300 ${pathname === '/' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:text-primary text-black'}`}
              >
                Trang chủ
              </Link>
              <Link 
                href="/menu" 
                className={`relative px-4 py-1.5 rounded-full font-lobster text-2xl transition-all duration-300 ${pathname.startsWith('/menu') ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:text-primary text-black'}`}
              >
                Thực đơn
              </Link>
              <Link 
                href="/order-tracking" 
                className={`relative px-4 py-1.5 rounded-full font-lobster text-2xl transition-all duration-300 ${pathname.startsWith('/order-tracking') ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:text-primary text-black'}`}
              >
                Đơn hàng
              </Link>
              <Link 
                href="/contact" 
                className={`relative px-4 py-1.5 rounded-full font-lobster text-2xl transition-all duration-300 ${pathname.startsWith('/contact') ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:text-primary text-black'}`}
              >
                Liên hệ
              </Link>
            </nav>
          </div>

          <div className={`flex items-center justify-end px-1 gap-2 md:gap-3 ${isMobileSearchOpen ? 'hidden md:flex' : 'w-10 md:w-auto flex-shrink-0'}`}>
            {/* Đã xóa SearchBar desktop và Search icon mobile */}
            {/* Hotline hiển thị bên phải icon giỏ hàng trên desktop */}

            <div className="hidden md:block text-base font-bold text-gray-800 ml-2">
              <span className="text-primary font-lobster text-[28px]">Hotline: </span> 
              <a href="tel:0933960788" className="font-lobster hover:text-primary transition-colors font-sans text-[24px] inline-block min-w-[155px]">
                {displayedPhone || "0933 960 788"}
              </a>
            </div>

            <div className="relative ml-5">
              <button
                onClick={handleCartIconClick}
                className={`cursor-pointer relative hover:text-primary transition-colors p-1 hidden md:inline-flex text-inherit ${isCartAnimating ? 'animate-cart-bounce' : ''}`}
                aria-label={`Mở xem nhanh giỏ hàng, ${totalItems} sản phẩm`}
                style={{ transformOrigin: 'center' }}
              >
                <ShoppingCart size={28} />
                {isClient && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 border border-white leading-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>



            <div className="relative hidden md:block">
              {user ? (
                <button onClick={handleUserMenuToggle} className="cursor-pointer hover:text-primary transition-colors p-1 text-inherit">
                  <CircleUser size={28} />
                </button>
              ) : (
                <Link href="/login" className="hover:text-primary transition-colors p-1 text-inherit">
                  <CircleUser size={28} />
                </Link>
              )}

              {user && isUserMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-50 text-secondary"
                >
                  <div className="p-4 border-b">
                    <p className="font-lobster text-xl">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                  </div>
                  <nav className="p-2">
                    <Link
                      href="/account"
                      onClick={handleUserMenuClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
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
                      className="cursor-pointer w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 text-red-600 transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm z-[10000] transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-[10001] flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden pb-[env(safe-area-inset-bottom)]`} style={{ background: 'linear-gradient(to bottom, #FFFBF7 0%, #FFF5EB 100%)' }}>
        {/* Header với logo và close button */}
        <div className="flex justify-between items-center p-5 flex-shrink-0 border-b border-orange-100/30">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="hover:opacity-90 transition-all duration-300 hover:scale-[1.02] flex-shrink-0"
          >
            <img
              src="/images/banner-logo/banner-codao.png"
              alt="Bánh Tằm Cô Đào Logo"
              width={200}
              height={50}
              className="drop-shadow-sm"
            />
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="cursor-pointer text-gray-400 hover:text-primary hover:bg-primary/10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 shadow-sm bg-white/50 border border-gray-100 flex-shrink-0"
            aria-label="Đóng menu"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow px-3 overflow-y-auto scrollbar-hide py-4">
          {/* User Section for Mobile */}
          {user && (
            <div className="mb-6 px-1">
              <div className="p-2 rounded-xl bg-white shadow-md border border-gray-300 flex items-center gap-3 transition-all duration-300 hover:shadow-md">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/banner-logo/banhtamcodao-logo.png"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate text-lg font-lobster">{user.full_name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider truncate">{user.role === 'admin' ? 'Administrator' : 'Khách hàng'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <li key={link.href} style={{ animationDelay: `${index * 50}ms` }}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-gray-700 hover:text-primary hover:bg-orange-50/60'
                      } active:scale-[0.98] mt-2`}
                  >
                    <div className={`flex-shrink-0 transition-all duration-300 ${isActive
                      ? 'text-white scale-105'
                      : 'text-gray-400 group-hover:text-primary group-hover:scale-105'
                      }`}>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className={`text-[16px] font-bold tracking-wide transition-colors duration-300 truncate ${isActive ? 'text-white' : 'text-gray-800 group-hover:text-primary'
                      }`}>
                      {link.label}
                    </span>

                    {isActive && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    )}
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
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/admin')
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                    } active:scale-[0.98]`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${pathname.startsWith('/admin')
                    ? 'text-blue-600 scale-105'
                    : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-105'
                    }`}>
                    <Shield size={20} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2} />
                  </div>
                  <span className={`text-[15px] font-bold tracking-wide transition-colors duration-300 truncate ${pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-800 group-hover:text-blue-600'
                    }`}>
                    Admin Control
                  </span>
                </Link>
              </li>
            )}

            {/* Account Link for users */}
            {user && (
              <li>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/account')
                    ? 'bg-orange-100 text-primary'
                    : 'text-gray-700 hover:text-primary hover:bg-orange-50/60'
                    } active:scale-[0.98]`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${pathname.startsWith('/account')
                    ? 'text-primary scale-105'
                    : 'text-gray-400 group-hover:text-primary group-hover:scale-105'
                    }`}>
                    <Settings size={20} strokeWidth={pathname.startsWith('/account') ? 2.5 : 2} />
                  </div>
                  <span className={`text-[15px] font-bold tracking-wide transition-colors duration-300 truncate ${pathname.startsWith('/account') ? 'text-primary' : 'text-gray-800 group-hover:text-primary'
                    }`}>
                    Tài khoản của tôi
                  </span>
                </Link>
              </li>
            )}

            {/* Login Link (khi chưa đăng nhập) */}
            {!user && (
              <li style={{ animationDelay: `${navLinks.length * 50}ms` }}>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/login') || pathname.startsWith('/register')
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-700 hover:text-primary hover:bg-orange-50/60'
                    } active:scale-[0.98] mt-2`}
                >
                  <div className={`flex-shrink-0 transition-all duration-300 ${pathname.startsWith('/login') || pathname.startsWith('/register')
                    ? 'text-white scale-105'
                    : 'text-gray-400 group-hover:text-primary group-hover:scale-105'
                    }`}>
                    <LogIn size={20} strokeWidth={2} />
                  </div>
                  <span className={`text-[15px] font-bold tracking-wide transition-colors duration-300 truncate ${pathname.startsWith('/login') || pathname.startsWith('/register') ? 'text-white' : 'text-gray-800 group-hover:text-primary'
                    }`}>
                    Đăng nhập / Đăng ký
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer Sidebar with Logout */}
        {user && (
          <div className="p-4 mt-auto border-t border-orange-100 bg-orange-50/30 backdrop-blur-sm pb-8">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-white text-red-500 font-bold border border-red-500 shadow-md hover:bg-red-50 hover:text-red-600 transition-all duration-300 active:scale-95 group overflow-hidden"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
              <span className="truncate">Đăng xuất tài khoản</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest opacity-70">© 2026 Bánh Tằm Cô Đào</p>
          </div>
        )}

        {/* Social Links for Guest */}
        {!user && (
          <div className="p-4 mt-auto border-t border-orange-100 flex flex-col gap-3">
            <div className="flex justify-center gap-3">
              <a href="https://www.facebook.com/banhtamcodao" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center transition-all duration-300">
                <img src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1758874862/icons8-messenger-500_k7lerf.png" alt="Facebook" className="w-full h-full rounded-full" />
              </a>
              <a href="https://zalo.me/0933960788" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center transition-all duration-300">
                <img src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1758874837/icons8-zalo-480_y1f57c.png" alt="Zalo" className="w-full h-full rounded-full" />
              </a>
            </div>
            <p className="text-center text-[9px] text-gray-400 font-medium uppercase tracking-widest opacity-70">Kết nối với chúng tôi</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;