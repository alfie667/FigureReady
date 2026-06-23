import { MetadataRoute } from 'next'

const BASE = 'https://figure-ready.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                                                  priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/graphpad-alternative`,                        priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/scientific-figure-maker`,                     priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/figure-size-scientific-publication`,          priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/publication-figure-templates`,                priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/excel-to-scientific-graph`,                   priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/pricing`,                                     priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/roadmap`,                                     priority: 0.5, changeFrequency: 'weekly'  },
  ]
}
