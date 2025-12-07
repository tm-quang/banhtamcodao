'use client';

import { useState, useEffect } from 'react';

/**
 * ProductOptions Component
 * Handles product customization options (size, toppings, special instructions)
 * @param {Object} props
 * @param {Array} props.options - Available options from database
 * @param {number} props.basePrice - Base product price
 * @param {Function} props.onOptionsChange - Callback when options change
 */
export default function ProductOptions({ options = [], basePrice = 0, onOptionsChange }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');

    // Parse options into categories
    const sizeOptions = options.filter(opt => opt.type === 'size');
    const toppingOptions = options.filter(opt => opt.type === 'topping');

    // Calculate total price
    useEffect(() => {
        let additionalPrice = 0;

        if (selectedSize) {
            additionalPrice += selectedSize.price_adjustment || 0;
        }

        selectedToppings.forEach(topping => {
            additionalPrice += topping.price_adjustment || 0;
        });

        const totalPrice = basePrice + additionalPrice;

        if (onOptionsChange) {
            onOptionsChange({
                size: selectedSize,
                toppings: selectedToppings,
                specialInstructions,
                additionalPrice,
                totalPrice,
            });
        }
    }, [selectedSize, selectedToppings, specialInstructions, basePrice, onOptionsChange]);

    const handleSizeChange = (size) => {
        setSelectedSize(size);
    };

    const handleToppingToggle = (topping) => {
        setSelectedToppings(prev => {
            const exists = prev.find(t => t.id === topping.id);
            if (exists) {
                return prev.filter(t => t.id !== topping.id);
            } else {
                return [...prev, topping];
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // If no options available, return null
    if (sizeOptions.length === 0 && toppingOptions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 border-t pt-6 mt-6">
            {/* Size Options */}
            {sizeOptions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-secondary mb-3">Chọn kích cỡ</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {sizeOptions.map((size) => (
                            <button
                                key={size.id}
                                onClick={() => handleSizeChange(size)}
                                className={`p-3 rounded-lg border-2 transition-all ${selectedSize?.id === size.id
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-medium text-secondary">{size.name}</div>
                                {size.price_adjustment > 0 && (
                                    <div className="text-sm text-primary mt-1">
                                        +{formatCurrency(size.price_adjustment)}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Topping Options */}
            {toppingOptions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-secondary mb-3">Thêm topping</h3>
                    <div className="space-y-2">
                        {toppingOptions.map((topping) => (
                            <label
                                key={topping.id}
                                className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedToppings.some(t => t.id === topping.id)}
                                        onChange={() => handleToppingToggle(topping)}
                                        className="w-5 h-5 text-primary focus:ring-primary rounded"
                                    />
                                    <span className="font-medium text-secondary">{topping.name}</span>
                                </div>
                                {topping.price_adjustment > 0 && (
                                    <span className="text-primary font-medium">
                                        +{formatCurrency(topping.price_adjustment)}
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Special Instructions */}
            <div>
                <h3 className="text-lg font-semibold text-secondary mb-3">Ghi chú đặc biệt</h3>
                <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Ví dụ: Ít đường, nhiều đá, không hành..."
                    rows="3"
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                    Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn
                </p>
            </div>
        </div>
    );
}
