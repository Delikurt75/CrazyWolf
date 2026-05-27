// Snippet for app/layout.tsx
// Replace the existing `metadata` export with this corrected version.
// Changes made:
//   1. Removed duplicate apple-mobile-web-app-capable and status-bar-style entries
//   2. Removed `defer` from the external Abacus AI script (async + defer is redundant)
//   3. Added missing `og:url` property
//   4. Changed html lang to 'tr' to match primary Turkish content
//      (or use next-intl / i18n routing for multi-language support)

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
  description:
    'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi. Your global guide for migration, settlement, and living abroad.',
  applicationName: 'Tengri Kezgen Köçer',
  keywords: ['migration', 'living abroad', 'cost of living', 'visa', 'expatriate', 'travel', 'göç', 'yaşam maliyeti'],
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
    description: 'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi.',
    url: 'https://tengrikezgenkocer.com',
    type: 'website',
    images: [{ url: 'https://tengrikezgenkocer.com/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
    description: 'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi.',
    images: ['https://tengrikezgenkocer.com/og-image.png'],
  },
  // FIX: Use Next.js appleWebApp to avoid duplicate meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TKK',
  },
  manifest: '/manifest.json',
  icons: {
    shortcut: '/favicon.svg',
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    'msapplication-TileColor': '#0f172a',
    'mobile-web-app-capable': 'yes',
  },
};

// In the RootLayout function, update:
// 1. <html lang="en"> → <html lang="tr"> (or use i18n routing)
// 2. Remove `defer` from the abacus script:
//    Before: <script src="..." async defer />
//    After:  <script src="..." async />
//
// Example:
//
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="tr" suppressHydrationWarning className="antialiased">
//       <head>
//         {/* FIX: async only, remove defer */}
//         <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async />
//       </head>
//       <body ...>
//         ...
//       </body>
//     </html>
//   );
// }
