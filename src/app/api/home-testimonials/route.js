/**
 * src/app/api/home-testimonials/route.js
 * Public API to fetch curated testimonials for the home page
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const { data: testimonials, error } = await supabaseAdmin
            .from('home_testimonials')
            .select('*')
            .eq('status', 'active')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            testimonials
        });
    } catch (error) {
        console.error('Error fetching home testimonials:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch testimonials'
        }, { status: 500 });
    }
}
