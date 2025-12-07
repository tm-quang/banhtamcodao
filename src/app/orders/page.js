/**
 * Order lookup page - Tra cứu đơn hàng
 * @file src/app/orders/page.js
 */
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

/**
 * Component con để hiển thị một đơn hàng
 * @param {Object} props - Component props
 * @param {Object} props.order - Order data
 */
const OrderCard = ({ order }) => {
    const items = order.items_list.split('|||').map(itemStr => {
        try { return JSON.parse(itemStr); } catch { return null; }
    }).filter(Boolean);

    const getStatusChip = (status) => {
        const colorMap = {
            'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
            'Đã xác nhận': 'bg-blue-100 text-blue-800',
            'Đang vận chuyển': 'bg-indigo-100 text-indigo-800',
            'Hoàn thành': 'bg-green-100 text-green-800',
            'Đã hủy': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <p className="font-bold text-lg text-secondary">Mã đơn: {order.order_code}</p>
                    <p className="text-sm text-gray-500">Đặt lúc: {format(new Date(order.order_time), 'HH:mm, dd/MM/yyyy', { locale: vi })}</p>
                </div>
                {getStatusChip(order.status)}
            </div>
            <div className="p-4 space-y-3">
                <div className="text-sm">
                    <p><strong>Người nhận:</strong> {order.recipient_name}</p>
                    <p><strong>Địa chỉ:</strong> {order.delivery_address}</p>
                </div>
                <div className="border-t pt-3">
                    <p className="font-semibold mb-2">Các món đã đặt:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {items.map((item, index) => (
                            <li key={index}>{item.name} (x{item.qty})</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t text-right">
                <p className="text-lg font-bold">Tổng cộng: <span className="text-primary">{formatCurrency(order.total_amount)}</span></p>
            </div>
        </div>
    );
};

export default function OrderLookupPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    /** Để biết người dùng đã tìm kiếm hay chưa */
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        setOrders([]);

        try {
            const res = await fetch('/api/orders/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-lobster text-secondary mb-4">
                        Tra Cứu Đơn Hàng
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Nhập số điện thoại bạn đã dùng để đặt hàng để xem lại lịch sử và trạng thái các đơn hàng của bạn.
                    </p>
                </div>

                {/* Form tìm kiếm */}
                <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 mb-12">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại của bạn..."
                        required
                        className="flex-grow border border-gray-300 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                    />
                    <button type="submit" disabled={loading} className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:bg-gray-400">
                        <Search size={18} />
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>

                {/* Khu vực hiển thị kết quả */}
                <div className="max-w-3xl mx-auto">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!loading && searched && orders.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-center">Các đơn hàng đã tìm thấy</h2>
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}

                    {!loading && searched && orders.length === 0 && (
                        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold text-secondary">Không tìm thấy đơn hàng nào</h2>
                            <p className="text-gray-500 mt-2">Số điện thoại bạn nhập không khớp với bất kỳ đơn hàng nào trong hệ thống.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}