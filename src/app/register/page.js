/**
 * Register page component
 * @file src/app/register/page.js
 */
import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";
import Link from 'next/link';

export const metadata = {
    title: 'Đăng ký - Bánh Tằm Cô Đào',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-1.5 pt-6 pb-8 bg-gray-50/30">
            <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-white rounded-xl shadow-md border border-gray-300">
                <h2 className="text-3xl font-bold text-center text-secondary">
                    Đăng ký tài khoản
                </h2>
                <Suspense fallback={
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                        <div className="pt-2">
                            <div className="h-12 bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                }>
                    <RegisterForm />
                </Suspense>
                <p className="text-center text-sm text-gray-500 pt-2">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}