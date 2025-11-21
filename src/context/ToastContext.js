// src/context/ToastContext.js
'use client';

import { createContext, useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ToastContext = createContext(null);

// --- Component Toast (Cập nhật để có hiệu ứng trượt) ---
const Toast = ({ toast, onRemove }) => {
    const { id, message, type, data } = toast;
    const [isVisible, setIsVisible] = useState(false);

    // Hàm xử lý khi đóng (để có animation trượt ra)
    const handleRemove = useCallback(() => {
        setIsVisible(false);
        // Đợi animation trượt ra hoàn tất rồi mới gỡ khỏi DOM
        setTimeout(() => onRemove(id), 300);
    }, [id, onRemove]);

    // Effect để tự động đóng sau 5 giây
    useEffect(() => {
        const removeTimer = setTimeout(() => {
            handleRemove();
        }, 2500);
        return () => clearTimeout(removeTimer);
    }, [id, handleRemove]);

    // Effect để kích hoạt animation trượt vào
    useEffect(() => {
        // Cần một khoảng trễ nhỏ để trình duyệt có thể áp dụng transition
        const showTimer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(showTimer);
    }, []);

    const product = data?.product;
    const icons = {
        success: <CheckCircle className="text-green-500" />,
        error: <XCircle className="text-red-500" />,
        info: <Info className="text-blue-500" />,
    };
    
    // Các lớp CSS động cho hiệu ứng trượt
    const toastClasses = `transition-all duration-300 ease-in-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`;

    // Giao diện cho thông báo có sản phẩm
    if (product) {
        return (
            <div className={toastClasses}>
                <div className="bg-white shadow-lg rounded-lg w-80 overflow-hidden">
                    <div className="flex items-center gap-2 p-3 bg-green-100 border-b border-green-200">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="flex-grow text-sm font-semibold text-green-800">{message}</p>
                        <button onClick={handleRemove}><X size={18} className="text-gray-500 hover:text-black" /></button>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Image src={product.image_url || '/placeholder.jpg'} alt={product.name} width={60} height={60} className="rounded-md object-cover" />
                            <div><p className="font-semibold text-secondary">{product.name}</p></div>
                        </div>
                        <Link href="/cart" onClick={handleRemove} className="w-full text-center bg-white border border-gray-300 text-secondary font-bold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                            Xem giỏ hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // Giao diện cho thông báo thường
    return (
        <div className={toastClasses}>
            <div className="flex items-center bg-slate-100 shadow-lg rounded-md p-4 min-w-[300px]">
                {icons[type]}
                <p className="flex-grow px-3 text-sm text-secondary">{message}</p>
                <button onClick={handleRemove}><X size={18} className="text-gray-400 hover:text-secondary" /></button>
            </div>
        </div>
    );
};

// --- Toast Container ---
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-14 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
    </div>
);

// --- Provider và Hook (giữ nguyên không đổi) ---
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