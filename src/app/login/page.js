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
        <div className="flex items-center justify-center min-h-[50vh] md:min-h-0">
            <div className="w-full max-w-md p-0 space-y-6">
                <h2 className="text-3xl font-bold text-center text-secondary">
                    Đăng nhập
                </h2>
                <div className="space-y-4 animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="h-12 bg-primary/30 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-6 pb-8">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>
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
