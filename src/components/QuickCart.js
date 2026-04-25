// src/components/QuickCart.js
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { X, Gift } from 'lucide-react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function QuickCart({ onClose }) {
    const { cartItems, removeFromCart } = useCart();

    const subtotal = cartItems.reduce((total, item) => {
        // Bỏ qua sản phẩm tặng (is_free = true)
        if (item.is_free) return total;
        const price = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
        return total + price * item.quantity;
    }, 0);

    return (
        <div className="absolute top-full right-0 w-80 bg-white rounded-2xl shadow-xl border z-50 text-secondary animate-slideInRight" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
                <h3 className="font-bold text-lg">Giỏ hàng của bạn</h3>
            </div>
            {cartItems.length > 0 ? (
                <>
                    <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <Image src={item.image_url} alt={item.name} width={64} height={64} className="rounded-md object-cover"/>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{item.name}</p>
                                        {item.is_free && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-1.5 py-0.5 rounded-full">
                                                <Gift size={10} />
                                                Tặng
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {item.quantity} x {item.is_free ? '0đ' : formatCurrency(item.discount_price ?? item.price)}
                                    </p>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t space-y-4">
                        <div className="flex justify-between font-bold">
                            <span>Tạm tính:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex gap-2">
                             <Link href="/cart" onClick={onClose} className="w-1/2 text-center bg-white border border-gray-300 text-secondary font-bold py-2 px-4 rounded-xl hover:bg-gray-100 transition-colors">
                                Xem giỏ hàng
                            </Link>
                            <Link href="/checkout" onClick={onClose} className="w-1/2 text-center bg-primary text-light font-bold py-2 px-4 rounded-xl hover:bg-orange-600 transition-colors">
                                Thanh toán
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <p className="p-8 text-center text-gray-500">Giỏ hàng của bạn đang trống.</p>
            )}
        </div>
    );
}