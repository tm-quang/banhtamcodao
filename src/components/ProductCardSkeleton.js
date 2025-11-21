// src/components/ProductCardSkeleton.js
import { Skeleton } from '@mui/material';

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl shadow-md p-4 flex flex-col h-full">
            {/* Skeleton for Image */}
            <Skeleton variant="rectangular" width="100%" sx={{ aspectRatio: '4/3', borderRadius: '12px', mb: 2 }} />
            
            {/* Skeleton for Text */}
            <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '80%' }} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '50%' }} />

            {/* Skeleton for Price and Button */}
            <div className="mt-6 flex justify-between items-end">
                <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '40%' }} />
                <Skeleton variant="circular" width={56} height={56} />
            </div>
        </div>
    );
}