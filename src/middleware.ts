import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/reset-password'];

// role -> the base path their dashboard lives under
const ROLE_HOME: Record<string, string> = {
  admin: '/dashboard',
  manager: '/dashboard',
  driver: '/driver',
  customer: '/track',
};

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const home = ROLE_HOME[profile?.role ?? 'customer'] ?? '/track';
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Role-guard the driver and admin/manager areas
  if (user && (pathname.startsWith('/driver') || pathname.startsWith('/dashboard'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role;

    if (pathname.startsWith('/driver') && role !== 'driver') {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role ?? 'customer'] ?? '/login';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/dashboard') && role !== 'admin' && role !== 'manager') {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role ?? 'customer'] ?? '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
