// src/components/InteractiveElements.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Plus, Minus } from 'lucide-react';

// Interactive Button with Ripple Effect
export const RippleButton = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  size = "md",
  disabled = false 
}) => {
  const [ripples, setRipples] = useState([]);

  const variants = {
    primary: "bg-gradient-to-r from-primary to-orange-500 text-white hover:from-orange-500 hover:to-primary",
    secondary: "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white",
    ghost: "bg-transparent text-primary hover:bg-primary/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const handleClick = (e) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-full font-semibold transition-all duration-300 
        transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ 
  icon: Icon, 
  onClick, 
  label,
  position = "bottom-right",
  color = "primary"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const positions = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  };

  const colors = {
    primary: "bg-primary hover:bg-orange-600",
    secondary: "bg-secondary hover:bg-gray-700",
    accent: "bg-accent hover:bg-blue-600"
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className={`
            fixed ${positions[position]} z-50 
            ${colors[color]} text-white rounded-full p-4 shadow-2xl
            transition-all duration-300 hover:shadow-3xl
          `}
          title={label}
        >
          <Icon size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Interactive Card with 3D Tilt Effect
export const InteractiveCard = ({ 
  children, 
  className = "",
  tiltIntensity = 10
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    setRotateY((deltaX / rect.width) * tiltIntensity);
    setRotateX(-(deltaY / rect.height) * tiltIntensity);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={`transition-transform duration-300 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Animated Counter
export const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  start = 0,
  suffix = "",
  prefix = "",
  className = ""
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * (end - start) + start));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Interactive Product Quick Actions
export const ProductQuickActions = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist,
  isInWishlist = false,
  className = ""
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    setIsAnimating(true);
    onAddToCart(product, quantity);
    
    setTimeout(() => {
      setIsAnimating(false);
      setQuantity(1);
    }, 1000);
  };

  return (
    <motion.div 
      className={`flex items-center space-x-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quantity Selector */}
      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add to Cart Button */}
      <RippleButton
        onClick={handleAddToCart}
        variant="primary"
        size="md"
        className="flex items-center space-x-2"
      >
        <ShoppingCart size={18} />
        <span>Thêm vào giỏ</span>
      </RippleButton>

      {/* Wishlist Button */}
      <motion.button
        onClick={() => onToggleWishlist(product)}
        className={`p-3 rounded-full transition-all duration-300 ${
          isInWishlist 
            ? 'bg-red-100 text-red-500' 
            : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
      </motion.button>
    </motion.div>
  );
};

// Toast Notification
export const Toast = ({ 
  message, 
  type = "success", 
  isVisible, 
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const types = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white"
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.3 }}
          className={`fixed top-4 right-4 z-50 ${types[type]} px-6 py-4 rounded-lg shadow-2xl max-w-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{message}</span>
            <button
              onClick={onClose}
              className="ml-4 text-current hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Smooth Scroll Button
export const SmoothScrollButton = ({ 
  targetId, 
  children, 
  className = "",
  offset = 0
}) => {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};


