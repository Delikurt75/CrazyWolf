# Tengri Kezgen Köçer — CrazyWolf

Göç, Yerleşim & Yaşam Rehberi / The Global Guide of the Sky Wanderer Nomad

**Site:** https://tengrikezgenkocer.com/

## Proje Yapısı

- `ISSUES_REPORT.md` — Sitede tespit edilen tüm sorunların detaylı raporu
- `fixes/` — Sorunları çözmek için hazırlanmış düzeltme dosyaları

## Düzeltme Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `fixes/middleware.ts` | Statik dosyaların login'e yönlendirilmesini engelleyen middleware düzeltmesi |
| `fixes/app/robots.ts` | SEO için eksik olan robots.txt dosyası |
| `fixes/app/sitemap.ts` | SEO için eksik olan sitemap.xml dosyası |
| `fixes/app/layout-metadata-fix.ts` | Yinelenen meta etiketlerinin düzeltilmesi ve eksik meta etiketlerinin eklenmesi |
| `fixes/app/structured-data.tsx` | JSON-LD schema markup bileşeni |
| `fixes/next.config.ts` | Güvenlik header'ları ve cache-control ayarları |

## Uygulama Talimatları

Her düzeltme dosyasını mevcut Next.js projesindeki karşılığına kopyalayın / adapte edin. Detaylar için `ISSUES_REPORT.md` dosyasını okuyun.
