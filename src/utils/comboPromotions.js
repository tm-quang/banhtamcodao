/**
 * src/utils/comboPromotions.js
 * Utility functions để kiểm tra và áp dụng combo promotions
 */

/**
 * Helper function để convert category name thành slug
 */
function categoryNameToSlug(categoryName) {
    if (!categoryName) return '';
    return categoryName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/**
 * Kiểm tra điều kiện combo có đáp ứng không
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ
 * @param {Object} conditions - Điều kiện combo
 * @returns {number} - Số lượng combo đạt được (0 nếu không đạt)
 */
export function checkComboConditions(cartItems, conditions) {
    if (!conditions || !conditions.rules || conditions.rules.length === 0) {
        return 0;
    }

    // Parse conditions nếu là string (từ database JSONB)
    const parsedConditions = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
    const { type, operator, rules } = parsedConditions;
    
    console.log('Checking combo conditions:', { type, operator, rules, cartItems });

    if (operator === 'AND') {
        // Tất cả điều kiện phải thỏa mãn
        let minComboCount = Infinity;

        for (const rule of rules) {
            let matchingQuantity = 0;

            // Tìm sản phẩm khớp với điều kiện
            for (const cartItem of cartItems) {
                // Bỏ qua sản phẩm tặng (is_free)
                if (cartItem.is_free) continue;

                let matches = false;

                // Kiểm tra theo product_id
                if (rule.product_id && cartItem.id === rule.product_id) {
                    matches = true;
                }
                // Kiểm tra theo product_slug
                else if (rule.product_slug && cartItem.slug === rule.product_slug) {
                    matches = true;
                }
                // Kiểm tra theo category_id
                else if (rule.category_id && cartItem.category_id === rule.category_id) {
                    matches = true;
                }
                // Kiểm tra theo category_slug
                else if (rule.category_slug) {
                    // Match với category_slug
                    if (cartItem.category_slug === rule.category_slug) {
                        matches = true;
                    } else if (cartItem.category_name) {
                        // Thử match với category_name (convert thành slug)
                        const categoryNameSlug = categoryNameToSlug(cartItem.category_name);
                        if (categoryNameSlug === rule.category_slug.toLowerCase()) {
                            matches = true;
                        }
                    }
                }

                if (matches) {
                    matchingQuantity += cartItem.quantity || 0;
                }
            }

            // Kiểm tra số lượng tối thiểu
            const minQuantity = parseInt(rule.min_quantity) || 0;
            if (matchingQuantity < minQuantity) {
                return 0; // Không đủ điều kiện
            }

            // Tính số combo đạt được cho điều kiện này
            const comboCountForRule = Math.floor(matchingQuantity / minQuantity);
            console.log(`[Combo Conditions] Rule: min_quantity=${minQuantity}, matching_quantity=${matchingQuantity}, combo_count=${comboCountForRule}`);
            minComboCount = Math.min(minComboCount, comboCountForRule);
        }

        const result = minComboCount === Infinity ? 0 : minComboCount;
        console.log('Combo count (AND):', result);
        return result;
    } else {
        // OR: Chỉ cần 1 điều kiện thỏa mãn
        let totalComboCount = 0;

        for (const rule of rules) {
            let matchingQuantity = 0;

            for (const cartItem of cartItems) {
                if (cartItem.is_free) continue;

                let matches = false;

                if (rule.product_id && cartItem.id === rule.product_id) {
                    matches = true;
                } else if (rule.product_slug && cartItem.slug === rule.product_slug) {
                    matches = true;
                } else if (rule.category_id && cartItem.category_id === rule.category_id) {
                    matches = true;
                } else if (rule.category_slug) {
                    // Match với category_slug
                    if (cartItem.category_slug === rule.category_slug) {
                        matches = true;
                    } else if (cartItem.category_name) {
                        // Thử match với category_name (convert thành slug)
                        const categoryNameSlug = categoryNameToSlug(cartItem.category_name);
                        if (categoryNameSlug === rule.category_slug.toLowerCase()) {
                            matches = true;
                        }
                    }
                }

                if (matches) {
                    matchingQuantity += cartItem.quantity || 0;
                }
            }

            const minQuantity = parseInt(rule.min_quantity) || 0;
            if (matchingQuantity >= minQuantity) {
                totalComboCount += Math.floor(matchingQuantity / minQuantity);
            }
        }

        console.log('Combo count (OR):', totalComboCount);
        return totalComboCount;
    }
}

/**
 * Tính phần thưởng từ combo
 * @param {Object} combo - Combo promotion object
 * @param {number} comboCount - Số lượng combo đạt được
 * @returns {Array} - Danh sách sản phẩm tặng cần thêm
 */
export function calculateComboRewards(combo, comboCount) {
    if (!combo.rewards || !combo.rewards.products || comboCount <= 0) {
        return [];
    }

    const rewards = [];

    for (const rewardProduct of combo.rewards.products) {
        const quantityPerCombo = parseInt(rewardProduct.quantity_per_combo) || 1;
        // Chỉ áp dụng max_quantity nếu nó > 0 và có ý nghĩa (không giới hạn quá chặt)
        // Nếu max_quantity = 1 và combo count > 1, có thể là cấu hình sai, nên bỏ qua
        const maxQuantity = (rewardProduct.max_quantity && parseInt(rewardProduct.max_quantity) > 0) 
            ? parseInt(rewardProduct.max_quantity) 
            : null;
        
        let totalQuantity = quantityPerCombo * comboCount;
        console.log(`[Combo Rewards] Combo count: ${comboCount}, quantity_per_combo: ${quantityPerCombo}, calculated: ${totalQuantity}, max_quantity: ${maxQuantity || 'unlimited'}`);
        
        // Chỉ áp dụng max_quantity nếu nó lớn hơn quantity_per_combo (có ý nghĩa)
        // Nếu max_quantity <= quantity_per_combo, có thể là cấu hình sai, bỏ qua
        if (maxQuantity && maxQuantity > quantityPerCombo && totalQuantity > maxQuantity) {
            console.log(`[Combo Rewards] Limiting to max_quantity: ${maxQuantity} (was ${totalQuantity})`);
            totalQuantity = maxQuantity;
        } else if (maxQuantity && maxQuantity <= quantityPerCombo) {
            console.log(`[Combo Rewards] Ignoring max_quantity (${maxQuantity}) as it's <= quantity_per_combo (${quantityPerCombo}). This may be a configuration error.`);
        }

        if (totalQuantity > 0) {
            rewards.push({
                product_id: rewardProduct.product_id,
                product_slug: rewardProduct.product_slug,
                category_slug: rewardProduct.category_slug,
                quantity: totalQuantity,
                combo_promotion_id: combo.id,
                combo_name: combo.name
            });
        }
    }

    return rewards;
}

/**
 * Kiểm tra và tính toán tất cả combo promotions có thể áp dụng
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ
 * @param {Array} combos - Danh sách combo promotions active
 * @returns {Array} - Danh sách sản phẩm tặng cần thêm vào giỏ
 */
export function checkAllComboPromotions(cartItems, combos) {
    if (!combos || combos.length === 0) {
        return [];
    }

    const allRewards = [];

    for (const combo of combos) {
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (combo.min_order_value) {
            const totalPrice = cartItems
                .filter(item => !item.is_free)
                .reduce((sum, item) => {
                    const price = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
                    return sum + (price * (item.quantity || 0));
                }, 0);

            if (totalPrice < combo.min_order_value) {
                continue; // Không đủ giá trị đơn hàng
            }
        }

        // Kiểm tra điều kiện
        console.log(`[checkAllComboPromotions] Checking combo: ${combo.name} (id: ${combo.id})`);
        const comboCount = checkComboConditions(cartItems, combo.conditions);
        console.log(`[checkAllComboPromotions] Combo ${combo.name} count: ${comboCount}`);
        
        if (comboCount > 0) {
            const rewards = calculateComboRewards(combo, comboCount);
            console.log(`[checkAllComboPromotions] Combo ${combo.name} rewards:`, rewards);
            allRewards.push(...rewards);
        }
    }

    return allRewards;
}


/**
 * Gợi ý các combo sắp đạt được dựa trên giỏ hàng hiện tại
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ
 * @param {Array} combos - Danh sách combo promotions active
 * @returns {Array} - Danh sách các gợi ý (mỗi gợi ý chứa thông tin combo và những gì còn thiếu)
 */
export function getPromotionSuggestions(cartItems, combos) {
    if (!combos || combos.length === 0 || !cartItems || cartItems.length === 0) {
        return [];
    }

    const suggestions = [];
    const nonFreeItems = cartItems.filter(item => !item.is_free);

    for (const combo of combos) {
        if (!combo.conditions || !combo.conditions.rules || combo.conditions.rules.length === 0) {
            continue;
        }

        // Kiểm tra giá trị đơn hàng tối thiểu trước
        let isMinOrderValueMet = true;
        let neededValue = 0;
        if (combo.min_order_value) {
            const totalPrice = nonFreeItems.reduce((sum, item) => {
                const price = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
                return sum + (price * (item.quantity || 0));
            }, 0);
            
            if (totalPrice < combo.min_order_value) {
                isMinOrderValueMet = false;
                neededValue = combo.min_order_value - totalPrice;
            }
        }

        const parsedConditions = typeof combo.conditions === 'string' ? JSON.parse(combo.conditions) : combo.conditions;
        const { operator, rules } = parsedConditions;
        
        // Tính toán trạng thái của từng rule
        const ruleStatuses = rules.map(rule => {
            let matchingQuantity = 0;
            let matchingItems = [];

            for (const cartItem of nonFreeItems) {
                let matches = false;
                if (rule.product_id && cartItem.id === rule.product_id) matches = true;
                else if (rule.product_slug && cartItem.slug === rule.product_slug) matches = true;
                else if (rule.category_id && cartItem.category_id === rule.category_id) matches = true;
                else if (rule.category_slug) {
                    if (cartItem.category_slug === rule.category_slug) matches = true;
                    else if (cartItem.category_name && categoryNameToSlug(cartItem.category_name) === rule.category_slug.toLowerCase()) matches = true;
                }

                if (matches) {
                    matchingQuantity += cartItem.quantity || 0;
                    matchingItems.push(cartItem);
                }
            }

            const minQty = parseInt(rule.min_quantity) || 1;
            const currentLevel = Math.floor(matchingQuantity / minQty);
            const remainingToNext = minQty - (matchingQuantity % minQty);
            const isPartiallySatisfied = matchingQuantity > 0 && matchingQuantity % minQty !== 0;

            return {
                rule,
                matchingQuantity,
                minQty,
                currentLevel,
                remainingToNext,
                isPartiallySatisfied,
                matchingItems
            };
        });

        // logic gợi ý:
        // 1. Nếu chưa đủ giá trị đơn hàng tối thiểu nhưng đã có sản phẩm thuộc combo
        // 2. Nếu là AND: Suggest các món còn thiếu để đạt level tiếp theo
        // 3. Nếu là OR: Suggest món đang dở dang nhất

        const hasAnyMatchingItem = ruleStatuses.some(s => s.matchingQuantity > 0);
        if (!hasAnyMatchingItem) continue;

        if (operator === 'AND') {
            const minLevel = Math.min(...ruleStatuses.map(s => s.currentLevel));
            const nextLevel = minLevel + 1;
            const missingRules = ruleStatuses.filter(s => s.matchingQuantity < nextLevel * s.minQty);

            if (missingRules.length > 0) {
                suggestions.push({
                    id: combo.id,
                    name: combo.name,
                    description: combo.description,
                    type: 'AND',
                    missing: missingRules.map(s => ({
                        name: s.rule.product_name || s.rule.category_name || s.rule.product_slug || s.rule.category_slug || 'Sản phẩm',
                        needed: (nextLevel * s.minQty) - s.matchingQuantity,
                        product_slug: s.rule.product_slug,
                        category_slug: s.rule.category_slug
                    })),
                    rewards: combo.rewards,
                    neededValue: !isMinOrderValueMet ? neededValue : 0
                });
            }
        } else {
            // OR logic
            const partiallySatisfied = ruleStatuses.filter(s => s.isPartiallySatisfied);
            if (partiallySatisfied.length > 0) {
                // Chọn rule gần đạt nhất
                const bestRule = partiallySatisfied.sort((a, b) => a.remainingToNext - b.remainingToNext)[0];
                suggestions.push({
                    id: combo.id,
                    name: combo.name,
                    description: combo.description,
                    type: 'OR',
                    missing: [{
                        name: bestRule.rule.product_name || bestRule.rule.category_name || bestRule.rule.product_slug || bestRule.rule.category_slug || 'Sản phẩm',
                        needed: bestRule.remainingToNext,
                        product_slug: bestRule.rule.product_slug,
                        category_slug: bestRule.rule.category_slug
                    }],
                    rewards: combo.rewards,
                    neededValue: !isMinOrderValueMet ? neededValue : 0
                });
            }
        }
    }

    return suggestions;
}
