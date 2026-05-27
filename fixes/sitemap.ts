// app/sitemap.ts
// Place this file at: src/app/sitemap.ts  (or app/sitemap.ts depending on project structure)

import { MetadataRoute } from 'next';

const BASE_URL = 'https://tengrikezgenkocer.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/cost-of-living`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Protected routes — omit from sitemap OR include if you want crawlers
    // to discover them (they will be gated but at least indexed by title):
    // { url: `${BASE_URL}/find-country`,     priority: 0.6 },
    // { url: `${BASE_URL}/ai-advisor`,       priority: 0.6 },
    // { url: `${BASE_URL}/visa-migration`,   priority: 0.6 },
    // { url: `${BASE_URL}/healthcare`,       priority: 0.6 },
    // { url: `${BASE_URL}/disability-rights`,priority: 0.6 },
    // { url: `${BASE_URL}/travel-compare`,   priority: 0.6 },
  ];
}
