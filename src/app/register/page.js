/**
 * Register page component
 * @file src/app/register/page.js
 */
import RegisterForm from "@/components/RegisterForm";
import Link from 'next/link';

export const metadata = {
    title: 'Đăng ký - Bánh Tằm Cô Đào',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <RegisterForm />
                <p className="text-center text-sm text-gray-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}