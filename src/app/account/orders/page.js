/**
 * Account orders page component
 * @file src/app/account/orders/page.js
 */
'use client';
import { useAuth } from '@/context/AuthContext';
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Package } from 'lucide-react';
import OrderCard from '@/components/OrderCard';

const STATUS_PRIORITY = ['Chờ xác nhận', 'Đang vận chuyển', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'];
const FILTER_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Chờ xác nhận', label: 'Chờ xác nhận' },
    { value: 'Đang vận chuyển', label: 'Đang vận chuyển' },
    { value: 'Hoàn thành', label: 'Hoàn thành' },
    { value: 'Đã hủy', label: 'Đã hủy' },
];

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = useCallback(async () => {
        if (!user?.phone_number) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/orders/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: user.phone_number }),
                cache: 'no-store'
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.phone_number]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!loading && user?.phone_number) {
            const interval = setInterval(() => {
                fetchOrders();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [loading, user?.phone_number, fetchOrders]);

    const sortedOrders = useMemo(() => {
        if (!orders?.length) return [];
        return [...orders].sort((a, b) => {
            const statusDiff = STATUS_PRIORITY.indexOf(a.status || '') - STATUS_PRIORITY.indexOf(b.status || '');
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.order_time) - new Date(a.order_time);
        });
    }, [orders]);

    const statusCounts = useMemo(() => {
        const base = FILTER_OPTIONS.reduce((acc, option) => {
            if (option.value !== 'all') acc[option.value] = 0;
            return acc;
        }, {});
        sortedOrders.forEach((order) => {
            if (order.status && base.hasOwnProperty(order.status)) {
                base[order.status] += 1;
            }
        });
        return base;
    }, [sortedOrders]);

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') return sortedOrders;
        return sortedOrders.filter((order) => order.status === statusFilter);
    }, [sortedOrders, statusFilter]);

    const totalSpent = useMemo(
        () => sortedOrders.filter(o => o.status === 'Hoàn thành').reduce((sum, order) => sum + (order.total_amount || 0), 0),
        [sortedOrders]
    );

    if (loading && orders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 rounded-2xl bg-gray-100" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-50" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Theo dõi hoạt động</span>
                    <h2 className="text-xl font-bold text-secondary tracking-tight">Lịch sử đơn hàng</h2>
                </div>
            </div>

            {orders.length > 0 ? (
                <>
                    {/* Order Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 px-1">
                        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Tổng tích lũy</p>
                            <p className="text-lg font-black text-secondary tracking-tight">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent)}
                            </p>
                        </div>
                        
                        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Số đơn hàng</p>
                            <p className="text-lg font-black text-secondary tracking-tight">{orders.length}</p>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Đơn gần nhất</p>
                            <p className="text-lg font-black text-secondary tracking-tight truncate">
                                {sortedOrders[0]?.order_code ? `#${sortedOrders[0].order_code.slice(-8)}` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                        {FILTER_OPTIONS.map((option) => {
                            const isActive = statusFilter === option.value;
                            const count = option.value === 'all' ? orders.length : statusCounts[option.value] || 0;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                                        isActive
                                            ? 'bg-secondary text-white'
                                            : 'bg-white text-gray-500 border border-gray-100'
                                    }`}
                                >
                                    {option.label}
                                    <span
                                        className={`flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-black ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Order List */}
                    <div className="grid grid-cols-1 gap-6">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm mb-3">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-base font-bold text-secondary">Không tìm thấy đơn hàng</h3>
                                <p className="text-gray-500 text-xs">Chưa có đơn hàng nào trong trạng thái này.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
                    <div className="h-24 w-24 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <Package size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-secondary mb-1 tracking-tight">Bắt đầu trải nghiệm ngay!</h2>
                    <p className="text-gray-500 max-w-sm mb-8 text-sm font-medium">
                        Bạn chưa có đơn hàng nào. Hãy khám phá thực đơn đa dạng và đặt món ngay hôm nay để nhận nhiều ưu đãi.
                    </p>
                    <Link
                        href="/menu"
                        className="px-8 py-3.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all"
                    >
                        Xem thực đơn ngay
                    </Link>
                </div>
            )}
        </div>
    );
}