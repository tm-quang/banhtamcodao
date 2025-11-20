// src/components/OrderCard.js
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronDown, MapPin, Phone, Receipt } from 'lucide-react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const STATUS_THEME = {
    'Chờ xác nhận': {
        chip: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200',
        accent: 'text-amber-600',
        progress: 20,
    },
    'Đã xác nhận': {
        chip: 'bg-sky-100 text-sky-700',
        border: 'border-sky-200',
        accent: 'text-sky-600',
        progress: 35,
    },
    'Đang vận chuyển': {
        chip: 'bg-blue-100 text-blue-700',
        border: 'border-blue-200',
        accent: 'text-blue-600',
        progress: 70,
    },
    'Hoàn thành': {
        chip: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200',
        accent: 'text-emerald-600',
        progress: 100,
    },
    'Đã hủy': {
        chip: 'bg-rose-100 text-rose-700',
        border: 'border-rose-200',
        accent: 'text-rose-600',
        progress: 0,
    },
};

export default function OrderCard({ order }) {
    const [isOpen, setIsOpen] = useState(false);
    const items = order.items_list
        ?.split('|||')
        .map((itemStr) => {
            try {
                return JSON.parse(itemStr);
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    const theme = STATUS_THEME[order.status] || {
        chip: 'bg-slate-100 text-slate-700',
        border: 'border-slate-200',
        accent: 'text-slate-600',
        progress: 50,
    };

    const createdAt = format(new Date(order.order_time), 'HH:mm, dd/MM/yyyy', { locale: vi });

    return (
        <div className={`rounded-2xl border bg-white shadow-md transition hover:shadow-xl ${theme.border}`}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center sm:gap-6"
            >
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image
                            src="/images/banner-logo/logo.png"
                            alt="Bánh Tằm Cô Đào"
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mã đơn hàng</p>
                        <p className="text-lg font-semibold text-slate-900">{order.order_code}</p>
                        <p className="text-xs text-slate-500">{createdAt}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:w-auto sm:justify-end">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${theme.chip}`}>
                        {order.status || 'Đang xử lý'}
                    </span>
                    <div className="text-right">
                        <p className={`text-lg font-semibold ${theme.accent}`}>{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-slate-500">Tổng thanh toán</p>
                    </div>
                    <ChevronDown className={`text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <div className="px-4 pb-4">
                <div className="h-1 rounded-full bg-slate-100">
                    <div
                        className={`h-full rounded-full bg-slate-900 transition-all duration-500 ${theme.accent.replace('text', 'bg')
                            }`}
                        style={{ width: `${theme.progress}%` }}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="space-y-4 px-4 pb-5">
                    <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                            <Receipt size={18} className="mt-0.5 text-slate-400" />
                            <div>
                                <p className="font-semibold text-slate-700">Thông tin đơn hàng</p>
                                <p>Mã thanh toán: {order.payment_code || '—'}</p>
                                <p>Ghi chú: {order.customer_note || 'Không có ghi chú'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={18} className="mt-0.5 text-slate-400" />
                            <div>
                                <p className="font-semibold text-slate-700">Địa chỉ nhận</p>
                                <p>{order.delivery_address || 'Chưa cập nhật'}</p>
                                <p className="mt-1 flex items-center gap-2">
                                    <Phone size={14} />
                                    {order.recipient_phone || '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700">Các món đã đặt</p>
                        <div className="space-y-2">
                            {items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">x{item.qty}</p>
                                    </div>
                                    <p className="font-semibold text-slate-700">
                                        {formatCurrency(item.total || item.price)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}