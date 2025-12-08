/**
 * Order Confirmation page
 * @file src/app/order-confirmation/page.js
 */
import { Suspense } from 'react';
import OrderConfirmationContent from './OrderConfirmationContent';
import { SkeletonOrderConfirmation } from '@/components/Skeleton';

export const metadata = {
    title: 'Xác nhận đơn hàng - Bánh Tằm Cô Đào',
};

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<SkeletonOrderConfirmation />}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
