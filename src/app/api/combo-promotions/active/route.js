/**
 * src/app/api/combo-promotions/active/route.js
 * API route để lấy danh sách combo promotions đang active
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Database chưa được cấu hình',
                comboPromotions: []
            }, { status: 500 });
        }

        const now = new Date();

        // Lấy tất cả combo promotions active
        const { data: combos, error } = await supabaseAdmin
            .from('combo_promotions')
            .select('*')
            .eq('status', 'active')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Combo API] Supabase error:', error);
            // Kiểm tra xem có phải lỗi "relation does not exist" không
            if (error.message && error.message.includes('does not exist')) {
                return NextResponse.json({
                    success: false,
                    message: 'Bảng combo_promotions chưa được tạo. Vui lòng chạy migration SQL.',
                    comboPromotions: [],
                    error: 'TABLE_NOT_EXISTS'
                }, { status: 500 });
            }
            return NextResponse.json({
                success: false,
                message: 'Lỗi khi lấy combo promotions',
                comboPromotions: [],
                error: error.message
            }, { status: 500 });
        }

        console.log(`[Combo API] Found ${combos?.length || 0} combos with status='active'`);
        console.log(`[Combo API] Current time: ${now.toISOString()}`);
        
        // Log tất cả combos để debug
        if (combos && combos.length > 0) {
            console.log(`[Combo API] All combos found:`, combos.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                start_date: c.start_date,
                end_date: c.end_date
            })));
        } else {
            console.log(`[Combo API] No combos found with status='active'. Check if table exists and has data.`);
        }

        // Lọc combo promotions đang hiệu lực
        const activeCombos = (combos || []).filter(combo => {
            // Kiểm tra thời gian
            if (combo.start_date) {
                const startDate = new Date(combo.start_date);
                // So sánh với thời gian hiện tại (chấp nhận sai số 1 phút để tránh vấn đề timezone)
                const timeDiff = startDate.getTime() - now.getTime();
                if (timeDiff > 60000) { // Nếu start_date > now + 1 phút
                    console.log(`[Combo API] Combo ${combo.id} (${combo.name}) - Not started yet. Start: ${startDate.toISOString()}, Now: ${now.toISOString()}, Diff: ${Math.round(timeDiff / 1000 / 60)} minutes`);
                    return false;
                }
            }

            if (combo.end_date) {
                const endDate = new Date(combo.end_date);
                // So sánh với thời gian hiện tại (chấp nhận sai số 1 phút)
                const timeDiff = now.getTime() - endDate.getTime();
                if (timeDiff > 60000) { // Nếu now > end_date + 1 phút
                    console.log(`[Combo API] Combo ${combo.id} (${combo.name}) - Expired. End: ${endDate.toISOString()}, Now: ${now.toISOString()}, Diff: ${Math.round(timeDiff / 1000 / 60)} minutes`);
                    return false;
                }
            }

            // Kiểm tra giờ (nếu có)
            if (combo.valid_hours) {
                try {
                    const validHours = typeof combo.valid_hours === 'string' 
                        ? JSON.parse(combo.valid_hours) 
                        : combo.valid_hours;
                    
                    if (validHours.start && validHours.end) {
                        // Lấy giờ local (GMT+7 cho Vietnam)
                        const localNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
                        const currentHour = localNow.getHours();
                        const currentMinute = localNow.getMinutes();
                        const currentTime = currentHour * 60 + currentMinute;
                        
                        const [startHour, startMinute] = validHours.start.split(':').map(Number);
                        const [endHour, endMinute] = validHours.end.split(':').map(Number);
                        const startTime = startHour * 60 + startMinute;
                        const endTime = endHour * 60 + endMinute;
                        
                        // Kiểm tra nếu valid_hours không hợp lệ (start > end), bỏ qua check này
                        if (startTime > endTime) {
                            console.log(`[Combo API] Combo ${combo.id} (${combo.name}) - Invalid valid_hours (start > end). Ignoring valid_hours check.`);
                            // Bỏ qua valid_hours check nếu không hợp lệ
                        } else {
                            // Logic bình thường: currentTime phải nằm trong khoảng [startTime, endTime)
                            if (currentTime < startTime || currentTime >= endTime) {
                                console.log(`[Combo API] Combo ${combo.id} (${combo.name}) - Outside valid hours. Current: ${currentHour}:${currentMinute} (${currentTime}), Valid: ${validHours.start} (${startTime})-${validHours.end} (${endTime})`);
                                return false;
                            }
                        }
                    }
                } catch (e) {
                    console.error('[Combo API] Error parsing valid_hours:', e);
                    // Nếu parse lỗi, bỏ qua valid_hours check
                }
            }

            console.log(`[Combo API] Combo ${combo.id} (${combo.name}) - Active and valid`);
            return true;
        });

        console.log(`[Combo API] Returning ${activeCombos.length} active combos`);

        return NextResponse.json({
            success: true,
            comboPromotions: activeCombos
        });
    } catch (error) {
        console.error('API Error - GET /api/combo-promotions/active:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Lỗi Server',
            comboPromotions: []
        }, { status: 500 });
    }
}

