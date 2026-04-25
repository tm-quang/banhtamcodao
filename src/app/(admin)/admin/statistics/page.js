'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StatisticsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/analytics');
    }, []);
    return null;
}
