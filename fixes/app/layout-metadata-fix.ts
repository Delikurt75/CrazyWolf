import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a365d' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
  description:
    'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi. Your global guide for migration, settlement, and living abroad.',
  applicationName: 'Tengri Kezgen Köçer',
  keywords: [
    'migration',
    'living abroad',
    'cost of living',
    'visa',
    'expatriate',
    'travel',
    'göç',
    'yaşam maliyeti',
    'yerleşim',
    'sağlık',
    'engelli hakları',
  ],
  authors: [{ name: 'Tengri Kezgen Köçer' }],

  manifest: '/manifest.json',

  alternates: {
    canonical: 'https://tengrikezgenkocer.com',
  },

  openGraph: {
    title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
    description: 'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi.',
    url: 'https://tengrikezgenkocer.com',
    siteName: 'Tengri Kezgen Köçer',
    images: [
      {
        url: 'https://tengrikezgenkocer.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tengri Kezgen Köçer - Göç ve Yaşam Rehberi',
      },
    ],
    type: 'website',
    locale: 'tr_TR',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Tengri Kezgen Köçer | Göç, Yerleşim & Yaşam Rehberi',
    description: 'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi.',
    images: ['https://tengrikezgenkocer.com/og-image.png'],
    // Uncomment and fill when you have a Twitter handle:
    // site: '@tengrikezgenkocer',
    // creator: '@tengrikezgenkocer',
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  appleWebApp: {
    capable: true,
    title: 'TKK',
    statusBarStyle: 'black-translucent',
  },

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  other: {
    'msapplication-TileColor': '#0f172a',
    'mobile-web-app-capable': 'yes',
  },
};
