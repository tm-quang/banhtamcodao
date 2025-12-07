// src/context/ToastContext.js
'use client';

import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ToastContext = createContext(null);

// Maximum number of visible toasts
const MAX_TOASTS = 3;

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
        }, 1500);
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
            headerBg: 'bg-emerald-100',
        },
        error: {
            icon: XCircle,
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            iconColor: 'text-rose-500',
            headerBg: 'bg-rose-100',
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            iconColor: 'text-amber-500',
            headerBg: 'bg-amber-100',
        },
        info: {
            icon: Info,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconColor: 'text-blue-500',
            headerBg: 'bg-blue-100',
        },
    };

    const style = typeStyles[type] || typeStyles.info;
    const Icon = style.icon;

    // Calculate stacking offset - newer toasts appear on top
    const stackIndex = total - 1 - index; // Reverse so newest is on top
    const translateY = stackIndex * 8;
    const scale = 1 - stackIndex * 0.03;
    const opacityValue = 1 - stackIndex * 0.15;
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
                className="absolute -top-5 left-0 right-0 transition-all duration-300 ease-out"
                style={{
                    transform: currentTransform,
                    opacity: currentOpacity,
                    zIndex,
                }}
            >
                <div className="bg-white shadow-xl rounded-2xl w-80 overflow-hidden border border-gray-100">
                    <div className={`flex items-center gap-2 p-3 ${style.headerBg} border-b ${style.border}`}>
                        <Icon className={style.iconColor} size={20} />
                        <p className="flex-grow text-sm font-semibold text-gray-800">{message}</p>
                        <button onClick={handleRemove} className="p-1 hover:bg-white/50 rounded-full transition-colors">
                            <X size={16} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src={product.image_url || '/placeholder.jpg'}
                                alt={product.name}
                                width={56}
                                height={56}
                                className="rounded-xl object-cover"
                            />
                            <p className="font-semibold text-secondary line-clamp-2">{product.name}</p>
                        </div>
                        <Link
                            href="/cart"
                            onClick={handleRemove}
                            className="w-full text-center bg-primary text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Xem giỏ hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Regular toast
    return (
        <div
            className="absolute top-0 left-0 right-0 transition-all duration-300 ease-out"
            style={{
                transform: currentTransform,
                opacity: currentOpacity,
                zIndex,
            }}
        >
            <div className={`flex items-center ${style.bg} border ${style.border} shadow-xl rounded-2xl p-4 min-w-[320px] backdrop-blur-sm`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.headerBg} flex items-center justify-center`}>
                    <Icon size={20} className={style.iconColor} />
                </div>
                <p className="flex-grow px-3 text-sm font-medium text-gray-700">{message}</p>
                <button
                    onClick={handleRemove}
                    className="flex-shrink-0 p-1.5 hover:bg-white/70 rounded-lg transition-colors"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>
        </div>
    );
};

// Toast Container - single position, stacking toasts
const ToastContainer = ({ toasts, removeToast }) => {
    // Only show last MAX_TOASTS toasts
    const visibleToasts = toasts.slice(-MAX_TOASTS);

    return (
        <div className="fixed top-20 right-5 z-[9999] w-80">
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
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, data }]);
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