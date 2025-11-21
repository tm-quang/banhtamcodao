// src/app/sitemap.js
import pool from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // Dynamic product pages
    const [productRows] = await pool.execute(
      'SELECT slug, updated_at FROM products WHERE status = ?',
      ['active']
    );

    const productPages = productRows.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    // Nếu database không có hoặc lỗi, chỉ trả về static pages
    console.error('Error generating sitemap:', error.message);
    // Trong production, có thể log vào monitoring service
    return staticPages;
  }
}

