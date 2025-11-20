import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, LogOut, Settings, Shield, User as UserIcon, Facebook, Twitter, Heart, ShoppingCart } from 'lucide-react';
import { FaUserCircle } from "react-icons/fa";
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

  const transparentHeaderPaths = ['/', '/contact', '/menu'];
  const isTransparentPage = transparentHeaderPaths.includes(pathname);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    setIsScrolled(!isTransparentPage || window.scrollY > 50);
    if (isTransparentPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname, isTransparentPage]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const isSolid = !isTransparentPage || isScrolled;
  const headerClass = `fixed top-0 w-full z-50 text-light transition-colors duration-500 ease-in-out ${isSolid ? 'bg-secondary shadow-md' : 'bg-transparent'} h-14 md:h-16`;

  const navLinks = [
    { href: '/', label: 'Trang chủ' }, { href: '/menu', label: 'Thực đơn' },
    { href: '/cart', label: 'Giỏ hàng' }, { href: '/order-tracking', label: 'Tra cứu đơn hàng' },
    { href: '/contact', label: 'Liên hệ' },
  ];
  
  const handleCartIconClick = (e) => {
      e.preventDefault();
      openMiniCart();
  }

  const handleUserMenuToggle = (e) => {
    e.preventDefault();
    setIsUserMenuOpen(prev => !prev);
  }

  return (
    <>
      <header className={headerClass} ref={headerRef}>
        <div className="container mx-auto flex h-full justify-between items-center px-2">
           <div className="w-48">
              <Link href="/">
                  <Image
                    src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                    alt="Bánh Tằm Cô Đào Logo" width={180} height={40} priority
                  />
              </Link>
          </div>

          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-7 font-medium text-2xl font-lobster">
               <Link href="/" className="relative group transition-colors py-2 hover:text-primary">
                 <span className="relative z-10">Trang chủ</span>
                 <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
               </Link>
               <Link href="/menu" className="relative group transition-colors py-2 hover:text-primary">
                 <span className="relative z-10">Thực đơn</span>
                 <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
               </Link>
               <Link href="/contact" className="relative group transition-colors py-2 hover:text-primary">
                 <span className="relative z-10">Liên hệ</span>
                 <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
               </Link>
               <Link href="/order-tracking" className="relative group transition-colors py-2 hover:text-primary">
                 <span className="relative z-10">Đơn hàng</span>
                 <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
               </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 px-1">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <Link 
              href="/wishlist" 
              className={`relative hover:text-primary transition-colors p-1 ${isWishlistAnimating ? 'animate-wishlist-bounce' : ''}`}
              aria-label={`Danh sách yêu thích, ${wishlistCount} sản phẩm`}
            >
              <Heart size={24} />
              {isClient && wishlistCount > 0 && (
                <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${flashWishlistCount ? 'animate-cart-count-flash' : ''}`}>
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <button
                onClick={handleCartIconClick}
                className={`relative hover:text-primary transition-colors p-1 hidden md:inline-flex ${isCartAnimating ? 'animate-cart-bounce' : ''}`}
                aria-label={`Mở xem nhanh giỏ hàng, ${totalItems} sản phẩm`}
                style={{ transformOrigin: 'center' }}
            >
                <ShoppingCart size={24} />
                {isClient && totalItems > 0 && (
                    <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${flashCartCount && totalItems > 0 ? 'animate-cart-count-flash' : ''}`}>
                    {totalItems}
                    </span>
                )}
            </button>
            
            <div className="relative hidden md:block">
              {user ? (
                <button onClick={handleUserMenuToggle} className="hover:text-primary transition-colors p-1">
                  <FaUserCircle size={24} />
                </button>
              ) : (
                <Link href="/login" className="hover:text-primary transition-colors p-1">
                  <FaUserCircle size={24} />
                </Link>
              )}

              {user && isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50 text-secondary" onClick={() => setIsUserMenuOpen(false)}>
                  <div className="p-4 border-b">
                    <p className="font-bold">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                  </div>
                  <nav className="p-2">
                    <Link href="/account" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"><Settings size={16} /> Thông tin tài khoản</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"><Shield size={16} /> Quản trị Website</Link>
                    )}
                    <button onClick={logout} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-red-600"><LogOut size={16} /> Đăng xuất</button>
                  </nav>
                </div>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden hover:text-primary transition-colors relative z-[110] p-2">
              <div className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </div>
            </button>
          </div>
        </div>
      </header>
      
      <div className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Image src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png" alt="Bánh Tằm Cô Đào Logo" width={180} height={38}/>
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="text-black hover:text-primary"><X size={28} /></button>
          </div>
          <nav className="flex-grow p-4 overflow-y-auto">
            <ul className="flex flex-col gap-2">
                {navLinks.map(link => (
                    <li key={link.href}><Link href={link.href} onClick={() => setIsMenuOpen(false)} className="block text-xl text-black font-bold hover:text-primary py-3 px-2 rounded-md transition-colors">{link.label}</Link></li>
                ))}
                {user?.role === 'admin' && (
                    <li><Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black font-bold hover:text-primary py-3 px-2 rounded-md transition-colors">Admin</Link></li>
                )}
            </ul>
          </nav>
          
          {/* --- PHẦN FOOTER CỦA MENU --- */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
              {user ? (
                  // Giao diện khi đã đăng nhập
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                          <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                              <UserIcon size={20}/> Tài khoản
                          </Link>
                           <button onClick={logout} className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
                              <LogOut size={20}/> Đăng xuất
                          </button>
                      </div>
                      <div className="flex justify-center gap-4 pt-2">
                          <a href="#" className="text-gray-400 hover:text-primary"><Facebook /></a>
                          <a href="#" className="text-gray-400 hover:text-primary"><Twitter /></a>
                      </div>
                  </div>
              ) : (
                  // Giao diện khi chưa đăng nhập
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full bg-primary text-light font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
                      <LogIn size={20} className="mr-2"/> Đăng nhập | Đăng ký
                  </Link>
              )}
          </div>
      </div>
    </>
  );
};

export default Header;