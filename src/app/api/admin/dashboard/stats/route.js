// src/app/api/admin/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');
        
        // Parse và validate tham số
        const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        
        // Validate tháng và năm
        if (isNaN(month) || month < 1 || month > 12) {
            return NextResponse.json(
                { success: false, message: 'Tháng không hợp lệ' },
                { status: 400 }
            );
        }
        
        if (isNaN(year) || year < 2000 || year > 2100) {
            return NextResponse.json(
                { success: false, message: 'Năm không hợp lệ' },
                { status: 400 }
            );
        }

        // Tính số ngày trong tháng
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Tạo mảng các ngày trong tháng
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        
        // Khởi tạo mảng kết quả với giá trị 0 cho mỗi ngày
        const dailyStats = days.map(day => ({
            day,
            revenue: 0, // Doanh thu (VNĐ)
            orders: 0   // Số đơn hàng
        }));

        // Query để lấy doanh thu và số đơn theo ngày trong tháng
        // Chỉ tính các đơn hàng có status là 'Hoàn thành' hoặc 'Đã giao'
        const [rows] = await pool.execute(
            `SELECT 
                DAY(order_time) as day,
                COALESCE(SUM(total_amount), 0) as revenue,
                COUNT(*) as orders
            FROM orders
            WHERE YEAR(order_time) = ? 
                AND MONTH(order_time) = ?
                AND status IN ('Hoàn thành', 'Đã giao')
            GROUP BY DAY(order_time)
            ORDER BY day ASC`,
            [parseInt(year), parseInt(month)]
        );

        // Cập nhật dữ liệu thực tế vào mảng
        rows.forEach(row => {
            const dayIndex = row.day - 1;
            if (dayIndex >= 0 && dayIndex < dailyStats.length) {
                dailyStats[dayIndex].revenue = parseFloat(row.revenue) || 0;
                dailyStats[dayIndex].orders = parseInt(row.orders) || 0;
            }
        });

        // Chuyển đổi doanh thu từ VNĐ sang ngàn VNĐ (k)
        const dailyRevenueK = dailyStats.map(stat => 
            Math.round((stat.revenue / 1000) * 10) / 10 // Làm tròn 1 chữ số thập phân
        );
        
        const dailyOrders = dailyStats.map(stat => stat.orders);

        return NextResponse.json({
            success: true,
            data: {
                days,
                dailyRevenueK, // Doanh thu theo ngàn VNĐ
                dailyOrders,   // Số đơn hàng
                dailyStats     // Dữ liệu chi tiết (để tham khảo)
            }
        });
    } catch (error) {
        console.error('API Error - /api/admin/dashboard/stats:', error);
        return NextResponse.json(
            { success: false, message: 'Lỗi Server' },
            { status: 500 }
        );
    }
}

