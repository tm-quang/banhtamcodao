// src/app/(admin)/dashboard/reviews/page.js
import ReviewTable from '@/components/admin/ReviewTable';

async function getReviews() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';
    try {
        const res = await fetch(`${apiUrl}/api/admin/reviews`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.reviews || [];
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
}

export const metadata = {
    title: 'Quản lý Đánh giá - Trang Quản Trị',
};

export default async function ReviewsPage() {
    const reviews = await getReviews();
    return (
        <ReviewTable initialReviews={reviews} />
    );
}