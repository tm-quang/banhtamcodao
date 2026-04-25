/**
 * src/context/SettingsContext.js
 * Context quản lý cài đặt hệ thống Real-time
 */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (data) {
                const settingsMap = {};
                data.forEach(s => {
                    settingsMap[s.key] = s.value;
                });
                setSettings(settingsMap);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Thiết lập Real-time subscription
        const channel = supabase
            .channel('site_settings_realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'site_settings' 
            }, (payload) => {
                console.log('Settings changed real-time:', payload);
                fetchSettings(); // Refresh settings when any change occurs
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
