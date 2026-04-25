// src/context/AuthContext.js
'use client';
import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include', // Đảm bảo gửi cookies
                cache: 'no-store' // Không cache để luôn lấy dữ liệu mới nhất
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else if (res.status === 401) {
                // 401 is expected when user is not logged in - silently handle it
                setUser(null);
            } else {
                // Only log non-401 errors
                console.error("Error fetching user:", res.status, res.statusText);
            }
        } catch (error) {
            // Only log actual network errors, not authorization failures
            if (error.name !== 'AbortError') {
                console.error("Network error fetching user:", error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Refresh user function - có thể gọi từ bên ngoài sau khi login
    const refreshUser = useCallback(async () => {
        setLoading(true);
        await fetchUser();
    }, [fetchUser]);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};