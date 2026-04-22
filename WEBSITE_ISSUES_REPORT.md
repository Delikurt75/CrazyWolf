# tengrikezgenkocer.com — Kapsamlı Sorun Raporu

**Tarih:** 22 Nisan 2026  
**Site:** https://tengrikezgenkocer.com/  
**Teknoloji:** Next.js (App Router) / Cloudflare / Tailwind CSS  

---

## Özet

Aşağıda tespit edilen tüm sorunlar **Kritik**, **Yüksek**, **Orta** ve **Düşük** olarak önem derecelerine göre sıralanmıştır.

---

## 🔴 KRİTİK SORUNLAR

### 1. `manifest.json` Login Sayfasına Yönlendiriliyor (PWA Kırık)

**Sorun:** `/manifest.json` adresine istek atıldığında, auth middleware tarafından yakalanıp `/login?callbackUrl=%2Fmanifest.json` sayfasına yönlendiriliyor. Bu, PWA (Progressive Web App) kurulumunu tamamen kırıyor.

**Etki:** 
- Kullanıcılar siteyi ana ekrana ekleyemiyor
- Service Worker kayıt hatası oluşuyor
- Lighthouse PWA skoru 0

**Çözüm:** Auth middleware'de `/manifest.json` yolu public path olarak tanımlanmalı:
```typescript
// middleware.ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.svg|manifest.json|icons|og-image.png|logo.jpeg|robots.txt).*)'],
};
```

---

### 2. `sitemap.xml` 404 Döndürüyor (SEO Felaketi)

**Sorun:** `/sitemap.xml` isteği 404 sayfası döndürüyor. Sitemap dosyası ya oluşturulmamış ya da Next.js tarafından sunulmuyor.

**Etki:**
- Google ve diğer arama motorları sayfaları indeksleyemiyor
- SEO performansı ciddi şekilde düşük
- Google Search Console'da "sitemap bulunamadı" hatası

**Çözüm:** Next.js App Router'da `app/sitemap.ts` dosyası oluşturulmalı:
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://tengrikezgenkocer.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://tengrikezgenkocer.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://tengrikezgenkocer.com/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
```

---

### 3. `robots.txt` İçeriği Eksik — Crawl Kuralları ve Sitemap Linki Yok

**Sorun:** `/robots.txt` dosyası yalnızca content-signal meta bilgileri içeriyor. Standart `User-agent`, `Allow`, `Disallow` ve `Sitemap` direktifleri tamamen eksik.

**Etki:**
- Arama motorları hangi sayfaları tarayabileceklerini bilemiyor
- Sitemap URL'si robots.txt üzerinden keşfedilemiyor
- Login ve signup gibi private sayfalar indekslenebilir

**Çözüm:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /login
Disallow: /signup

Sitemap: https://tengrikezgenkocer.com/sitemap.xml
```

---

## 🟠 YÜKSEK ÖNEMLİ SORUNLAR

### 4. `<html lang="en">` — Dil Kodu Yanlış

**Sorun:** Site içeriği Türkçe olmasına rağmen HTML `lang` attribute'u `"en"` (İngilizce) olarak ayarlanmış.

**Etki:**
- Ekran okuyucular (screen readers) içeriği İngilizce olarak okumaya çalışıyor — erişilebilirlik sorunu
- Arama motorları sitenin dilini yanlış algılıyor
- Google hreflang uyumsuzluğu

**Çözüm:** `layout.tsx` içinde:
```tsx
<html lang="tr">
```

---

### 5. Yinelenen Meta Etiketleri (Duplicate Meta Tags)

**Sorun:** Aşağıdaki meta etiketler HTML'de birden fazla kez tekrarlanıyor:
- `apple-mobile-web-app-capable` → **2 kez** tanımlanmış
- `apple-mobile-web-app-status-bar-style` → **2 kez** tanımlanmış (`black-translucent`)

**Etki:**
- HTML doğrulama (W3C validator) hataları
- Tarayıcılar arası tutarsız davranış
- Gereksiz HTML boyut artışı

**Çözüm:** `layout.tsx` metadata objesinde yinelenen etiketler kaldırılmalı. Her bir meta etiketi yalnızca bir kez tanımlanmalı.

---

### 6. Ana Sayfa Boş İçerik (Empty Content Shell)

**Sorun:** Ana sayfanın sunucu tarafından render edilen (SSR) HTML'inde gerçek bir içerik yok. `<main>` elementi yalnızca boş bir `<div class="min-h-dvh bg-slate-950"></div>` içeriyor.

**Etki:**
- JavaScript devre dışı olan kullanıcılar tamamen boş bir sayfa görüyor
- Arama motorları indeksleyecek anlamlı içerik bulamıyor
- First Contentful Paint (FCP) ve Largest Contentful Paint (LCP) değerleri çok yüksek
- Web Vitals puanları düşük

**Çözüm:** Kritik sayfa içeriği sunucu tarafında render edilmeli (Server Components kullanılmalı). En azından hero bölümü, başlık ve açıklama metni SSR ile gelmeli.

---

### 7. Header Logo Alanında Sonsuz Pulse Animasyonu

**Sorun:** Header'daki logo alanı, gerçek bir logo/görsel yüklenmeden sürekli `animate-pulse` (iskelet/loading) animasyonu gösteriyor:
```html
<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 animate-pulse shrink-0"></div>
```

**Etki:**
- Kullanıcıya site sürekli "yükleniyor" hissi veriyor
- Profesyonel olmayan görünüm
- Logo asla yüklenmiyor, loading durumu sonsuza kadar sürüyor

**Çözüm:** Gerçek logo görseli (`/logo.jpeg` gibi) kullanılmalı veya SVG logo eklenmelidir. Pulse animasyonu yalnızca geçici bir loading state olarak kullanılmalı.

---

### 8. Eksik `og:url` Meta Etiketi

**Sorun:** Open Graph meta etiketlerinde `og:url` eksik. Facebook, LinkedIn ve diğer sosyal medya platformları URL'yi doğru tanımlayamıyor.

**Etki:**
- Sosyal medya paylaşımlarında canonical URL belirlenemiyor
- Open Graph doğrulama hataları

**Çözüm:**
```html
<meta property="og:url" content="https://tengrikezgenkocer.com/" />
```

---

### 9. Eksik `og:locale` Meta Etiketi

**Sorun:** Open Graph `og:locale` tanımlanmamış.

**Etki:**
- Sosyal medya platformları içerik dilini otomatik algılayamıyor
- Paylaşımlarda yanlış dilde önizleme gösterilebilir

**Çözüm:**
```html
<meta property="og:locale" content="tr_TR" />
```

---

## 🟡 ORTA ÖNEMLİ SORUNLAR

### 10. `og:title` ve `twitter:title` İçinde HTML Entity (`&amp;`)

**Sorun:** Title meta etiketlerinde `&` yerine `&amp;` kullanılmış:
```
Tengri Kezgen Köçer | Göç, Yerleşim &amp; Yaşam Rehberi
```

**Etki:**
- Bazı sosyal medya platformları entity'i düz metin olarak gösterebilir
- Sosyal paylaşım önizlemelerinde `&amp;` görünmesi

**Çözüm:** Template literal yerine düz string kullanılmalı veya Next.js metadata API'si ile düzgün encode edilmeli.

---

### 11. Eksik Canonical URL Etiketi

**Sorun:** Sayfada `<link rel="canonical">` etiketi bulunmuyor.

**Etki:**
- Duplicate content sorunları (www vs non-www, HTTP vs HTTPS)
- SEO puanı düşüşü

**Çözüm:**
```html
<link rel="canonical" href="https://tengrikezgenkocer.com/" />
```

---

### 12. Cache-Control Header'ı Agresif No-Cache

**Sorun:** Ana sayfa için HTTP response header'ı:
```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```

**Etki:**
- Her sayfa ziyaretinde sunucuya istek gidiyor
- CDN (Cloudflare) cache kullanamıyor
- Sayfa yükleme süreleri gereksiz yüksek
- Sunucu maliyetleri artıyor

**Çözüm:** Statik sayfalar için uygun cache politikaları belirlenmeli:
```
cache-control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200
```

---

### 13. Eksik Yapısal Veri (Structured Data / JSON-LD)

**Sorun:** Sayfada hiçbir Schema.org yapısal verisi (JSON-LD) tanımlanmamış.

**Etki:**
- Google zengin sonuçlarda (rich snippets) görünmüyor
- Arama sonuçlarında düz görünüm
- Knowledge Graph'ta site tanınmıyor

**Çözüm:** En azından `WebSite` ve `Organization` schema'ları eklenmelidir:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Tengri Kezgen Köçer",
  "url": "https://tengrikezgenkocer.com",
  "description": "Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi."
}
```

---

### 14. `Content-Security-Policy: frame-ancestors *` — Güvenlik Riski

**Sorun:** CSP header'da `frame-ancestors *` tüm domainlerin siteyi iframe içinde yüklemesine izin veriyor.

**Etki:**
- Clickjacking saldırılarına açık
- Kötü niyetli siteler, siteyi kendi sayfalarında gömebilir
- Kullanıcı kimlik bilgileri çalınabilir

**Çözüm:**
```
content-security-policy: frame-ancestors 'self' https://apps.abacus.ai
```

---

### 15. `Permissions-Policy` 3. Parti Erişim Kapsamı Geniş

**Sorun:** Camera, microphone ve autoplay izinleri `apps.abacus.ai`, `abacus.ai` ve `chatllm.abacus.ai` domainlerine verilmiş. Bir göç rehberi sitesinin kamera ve mikrofon erişimine ihtiyacı olup olmadığı sorgulanmalı.

**Etki:**
- Gereksiz izin tanımları
- Kullanıcı güvenliği endişeleri
- Privacy audit'lerde kırmızı bayrak

**Çözüm:** Yalnızca gerçekten ihtiyaç duyulan izinler tanımlanmalı. Chatbot kamera/mikrofon kullanmıyorsa kaldırılmalı.

---

### 16. Login Sayfasında CSRF Koruması Görünmüyor

**Sorun:** Login formunda CSRF token gözükmüyor. Form sadece email ve password alanları içeriyor.

**Etki:**
- Cross-Site Request Forgery saldırılarına açık
- Kullanıcı oturumları çalınabilir

**Çözüm:** Server-side CSRF token oluşturulmalı ve her form submit'inde doğrulanmalı.

---

## 🔵 DÜŞÜK ÖNEMLİ SORUNLAR

### 17. `<head>` İçinde `<script>` Etiketi (3. Parti)

**Sorun:** Abacus.ai chatbot scripti `<head>` içinde yükleniyor:
```html
<script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async defer></script>
```

**Etki:**
- `async` ve `defer` birlikte kullanılması gereksiz (async zaten defer'i kapsar)
- 3. parti script render-blocking olabilir

**Çözüm:** Yalnızca `defer` veya `async` kullanılmalı; script `<body>` sonuna taşınabilir.

---

### 18. Font Preload Fazlası

**Sorun:** 6 farklı woff2 font dosyası preload ediliyor, ancak ana sayfada muhtemelen hepsi kullanılmıyor.

**Etki:**
- Gereksiz bandwidth kullanımı
- İlk yükleme süresi artışı
- LCP performansı düşüşü

**Çözüm:** Yalnızca above-the-fold içerikte kullanılan fontlar preload edilmeli.

---

### 19. Eksik `X-Frame-Options` Header'ı

**Sorun:** CSP `frame-ancestors` var ama eski tarayıcılar için `X-Frame-Options` header'ı eksik.

**Etki:**
- Eski tarayıcılarda clickjacking koruması yok

**Çözüm:**
```
X-Frame-Options: SAMEORIGIN
```

---

### 20. Erişilebilirlik: Header'da Skip Navigation Linki Yok

**Sorun:** Sticky header'da "Ana içeriğe geç" (skip to content) linki bulunmuyor.

**Etki:**
- Klavye ile gezinen ve ekran okuyucu kullanan kullanıcılar her sayfa geçişinde header'ı tekrar geçmek zorunda
- WCAG 2.1 Level A ihlali (Guideline 2.4.1)

**Çözüm:**
```html
<a href="#main-content" class="sr-only focus:not-sr-only">Ana içeriğe geç</a>
```

---

### 21. Footer'da `text-gray-400` vs `text-slate-400` Tutarsızlık

**Sorun:** Site genelinde `slate` renk paleti kullanılırken, footer'da `text-gray-400` kullanılmış.

**Etki:**
- Renk tutarsızlığı
- Design system bütünlüğü bozuluyor

**Çözüm:** `text-gray-400` → `text-slate-400` olarak değiştirilmeli.

---

### 22. Login Sayfasında Tekrarlayan Metin

**Sorun:** Login sayfasındaki açıklama metni kendini tekrarlıyor:
```
Tengri Kezgen Köçer - Tengri Kezgen Köçer
```

**Etki:**
- Kullanıcı deneyimi bozuk
- Profesyonel olmayan görünüm

**Çözüm:** Tekrarlayan metin düzeltilip anlamlı bir açıklama eklenmelidir:
```
Tengri Kezgen Köçer - Hesabınıza giriş yapın
```

---

## Sorun Özet Tablosu

| #  | Sorun | Önem | Kategori |
|----|-------|------|----------|
| 1  | manifest.json login'e yönleniyor | 🔴 Kritik | PWA |
| 2  | sitemap.xml 404 | 🔴 Kritik | SEO |
| 3  | robots.txt crawl kuralları eksik | 🔴 Kritik | SEO |
| 4  | HTML lang="en" yanlış | 🟠 Yüksek | Erişilebilirlik / SEO |
| 5  | Yinelenen meta etiketleri | 🟠 Yüksek | HTML |
| 6  | Ana sayfa boş SSR içeriği | 🟠 Yüksek | Performans / SEO |
| 7  | Header logo sonsuz pulse | 🟠 Yüksek | UX |
| 8  | Eksik og:url | 🟠 Yüksek | SEO / Sosyal |
| 9  | Eksik og:locale | 🟠 Yüksek | SEO / Sosyal |
| 10 | Meta title'da &amp; entity | 🟡 Orta | SEO |
| 11 | Eksik canonical URL | 🟡 Orta | SEO |
| 12 | Agresif no-cache policy | 🟡 Orta | Performans |
| 13 | Eksik JSON-LD structured data | 🟡 Orta | SEO |
| 14 | CSP frame-ancestors * | 🟡 Orta | Güvenlik |
| 15 | Geniş permissions-policy | 🟡 Orta | Güvenlik |
| 16 | Login'de CSRF koruması yok | 🟡 Orta | Güvenlik |
| 17 | async + defer birlikte | 🔵 Düşük | Performans |
| 18 | Fazla font preload | 🔵 Düşük | Performans |
| 19 | Eksik X-Frame-Options | 🔵 Düşük | Güvenlik |
| 20 | Skip navigation linki yok | 🔵 Düşük | Erişilebilirlik |
| 21 | gray vs slate renk tutarsızlığı | 🔵 Düşük | UX |
| 22 | Login'de tekrarlayan metin | 🔵 Düşük | UX |

---

## Öncelikli Aksiyon Planı

1. **Hemen yapılması gerekenler (Kritik):**
   - Auth middleware'de public path'lere manifest.json ekle
   - sitemap.ts oluştur
   - robots.txt'ye crawl kuralları ve sitemap linki ekle

2. **Kısa vadede yapılması gerekenler (Yüksek):**
   - `lang="tr"` düzelt
   - Yinelenen meta etiketleri temizle
   - Ana sayfa SSR içerik ekle
   - Header logo düzelt
   - og:url ve og:locale ekle

3. **Orta vadede yapılması gerekenler:**
   - Canonical URL ekle
   - JSON-LD structured data ekle
   - CSP frame-ancestors kısıtla
   - Cache policy optimize et
   - CSRF koruması ekle

4. **Düşük öncelikli iyileştirmeler:**
   - Script yükleme optimize et
   - Font preload azalt
   - Skip navigation ekle
   - Renk tutarsızlığı düzelt
   - Login sayfası metin düzelt
