import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tengrikezgenkocer.com';

  const staticPages = [
    '',
    '/find-country',
    '/ai-advisor',
    '/cost-of-living',
    '/visa-migration',
    '/healthcare',
    '/travel-compare',
    '/disability-rights',
    '/signup',
    '/login',
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));
}
