/**
 * Login page component
 * @file src/app/login/page.js
 */
import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export const metadata = {
    title: 'Đăng nhập - Bánh Tằm Cô Đào',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-6 pb-8">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <LoginForm />
                <p className="text-center text-sm text-gray-500">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}