// src/components/LoadingAnimations.js
'use client';

import { motion } from 'framer-motion';
import {
  Skeleton,
  SkeletonText,
  SkeletonButton,
  SkeletonImage,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonProductCard,
  SkeletonFormSection,
  SkeletonOrderSummary,
  SkeletonCheckout,
  SkeletonLoadingOverlay,
  SkeletonOrderConfirmation,
  RingSpinner
} from './Skeleton';

// Re-export để tương thích ngược
export {
  Skeleton,
  SkeletonText,
  SkeletonButton,
  SkeletonImage,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonProductCard,
  SkeletonFormSection,
  SkeletonOrderSummary,
  SkeletonCheckout,
  SkeletonLoadingOverlay,
  SkeletonOrderConfirmation,
  RingSpinner
};

// Alias để tương thích ngược với code cũ
export const TextSkeleton = SkeletonText;
export const ButtonSkeleton = SkeletonButton;

// Skeleton loading for product cards - sử dụng component tập trung
export const ProductCardSkeleton = () => {
  return <SkeletonProductCard />;
};

// Skeleton loading for menu items - sử dụng component tập trung
export const MenuItemSkeleton = () => {
  return (
    <SkeletonCard padding="p-4">
      <div className="flex space-x-4">
        <SkeletonImage width="w-20" height="h-20" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonText lines={1} width="w-3/4" height="h-5" />
          <SkeletonText lines={1} width="w-1/2" height="h-4" />
          <SkeletonText lines={1} width="w-1/3" height="h-4" />
        </div>
      </div>
    </SkeletonCard>
  );
};

// Pulse loading dots
export const PulseDots = ({ count = 3, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary",
    white: "bg-white",
    gray: "bg-gray-400"
  };

  return (
    <div className="flex space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 ${colorClasses[color]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Skeleton for hero section
export const HeroSkeleton = () => {
  return (
    <section className="relative h-screen w-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="h-16 bg-white/50 rounded-lg w-96 mx-auto animate-pulse"></div>
            <div className="h-8 bg-white/30 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="h-12 bg-white/40 rounded-full w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Các component này đã được export từ Skeleton.js

// Loading overlay với skeleton - sử dụng component tập trung
export const LoadingOverlay = ({ isLoading, children }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <SkeletonLoadingOverlay size="lg" message="Đang tải..." />
        </motion.div>
      )}
    </div>
  );
};

// Shimmer effect component
export const ShimmerEffect = ({ className = "", children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  );
};

// Page transition loading với skeleton - sử dụng component tập trung
export const PageTransition = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <SkeletonLoadingOverlay size="xl" message={null} />
        <div className="space-y-3">
          <Skeleton variant="rounded" width="w-48" height="h-8" className="mx-auto" />
          <Skeleton variant="text" width="w-32" height="h-4" className="mx-auto" />
        </div>
      </div>
    </motion.div>
  );
};


