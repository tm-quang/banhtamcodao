// src/utils/cartValidation.js
import supabase from '@/lib/supabase';
import { checkAllComboPromotions } from '@/utils/comboPromotions';

/**
 * Helper to filter active combos (similar to api/combo-promotions/active)
 */
export function isComboActive(combo, now) {
  if (combo.start_date) {
    const startDate = new Date(combo.start_date);
    if (startDate.getTime() - now.getTime() > 60000) return false;
  }
  if (combo.end_date) {
    const endDate = new Date(combo.end_date);
    if (now.getTime() - endDate.getTime() > 60000) return false;
  }
  if (combo.valid_hours) {
    try {
      const validHours = typeof combo.valid_hours === 'string' ? JSON.parse(combo.valid_hours) : combo.valid_hours;
      if (validHours.start && validHours.end) {
        const localNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const currentHour = localNow.getHours();
        const currentMinute = localNow.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const [startHour, startMinute] = validHours.start.split(':').map(Number);
        const [endHour, endMinute] = validHours.end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        if (startTime <= endTime) {
          if (currentTime < startTime || currentTime >= endTime) return false;
        }
      }
    } catch (e) {
      console.error('Error parsing valid_hours:', e);
    }
  }
  return true;
}

/**
 * Validates a list of cart items against the database and active promotions.
 * @param {Array} items_list - The list of items to validate.
 * @returns {Promise<Object>} - Validation result { success, message, requireRefresh }
 */
export async function validateCartItems(items_list) {
  if (!items_list || items_list.length === 0) {
    return { success: false, message: 'Giỏ hàng trống.' };
  }

  // Normalize items_list (handle both 'quantity' and 'qty')
  const normalizedItems = items_list.map(item => ({
    ...item,
    id: item.id || item.product_id,
    quantity: item.quantity || item.qty || 0
  }));

  const nonFreeItems = normalizedItems.filter(item => !item.is_free);
  
  // If only free items exist, it's invalid
  if (nonFreeItems.length === 0 && normalizedItems.some(item => item.is_free)) {
    return {
      success: false,
      message: 'Giỏ hàng không thể chỉ chứa sản phẩm tặng kèm. Vui lòng thêm món chính.'
    };
  }

  const productIds = nonFreeItems.map(item => item.id);

  if (productIds.length > 0) {
    // 1. Fetch current status and prices from database
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, status, category_id, category_slug:categories(slug)')
      .in('id', productIds);

    if (error) throw error;

    const productMap = products.reduce((acc, p) => {
      acc[p.id] = {
        ...p,
        category_slug: p.category_slug?.slug || ''
      };
      return acc;
    }, {});

    // 2. Validate existence, status and price
    for (const item of nonFreeItems) {
      const dbProduct = productMap[item.id];

      if (!dbProduct || dbProduct.status !== 'active') {
        return {
          success: false,
          message: `Sản phẩm "${item.name}" đã ngừng bán hoặc không tồn tại.`,
        };
      }

      const clientPrice = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
      const dbPrice = dbProduct.discount_price ?? dbProduct.price ?? 0;

      if (Math.abs(clientPrice - dbPrice) > 1) { // Allow tiny rounding differences
        return {
          success: false,
          message: `Giá của sản phẩm "${item.name}" đã thay đổi. Vui lòng tải lại giỏ hàng.`,
        };
      }
    }

    // 3. Combo & Promotion Validation
    const { data: combos, error: comboError } = await supabase
      .from('combo_promotions')
      .select('*')
      .eq('status', 'active');

    if (comboError) throw comboError;

    const now = new Date();
    const activeCombos = (combos || []).filter(c => isComboActive(c, now));

    // Re-calculate rewards based on DB items
    const itemsForComboCheck = nonFreeItems.map(item => {
      const dbProduct = productMap[item.id];
      return {
        ...item,
        category_id: dbProduct?.category_id,
        category_slug: dbProduct?.category_slug
      };
    });

    const calculatedRewards = checkAllComboPromotions(itemsForComboCheck, activeCombos);
    const freeItemsInCart = normalizedItems.filter(item => item.is_free);

    // Check if all free items in cart are valid
    for (const freeItem of freeItemsInCart) {
      const isJustified = calculatedRewards.some(reward => {
        const matchId = reward.product_id && (freeItem.id === reward.product_id || freeItem.product_id === reward.product_id);
        const matchSlug = reward.product_slug && (freeItem.slug === reward.product_slug || freeItem.product_slug === reward.product_slug);
        const matchCategory = reward.category_slug && (freeItem.category_slug === reward.category_slug);
        
        return (matchId || matchSlug || matchCategory) && 
               freeItem.quantity <= reward.quantity &&
               (String(freeItem.combo_promotion_id) === String(reward.combo_promotion_id));
      });

      if (!isJustified) {
        return {
          success: false,
          message: `Sản phẩm tặng kèm "${freeItem.name}" không còn đủ điều kiện hoặc đã hết hạn. Vui lòng cập nhật lại giỏ hàng.`,
          requireRefresh: true
        };
      }
    }
  }

  return { success: true, message: 'Giỏ hàng hợp lệ.' };
}
