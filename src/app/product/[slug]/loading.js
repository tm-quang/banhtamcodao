// src/app/product/[slug]/loading.js
import { Skeleton } from '@mui/material';
import { ChevronRight } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div className="bg-light pt-24 pb-8">
      <div className="container mx-auto px-4">
        {/* Skeleton for Breadcrumbs */}
        <div className="flex text-gray-500 text-sm mb-4 items-center">
            <Skeleton variant="text" width={80} />
            <ChevronRight size={16} className="mx-2" />
            <Skeleton variant="text" width={80} />
            <ChevronRight size={16} className="mx-2" />
            <Skeleton variant="text" width={150} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Skeleton for Image */}
          <div>
            <Skeleton variant="rectangular" className="w-full aspect-square rounded-lg" />
          </div>

          {/* Skeleton for Details */}
          <div>
            <Skeleton variant="text" sx={{ fontSize: '2.5rem', width: '70%' }} />
            <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '30%', mb: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '2.5rem', width: '40%', mb: 3 }} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" sx={{ mb: 3 }} />

            <div className="flex items-center gap-4 mt-8">
                <Skeleton variant="rectangular" width={150} height={44} sx={{ borderRadius: '6px' }} />
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}