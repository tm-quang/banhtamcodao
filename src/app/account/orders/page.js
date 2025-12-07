/**
 * Account orders page component
 * @file src/app/account/orders/page.js
 */
'use client';
import { useAuth } from '@/context/AuthContext';
import { useMemo, useState, useEffect } from 'react';
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

    useEffect(() => {
        if (user?.phone_number) {
            const fetchOrders = async () => {
                const res = await fetch('/api/orders/lookup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: user.phone_number }),
                });
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
                setLoading(false);
            };
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

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
        () => sortedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        [sortedOrders]
    );

    const lastOrder = sortedOrders[0];

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-28 rounded-2xl bg-slate-100" />
                    ))}
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-24 rounded-2xl bg-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium uppercase tracking-wide text-slate-500">Lịch sử mua hàng</span>
                <h2 className="text-2xl font-bold text-slate-900">Đơn hàng gần đây</h2>
            </div>

            {orders.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng chi tiêu</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(totalSpent)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Tính từ trước tới nay</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Số đơn hàng</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</p>
                            <p className="mt-1 text-xs text-slate-500">Bao gồm mọi trạng thái</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn gần nhất</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {lastOrder?.order_code || 'Chưa có'}
                            </p>
                            {lastOrder && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {new Date(lastOrder.order_time).toLocaleString('vi-VN')}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.map((option) => {
                            const isActive = statusFilter === option.value;
                            const count = option.value === 'all' ? orders.length : statusCounts[option.value] || 0;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                        isActive
                                            ? 'border-slate-900 bg-slate-900 text-white shadow'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {option.label}
                                    <span
                                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-2 text-xs ${
                                            isActive ? 'text-slate-900' : 'text-slate-500'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                Chưa có đơn hàng nào trong trạng thái này.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-lg font-semibold text-slate-700">Bạn chưa có đơn hàng nào</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Các đơn hàng sẽ xuất hiện tại đây khi bạn đặt món trên Bánh Tằm Cô Đào.
                    </p>
                </div>
            )}
        </div>
    );
}