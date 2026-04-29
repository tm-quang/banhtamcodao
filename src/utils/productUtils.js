/**
 * Product Utility functions
 * @file src/utils/productUtils.js
 */

export const preferredCategoryOrder = ['Bánh Tằm', 'Món Phụ', 'Thức Uống', 'Trà Sữa', 'Ăn Vặt'];

/**
 * Áp dụng thông tin khuyến mãi combo vào danh sách sản phẩm
 * @param {Array} products - Danh sách sản phẩm
 * @param {Array} activePromos - Danh sách khuyến mãi đang hoạt động
 * @returns {Array} Danh sách sản phẩm đã được gắn promotion_text
 */
export function applyPromotions(products, activePromos) {
  if (!products) return [];
  
  const productsArray = Array.isArray(products) ? products : [products];
  
  const result = productsArray.map(item => {
    let promotion_text = null;
    if (activePromos && activePromos.length > 0) {
      try {
        const matchingPromo = activePromos.find(promo => {
          let conditions = promo.conditions;
          if (typeof conditions === 'string') {
            try {
              conditions = JSON.parse(conditions);
            } catch (e) {
              return false;
            }
          }
          
          const rules = conditions?.rules || [];
          return rules.some(rule => 
            rule.apply_to_all || 
            (rule.product_id && rule.product_id === item.id) ||
            (rule.category_slug && (item.category_slug === rule.category_slug || item.categories?.slug === rule.category_slug))
          );
        });
        if (matchingPromo) {
          promotion_text = matchingPromo.name;
        }
      } catch (err) {
        console.error(`Error matching promo for product ${item.id}:`, err);
      }
    }

    const processedItem = {
      ...item,
      category_name: item.category_name || item.categories?.name || 'Danh mục',
      category_slug: item.category_slug || item.categories?.slug || '',
      price: parseFloat(item.price) || 0,
      discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
      promotion_text: promotion_text
    };
    
    return processedItem;
  });

  if (Array.isArray(products)) {
    result.sort((a, b) => {
      const orderIndex = (name) => {
        if (!name) return Number.MAX_SAFE_INTEGER;
        const normalized = name.toLowerCase().trim();
        const index = preferredCategoryOrder.findIndex(item => item.toLowerCase() === normalized);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
      };

      const ai = orderIndex(a.category_name);
      const bi = orderIndex(b.category_name);

      if (ai !== bi) return ai - bi;

      return (a.name || '').localeCompare(b.name || '', 'vi');
    });
  }

  return Array.isArray(products) ? result : result[0];
}
