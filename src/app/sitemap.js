/**
 * Sitemap generator
 * @file src/app/sitemap.js
 */
import supabase from '@/lib/supabase';

export const dynamic = 'force-dynamic';
/** Revalidate every hour */
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3300');

  /** Static pages */
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    // Dynamic product pages from Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'active');

    if (error) throw error;

    const productPages = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error.message);
    return staticPages;
  }
}

