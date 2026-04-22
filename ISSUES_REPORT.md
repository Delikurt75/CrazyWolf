# Tengri Kezgen Köçer — Site Sorunları Raporu

**Tarih:** 22 Nisan 2026  
**Site:** https://tengrikezgenkocer.com/  
**Tech Stack:** Next.js (App Router), Tailwind CSS, Cloudflare CDN

---

## 🔴 KRİTİK SORUNLAR

### 1. Middleware Auth Redirect — Statik Dosyalar Login'e Yönleniyor

**Sorun:** `favicon.svg`, `manifest.json`, `og-image.png`, `/icons/*` gibi public statik dosyalar login sayfasına yönlendiriliyor (HTTP 307). Bu, Next.js middleware'inin tüm istekleri auth kontrolüne tabi tutması ve statik dosyaları hariç tutmamasından kaynaklanıyor.

**Etkilenen dosyalar:**
- `/favicon.svg` → 307 redirect → `/login?callbackUrl=%2Ffavicon.svg`
- `/manifest.json` → 307 redirect → `/login?callbackUrl=%2Fmanifest.json`
- `/og-image.png` → 307 redirect → `/login?callbackUrl=%2Fog-image.png`
- `/icons/icon-192.png` → 307 redirect
- `/icons/icon-512.png` → 307 redirect
- `/icons/apple-touch-icon.png` → 307 redirect

**Sonuçları:**
- Tarayıcı sekmesinde favicon görünmüyor
- PWA yüklenemiyor (manifest erişilemiyor)
- Sosyal medyada paylaşımlarda OG görseli çıkmıyor (Twitter, Facebook, LinkedIn kartları bozuk)
- Apple cihazlarda ana ekrana ekleme düzgün çalışmıyor

**Çözüm:** `middleware.ts` dosyasında statik dosyaları hariç tutun — bkz. `middleware.ts` düzeltmesi aşağıda.

---

### 2. robots.txt Eksik — HTTP 404

**Sorun:** `/robots.txt` dosyası 404 döndürüyor. Arama motorları siteyi düzgün tarayamıyor.

**Sonuçları:**
- Google, Bing ve diğer arama motorları siteyi tam olarak indeksleyemiyor
- SEO performansı ciddi şekilde düşüyor
- Arama motorları siteyi "düzgün yapılandırılmamış" olarak değerlendirebilir

**Çözüm:** `public/robots.txt` veya Next.js App Router `app/robots.ts` dosyası oluşturun.

---

### 3. sitemap.xml Eksik — HTTP 404

**Sorun:** `/sitemap.xml` dosyası 404 döndürüyor.

**Sonuçları:**
- Arama motorları tüm sayfaları keşfedemiyor
- Yeni eklenen sayfalar indekslenmekte gecikebilir
- Google Search Console'da sitemap hatası gösterilir

**Çözüm:** `app/sitemap.ts` dosyası oluşturun.

---

## 🟠 ORTA ÖNCELİKLİ SORUNLAR

### 4. Yinelenen Meta Etiketleri

**Sorun:** HTML'de aynı meta etiketleri birden fazla kez yer alıyor:

```
apple-mobile-web-app-capable → 2 kez
apple-mobile-web-app-status-bar-style → 2 kez
```

**Sonuçları:**
- HTML doğrulama (W3C validator) hataları
- Bazı tarayıcılar beklenmedik davranış gösterebilir

**Çözüm:** `layout.tsx` dosyasındaki metadata nesnesinde yinelenen etiketleri kaldırın.

---

### 5. `og:url` Meta Etiketi Eksik

**Sorun:** Open Graph meta etiketleri arasında `og:url` yok.

**Sonuçları:**
- Facebook ve LinkedIn paylaşımlarında canonical URL belirsiz
- Paylaşım kartlarında yanlış URL gösterilebilir

**Çözüm:** Metadata'ya `og:url` ekleyin:
```tsx
openGraph: {
  url: 'https://tengrikezgenkocer.com',
  // ... diğer alanlar
}
```

---

### 6. Canonical URL Eksik

**Sorun:** Sayfada `<link rel="canonical">` etiketi yok.

**Sonuçları:**
- Duplicate content sorunu oluşabilir (www vs non-www, http vs https)
- SEO sıralamasında olumsuz etki

**Çözüm:** Metadata'ya canonical URL ekleyin:
```tsx
alternates: {
  canonical: 'https://tengrikezgenkocer.com',
}
```

---

### 7. Header'da Logo Placeholder (Animate-Pulse)

**Sorun:** Header'daki logo alanı `animate-pulse` class'ı ile skeleton/loading durumunda gösteriliyor:
```html
<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 animate-pulse shrink-0"></div>
```

**Sonuçları:**
- Kullanıcı siteye girdiğinde logo yerine sürekli yanıp sönen gri bir daire görüyor
- Profesyonellik algısını düşürüyor
- Branding eksikliği

**Çözüm:** Gerçek bir logo/ikon SVG koyun veya en azından text-based bir logo kullanın.

---

### 8. İçerik Alanı Başlangıçta Boş (Hydration Sorunu)

**Sorun:** Sunucu tarafında render edilen HTML'de ana içerik alanı boş:
```html
<main class="flex-1 min-w-0 ...">
  <div class="min-h-dvh bg-slate-950"></div>
</main>
```
Tüm gerçek içerik client-side JavaScript ile yükleniyor.

**Sonuçları:**
- JavaScript devre dışı olan kullanıcılar boş sayfa görüyor
- SEO botları (Google dışında) sayfayı boş olarak algılıyor
- First Contentful Paint (FCP) gecikiyor
- CLS (Cumulative Layout Shift) yüksek

**Çözüm:** Server Components kullanarak içeriğin sunucu tarafında da render edilmesini sağlayın.

---

## 🟡 DÜŞÜK ÖNCELİKLİ / İYİLEŞTİRME ÖNERİLERİ

### 9. `twitter:site` ve `twitter:creator` Eksik

**Sorun:** Twitter Card meta etiketlerinde site ve creator bilgisi yok.

**Çözüm:**
```tsx
twitter: {
  site: '@tengrikezgenkocer',
  creator: '@tengrikezgenkocer',
}
```

---

### 10. Structured Data (JSON-LD) Eksik

**Sorun:** Sayfada hiçbir JSON-LD schema markup'ı yok.

**Sonuçları:**
- Google zengin sonuçlarında (rich snippets) görünmüyor
- Site hakkında arama motorlarına yapısal bilgi verilmiyor

**Çözüm:** `WebSite`, `Organization` ve `WebApplication` schema'ları ekleyin.

---

### 11. Hreflang Eksik (Çok Dilli Site İçin)

**Sorun:** Site hem Türkçe hem İngilizce içerik barındırıyor ama `hreflang` etiketleri yok.

**Sonuçları:**
- Google hangi dilin hangi kullanıcıya gösterilmesi gerektiğini bilmiyor
- Arama sonuçlarında yanlış dildeki sayfa gösterilebilir

---

### 12. Cache-Control Header'ları Eksik

**Sorun:** Ana sayfa `no-cache, no-store` ile sunuluyor. Statik varlıklar için bile cache yok.

**Sonuçları:**
- Her ziyarette her şey yeniden yükleniyor
- Performans kaybı
- Cloudflare CDN tam verimle kullanılamıyor

---

### 13. CSP (Content Security Policy) Header Eksik

**Sorun:** İçerik güvenlik politikası header'ı yok.

**Sonuçları:**
- XSS saldırılarına karşı koruma yetersiz
- Üçüncü parti script'ler (`apps.abacus.ai`) kontrol dışı

---

### 14. Accessibility (Erişilebilirlik) Eksiklikleri

**Sorun (HTML analizi):**
- Navigation menüsü `<nav>` yerine `<header>` içinde düz div'lerle yapılmış
- Navigasyon linkleri hamburger menü veya dropdown olarak belirtilmemiş
- `aria-label` eksiklikleri olabilir
- Skip navigation linki yok

---

## MIDDLEWARE DÜZELTME ÖNERİSİ

`middleware.ts` dosyasında şu config'i ekleyin:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth kontrolü mantığınız burada...
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicons)
     * - public folder files (images, icons, manifest, etc.)
     * - robots.txt, sitemap.xml
     * - og-image.png
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|og-image\\.png|icons/.*|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
```

---

## ÖZET TABLO

| # | Sorun | Önem | Durum |
|---|-------|------|-------|
| 1 | Statik dosyalar login'e yönleniyor (middleware) | 🔴 Kritik | Düzeltilmeli |
| 2 | robots.txt yok (404) | 🔴 Kritik | Oluşturulmalı |
| 3 | sitemap.xml yok (404) | 🔴 Kritik | Oluşturulmalı |
| 4 | Yinelenen meta etiketleri | 🟠 Orta | Düzeltilmeli |
| 5 | og:url meta etiketi eksik | 🟠 Orta | Eklenmeli |
| 6 | Canonical URL eksik | 🟠 Orta | Eklenmeli |
| 7 | Logo placeholder (animate-pulse) | 🟠 Orta | Logo eklenmeli |
| 8 | İçerik client-side rendering | 🟠 Orta | SSR uygulanmalı |
| 9 | twitter:site/creator eksik | 🟡 Düşük | Eklenmeli |
| 10 | JSON-LD schema eksik | 🟡 Düşük | Eklenmeli |
| 11 | Hreflang eksik | 🟡 Düşük | Eklenmeli |
| 12 | Cache-Control optimizasyonu | 🟡 Düşük | Ayarlanmalı |
| 13 | CSP header eksik | 🟡 Düşük | Eklenmeli |
| 14 | Accessibility eksiklikleri | 🟡 Düşük | İyileştirilmeli |
