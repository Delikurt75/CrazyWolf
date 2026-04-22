# Site Bug Report — tengrikezgenkocer.com

Analyzed on 2026-04-22. All bugs found by auditing the live production site.

---

## BUG 1 — Main page shows blank content on initial render (SSR/hydration failure)

**Severity:** Critical  
**URL:** https://tengrikezgenkocer.com/

**What happens:**  
The raw HTML returned by the server contains only a skeleton header and an empty `<div class="min-h-dvh bg-slate-950"></div>` inside `<main>`. All actual page content (hero section, features, popular destinations, stats) is missing from the server-rendered HTML. The React payload delivered via inline `<script>` tags contains `d:null` for the page data, meaning the page module renders nothing on the server.

**Root cause:**  
The `page-7694f3d0.js` chunk is loaded with `async` but the initial RSC (React Server Component) payload (`d:null`) carries no rendered output. This is a classic case of a Next.js App Router page that relies entirely on client-side JavaScript. If JS is disabled or slow to load, users see a completely blank page.

**Fix:**  
Convert the homepage to use proper Server Components or add `loading.tsx` / `Suspense` boundaries. Ensure `generateMetadata` and any data-fetching calls happen server-side so the initial HTML is populated.

---

## BUG 2 — `manifest.json` route returns the Login page instead of a JSON manifest

**Severity:** Critical (breaks PWA installation)  
**URL:** https://tengrikezgenkocer.com/manifest.json

**What happens:**  
A `GET /manifest.json` request returns an HTTP 200 with HTML login-page content instead of a valid Web App Manifest JSON file. The `<head>` in `layout.tsx` declares:

```html
<link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
```

The browser will try to install this as a PWA and fail silently; Android Chrome and Safari will not add a home-screen icon.

**Root cause:**  
A middleware (or route authentication guard) is intercepting `/manifest.json` and redirecting unauthenticated requests to `/login`. Static/public files like `manifest.json` must be excluded from auth middleware.

**Fix:**  
In `middleware.ts` (or equivalent), add `/manifest.json` to the public-paths allowlist:

```ts
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|manifest\\.json|icons/|og-image\\.png|robots\\.txt).*)',
  ],
};
```

Also verify that `public/manifest.json` actually exists in the repository.

---

## BUG 3 — `og-image.png` returns the Login page (broken Open Graph / social previews)

**Severity:** High  
**URL:** https://tengrikezgenkocer.com/og-image.png

**What happens:**  
`GET /og-image.png` returns an HTTP 200 with HTML login content. Both `og:image` and `twitter:image` meta tags point to this URL:

```html
<meta property="og:image" content="https://tengrikezgenkocer.com/og-image.png" />
<meta name="twitter:image" content="https://tengrikezgenkocer.com/og-image.png" />
```

Sharing any page on Twitter, LinkedIn, Slack, etc. will show a broken/missing preview card.

**Root cause:** Same auth-middleware interception as Bug 2.

**Fix:** Add `og-image.png` (and all image/static assets in the `public/` folder) to the middleware public-paths allowlist (see Fix in Bug 2).

---

## BUG 4 — `sitemap.xml` returns HTTP 404 (SEO harm)

**Severity:** High  
**URL:** https://tengrikezgenkocer.com/sitemap.xml

**What happens:**  
The URL returns a 404. Google Search Console and other crawlers expect a sitemap to help index all pages. Without it, important pages may not be discovered.

**Fix:**  
Add a Next.js App Router sitemap using the built-in convention (`app/sitemap.ts`):

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://tengrikezgenkocer.com';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/cost-of-living`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    // Add remaining public routes …
  ];
}
```

---

## BUG 5 — Duplicate meta tags in `<head>` (SEO / browser warnings)

**Severity:** Medium  
**What happens:**  
The following meta tags appear **twice** in the rendered `<head>`:

| Tag | Value |
|-----|-------|
| `apple-mobile-web-app-capable` | `yes` |
| `apple-mobile-web-app-status-bar-style` | `black-translucent` |

Duplicate meta tags can confuse crawlers and cause validation warnings.

**Fix:**  
In `layout.tsx`, remove the duplicate `metadata` export entries:

```ts
// layout.tsx — metadata export (keep only one copy of each key)
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,            // renders apple-mobile-web-app-capable once
    statusBarStyle: 'black-translucent',  // renders status-bar-style once
    title: 'TKK',
  },
  // …
};
```

---

## BUG 6 — `robots.txt` has no `Sitemap:` directive and no crawl rules

**Severity:** Medium  
**URL:** https://tengrikezgenkocer.com/robots.txt

**What happens:**  
The current `robots.txt` contains only license/copyright boilerplate about content-signal conventions. It has no `User-agent` or `Disallow` rules and no `Sitemap:` pointer. Crawlers that encounter this file get no guidance.

**Fix:**  
Replace (or append to) `public/robots.txt`:

```
User-agent: *
Allow: /

# Block private/auth routes from crawlers
Disallow: /login
Disallow: /signup
Disallow: /find-country
Disallow: /ai-advisor
Disallow: /visa-migration
Disallow: /healthcare
Disallow: /disability-rights
Disallow: /travel-compare

Sitemap: https://tengrikezgenkocer.com/sitemap.xml
```

---

## BUG 7 — All protected feature pages require login but show no friendly gate or description

**Severity:** Medium (UX)  
**Affected URLs:**  
- `/find-country`  
- `/ai-advisor`  
- `/visa-migration`  
- `/healthcare`  
- `/disability-rights`  
- `/travel-compare`

**What happens:**  
Every one of these pages redirects immediately to the plain login form with no context. A visitor arriving from a search result or link has no idea why they're seeing a login screen or what value the page holds.

**Fix:**  
Add a public "preview/gate" page (or a middleware that appends `?redirect=/original-path` to the login URL) and show a brief description of the feature with a CTA before the login form:

```ts
// middleware.ts — preserve intended destination
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
return NextResponse.redirect(loginUrl);
```

Then in the login page, after successful auth, redirect to `searchParams.redirect ?? '/'`.

---

## BUG 8 — `html` element language is hard-coded as `lang="en"` while site content is bilingual

**Severity:** Low (accessibility / i18n)  
**What happens:**  
The `<html lang="en">` attribute is fixed in `layout.tsx`, but the site displays both Turkish (`Göç, Yerleşim & Yaşam Rehberi`) and English content. Screen readers and translation tools will incorrectly identify all text as English.

**Fix:**  
Either set `lang="tr"` if Turkish is the primary language, use i18n routing (`/en/`, `/tr/`), or set the lang attribute dynamically based on the active locale.

---

## BUG 9 — External script loaded with both `async` and `defer` (redundant/incorrect)

**Severity:** Low (correctness)  
**What happens:**  
The Abacus AI script is loaded as:

```html
<script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async="" defer=""></script>
```

`async` and `defer` are mutually exclusive. When both are present, `async` takes precedence and `defer` is ignored. The `defer` attribute is superfluous.

**Fix:**  
Remove `defer` from the script tag in `layout.tsx`:

```tsx
<script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async />
```

---

## Summary Table

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🔴 Critical | Homepage blank without JavaScript (SSR missing) |
| 2 | 🔴 Critical | `/manifest.json` returns Login HTML — PWA broken |
| 3 | 🟠 High | `/og-image.png` returns Login HTML — social previews broken |
| 4 | 🟠 High | `/sitemap.xml` returns 404 — SEO hurt |
| 5 | 🟡 Medium | Duplicate `apple-mobile-web-app-*` meta tags |
| 6 | 🟡 Medium | `robots.txt` has no crawl rules or Sitemap pointer |
| 7 | 🟡 Medium | Protected pages redirect to login with no context or redirect-back |
| 8 | 🟢 Low | `<html lang="en">` while site is bilingual |
| 9 | 🟢 Low | External script has both `async` and `defer` attributes |
