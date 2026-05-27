# Auth Guard Fix — Critical Issue

## Problem
Currently, ALL internal pages redirect to the login page, even pages that should be publicly accessible. When a user clicks "Find the Best Country for You" on the homepage, they get a login wall instead of seeing the feature.

## Pages That MUST Be Public (No Auth Required)

| Page | Reason |
|------|--------|
| `/` | Homepage — already public |
| `/about` | Company information — must be public for trust |
| `/contact` | Contact page — must be public |
| `/privacy` | Privacy policy — legally required to be public (GDPR/KVKK) |
| `/terms` | Terms of service — legally required to be public |
| `/signup` | Registration — already public |
| `/login` | Login — already public |
| `/cost-of-living` | Should show a preview/demo with signup prompt |

## Pages That Should Have Public Preview + Auth Gate

| Page | Public Content | Auth-Gated Content |
|------|---------------|-------------------|
| `/find-country` | Show the questionnaire UI | Require login for results |
| `/ai-advisor` | Show feature description + demo | Require login for actual chat |
| `/healthcare` | Show overview + 1-2 sample countries | Full data requires login |
| `/visa` | Show overview + process outline | Detailed guides require login |
| `/disability-rights` | Show overview | Full data requires login |
| `/travel-compare` | Show comparison UI | Require login for full results |

## Pages That Should Require Full Auth

| Page | Reason |
|------|--------|
| `/dashboard` | User-specific data |
| `/account` | Account management |
| `/settings` | User preferences |
| `/profile` | User profile |

## Implementation Fix

### If using Next.js Middleware:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/signup',
  '/cost-of-living',
  '/find-country',
  '/ai-advisor',
  '/healthcare',
  '/visa',
  '/disability-rights',
  '/travel-compare',
];

const AUTH_REQUIRED_ROUTES = [
  '/dashboard',
  '/account',
  '/settings',
  '/profile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const token = request.cookies.get('auth-token')?.value;
  if (!token && AUTH_REQUIRED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### If using React Router:
```tsx
// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

const PUBLIC_ROUTES = [
  '/', '/about', '/contact', '/privacy', '/terms',
  '/login', '/signup', '/cost-of-living', '/find-country',
  '/ai-advisor', '/healthcare', '/visa', '/disability-rights',
  '/travel-compare',
];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
}
```

### If using Vue Router:
```typescript
// router/index.ts
router.beforeEach((to, from, next) => {
  const publicRoutes = [
    '/', '/about', '/contact', '/privacy', '/terms',
    '/login', '/signup', '/cost-of-living', '/find-country',
    '/ai-advisor', '/healthcare', '/visa', '/disability-rights',
    '/travel-compare',
  ];

  const isPublicRoute = publicRoutes.some(
    route => to.path === route || to.path.startsWith(route + '/')
  );

  if (isPublicRoute) {
    next();
    return;
  }

  const isAuthenticated = store.getters['auth/isAuthenticated'];
  if (!isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  next();
});
```
