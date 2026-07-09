import { slot4BrandConfig } from '@/editable/theme/brand.config'

const brand = slot4BrandConfig.siteName

/*
  The public surface centers on the Reference Library — a working shelf of
  documents, collections, and resources. Long-form pieces live in The Journal.
  Profile-facing copy is deliberately absent from every public page.
*/

export const pagesContent = {
  home: {
    metadata: {
      title: `${brand} — The Reference Library`,
      description:
        'A working library of documents, guides, and reference material — with The Journal for long-form context. Search, browse, and download.',
      openGraphTitle: `${brand} — The Reference Library`,
      openGraphDescription:
        'Reference documents, collections, and long-form context — one calm, working library.',
      keywords: ['reference library', 'document archive', 'research documents', 'guide library'],
    },
    hero: {
      badge: 'The Reference Library',
      title: ['Read.', 'Reference.', 'Download.'],
      description:
        `${brand} is a working reference library — documents, guides, and collections you can actually keep, with long-form pieces in The Journal for the context around them.`,
      primaryCta: { label: 'Open the Library', href: '/pdf' },
      secondaryCta: { label: 'Read The Journal', href: '/article' },
      searchPlaceholder: 'Search documents and guides',
      focusLabel: 'Focus',
      featureCardBadge: 'On the shelf',
      featureCardTitle: 'The latest document on the shelf.',
      featureCardDescription:
        'The freshest addition leads every visit — every collection radiates out from here.',
    },
    intro: {
      badge: 'About the library',
      title: 'A working shelf for documents, guides, and the writing around them.',
      paragraphs: [
        'The library keeps two rooms open at once — the Reference Library for downloadable documents and collections, and The Journal for long-form pieces that give them context.',
        'Both rooms speak the same language: quiet type, generous space, one accent. Every file is downloadable, previewable, and reachable in two clicks.',
        'Whether you start with a document, a guide, or a piece of writing, the trail carries you forward. Nothing gets buried; nothing shouts.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A working shelf of PDFs, guides, and reference documents.',
        'Every entry previewable in-browser, downloadable in one click.',
        'The Journal for long-form context around every document.',
        'One accent, one type family, one calm rhythm across the site.',
      ],
      primaryLink: { label: 'Open the Library', href: '/pdf' },
      secondaryLink: { label: 'Read The Journal', href: '/article' },
    },
    cta: {
      badge: 'Contribute to the library',
      title: 'Send a document to the shelf.',
      description:
        'Have a guide, a report, or a document worth keeping? Submit it to the Reference Library — the shelf restocks weekly.',
      primaryCta: { label: 'Get started', href: '/signup' },
      secondaryCta: { label: 'Get in touch', href: '/contact' },
    },
    taskSection: {
      heading: 'Fresh in {label}',
      descriptionSuffix: 'Newest additions from this room of the library.',
    },
  },
  about: {
    badge: 'The library',
    title: 'A quieter way to keep documents, guides, and the writing around them.',
    description: `${brand} is a working library — the Reference Library for downloadable documents, The Journal for the writing around them, and one voice tying it all together.`,
    paragraphs: [
      'The site is deliberately narrow: a shelf for documents you can actually keep, and a journal for the pieces that give each one context.',
      'Nothing fights for your attention. The type is one family, the accent is one color, and every room reads on the same rhythm — so nothing feels like a different product bolted on.',
      'Whether you land on a document, a collection, or an essay, the trail leads back to the library. Move between rooms without switching gears.',
    ],
    values: [
      {
        title: 'The shelf first',
        description:
          'The Reference Library sets the pace: previewable documents, one-click downloads, clean file cards. Every entry gets room.',
      },
      {
        title: 'The Journal, in context',
        description:
          'Long-form pieces give the documents the writing they deserve. Read a piece, download the reference, keep both.',
      },
      {
        title: 'One voice, everywhere',
        description:
          'Type, spacing, accent, and motion stay the same across rooms. The library feels like a place, not a portfolio of pages.',
      },
    ],
  },
  contact: {
    eyebrow: `Reach ${brand}`,
    title: 'Contact the desk directly — not a support queue.',
    description:
      'Send a document for the Reference Library, pitch a piece for The Journal, or ask about a collection. Every message reaches the desk.',
    formTitle: 'Send a note',
  },

  search: {
    metadata: {
      title: 'Search the library',
      description: 'Search the Reference Library and The Journal across the whole site.',
    },
    hero: {
      badge: 'Across the library',
      title: 'Search every room at once.',
      description:
        'Keywords, categories, and rooms — every document and piece across the library in a single search.',
      placeholder: 'Search documents, guides, and pieces',
    },
    resultsTitle: 'Recently on the shelf',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a new document, guide, or piece.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to submit to the library.',
      description: 'The submission workspace is open to members of the desk. Sign in to continue.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Send an entry to the library.',
      description:
        'Pick a room, add the details, and prepare a clean entry with a file, cover image, summary, and body.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Submit entry',
    successTitle: 'Entry submitted.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to the desk.',
      badge: 'Member access',
      title: 'Welcome back to the desk.',
      description: 'Sign in to manage your entries, submissions, and shelf contributions.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched. Create an account first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create an account with the desk.',
      badge: 'Contributor access',
      title: 'Join the desk.',
      description: 'Create an account to submit documents, guides, and pieces to the library.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'More from The Journal',
      fallbackTitle: 'Entry details',
    },
    listing: {
      relatedTitle: 'More studios',
      fallbackTitle: 'Studio details',
    },
    image: {
      relatedTitle: 'More visuals',
      fallbackTitle: 'Visual details',
    },
    profile: {
      relatedTitle: 'From the Reference Library',
      fallbackDescription: 'Entry details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
