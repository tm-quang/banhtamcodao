// src/components/Footer.js
'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, ArrowRight, Send, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch footer settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const bgImageUrl = "/images/background/f_bg.png";

  const siteName = settings?.general?.site_name || "Bánh Tằm Cô Đào";
  const address = settings?.contact?.address || "Tổ 4, Khu phố 1, Đặc Khu Phú Quốc, An Giang";
  const phone = settings?.contact?.phone || "0933 960 788";
  const email = settings?.contact?.email || "banhtamcodao@gmail.com";
  const openingHours = "5h30 - 10h30 | T2 - CN";
  const facebook = settings?.social?.facebook || "#";
  const instagram = settings?.social?.instagram || "#";
  const tiktok = settings?.social?.tiktok || "#";
  const logoUrl = settings?.general?.logo_url || "https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png";

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Desktop Wave */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          preserveAspectRatio="none"
        >
          <path
            fill="#0a0a0a"
            d="M0,64 C480,128,720,0,1440,64 L1440,320 L0,320 Z"
          />
        </svg>

        {/* Mobile Wave */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute inset-0 w-full h-full pointer-events-none block md:hidden"
          preserveAspectRatio="none"
        >
          <path
            fill="#0a0a0a"
            d="M0,32 C480,64,960,16,1440,32 L1440,320 L0,320 Z"
          />
        </svg>

        {/* Ví dụ chèn ảnh họa tiết không nền (PNG) */}
        <img
          src="/images/banner-logo/banhtamcodao-logo.png"
          alt="Họa tiết trang trí"
          className="absolute bottom-0 left-12 bottom-24 w-[350px] h-auto opacity-10 object-contain select-none"
        />
      </div>

      <div className="relative page-container pt-32 md:pt-48 pb-6">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Brand & Identity (4 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <Link href="/" className="inline-block group transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-15 md:h-18 w-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
              </Link>
              <p className="text-gray-400 text-sm md:text-[15px] leading-relaxed max-w-md font-light italic">
                &quot;{settings?.general?.site_description || "Chuẩn vị Miền Tây"}&quot;
              </p>
            </div>

            {/* Premium Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: facebook, color: 'hover:text-blue-500' },
                { icon: Instagram, href: instagram, color: 'hover:text-pink-500' },
                { icon: Globe, href: tiktok, color: 'hover:text-primary' }
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  target="_blank"
                  className={`group w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 ${social.color}`}
                >
                  <social.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Map (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Contact Cards */}
            <div className="space-y-5">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">Liên hệ với chúng tôi</h4>
              <div className="space-y-4">
                <div className="group flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 uppercase tracking-wider font-bold">Hotline đặt món</p>
                    <Link href={`tel:${phone.replace(/\s/g, '')}`} className="text-md font-bold hover:text-primary transition-colors">{phone}</Link>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 transition-colors group-hover:bg-white group-hover:text-black">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 uppercase tracking-wider font-bold">Giờ mở c</p>
                    <p className="text-sm font-medium">{openingHours}</p>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 transition-colors group-hover:bg-white group-hover:text-black">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 uppercase tracking-wider font-bold">Địa chỉ</p>
                    <p className="text-sm font-medium leading-tight">{address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Map View */}
            <div className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold flex justify-between items-center">
                Vị trí bản đồ
                <Link href="https://maps.app.goo.gl/p12e1QCGrBVdpR1TA" target="_blank" className="text-primary hover:underline lowercase tracking-normal flex items-center gap-1">
                  google maps <ArrowRight size={10} />
                </Link>
              </h4>
              <div className="relative aspect-[16/9] md:aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1651.9437857602882!2d104.0132411408792!3d10.016312219051363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a797296fe8b0bf%3A0xb69bf20b76e4bd4d!2zQsOhbmggVOG6sW0gQ8O0IMSQw6Bv!5e0!3m2!1svi!2s!4v1777008611214!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="absolute inset-0 contrast-[1.1] opacity-70 hover:opacity-100 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter & Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Minimalist Newsletter */}
            <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Send size={14} />
                </div>
                <p className="text-sm font-bold tracking-tight">Đăng ký nhận ưu đãi độc quyền</p>
              </div>
              <form className="relative w-full md:w-80 group" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn..."
                  className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-full px-5 text-xs focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                />
                <button className="absolute right-1 top-1 h-8 px-4 bg-primary text-black text-[10px] font-black uppercase rounded-full hover:bg-orange-400 transition-colors">
                  Gửi ngay
                </button>
              </form>
            </div>

            {/* Small Links */}
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
              <div className="w-1 h-1 bg-white/20 rounded-full"></div>
              <p className="text-gray-600">&copy; {new Date().getFullYear()} Bánh Tằm Cô Đào</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute -bottom-10 right-20 opacity-[0.04] pointer-events-none select-none">
        <h2 className="text-[150px] font-lobster whitespace-nowrap">Bánh Tằm Cô Đào</h2>
      </div>
    </footer>
  );
};

export default Footer;
