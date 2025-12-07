// src/components/Skeleton.js
'use client';

/**
 * Component Skeleton tập trung cho toàn bộ hệ thống
 * Đảm bảo đồng bộ và dễ bảo trì
 */

const SkeletonBase = ({ className = "", children, variant = "rectangular" }) => {
  const baseClasses = "relative overflow-hidden";
  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded",
    rounded: "rounded-lg",
    roundedXL: "rounded-xl",
    rounded2XL: "rounded-2xl",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant] || variantClasses.rectangular} ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
      {children}
    </div>
  );
};

/**
 * Skeleton Component chính
 * @param {string} variant - Loại skeleton: 'text', 'rectangular', 'circular', 'rounded', 'roundedXL', 'rounded2XL'
 * @param {string} width - Chiều rộng (Tailwind classes hoặc custom)
 * @param {string} height - Chiều cao (Tailwind classes hoặc custom)
 * @param {string} className - Classes bổ sung
 */
export const Skeleton = ({
  variant = "rectangular",
  width = "w-full",
  height = "h-4",
  className = ""
}) => {
  return (
    <SkeletonBase variant={variant} className={`${width} ${height} ${className}`} />
  );
};

/**
 * Skeleton cho text
 */
export const SkeletonText = ({
  lines = 1,
  width = "w-full",
  height = "h-4",
  className = "",
  spacing = "space-y-2"
}) => {
  if (lines === 1) {
    return <Skeleton variant="text" width={width} height={height} className={className} />;
  }

  return (
    <div className={spacing}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "w-3/4" : width}
          height={height}
          className={className}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton cho button
 */
export const SkeletonButton = ({
  width = "w-24",
  height = "h-10",
  rounded = "rounded-lg",
  className = ""
}) => {
  return (
    <SkeletonBase
      variant={rounded === "rounded-full" ? "circular" : "rounded"}
      className={`${width} ${height} ${className}`}
    />
  );
};

/**
 * Skeleton cho image/avatar
 */
export const SkeletonImage = ({
  width = "w-full",
  height = "h-48",
  aspectRatio = null,
  rounded = "rounded-lg",
  className = ""
}) => {
  const aspectClass = aspectRatio ? `aspect-${aspectRatio}` : "";
  return (
    <SkeletonBase
      variant={rounded === "rounded-full" ? "circular" : rounded === "rounded-xl" ? "roundedXL" : "rounded"}
      className={`${width} ${height} ${aspectClass} ${className}`}
    />
  );
};

/**
 * Skeleton cho card
 */
export const SkeletonCard = ({
  padding = "p-4",
  className = "",
  children
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md ${padding} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Skeleton cho table row
 */
export const SkeletonTableRow = ({ cols = 4, className = "" }) => {
  return (
    <tr className={className}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" width="w-full" height="h-4" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton cho input field
 */
export const SkeletonInput = ({
  label = true,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Skeleton variant="text" width="w-24" height="h-4" />
      )}
      <Skeleton variant="rounded" width="w-full" height="h-12" />
    </div>
  );
};

/**
 * Ring Spinner - Vòng tròn loading xoay
 * @param {string} size - Kích thước: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Màu: 'primary', 'white', 'gray'
 */
export const RingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };
  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Skeleton cho product card
 */
export const SkeletonProductCard = ({ className = "" }) => {
  return (
    <SkeletonCard className={className}>
      <SkeletonImage width="w-full" height="h-48" aspectRatio="4/3" rounded="rounded-xl" className="mb-4" />
      <div className="space-y-3">
        <SkeletonText lines={1} width="w-3/4" height="h-6" />
        <SkeletonText lines={1} width="w-1/2" height="h-4" />
        <SkeletonText lines={1} width="w-1/3" height="h-5" />
      </div>
      <div className="flex justify-between items-center mt-6">
        <Skeleton variant="text" width="w-20" height="h-6" />
        <SkeletonButton width="w-24" height="h-10" rounded="rounded-2xl" />
      </div>
    </SkeletonCard>
  );
};

/**
 * Skeleton cho form section
 */
export const SkeletonFormSection = ({
  title = true,
  icon = true,
  inputs = 2,
  className = ""
}) => {
  return (
    <div className={`p-6 md:p-8 border-b border-gray-200 ${className}`}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <Skeleton variant="rounded" width="w-10" height="h-10" />
          )}
          <Skeleton variant="text" width="w-48" height="h-8" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: inputs }).map((_, i) => (
          <SkeletonInput key={i} />
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton cho order summary
 */
export const SkeletonOrderSummary = ({
  items = 3,
  className = ""
}) => {
  return (
    <SkeletonCard padding="p-6" className={`sticky top-6 ${className}`}>
      <Skeleton variant="text" width="w-32" height="h-8" className="mb-6" />

      {/* Items */}
      <div className="space-y-4 mb-6">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonImage width="w-16" height="h-16" rounded="rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonText lines={1} width="w-3/4" height="h-4" />
              <SkeletonText lines={1} width="w-1/2" height="h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton variant="text" width="w-24" height="h-4" />
            <Skeleton variant="text" width="w-32" height="h-4" />
          </div>
        ))}
      </div>

      {/* Button */}
      <SkeletonButton width="w-full" height="h-14" rounded="rounded-xl" className="mt-6" />
    </SkeletonCard>
  );
};

/**
 * Skeleton cho checkout page
 */
export const SkeletonCheckout = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
      {/* Form bên trái */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden">
        <SkeletonFormSection title icon inputs={4} />
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton variant="rounded" width="w-10" height="h-10" />
            <Skeleton variant="text" width="w-40" height="h-8" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2].map((i) => (
              <SkeletonButton key={i} width="w-full" height="h-14" rounded="rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Summary bên phải */}
      <div className="lg:col-span-2">
        <SkeletonOrderSummary items={3} />
      </div>
    </div>
  );
};

export const SkeletonLoadingOverlay = ({
  size = "md"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <RingSpinner size={size} />
    </div>
  );
};

/**
 * Skeleton cho trang xác nhận đơn hàng - khớp layout 2 cột
 */
export const SkeletonOrderConfirmation = () => {
  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFFBF7 100%)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <Skeleton variant="circular" width="w-20" height="h-20" className="mx-auto mb-4" />
          <Skeleton variant="text" width="w-64" height="h-8" className="mx-auto mb-2" />
          <Skeleton variant="text" width="w-48" height="h-4" className="mx-auto" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Order Code Card */}
            <SkeletonCard padding="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton variant="text" width="w-20" height="h-4" />
                  <Skeleton variant="text" width="w-32" height="h-8" />
                </div>
                <Skeleton variant="rounded" width="w-12" height="h-12" />
              </div>
            </SkeletonCard>

            {/* Order Items */}
            <SkeletonCard padding="p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <Skeleton variant="text" width="w-40" height="h-6" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Skeleton variant="text" width="w-3/4" height="h-5" />
                    <Skeleton variant="text" width="w-20" height="h-5" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

            {/* Delivery Info */}
            <SkeletonCard padding="p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <Skeleton variant="text" width="w-48" height="h-6" />
              </div>
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton variant="circular" width="w-5" height="h-5" />
                    <div className="space-y-1 flex-1">
                      <Skeleton variant="text" width="w-24" height="h-3" />
                      <Skeleton variant="text" width="w-full" height="h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Payment Summary */}
            <SkeletonCard padding="p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <Skeleton variant="text" width="w-40" height="h-6" />
              </div>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <Skeleton variant="text" width="w-24" height="h-4" />
                    <Skeleton variant="text" width="w-28" height="h-4" />
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Skeleton variant="text" width="w-28" height="h-6" />
                  <Skeleton variant="text" width="w-32" height="h-6" />
                </div>
              </div>
            </SkeletonCard>

            {/* QR Payment Area */}
            <SkeletonCard padding="p-0">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <Skeleton variant="text" width="w-48" height="h-6" />
              </div>
              <div className="p-6 text-center">
                <Skeleton variant="rounded" width="w-56" height="h-56" className="mx-auto mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between px-4">
                      <Skeleton variant="text" width="w-24" height="h-4" />
                      <Skeleton variant="text" width="w-32" height="h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </SkeletonCard>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <SkeletonButton width="flex-1" height="h-14" rounded="rounded-2xl" />
              <SkeletonButton width="flex-1" height="h-14" rounded="rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

