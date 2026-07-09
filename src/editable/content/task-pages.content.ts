import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'The Journal',
    headline: 'Long-form reads with the desk’s calmer rhythm.',
    description:
      'Essays, guides, and explainers set in a wide editorial column. The Journal is where a piece gets room to think out loud.',
    filterLabel: 'Choose a room',
    secondaryNote: 'Reading first — hierarchy, whitespace, and one column at a time.',
    chips: ['Editorial pacing', 'Long-form', 'Topic filters'],
  },
  classified: {
    eyebrow: 'Notices',
    headline: 'Fresh notices and time-boxed opportunities.',
    description:
      'Quick to scan, ready to act on. Notices carry a price, a place, and a way in — nothing decorative.',
    filterLabel: 'Filter notice',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Quick scan', 'Time-boxed', 'Actionable'],
  },
  sbm: {
    eyebrow: 'The Shelf',
    headline: 'Saved links and references, arranged like shelves.',
    description:
      'Curated resources and outbound links worth returning to. Not a feed, more a working library.',
    filterLabel: 'Filter shelf',
    secondaryNote: 'Curation with calm metadata; no filler, no chatter.',
    chips: ['Curated', 'Reference', 'Working library'],
  },
  profile: {
    eyebrow: 'The Directory',
    headline: 'A working directory of the people behind the work.',
    description:
      'Voices, makers, and studios — each entry surfaces identity, location, and the way to reach them. A directory that reads like a rolodex worth keeping.',
    filterLabel: 'Filter directory',
    secondaryNote: 'Identity and credibility land before the grid does.',
    chips: ['Identity first', 'Direct contact', 'Verified'],
  },
  pdf: {
    eyebrow: 'The Files',
    headline: 'Files, guides, and reference material to keep.',
    description:
      'Downloadable documents presented as a working library — searchable, dated, and easy to route to the right team.',
    filterLabel: 'Filter file type',
    secondaryNote: 'File cues, archive rhythm, and clear routing.',
    chips: ['Downloadable', 'Reference', 'Archive-ready'],
  },
  listing: {
    eyebrow: 'The Studios',
    headline: 'Studios and businesses, presented as a working directory.',
    description:
      'Trust cues, location, and direct action paths for every listing. Built for comparison, not just for lists.',
    filterLabel: 'Filter studio',
    secondaryNote: 'Compare, contact, and decide without leaving the page.',
    chips: ['Directory', 'Comparison', 'Direct action'],
  },
  image: {
    eyebrow: 'Visuals',
    headline: 'Photography, illustration, and standout visual work.',
    description:
      'Gallery-first browsing with room to breathe. Every entry leads with the image; the words are the frame.',
    filterLabel: 'Filter frame',
    secondaryNote: 'Let images carry the surface before language does.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
