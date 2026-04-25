/**
 * Tooltip component với Tailwind CSS - có mũi tên tam giác
 */
'use client';
import { useState } from 'react';

export function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
    left: 'left-full top-1/2 -translate-y-1/2 translate-x-1/2',
    right: 'right-full top-1/2 -translate-y-1/2 -translate-x-1/2',
  };

  const arrowBorders = {
    top: 'border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positions[position]} pointer-events-none`}>
          <div className="relative bg-gray-900 text-white text-xs py-1.5 px-2.5 rounded-md shadow-lg whitespace-nowrap">
            {content}
            {/* Mũi tên tam giác */}
            {position === 'top' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900" />
            )}
            {position === 'bottom' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-900" />
            )}
            {position === 'left' && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-900" />
            )}
            {position === 'right' && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-t-transparent border-b-transparent border-r-gray-900" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

