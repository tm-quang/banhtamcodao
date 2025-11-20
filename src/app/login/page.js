// src/app/login/page.js
import LoginForm from "@/components/LoginForm";
import Link from "next/link"; // Import Link

export const metadata = {
  title: 'Đăng nhập - Bánh Tằm Cô Đào',
};

export default function LoginPage() {
    return (
        <div className="container mx-auto px-4 pt-24 pb-8 flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <LoginForm />
                {/* Thêm liên kết đến trang đăng ký */}
                <p className="text-center text-sm mt-4">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}