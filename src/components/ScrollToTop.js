// src/components/ScrollToTop.js
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component tự động scroll về đầu trang khi:
 * - Route change (navigation)
 * - Page refresh (F5)
 * - Click vào link/button
 * - Query params thay đổi
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll về đầu trang khi route thay đổi
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth' // Smooth scroll cho UX tốt hơn
      });
    };

    // Sử dụng setTimeout nhỏ để đảm bảo DOM đã render
    const timer = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Xử lý khi page được load lần đầu (refresh hoặc lần đầu vào trang)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Scroll về đầu trang ngay khi component mount (page load)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Instant scroll khi page load
      });

      // Xử lý khi user refresh trang (F5)
      const handleBeforeUnload = () => {
        // Lưu scroll position nếu cần (optional)
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      };

      // Xử lý khi page được restore từ cache
      const handleLoad = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('load', handleLoad);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  return null; // Component không render gì
}

