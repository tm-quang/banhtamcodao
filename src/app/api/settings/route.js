/**
 * src/app/api/settings/route.js
 * Public API to fetch site settings
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: settings, error } = await supabaseAdmin
            .from('site_settings')
            .select('*');

        if (error) throw error;

        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json({ 
            success: true, 
            settings: settingsMap 
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch settings' 
        }, { status: 500 });
    }
}
