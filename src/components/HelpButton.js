// src/components/HelpButton.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Component con cho từng nút liên hệ (đã được thu nhỏ)
const ContactLink = ({ href, title, bgColor, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center justify-end"
  >
    <span className="mr-3 px-3 py-1 bg-secondary text-light text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {title}
    </span>
    {/* 1. Thay đổi kích thước khung tròn nhỏ hơn */}
    <div className={`w-12 h-12 rounded-full flex items-center justify-center transform transition-transform duration-300 ${bgColor || ''} group-hover:scale-110`}>
      {children}
    </div>
  </a>
);

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  const phoneNumber = '0933960788';
  const zaloLink = `https://zalo.me/${phoneNumber}`;
  const facebookLink = 'https://m.me/your-facebook-page-id'; // THAY THẾ LINK FACEBOOK CỦA BẠN

  // Chỉ hiển thị ở trang chủ
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Chỉ hiển thị ở trang chủ - đặt sau tất cả hooks
  if (!isHomePage) {
    return null;
  }

  return (
    <div ref={menuRef} className="fixed bottom-36 right-4 z-40 flex flex-col items-end pointer-events-none">
      <div
        className={`flex flex-col items-end gap-3 mb-3 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Nút gọi điện */}
        <ContactLink href={`tel:${phoneNumber}`} title={`Gọi ${phoneNumber}`}>
          {/* 2. Điều chỉnh size icon cho đồng bộ */}
            <Image
            src="https://res.cloudinary.com/dgoe8cra8/image/upload/v1759501779/o5g1pgu0iubuc6urku7h.png"
            alt="Chat via Messenger"
            width={40} 
            height={40}
            className="rounded-full"
          />
        </ContactLink>

        {/* Nút Messenger */}
        <ContactLink href={facebookLink} title="Chat Messenger">
          {/* 3. Điều chỉnh kích thước ảnh để có khoảng trắng xung quanh */}
          <Image
            src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1758874862/icons8-messenger-500_k7lerf.png"
            alt="Chat via Messenger"
            width={48} 
            height={48}
            className="rounded-full"
          />
        </ContactLink>

        {/* Nút Zalo */}
        <ContactLink href={zaloLink} title="Chat Zalo">
          {/* 4. Điều chỉnh kích thước ảnh */}
          <Image
            src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1758874837/icons8-zalo-480_y1f57c.png"
            alt="Chat via Zalo"
            width={48}
            height={48}
            className="rounded-full"
          />
        </ContactLink>
      </div>

      {/* Nút chính */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-light w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-slow pointer-events-auto"
      >
        {/* 5. Giữ icon chính to hơn một chút để tạo điểm nhấn */}
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-75' : 'rotate-0'}`}>
            {isOpen ? <X size={35} /> : <Phone size={30} />}
        </div>
      </button>
    </div>
  );
}