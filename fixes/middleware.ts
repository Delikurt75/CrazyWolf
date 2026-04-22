import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * List of paths that are always publicly accessible — no auth redirect.
 * Includes static assets, PWA manifest, OG image, robots, and other public
 * files that must never be intercepted by the auth guard.
 */
const PUBLIC_PATH_PREFIXES = [
  '/_next/',
  '/icons/',
  '/favicon.svg',
  '/manifest.json',
  '/og-image.png',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Public page routes (not behind auth).
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/cost-of-living'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check for an auth session cookie (replace 'session' with your actual cookie name)
  const session = request.cookies.get('session')?.value;
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so the login page can redirect back
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.svg, manifest.json, og-image.png, icons/, robots.txt, sitemap.xml
     */
    '/((?!_next/static|_next/image|favicon\\.svg|manifest\\.json|og-image\\.png|icons/|robots\\.txt|sitemap\\.xml).*)',
  ],
};
