'use client';

import { useState } from 'react';
import { FileText, Utensils, Star } from 'lucide-react';

/**
 * ProductTabs Component
 * Tab navigation for product information sections
 * @param {Object} props
 * @param {Function} props.onTabChange - Callback when tab changes
 */
export default function ProductTabs({ onTabChange }) {
    const [activeTab, setActiveTab] = useState('description');

    const tabs = [
        { id: 'description', label: 'Mô tả', icon: FileText },
        { id: 'nutrition', label: 'Dinh dưỡng', icon: Utensils },
        { id: 'reviews', label: 'Đánh giá', icon: Star },
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (onTabChange) {
            onTabChange(tabId);
        }

        // Smooth scroll to section
        const sectionId = tabId === 'description' ? 'product-description' :
            tabId === 'nutrition' ? 'product-nutrition' : 'reviews';
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
