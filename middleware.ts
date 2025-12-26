import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/db/server';

export async function middleware(req: NextRequest) {
  // Only apply to API routes that modify data (simulating protection)
  if (req.nextUrl.pathname.startsWith('/api/orders')) {
      const supabase = await createClient(); // Middleware Supabase client might differ, but assuming standard here or using simple fetch

      // In real middleware, we might need a direct DB call or a cached list.
      // Since middleware has limitations on some Node APIs, and Supabase client works in edge...
      // Let's assume we can check blacklist.

      // Get Client IP
      const ip = req.headers.get('x-forwarded-for') || 'unknown';

      // Check if IP is shadow banned
      // Note: In a real high-scale app, use Redis/Edge Config.
      // Here we query Supabase (might add latency).
      const { data: entry } = await supabase
        .from('blacklists')
        .select('shadow_banned')
        .eq('ip_address', ip)
        .single();

      if (entry?.shadow_banned) {
          // SHADOW BAN: Return Success but DO NOTHING
          return NextResponse.json({
              success: true,
              message: "Order placed successfully!",
              orderId: "fake-" + Math.random().toString(36)
          });
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/orders/:path*',
};
