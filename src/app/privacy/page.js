/**
 * Privacy Policy page
 * @file src/app/privacy/page.js
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Chính sách bảo mật - Bánh Tằm Cô Đào',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/register" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
                    <ArrowLeft size={18} />
                    Quay lại đăng ký
                </Link>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10">
                    <h1 className="text-3xl font-bold text-secondary mb-6">Chính sách bảo mật</h1>

                    <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
                        <p className="text-sm text-gray-400">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">1. Thu thập thông tin</h2>
                            <p>Chúng tôi thu thập các thông tin cá nhân khi bạn đăng ký tài khoản hoặc đặt hàng, bao gồm:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Họ tên</li>
                                <li>Số điện thoại</li>
                                <li>Địa chỉ email</li>
                                <li>Địa chỉ giao hàng</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">2. Mục đích sử dụng</h2>
                            <p>Thông tin của bạn được sử dụng để:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Xử lý và giao các đơn hàng</li>
                                <li>Liên hệ xác nhận đơn hàng và hỗ trợ khách hàng</li>
                                <li>Gửi thông tin về khuyến mãi (nếu bạn đồng ý nhận)</li>
                                <li>Cải thiện chất lượng dịch vụ</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">3. Bảo mật thông tin</h2>
                            <p>Chúng tôi cam kết:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Không bán, chia sẻ hoặc trao đổi thông tin cá nhân của bạn với bất kỳ bên thứ ba nào.</li>
                                <li>Áp dụng các biện pháp bảo mật kỹ thuật để bảo vệ thông tin của bạn.</li>
                                <li>Chỉ những nhân viên được ủy quyền mới có quyền truy cập thông tin khách hàng.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">4. Cookies</h2>
                            <p>Website của chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng. Bạn có thể tắt cookies trong cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của website.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">5. Quyền của bạn</h2>
                            <p>Bạn có quyền:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Yêu cầu truy cập thông tin cá nhân của mình</li>
                                <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                                <li>Yêu cầu xóa tài khoản và thông tin cá nhân</li>
                                <li>Từ chối nhận email quảng cáo</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">6. Liên hệ</h2>
                            <p>Nếu có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:</p>
                            <ul className="list-none space-y-1">
                                <li><strong>Email:</strong> banhtamcodao@gmail.com</li>
                                <li><strong>Hotline:</strong> 0933 960 788</li>
                                <li><strong>Địa chỉ:</strong> An Thới, Phú Quốc, Kiên Giang</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
