// src/components/CategoryTabs.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const categoryImages = {
  default: '/images/menu-icons/default.svg',
  tatca: '/images/menu-icons/all.svg',
  banhtam: '/images/menu-icons/banh-tam.svg',
  monphu: '/images/menu-icons/mon-phu.svg',
  anvat: '/images/menu-icons/mon-phu.svg',
  thucuong: '/images/menu-icons/thuc-uong.svg',
  trasua: '/images/menu-icons/tra-sua.svg',
};

const normalizeCategoryKey = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

export default function CategoryTabs({ categories = [], activeCategory, onCategoryChange }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-24 h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mb-6 pb-2">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-1">
        <button
          onClick={() => onCategoryChange('')}
          className={`group relative flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
            activeCategory === ''
              ? 'bg-white border-primary/70 shadow-lg shadow-primary/10'
              : 'bg-white text-gray-500 border-gray-100 hover:border-primary/60'
          }`}
        >
          <span className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity ${
            activeCategory === '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`} />
          <div className={`flex h-14 w-14 items-center justify-center rounded-full border bg-orange-50 transition-all duration-300 ${
            activeCategory === ''
              ? 'border-primary/80 shadow-inner'
              : 'border-transparent group-hover:border-primary/50'
          }`}>
            <Image
              src={categoryImages.tatca}
              alt="Biểu tượng Tất cả"
              width={44}
              height={44}
              className="h-11 w-11"
            />
          </div>
          <span className={`mt-2 text-xs font-semibold tracking-wide ${
            activeCategory === '' ? 'text-primary' : 'text-gray-600 group-hover:text-primary'
          }`}>
            Tất cả
          </span>
        </button>

        {categories.map((category) => {
          const key = normalizeCategoryKey(category.name);
          const isActive = activeCategory === category.id.toString();

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id.toString())}
              className={`group relative flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                isActive
                  ? 'bg-white border-primary/70 shadow-lg shadow-primary/10'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-primary/60'
              }`}
            >
              <span className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`} />
              <div className={`flex h-14 w-14 items-center justify-center rounded-full border bg-orange-50 transition-all duration-300 ${
                isActive
                  ? 'border-primary/80 shadow-inner'
                  : 'border-transparent group-hover:border-primary/50'
              }`}>
                <Image
                  src={categoryImages[key] || categoryImages.default}
                  alt={`Biểu tượng ${category.name}`}
                  width={44}
                  height={44}
                  className="h-11 w-11"
                />
              </div>
              <span className={`mt-2 text-xs font-semibold tracking-wide ${
                isActive ? 'text-primary' : 'text-gray-600 group-hover:text-primary'
              }`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}
