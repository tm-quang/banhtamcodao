// src/app/(admin)/layout.js
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export default async function AdminLayout({ children }) {
    // Guard: only allow authenticated admin
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken');
    if (!token) {
        redirect('/login?next=/admin');
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            `SELECT a.role FROM accounts a WHERE a.id = ? LIMIT 1`,
            [decoded.id]
        );
        const role = rows?.[0]?.role;
        if (role !== 'admin') {
            redirect('/');
        }
    } catch (e) {
        redirect('/login?next=/admin');
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader />
                <main className="flex-grow p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}