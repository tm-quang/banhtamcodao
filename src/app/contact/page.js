/**
 * Contact page component - REDESIGNED PREMIUM UI (COMPACT)
 * @file src/app/contact/page.js
 */
import { MapPin, Clock, Mail, Phone, ExternalLink } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata = {
    title: 'Liên hệ - Bánh Tằm Cô Đào',
    description: 'Liên hệ với Bánh Tằm Cô Đào để được hỗ trợ và giải đáp thắc mắc.',
};

/** Icon Zalo */
const ZaloIcon = ({ className = "w-full h-full" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
        <path fill="#2962ff" d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"></path><path fill="#eee" d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"></path><path fill="#2962ff" d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"></path><path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"></path><path fill="#2962ff" d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"></path><path fill="#2962ff" d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"></path>
    </svg>
);

const ContactCard = ({ icon, title, text, href, target, rel, delay, isZalo }) => {
    const Component = href ? 'a' : 'div';
    const props = href ? { href, target, rel } : {};

    return (
        <AnimateOnScroll delay={delay}>
            <Component
                {...props}
                className={`flex items-start gap-4 p-4 bg-white rounded-2xl shadow-md border border-gray-300 hover:shadow-lg transition-all duration-300 w-full ${href ? 'cursor-pointer group' : ''}`}
            >
                <div className={`w-12 h-12 flex-shrink-0 rounded-2xl transition-all duration-300 shadow-inner flex items-center justify-center ${isZalo ? 'p-0 overflow-hidden' : 'bg-primary-50 text-primary p-2.5 group-hover:bg-primary group-hover:text-white'}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-base mb-0.5">{title}</h3>
                    <p className="text-gray-500 leading-snug text-sm break-words">
                        {text}
                    </p>
                    {href && (
                        <span className="inline-flex items-center gap-1 text-primary font-bold text-[12px] mt-1 opacity-100 transition-opacity">
                            Xem ngay <ExternalLink size={12} />
                        </span>
                    )}
                </div>
            </Component>
        </AnimateOnScroll>
    );
};

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-32 md:pt-32 pb-8 overflow-x-hidden">
            {/* Decorative Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-orange-200/10 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/4"></div>
            </div>

            <div className="relative z-10 page-container">
                {/* Header Section */}
                <div className="text-center mb-6 md:mb-10">
                    <AnimateOnScroll>
                        <h1 className="text-3xl md:text-5xl font-lobster text-secondary mb-2">Kết Nối Với Bánh Tằm Cô Đào</h1>
                        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                            Phản hồi của bạn đều là động lực để chúng tôi hoàn thiện hơn.
                        </p>
                    </AnimateOnScroll>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-start mb-10 md:mb-12">
                    {/* Left Side: Contact Cards */}
                    <div className="lg:col-span-5 space-y-3">
                        <ContactCard
                            delay={0.1}
                            icon={<MapPin size={24} />}
                            title="Địa chỉ"
                            text="Tổ 4, Khu phố 1, Đặc Khu Phú Quốc, An Giang"
                            href="https://maps.app.goo.gl/p12e1QCGrBVdpR1TA"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                        <ContactCard
                            delay={0.2}
                            icon={<Clock size={24} />}
                            title="Giờ mở cửa"
                            text="5h30 - 10h30 - T2 đến CN"
                        />
                        <ContactCard
                            delay={0.3}
                            icon={<Phone size={24} />}
                            title="Hotline"
                            text="0933 960 788"
                            href="tel:0933960788"
                        />
                        <ContactCard
                            delay={0.4}
                            icon={<Mail size={24} />}
                            title="Email"
                            text="banhtamcodao@gmail.com"
                            href="mailto:banhtamcodao@gmail.com"
                        />
                        <ContactCard
                            delay={0.5}
                            isZalo={true}
                            icon={<ZaloIcon />}
                            title="Zalo"
                            text="Nhấn để kết nối nhanh qua Zalo"
                            href="https://zalo.me/0933960788"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:col-span-7">
                        <AnimateOnScroll delay={0.3}>
                            <ContactForm />
                        </AnimateOnScroll>
                    </div>
                </div>

                {/* Map Section */}
                <AnimateOnScroll delay={0.6}>
                    <div className="bg-white p-1.5 md:p-2 rounded-2xl shadow-md border border-gray-300 overflow-hidden">
                        <div className="relative h-[250px] md:h-[450px] rounded-2xl overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1651.9437857602882!2d104.0132411408792!3d10.016312219051363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a797296fe8b0bf%3A0xb69bf20b76e4bd4d!2zQsOhbmggVOG6sW0gQ8O0IMSQw6Bv!5e0!3m2!1svi!2s!4v1777008611214!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="transition-all duration-700"
                            ></iframe>

                            {/* Map Info Overlay - Desktop only */}
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md max-w-[220px] hidden md:block border border-gray-100">
                                <h4 className="font-bold text-gray-900 text-[12px] mb-0.5">Bánh Tằm Cô Đào</h4>
                                <p className="text-gray-500 text-[10px] mb-2 leading-tight">
                                    Tổ 4, Khu Phố 1, Đặc Khu Phú Quốc, An Giang
                                </p>
                                <a
                                    href="https://maps.app.goo.gl/p12e1QCGrBVdpR1TA"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center bg-primary text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Chỉ đường
                                </a>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-[10px]">
                        &copy; {new Date().getFullYear()} Bánh Tằm Cô Đào.
                    </p>
                </div>
            </div>
        </div>
    );
}