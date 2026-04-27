/**
 * Product Utility functions
 * @file src/utils/productUtils.js
 */

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
    
    // Clean up internal objects if needed
    // delete processedItem.categories;
    
    return processedItem;
  });

  return Array.isArray(products) ? result : result[0];
}
