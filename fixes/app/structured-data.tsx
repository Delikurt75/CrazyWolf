export function StructuredData() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tengri Kezgen Köçer',
    alternateName: 'TKK',
    url: 'https://tengrikezgenkocer.com',
    description:
      'Göğün altında gezen ve yeni hayat kuran insanın küresel rehberi. Your global guide for migration, settlement, and living abroad.',
    inLanguage: ['tr', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tengrikezgenkocer.com/find-country?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tengri Kezgen Köçer',
    url: 'https://tengrikezgenkocer.com',
    logo: 'https://tengrikezgenkocer.com/icons/icon-512.png',
    description:
      'Migration, settlement, cost of living, healthcare, visas, disability rights — comprehensive guidance for 200+ countries.',
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tengri Kezgen Köçer',
    url: 'https://tengrikezgenkocer.com',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Country comparison for 200+ countries',
      'AI-powered migration advisor with text, voice, and video',
      'Cost of living comparison',
      'Visa and migration guidance',
      'Healthcare information',
      'Disability rights information',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
    </>
  );
}
