# Performance Optimization Guide

## Image Optimization

### Use Next-Gen Formats
```html
<!-- Instead of: -->
<img src="/image.png">

<!-- Use: -->
<picture>
  <source srcset="/image.avif" type="image/avif">
  <source srcset="/image.webp" type="image/webp">
  <img src="/image.png" alt="Description" loading="lazy" decoding="async">
</picture>
```

### Lazy Loading
```html
<!-- Images below the fold -->
<img src="/country-flag.webp" alt="Germany flag" loading="lazy" decoding="async">

<!-- Critical images (above the fold) — do NOT lazy load -->
<img src="/hero-image.webp" alt="Hero" fetchpriority="high">
```

### Responsive Images
```html
<img
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  src="/hero-800.webp"
  alt="Migration guide hero"
>
```

## Font Optimization
```html
<!-- Preload critical fonts -->
<link rel="preload" as="font" type="font/woff2" href="/fonts/main.woff2" crossorigin>

<!-- Use font-display: swap -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/main.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

## Code Splitting (React/Next.js)
```tsx
import { lazy, Suspense } from 'react';

const CostOfLiving = lazy(() => import('./pages/CostOfLiving'));
const AIAdvisor = lazy(() => import('./pages/AIAdvisor'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/cost-of-living" element={<CostOfLiving />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
      </Routes>
    </Suspense>
  );
}
```

## Caching Headers
```nginx
# Static assets — cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|webp|avif|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML pages — no cache or short cache
location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate";
}

# API responses — short cache
location /api/ {
    add_header Cache-Control "private, max-age=60";
}
```

## Preload Critical Resources
```html
<head>
  <!-- Preload LCP image -->
  <link rel="preload" as="image" href="/hero-image.webp">

  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- DNS prefetch for analytics -->
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
</head>
```

## Core Web Vitals Targets
| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| INP | < 200ms | Interaction to Next Paint |
| FCP | < 1.8s | First Contentful Paint |
| TTFB | < 800ms | Time to First Byte |
