// src/components/admin/CustomerTableWrapper.js
'use client';
import dynamic from 'next/dynamic';

// Dynamic import để tránh hydration error với MUI
const CustomerTable = dynamic(() => import('@/components/admin/CustomerTable'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">Đang tải...</div>
        </div>
    )
});

export default function CustomerTableWrapper({ customers }) {
    return <CustomerTable customers={customers} />;
}

