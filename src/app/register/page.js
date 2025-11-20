// src/app/register/page.js
import RegisterForm from "@/components/RegisterForm";
import Link from 'next/link';

export const metadata = {
  title: 'Đăng ký - Bánh Tằm Cô Đào',
};

export default function RegisterPage() {
    return (
        <div className="container mx-auto px-4 pt-24 pb-8 flex flex-col items-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <RegisterForm />
                <p className="text-center text-sm mt-4">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}