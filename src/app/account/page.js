/**
 * Account page - Redirects to profile
 * @file src/app/account/page.js
 */
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/account/profile');
    }, [router]);
    /** Hoặc một component loading */
    return null;
}