-- 1. BẬT RLS CHO TẤT CẢ CÁC BẢNG (Khóa cửa lại)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 2. TẠO POLICY CHO PHÉP XEM CÔNG KHAI (Ai cũng xem được sản phẩm, menu...)
-- Cho phép xem Products
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
-- Cho phép xem Categories
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
-- Cho phép xem Product Images
CREATE POLICY "Public Read Images" ON product_images FOR SELECT USING (true);
-- Cho phép xem Product Options
CREATE POLICY "Public Read Options" ON product_options FOR SELECT USING (true);
-- Cho phép xem Product Attributes
CREATE POLICY "Public Read Attributes" ON product_attributes FOR SELECT USING (true);
-- Cho phép xem Reviews đã duyệt
CREATE POLICY "Public Read Reviews" ON product_reviews FOR SELECT USING (status = 'approved');
-- Cho phép xem Settings
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
-- Cho phép xem Site Content (Banner, Slide)
CREATE POLICY "Public Read Content" ON site_content FOR SELECT USING (true);
-- Cho phép xem Announcements
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (is_active = true);
-- Cho phép xem Campaigns
CREATE POLICY "Public Read Campaigns" ON display_campaigns FOR SELECT USING (status = 'active');

-- 3. CÁC BẢNG NHẠY CẢM (Orders, Customers, Accounts...)
-- Hiện tại KHÔNG tạo policy công khai. 
-- Điều này có nghĩa là chỉ có "Service Role Key" (Key Admin) mới truy cập được.
-- Đảm bảo backend của bạn sử dụng Service Role Key.
