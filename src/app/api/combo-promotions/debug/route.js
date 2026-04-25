/**
 * Debug endpoint để kiểm tra chi tiết combo
 * GET /api/combo-promotions/debug
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, message: 'Supabase not initialized' }, { status: 500 });
        }

        const now = new Date();
        const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

        // Lấy combo với tất cả thông tin
        const { data: combos, error } = await supabaseAdmin
            .from('combo_promotions')
            .select('*')
            .eq('status', 'active');

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const debugInfo = combos?.map(combo => {
            const startDate = combo.start_date ? new Date(combo.start_date) : null;
            const endDate = combo.end_date ? new Date(combo.end_date) : null;
            
            let timeCheck = {
                hasStartDate: !!combo.start_date,
                hasEndDate: !!combo.end_date,
                startDateISO: startDate?.toISOString(),
                endDateISO: endDate?.toISOString(),
                nowISO: now.toISOString(),
                nowLocalISO: nowLocal.toISOString(),
                isStarted: !startDate || startDate <= now,
                isExpired: endDate ? endDate < now : false,
                isInTimeRange: (!startDate || startDate <= now) && (!endDate || endDate >= now)
            };

            // Parse conditions và rewards
            let conditions = null;
            let rewards = null;
            try {
                conditions = typeof combo.conditions === 'string' ? JSON.parse(combo.conditions) : combo.conditions;
                rewards = typeof combo.rewards === 'string' ? JSON.parse(combo.rewards) : combo.rewards;
            } catch (e) {
                console.error('Parse error:', e);
            }

            // Check valid_hours
            let validHoursCheck = null;
            if (combo.valid_hours) {
                try {
                    const validHours = typeof combo.valid_hours === 'string' 
                        ? JSON.parse(combo.valid_hours) 
                        : combo.valid_hours;
                    
                    if (validHours.start && validHours.end) {
                        const currentHour = nowLocal.getHours();
                        const currentMinute = nowLocal.getMinutes();
                        const currentTime = currentHour * 60 + currentMinute;
                        
                        const [startHour, startMinute] = validHours.start.split(':').map(Number);
                        const [endHour, endMinute] = validHours.end.split(':').map(Number);
                        const startTime = startHour * 60 + startMinute;
                        const endTime = endHour * 60 + endMinute;
                        
                        validHoursCheck = {
                            validHours,
                            currentTime: `${currentHour}:${currentMinute}`,
                            currentTimeMinutes: currentTime,
                            startTimeMinutes: startTime,
                            endTimeMinutes: endTime,
                            isInValidHours: currentTime >= startTime && currentTime < endTime
                        };
                    }
                } catch (e) {
                    validHoursCheck = { error: e.message };
                }
            }

            return {
                id: combo.id,
                name: combo.name,
                status: combo.status,
                timeCheck,
                validHoursCheck,
                conditions,
                rewards,
                min_order_value: combo.min_order_value
            };
        }) || [];

        return NextResponse.json({
            success: true,
            debugInfo,
            summary: {
                total: combos?.length || 0,
                active: combos?.filter(c => c.status === 'active').length || 0,
                inTimeRange: debugInfo.filter(d => d.timeCheck.isInTimeRange).length,
                hasValidHours: debugInfo.filter(d => d.validHoursCheck && d.validHoursCheck.isInValidHours).length
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

