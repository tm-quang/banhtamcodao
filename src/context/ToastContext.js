// src/context/ToastContext.js
'use client';

import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ToastContext = createContext(null);

// Maximum number of visible toasts
const MAX_TOASTS = 1;

// Toast Component with stacking effect
const Toast = ({ toast, onRemove, index, total }) => {
    const { id, message, type, data } = toast;
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = useCallback(() => {
        setIsExiting(true); // Start exit animation (fade out)
        setTimeout(() => onRemove(id), 300);
    }, [id, onRemove]);

    useEffect(() => {
        const removeTimer = setTimeout(() => {
            handleRemove();
        }, 3000);
        return () => clearTimeout(removeTimer);
    }, [id, handleRemove]);

    useEffect(() => {
        const showTimer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(showTimer);
    }, []);

    const product = data?.product;

    // Type-based styling
    const typeStyles = {
        success: {
            icon: CheckCircle,
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            iconColor: 'text-emerald-500',
            iconBg: 'bg-emerald-100',
            progressBg: 'bg-emerald-500',
            glow: 'shadow-emerald-500/20',
            iconAnim: 'animate-svg-draw',
        },
        error: {
            icon: XCircle,
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            iconColor: 'text-rose-500',
            iconBg: 'bg-rose-100',
            progressBg: 'bg-rose-500',
            glow: 'shadow-rose-500/20',
            iconAnim: '',
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-100',
            progressBg: 'bg-amber-500',
            glow: 'shadow-amber-500/20',
            iconAnim: '',
        },
        info: {
            icon: Info,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-100',
            progressBg: 'bg-blue-500',
            glow: 'shadow-blue-500/20',
            iconAnim: '',
        },
    };

    const style = typeStyles[type] || typeStyles.info;
    const Icon = style.icon;

    // Calculate stacking offset - newer toasts appear on top
    const stackIndex = total - 1 - index; // Reverse so newest is on top
    const translateY = stackIndex * 12;
    const scale = 1 - stackIndex * 0.04;
    const opacityValue = 1 - stackIndex * 0.2;
    const zIndex = total - stackIndex;

    // Animation - slide in from right, fade out in place
    const visibleTransform = `translateX(0) translateY(${translateY}px) scale(${scale})`;
    const entryTransform = `translateX(120%) translateY(${translateY}px) scale(${scale})`;

    // Determine current transform: if exiting, keep visible position; if not visible yet, use entry position
    const currentTransform = isExiting ? visibleTransform : (isVisible ? visibleTransform : entryTransform);
    const currentOpacity = isExiting ? 0 : (isVisible ? opacityValue : 0);

    // Product toast (cart notification)
    if (product) {
        return (
            <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
                style={{
                    transform: currentTransform,
                    opacity: currentOpacity,
                    zIndex,
                }}
            >
                <div className={`bg-white backdrop-blur-md shadow-md rounded-xl w-80 overflow-hidden border border-white ${style.glow}`}>
                    <div className={`flex items-center gap-2 p-2 ${style.iconBg}/40 border-b border-gray-100`}>
                        <div className={`p-1.5 rounded-3xl ${style.iconBg} ${style.iconAnim}`}>
                            <Icon className={style.iconColor} size={18} />
                        </div>
                        <p className="flex-grow text-[14px] font-bold text-gray-800">{message}</p>
                        <button onClick={handleRemove} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={16} className="text-gray-400" />
                        </button>
                    </div>
                    <div className="p-2 flex gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-gray-100">
                            <Image
                                src={product.image_url || '/placeholder.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <p className="font-bold text-gray-900 text-[14px] line-clamp-1">{product.name}</p>
                            <Link
                                href="/cart"
                                onClick={handleRemove}
                                className="mt-1 text-primary text-[12px] font-bold hover:underline flex items-center gap-1"
                            >
                                Xem giỏ hàng →
                            </Link>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-gray-100">
                        <div className={`h-full ${style.progressBg} animate-toast-progress`} />
                    </div>
                </div>
            </div>
        );
    }

    // Regular toast
    return (
        <div
            className="absolute top-0 left-0 right-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
            style={{
                transform: currentTransform,
                opacity: currentOpacity,
                zIndex,
            }}
        >
            <div className={`flex items-center ${style.bg} backdrop-blur-md border ${style.border} shadow-md rounded-xl p-2 min-w-[320px] overflow-hidden relative ${style.glow}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-3xl ${style.iconBg} flex items-center justify-center ${style.iconAnim} shadow-sm`}>
                    <Icon size={18} className={style.iconColor} />
                </div>
                <div className="flex-grow px-4">
                    <p className="text-xs font-bold text-gray-800">{message}</p>
                </div>
                <button
                    onClick={handleRemove}
                    className="flex-shrink-0 p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <X size={18} className="text-gray-400" />
                </button>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
                    <div className={`h-full ${style.progressBg} animate-toast-progress`} />
                </div>
            </div>
        </div>
    );
};

// Toast Container - single position, stacking toasts
const ToastContainer = ({ toasts, removeToast }) => {
    // Only show last MAX_TOASTS toasts
    const visibleToasts = toasts.slice(-MAX_TOASTS);

    return (
        <div className="fixed top-10 right-5 z-[9999] w-80">
            <div className="relative" style={{ height: visibleToasts.length > 0 ? 'auto' : 0 }}>
                {visibleToasts.map((toast, index) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                        index={index}
                        total={visibleToasts.length}
                    />
                ))}
            </div>
        </div>
    );
};

// Provider and Hook
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const showToast = useCallback((message, type = 'info', data = {}) => {
        setToasts(prev => {
            // Tránh lặp lại thông báo giống hệt nhau đang hiển thị
            const isDuplicate = prev.some(t =>
                t.message === message &&
                t.data?.product?.id === data?.product?.id
            );
            if (isDuplicate) return prev;

            const id = Date.now() + Math.random();
            // Clear previous toasts and show only the new one
            return [{ id, message, type, data }];
        });
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isMounted && document.body ? createPortal(
                <ToastContainer toasts={toasts} removeToast={removeToast} />,
                document.body
            ) : null}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider.');
    }
    return context;
};