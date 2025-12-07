'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * NutritionalInfo Component
 * Displays nutritional information in a collapsible format
 * @param {Object} props
 * @param {Object} props.nutritionalInfo - Nutritional data object
 */
export default function NutritionalInfo({ nutritionalInfo }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!nutritionalInfo || Object.keys(nutritionalInfo).length === 0) {
        return null;
    }

    const {
        serving_size,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        allergens,
    } = nutritionalInfo;

    return (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="text-lg font-semibold text-secondary">Thông tin dinh dưỡng</h3>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* Serving Size */}
                    {serving_size && (
                        <div className="pb-3 border-b">
                            <p className="text-sm text-gray-600">Khẩu phần ăn</p>
                            <p className="text-lg font-semibold text-secondary">{serving_size}</p>
                        </div>
                    )}

                    {/* Calories */}
                    {calories && (
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="font-semibold text-secondary">Calories</span>
                            <span className="text-lg font-bold text-primary">{calories} kcal</span>
                        </div>
                    )}

                    {/* Macronutrients */}
                    <div className="space-y-2">
                        {protein && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Protein</span>
                                <span className="font-medium text-secondary">{protein}g</span>
                            </div>
                        )}
                        {carbs && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Carbohydrates</span>
                                <span className="font-medium text-secondary">{carbs}g</span>
                            </div>
                        )}
                        {fat && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Chất béo</span>
                                <span className="font-medium text-secondary">{fat}g</span>
                            </div>
                        )}
                        {fiber && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Chất xơ</span>
                                <span className="font-medium text-secondary">{fiber}g</span>
                            </div>
                        )}
                        {sugar && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Đường</span>
                                <span className="font-medium text-secondary">{sugar}g</span>
                            </div>
                        )}
                        {sodium && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Natri</span>
                                <span className="font-medium text-secondary">{sodium}mg</span>
                            </div>
                        )}
                    </div>

                    {/* Allergens */}
                    {allergens && allergens.length > 0 && (
                        <div className="pt-3 border-t">
                            <p className="text-sm font-semibold text-secondary mb-2">Chất gây dị ứng:</p>
                            <div className="flex flex-wrap gap-2">
                                {allergens.map((allergen, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                    >
                                        {allergen}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 pt-3 border-t">
                        * Giá trị dinh dưỡng có thể thay đổi tùy theo cách chế biến và nguyên liệu
                    </p>
                </div>
            )}
        </div>
    );
}
