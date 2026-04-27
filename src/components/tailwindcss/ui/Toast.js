/**
 * Toast Notification Component
 */
'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const types = {
        success: {
            bg: 'bg-green-500',
            icon: CheckCircle,
            iconColor: 'text-white'
        },
        error: {
            bg: 'bg-red-500',
            icon: XCircle,
            iconColor: 'text-white'
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: AlertCircle,
            iconColor: 'text-white'
        },
        info: {
            bg: 'bg-blue-500',
            icon: Info,
            iconColor: 'text-white'
        }
    };

    const config = types[type] || types.success;
    const Icon = config.icon;

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
            <div className={`${config.bg} text-white px-3 py-3 rounded-xl shadow-md max-w-sm flex items-center gap-3 min-w-[300px]`}>
                <Icon size={20} className={`${config.iconColor} flex-shrink-0`} />
                <p className="flex-1 font-medium text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-white/20 rounded-md p-1 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

