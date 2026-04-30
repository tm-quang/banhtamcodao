/**
 * Login page component
 * @file src/app/login/page.js
 */
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export const metadata = {
    title: 'Đăng nhập - Bánh Tằm Cô Đào',
};

function LoginFormFallback() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="pt-4 space-y-4">
                    <div className="h-px bg-gray-100 w-full"></div>
                    <div className="h-12 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-1.5 pt-6 pb-8 bg-gray-50/30">
            <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-white rounded-3xl shadow-md border border-gray-300">
                <h2 className="text-2xl font-bold text-center text-secondary mt-2">
                    Đăng nhập
                </h2>

                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>

                <p className="text-center text-sm text-gray-500 pt-2">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}
