    // src/components/AnimateOnScroll.js
    'use client';

    import { motion, useInView } from 'framer-motion';
    import { useRef } from 'react';

    // Component này sẽ bọc các section khác để tạo hiệu ứng
    const AnimateOnScroll = ({ children, delay = 0 }) => {
      const ref = useRef(null);
      // useInView sẽ trả về true nếu component nằm trong tầm nhìn
      const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

      const variants = {
        hidden: { opacity: 0, y: 50 }, // Trạng thái ẩn: mờ, và dịch xuống dưới 50px
        visible: { opacity: 1, y: 0 }, // Trạng thái hiện: rõ, và ở vị trí gốc
      };

      return (
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={variants}
          transition={{ duration: 0.6, delay }}
        >
          {children}
        </motion.div>
      );
    };

    export default AnimateOnScroll;
    
