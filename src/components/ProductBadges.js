'use client';

import { Flame, TrendingUp, Sparkles, Tag } from 'lucide-react';

/**
 * ProductBadges Component
 * Displays badges for product (New, Best Seller, Sale, etc.)
 * @param {Object} props
 * @param {Array} props.badges - Array of badge strings
 * @param {number} props.discountPercent - Discount percentage if on sale
 */
export default function ProductBadges({ badges = [], discountPercent = null }) {
    if (!badges || badges.length === 0) {
        return null;
    }

    const getBadgeConfig = (badge) => {
        const badgeLower = badge.toLowerCase();

        if (badgeLower === 'new' || badgeLower === 'mới') {
            return {
                icon: Sparkles,
                text: 'Mới',
                className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
            };
        }

        if (badgeLower === 'bestseller' || badgeLower === 'bán chạy') {
            return {
                icon: TrendingUp,
                text: 'Bán chạy',
                className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
            };
        }

        if (badgeLower === 'sale' || badgeLower === 'giảm giá') {
            return {
                icon: Tag,
                text: discountPercent ? `-${discountPercent}%` : 'Giảm giá',
                className: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
            };
        }

        if (badgeLower === 'hot' || badgeLower === 'nổi bật') {
            return {
                icon: Flame,
                text: 'Hot',
                className: 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
            };
        }

        // Default badge
        return {
            icon: Tag,
            text: badge,
            className: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
        };
    };

    return (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {badges.map((badge, index) => {
                const config = getBadgeConfig(badge);
                const Icon = config.icon;

                return (
                    <div
                        key={index}
                        className={`${config.className} px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm font-bold animate-pulse-slow`}
                    >
                        <Icon size={16} />
                        <span>{config.text}</span>
                    </div>
                );
            })}
        </div>
    );
}
