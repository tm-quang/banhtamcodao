// src/components/Footer.js
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const footerLinks = [
  {
    heading: 'Khám phá',
    links: [
      { label: 'Về chúng tôi', href: '#' },
      { label: 'Câu chuyện thương hiệu', href: '#' },
    ],
  },
  {
    heading: 'Thông tin khách hàng',
    links: [
      { label: 'Câu hỏi thường gặp', href: '#' },
      { label: 'Chính sách giao hàng', href: '#' },
      { label: 'Phương thức thanh toán', href: '#' },
    ],
  },
  // {
  //   heading: 'Kết nối',
  //   links: [
  //     { label: 'Tuyển dụng', href: '#' },
  //     { label: 'Hợp tác & sự kiện', href: '#' },
  //     { label: 'Blog ẩm thực', href: '#' },
  //   ],
  // },
];

const contactItems = [
  { icon: MapPin, label: 'An Thới, Phú Quốc, Kiên Giang' },
  { icon: Clock, label: '06:00 - 10:30 | Mỗi ngày' },
  { icon: Phone, label: '0933 960 788' },
  { icon: Mail, label: 'banhtamcodao@gmail.com' },
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  const bgImageUrl = "https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424775/tn7vyqy47q58kaoi2neg.jpg";

  return (
    <footer className="relative overflow-hidden text-light">
      <Image
        src={bgImageUrl}
        alt="Footer background"
        fill
        className="absolute inset-0 h-full w-full object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/85" />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-6 md:pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="space-y-4 lg:max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png"
                alt="Bánh Tằm Cô Đào Logo"
                width={220}
                height={64}
                priority
              />
            </Link>
            <p className="text-base text-gray-300 sm:text-lg">
              Những món ngon chuẩn vị miền Tây, mang đến trải nghiệm ấm áp như ở nhà.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-gray-300">
              {socials.map(({ icon: IconSocial, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-primary/90"
                >
                  <IconSocial className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/70 sm:text-sm">Nhận tin mới</p>
                <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Ưu đãi mỗi tuần</h3>
              </div>
            </div>
            <form className="mt-4 flex flex-col gap-3 sm:mt-4 sm:flex-row">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="h-[60px] flex-1 rounded-xl border border-white/20 bg-white/15 px-4 text-base text-white placeholder:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:!h-14"
              />
              <button
                type="submit"
                className="h-[50px] rounded-xl bg-primary px-6 text-xl font-semibold text-white shadow-[0_12px_30px_rgba(255,123,0,0.35)] transition-transform duration-200 hover:scale-[1.02] sm:h-14"
              >
                Đăng ký
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-300 sm:mt-3">
              Khi đăng ký, bạn đã đồng ý với <Link href="#" className="text-primary">chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-10 lg:pt-10">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Liên hệ</h4>
            <ul className="space-y-3 text-gray-300">
              {contactItems.map(({ icon: IconContact, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <IconContact className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 text-sm sm:text-base leading-relaxed">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {footerLinks.map(({ heading, links }) => (
            <div key={heading} className="space-y-3 sm:space-y-4">
              <h4 className="text-lg font-semibold text-white">{heading}</h4>
              <ul className="space-y-3 text-gray-300">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="transition-colors duration-200 hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p>© {new Date().getFullYear()} Bánh Tằm Cô Đào. Giữ trọn hương vị miền Tây.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-primary">Điều khoản sử dụng</Link>
            <Link href="#" className="hover:text-primary">Chính sách bảo mật</Link>
            <Link href="#" className="hover:text-primary">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;