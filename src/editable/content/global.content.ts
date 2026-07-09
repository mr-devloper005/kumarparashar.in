import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'A working reference library',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'A reference library',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Contact', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Contribute to the library',
    description:
      'A working reference library — downloadable documents and the long-form writing that gives them context. One quiet surface for reading, browsing, and keeping what matters.',
    columns: [
      {
        title: 'Discovery',
        links: [
          { label: 'The Reference Library', href: '/pdf' },
          { label: 'The Journal', href: '/article' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Studio',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Made with care',
  },
  commonLabels: {
    readMore: 'Read on',
    viewAll: 'View all',
    explore: 'Enter',
    latest: 'Fresh',
    related: 'More like this',
    published: 'On the shelf',
  },
} as const
