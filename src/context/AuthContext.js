// src/context/AuthContext.js
'use client';
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
                // 401 is expected when user is not logged in - no need to log error
            } catch (error) {
                // Only log actual network errors, not authorization failures
                if (error.name !== 'AbortError') {
                    console.error("Network error fetching user:", error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
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