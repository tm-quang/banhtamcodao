// src/lib/slugify.js
export function slugify(str) {
    if (!str) return '';
    str = str.toString().toLowerCase().trim();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Bỏ dấu
    str = str.replace(/[đĐ]/g, 'd'); // Thay chữ Đ/đ
    str = str.replace(/[^a-z0-9\s-]/g, ''); // Bỏ các ký tự đặc biệt
    str = str.replace(/[\s_-]+/g, '-'); // Thay khoảng trắng, gạch dưới bằng gạch ngang
    str = str.replace(/^-+|-+$/g, ''); // Bỏ gạch ngang ở đầu và cuối
    return str;
}