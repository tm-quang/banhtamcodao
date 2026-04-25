// src/context/CartContext.js
'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/context/ToastContext'; // Import toast
import { checkAllComboPromotions } from '@/utils/comboPromotions';

// Helper function để convert category name thành slug (tương tự trong comboPromotions.js)
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

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { showToast } = useToast(); // Sử dụng toast

  // --- LOGIC CHO MINI CART VÀ ANIMATION (ĐƯỢC THÊM LẠI) ---
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('banhtamcodao_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('banhtamcodao_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm mở mini cart (không tự động đóng)
  const openMiniCart = useCallback(() => {
    setIsMiniCartOpen(true);
  }, []);

  // Hàm đóng mini cart
  const closeMiniCart = useCallback(() => {
    setIsMiniCartOpen(false);
  }, []);

  // Hàm kích hoạt animation cho icon giỏ hàng
  const triggerCartAnimation = () => {
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 500); // Animation kéo dài 0.5s
  };

  const addToCart = async (product, quantity) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && !item.is_free);
      let newItems;
      
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id && !item.is_free ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity }];
      }

      // Kiểm tra và thêm combo rewards
      checkComboRewards(newItems);

      return newItems;
    });

    // Kích hoạt cả 2 hiệu ứng
    triggerCartAnimation();
    showToast('Thêm vào giỏ hàng thành công', 'success', { product });
  };

  // Hàm kiểm tra và thêm combo rewards
  const checkComboRewards = async (currentItems) => {
    try {
      // Fetch active combo promotions
      const res = await fetch('/api/combo-promotions/active');
      const data = await res.json();
      
      if (!data.success) {
        console.error('Failed to fetch combo promotions:', data.message);
        return;
      }

      if (!data.comboPromotions || data.comboPromotions.length === 0) {
        console.log('No active combo promotions found. Response:', data);
        return;
      }

      console.log('[checkComboRewards] Active combos:', data.comboPromotions);
      console.log('[checkComboRewards] Current cart items:', currentItems);

      // Chỉ tính toán phần thưởng dựa trên sản phẩm không tặng (loại bỏ sản phẩm tặng để tính lại)
      const nonFreeItems = currentItems.filter(item => !item.is_free);
      console.log('[checkComboRewards] Non-free items for combo calculation:', nonFreeItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category_name || item.category_slug
      })));
      const rewards = checkAllComboPromotions(nonFreeItems, data.comboPromotions);
      
      console.log('[checkComboRewards] Calculated rewards:', rewards);
      console.log('[checkComboRewards] Reward details:', rewards.map(r => ({
        product_id: r.product_id,
        product_slug: r.product_slug,
        category_slug: r.category_slug,
        quantity: r.quantity,
        combo_id: r.combo_promotion_id
      })));
      
      // Cập nhật giỏ hàng: xóa sản phẩm tặng không còn đủ điều kiện
      // Sử dụng currentItems làm base thay vì prevItems để tránh race condition
      setCartItems(prevItems => {
        // Lấy danh sách combo_promotion_id từ rewards mới
        const validComboIds = rewards.length > 0 ? rewards.map(r => r.combo_promotion_id) : [];
        
        // Bắt đầu với currentItems (đã có số lượng mới) và xóa tất cả sản phẩm tặng cũ
        // Vì chúng ta sẽ thêm lại sản phẩm tặng mới từ freeItemsToAdd
        const baseItems = currentItems.filter(item => !item.is_free);
        
        // Nếu không còn rewards, chỉ trả về sản phẩm không tặng
        if (rewards.length === 0) {
          return baseItems;
        }
        
        // Tạm thời giữ lại sản phẩm tặng từ prevItems nếu combo vẫn còn valid
        // (sẽ được thay thế bằng freeItemsToAdd sau)
        const existingFreeItems = prevItems.filter(item => 
          item.is_free && 
          item.combo_promotion_id && 
          validComboIds.includes(item.combo_promotion_id)
        );
        
        // Merge baseItems với existingFreeItems (sẽ được cập nhật sau)
        return [...baseItems, ...existingFreeItems];
      });
      
      if (rewards.length === 0) {
        return; // Không có rewards, đã xóa sản phẩm tặng ở trên
      }

      // Fetch thông tin sản phẩm tặng và thêm vào giỏ
      const freeItemsToAdd = [];
      
      for (const reward of rewards) {
        try {
          let productData = null;
          
          // Tìm sản phẩm theo product_id hoặc product_slug
          if (reward.product_id) {
            // Fetch từ admin API để lấy đầy đủ thông tin
            const productRes = await fetch(`/api/admin/products`);
            const productDataRes = await productRes.json();
            if (productDataRes.success && productDataRes.products) {
              productData = productDataRes.products.find(p => p.id === reward.product_id);
            }
          } else if (reward.product_slug) {
            // Fetch product by slug
            const productRes = await fetch(`/api/products/${reward.product_slug}`);
            const productDataRes = await productRes.json();
            if (productDataRes.success && productDataRes.product) {
              productData = productDataRes.product;
            }
          } else if (reward.category_slug) {
            // Nếu chỉ có category_slug, lấy sản phẩm đầu tiên từ category đó
            // Cần fetch category_id trước
            const categoryRes = await fetch('/api/categories');
            const categoryData = await categoryRes.json();
            if (categoryData.success && categoryData.categories) {
              const category = categoryData.categories.find(c => c.slug === reward.category_slug);
              if (category) {
                const productRes = await fetch(`/api/products?category=${category.id}&limit=1`);
                const productDataRes = await productRes.json();
                if (productDataRes.success && productDataRes.products && productDataRes.products.length > 0) {
                  productData = productDataRes.products[0];
                }
              }
            }
          }

          if (productData) {
            freeItemsToAdd.push({
              ...productData,
              quantity: reward.quantity,
              is_free: true,
              combo_promotion_id: reward.combo_promotion_id,
              combo_name: reward.combo_name,
              // Đảm bảo có product_id và product_slug để match sau này
              product_id: reward.product_id || productData.id,
              product_slug: reward.product_slug || productData.slug,
              category_slug: reward.category_slug || productData.category_slug
            });
            console.log(`[Combo] Prepared free item: ${productData.name} x${reward.quantity} (combo_id: ${reward.combo_promotion_id})`);
          } else {
            console.warn(`[Combo] Could not fetch product data for reward:`, reward);
          }
        } catch (error) {
          console.error('Error fetching reward product:', error);
        }
      }

      // Cập nhật giỏ hàng với sản phẩm tặng
      if (freeItemsToAdd.length > 0) {
        setCartItems(prevItems => {
          // Lấy danh sách combo_promotion_id từ rewards mới
          const validComboIds = freeItemsToAdd.map(free => free.combo_promotion_id);
          
          // Bắt đầu với sản phẩm không tặng từ prevItems (đã có số lượng mới từ updateQuantity)
          const nonFreeItems = prevItems.filter(item => !item.is_free);
          
          // Giữ lại sản phẩm tặng cũ từ các combo vẫn còn valid (sẽ được cập nhật sau)
          const existingFreeItems = prevItems.filter(item => 
            item.is_free && 
            item.combo_promotion_id && 
            validComboIds.includes(item.combo_promotion_id)
          );
          
          // Bắt đầu với danh sách sản phẩm không tặng + sản phẩm tặng cũ
          const updatedItems = [...nonFreeItems, ...existingFreeItems];
          
          // Xử lý từng freeItem từ rewards
          for (const freeItem of freeItemsToAdd) {
            // Tìm sản phẩm tặng đã có trong updatedItems
            const itemIndex = updatedItems.findIndex(item => {
              if (!item.is_free || item.combo_promotion_id !== freeItem.combo_promotion_id) {
                return false;
              }
              
              // Match theo product_id (ưu tiên)
              if (freeItem.id && item.id === freeItem.id) {
                return true;
              }
              
              // Match theo product_slug
              if (freeItem.slug && item.slug === freeItem.slug) {
                return true;
              }
              
              // Match theo category_slug (nếu reward chỉ có category_slug)
              if (freeItem.category_slug && !freeItem.id && !freeItem.slug) {
                if (item.category_slug === freeItem.category_slug || 
                    (item.category_name && categoryNameToSlug(item.category_name) === freeItem.category_slug)) {
                  return true;
                }
              }
              
              return false;
            });

            if (itemIndex >= 0) {
              // Cập nhật số lượng và thông tin sản phẩm
              const existingItem = updatedItems[itemIndex];
              const oldQuantity = existingItem.quantity;
              console.log(`[Combo] Updating free item: ${existingItem.name} from ${oldQuantity} to ${freeItem.quantity} (combo_id: ${freeItem.combo_promotion_id})`);
              updatedItems[itemIndex] = { 
                ...freeItem, // Cập nhật với thông tin mới từ API
                quantity: freeItem.quantity, // Số lượng mới (đã tính đúng từ combo count)
                is_free: true,
                combo_promotion_id: freeItem.combo_promotion_id,
                combo_name: freeItem.combo_name
              };
            } else {
              // Thêm mới
              console.log(`[Combo] Adding new free item: ${freeItem.name} x${freeItem.quantity} (combo_id: ${freeItem.combo_promotion_id})`);
              updatedItems.push(freeItem);
            }
          }

          console.log(`[Combo] Final cart items:`, updatedItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            is_free: item.is_free,
            combo_id: item.combo_promotion_id
          })));

          return updatedItems;
        });

        // Thông báo cho user (chỉ khi có sản phẩm tặng mới được thêm)
        const currentItems = cartItems.filter(item => !item.is_free);
        const hadFreeItems = cartItems.some(item => item.is_free);
        if (!hadFreeItems) {
          showToast(`🎁 Bạn đã nhận được ${freeItemsToAdd.length} phần quà từ combo!`, 'success');
        }
      }
    } catch (error) {
      console.error('Error checking combo rewards:', error);
    }
  };

  const removeFromCart = (productId) => {
    let removedItemName = '';
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        removedItemName = itemToRemove.name;
      }
      const newItems = prevItems.filter(item => item.id !== productId);
      
      // Kiểm tra lại combo rewards sau khi xóa sản phẩm
      // Chỉ kiểm tra nếu xóa sản phẩm không phải là sản phẩm tặng
      // (Nếu xóa sản phẩm tặng thì không cần check lại vì nó không ảnh hưởng đến điều kiện)
      if (!itemToRemove?.is_free) {
        // Sử dụng setTimeout để đảm bảo state đã được cập nhật trước khi check
        setTimeout(() => {
          checkComboRewards(newItems);
        }, 50);
      }
      
      return newItems;
    });

    if (removedItemName) {
      showToast(`Đã xóa "${removedItemName}" khỏi giỏ hàng.`, 'error');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      
      // Kiểm tra lại combo rewards sau khi thay đổi số lượng
      // Gọi async nhưng không block, nó sẽ tự cập nhật state sau
      checkComboRewards(updatedItems);
      
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Đã xóa toàn bộ giỏ hàng.', 'error');
  };

  // Silent version - no toast (for order completion)
  const clearCartSilent = () => {
    setCartItems([]);
  };

  // Cung cấp đầy đủ các state và hàm cho các component con
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartSilent,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    isCartAnimating
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};