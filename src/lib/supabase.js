/**
 * src/lib/supabase.js
 * Compatibility layer - re-exports server-side Supabase client
 * 
 * ⚠️ IMPORTANT: This file exports the SERVER version (includes SUPABASE_SERVICE_ROLE_KEY)
 * 
 * Usage:
 * - ✅ API Routes / Server Components: Use this file (backward compatibility)
 * - ✅ Client Components: Use @/lib/supabase-client instead
 * 
 * This file maintains backward compatibility with existing API routes and server components.
 * Client components should import from @/lib/supabase-client to avoid bundling server code.
 */

// Re-export clients from supabase-server
export { default, supabaseAdmin } from './supabase-server';

// Re-export helper functions from supabase-helpers
export { checkSupabaseAdmin, checkSupabase } from './supabase-helpers';
