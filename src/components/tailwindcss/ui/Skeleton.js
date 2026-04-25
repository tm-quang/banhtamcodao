/**
 * Skeleton Loading Component - Reusable skeleton UI
 * @file src/components/tailwindcss/ui/Skeleton.js
 */
'use client';

export function Skeleton({ 
  variant = 'text', 
  width = 'w-full', 
  height = 'h-4',
  className = '',
  ...props 
}) {
  const variants = {
    text: `rounded ${height} ${width}`,
    circular: 'rounded-full',
    rectangular: `rounded-lg ${width} ${height}`,
  };

  return (
    <div
      className={`
        bg-gray-200
        ${variants[variant]}
        ${className}
      `.trim()}
      style={{
        opacity: 0.7,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

// Skeleton Table Row Component
export function SkeletonTableRow({ columns, showSubline = false }) {
  return (
    <tr>
      {columns.map((col, index) => (
        <td key={index} className="px-6 py-4">
          <div className="space-y-2">
            <Skeleton
              variant="text"
              width={index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-3/4' : 'w-1/2'}
              height="h-4"
            />
            {showSubline && index === 1 && (
              <Skeleton variant="text" width="w-1/2" height="h-3" />
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}

// Skeleton Card Component
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        <Skeleton variant="text" width="w-3/4" height="h-5" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? 'w-1/2' : 'w-full'}
            height="h-4"
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton Stats Card Component
export function SkeletonStatsCard() {
  return (
    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
      <div className="w-20 h-20 bg-gray-300 rounded-full absolute bottom-0 right-0 opacity-20" style={{ opacity: 0.3, animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
      <div className="relative z-10">
        <Skeleton variant="rectangular" width="w-8" height="h-8" className="mb-3" />
        <Skeleton variant="rectangular" width="w-16" height="h-8" className="mb-1" />
        <Skeleton variant="rectangular" width="w-24" height="h-4" />
      </div>
    </div>
  );
}

