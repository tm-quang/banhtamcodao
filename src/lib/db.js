// src/lib/db.js
import mysql from 'mysql2/promise';

// Chỉ tạo pool nếu có đủ env vars
let pool = null;

if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    // Thêm SSL cho production nếu cần
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    Promise: global.Promise
  });
} else {
  // Tạo pool giả để tránh lỗi khi import, nhưng sẽ fail khi sử dụng
  console.warn('Database environment variables not set. Database operations will fail.');
}

export default pool;