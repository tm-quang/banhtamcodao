/**
 * Terms of Service page
 * @file src/app/terms/page.js
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Điều khoản dịch vụ - Bánh Tằm Cô Đào',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/register" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
                    <ArrowLeft size={18} />
                    Quay lại đăng ký
                </Link>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10">
                    <h1 className="text-3xl font-bold text-secondary mb-6">Điều khoản dịch vụ</h1>

                    <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
                        <p className="text-sm text-gray-400">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">1. Giới thiệu</h2>
                            <p>Chào mừng bạn đến với Bánh Tằm Cô Đào. Bằng việc truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">2. Điều kiện sử dụng</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Bạn phải từ 18 tuổi trở lên hoặc có sự đồng ý của phụ huynh để sử dụng dịch vụ.</li>
                                <li>Thông tin cá nhân bạn cung cấp phải chính xác và trung thực.</li>
                                <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">3. Đặt hàng và thanh toán</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Giá sản phẩm có thể thay đổi mà không cần thông báo trước.</li>
                                <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong các trường hợp bất khả kháng.</li>
                                <li>Phương thức thanh toán được hỗ trợ: Tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">4. Giao hàng</h2>
                            <p>Chúng tôi cam kết giao hàng trong thời gian nhanh nhất có thể. Thời gian giao hàng dự kiến sẽ được thông báo khi bạn đặt hàng.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">5. Hoàn trả và khiếu nại</h2>
                            <p>Nếu có bất kỳ vấn đề gì với đơn hàng, vui lòng liên hệ với chúng tôi trong vòng 24 giờ sau khi nhận hàng qua hotline: <strong>0933 960 788</strong></p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-secondary mb-3">6. Liên hệ</h2>
                            <p>Mọi thắc mắc xin liên hệ:</p>
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
