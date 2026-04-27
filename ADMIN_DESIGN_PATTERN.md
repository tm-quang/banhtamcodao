# Phân tích Thiết kế (Design Pattern) - Admin UI

Dựa trên phân tích tệp `src/app/(admin)/admin/orders/page.js`, dưới đây là các chuẩn mực thiết kế (design system) đang được áp dụng. Tài liệu này dùng làm quy chuẩn để sao chép và đồng bộ hóa kiểu thiết kế sang các trang quản trị (admin) khác.

## 1. Bố cục (Layout) tổng thể
- **Cấu trúc trang**: Flexbox theo cột (`flex flex-col h-full`).
- **Header trang**: Gồm 2 phần (Title & Subtitle bên trái, Action Buttons bên phải).
  - **Title**: Cỡ chữ lớn, in đậm (`text-2xl font-black text-gray-900 tracking-tight`). Đi kèm icon đặt trong khung hình vuông bo tròn (`w-9 h-9 rounded-xl bg-blue-600 text-white`).
  - **Subtitle**: Chữ siêu nhỏ, in hoa, khoảng cách chữ rộng (`text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em]`).
- **Thẻ Thống kê (Stats Cards)**: Hiển thị dạng Grid.
  - Mobile: 3 cột (`grid-cols-3`).
  - Desktop: 7 hoặc 4 cột (`lg:grid-cols-7` hoặc `lg:grid-cols-4`).
  - Khoảng cách (gap): `gap-3 md:gap-4`.
- **Thanh công cụ (Filter/Search Bar)**: Flexbox (`flex flex-wrap items-center justify-between gap-4`), bọc trong khung màu trắng (`bg-white rounded-2xl shadow-sm p-4`).
- **Bảng dữ liệu (Data Table)**:
  - Bản thân component `DataTable` đã có sẵn wrapper màu trắng, viền và shadow riêng biệt.
  - **KHÔNG** bọc `DataTable` bằng thẻ div có nền trắng (`bg-white`), viền (`border`) hay bóng đổ (`shadow`). Việc bọc thêm sẽ khiến phần phân trang (pagination) hiển thị lỗi nền trắng không mong muốn.
  - Chỉ nên dùng `div` trong suốt để điều chỉnh layout (VD: `transition-all duration-500 pb-0`).

## 2. Màu sắc (Colors)
Trang web sử dụng màu sắc khá rực rỡ và có độ tương phản cao:
- **Màu chủ đạo (Primary)**: Xanh dương (Blue - `blue-600`, `blue-500`, `blue-50`). Dùng cho tiêu đề, icon chính.
- **Màu nhấn (Secondary/Action)**: Cam (Orange - `orange-600`, `orange-50`). Dùng cho các nút hành động quan trọng (Lưu, Cập nhật).
- **Màu trạng thái**:
  - *Chờ xác nhận/Chưa thanh toán*: Amber (`amber-500`, `amber-700`).
  - *Đã xác nhận/Đang xử lý*: Blue/Cyan (`blue-600`, `cyan-600`).
  - *Thành công/Hoàn thành*: Green (`green-600`).
  - *Hủy/Lỗi*: Red (`red-600`).
- **Màu nền (Backgrounds)**: 
  - Nền chính trang: Thường là xám rất nhạt hoặc trắng.
  - Nền khối nội dung phụ (Card con): Xám nhạt (`bg-gray-50`).
- **Màu chữ (Text)**:
  - Text chính/Tiêu đề: `text-gray-900`.
  - Text phụ/Mô tả/Nhãn: `text-gray-600` hoặc `text-gray-500`.

## 3. Nút bấm (Buttons)
- **Nút hành động chính (Primary Button)**: 
  - Thường dùng màu Cam (`bg-orange-600 hover:bg-orange-700`).
  - Bo góc sâu (`!rounded-2xl` hoặc `!rounded-xl`).
  - Chữ in hoa, cực đậm, siêu nhỏ, khoảng cách chữ lớn (`font-black uppercase text-[10px] tracking-widest text-white`).
  - Thường đi kèm đổ bóng cùng tone màu (`shadow-md shadow-orange-100`).
- **Nút hành động phụ (Secondary/Outline)**:
  - Dùng `variant="outline"` hoặc nền xám (`bg-gray-500 text-white`).
  - Bo góc giống nút chính (`!rounded-2xl`).
- **Nút Icon (Icon Button)**:
  - Hình vuông bo tròn (`w-10 h-10 rounded-2xl`).
  - Nền nhạt, text đậm, đổi màu toàn bộ khi hover (VD: `bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white`).

## 4. Form & Input
- **Khung Input/Select chung**:
  - Bo góc nhiều (`rounded-xl` hoặc `rounded-2xl`).
  - Viền mỏng (`border border-gray-200`).
  - Font chữ đậm (`text-sm font-bold`).
- **Thanh tìm kiếm (Search Bar)**:
  - Đặt trong nền xám nhạt (`bg-gray-50/50`).
  - Chữ in hoa, đậm, bo góc cực sâu (`!rounded-2xl font-bold uppercase tracking-tight`).
- **Nhãn (Label)**:
  - Rất nhỏ, in hoa, in đậm (`text-[10px] font-black uppercase text-gray-500 block mb-1`).

## 5. Modal (Dialog)
Các cửa sổ popup (Modal) có thiết kế rất đồng nhất:
- **Cấu hình chung**: Dùng component `<Dialog noPadding={true}>` để tự custom padding. Các kích thước: `sm`, `lg`, `xl`.
- **Header Modal**:
  - Flexbox gồm Icon (trái) và Text (phải).
  - Icon nằm trong khung vuông bo tròn, nền trong suốt 10% (VD: `w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600`).
  - Tiêu đề chính đậm, tiêu đề phụ nhỏ (`text-xs text-gray-600`).
- **Body Modal**:
  - Scroll dọc với custom scrollbar (`max-h-[75vh] overflow-y-auto custom-scrollbar`).
  - Chia nhỏ thành các khu vực (Section). Mỗi Section có Header riêng gồm Icon tròn (VD: `w-10 h-10 rounded-3xl`) và Tiêu đề in hoa (`text-sm font-bold uppercase`).
  - Các ô nhập liệu hoặc hiển thị thông tin được bọc trong các Card nhỏ có nền xám (`bg-gray-50`), viền bo tròn (`rounded-2xl border border-gray-300`) và padding (`p-3` đến `p-5`).
- **Footer Modal**: Căn phải (`justify-end`) với Nút Hủy (xám hoặc outline) và Nút Lưu (màu chủ đạo, bo tròn, in hoa).

## 6. Typography (Kiểu chữ)
Giao diện tận dụng mạnh mẽ các lớp CSS của Tailwind về Font:
- **Độ đậm**: Ít dùng regular, lạm dụng `font-black` (cực đậm 900) và `font-bold` (đậm 700) tạo sự rõ ràng.
- **In hoa & Khoảng cách**: Lạm dụng `uppercase` kết hợp với dãn chữ (`tracking-widest` hoặc `tracking-[0.15em]`) cho nhãn, tiêu đề phụ, trạng thái, và nút bấm.
- **Kích thước**: Tương phản mạnh giữa Label (rất nhỏ `text-[10px]`) và Value (vừa/lớn `text-base` hoặc `text-xl`).

## 7. Các thành phần UI đặc trưng khác
- **Badges/Chips (Nhãn trạng thái)**:
  - Hình viên thuốc (`rounded-full` hoặc `rounded-2xl`).
  - Chữ siêu nhỏ, cực đậm, in hoa (`text-[10px] font-black uppercase tracking-widest text-white`).
  - Thường có viền mờ (`border border-white/20`) và bóng đổ (`shadow-md`).
- **Shadows (Bóng đổ)**: Ít dùng bóng xám chuẩn. Thay vào đó, dùng bóng có màu tiệp với màu của thành phần (VD: `shadow-orange-100`, `shadow-blue-50`).
- **Hover Effects**: Các thẻ (card) hoặc hàng của bảng thường có hiệu ứng phóng to hoặc nổi lên khi hover (`hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500`).
- **Hiệu ứng dòng thời gian (Timeline)**: Áp dụng đường viền dọc (`before:w-[2px] before:bg-blue-100`) kết hợp các chấm tròn (dot) cho phần lịch sử.
