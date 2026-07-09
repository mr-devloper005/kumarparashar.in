import type { CSSProperties } from 'react'

/*
  Modda-inspired design contract.

  Dark canvas, chartreuse accent, thin white borders, pill buttons.
  Every component consumes these CSS vars — don't hardcode fonts/colors
  inside JSX.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#0b0b0b',
  '--slot4-page-text': '#ffffff',
  '--slot4-panel-bg': '#141414',
  '--slot4-surface-bg': '#141414',
  '--slot4-raised-bg': '#1d1d1d',
  '--slot4-muted-text': 'rgba(255,255,255,0.72)',
  '--slot4-soft-muted-text': 'rgba(255,255,255,0.50)',
  '--slot4-accent': '#dce233',
  '--slot4-accent-fill': '#dce233',
  '--slot4-accent-soft': 'rgba(220,226,51,0.10)',
  '--slot4-on-accent': '#0b0b0b',
  '--slot4-dark-bg': '#0b0b0b',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#1d1d1d',
  '--slot4-cream': '#141414',
  '--slot4-warm': '#141414',
  '--slot4-lavender': '#141414',
  '--slot4-gray': '#141414',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#0b0b0b',
  '--editable-page-text': '#ffffff',
  '--editable-container': '1400px',
  '--editable-border': 'rgba(255,255,255,0.10)',
  '--editable-border-strong': 'rgba(255,255,255,0.26)',
  '--editable-nav-bg': '#0b0b0b',
  '--editable-nav-text': '#ffffff',
  '--editable-nav-active': '#dce233',
  '--editable-nav-active-text': '#0b0b0b',
  '--editable-cta-bg': '#dce233',
  '--editable-cta-text': '#0b0b0b',
  '--editable-search-bg': '#141414',
  '--editable-footer-bg': '#0b0b0b',
  '--editable-footer-text': '#ffffff',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-[var(--editable-border-strong)]',
  shadow: 'shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]',
  shadowStrong: 'shadow-[0_30px_80px_-30px_rgba(220,226,51,0.25)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(11,11,11,0)_0%,rgba(11,11,11,0.92)_100%)]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-6 sm:px-10 lg:px-14',
    sectionY: 'py-20 sm:py-24 lg:py-28',
    sectionYSm: 'py-14 sm:py-16 lg:py-20',
    sectionYLg: 'py-24 sm:py-32 lg:py-40',
  },
  layout: {
    safeGrid: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[320px] shrink-0 snap-start sm:w-[360px]',
  },
  type: {
    eyebrow: 'editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]',
    heroTitle:
      'editable-display text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[72px] lg:text-[96px]',
    sectionTitle:
      'editable-display text-[36px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]',
    display:
      'editable-display text-[44px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[60px] lg:text-[72px]',
    body: 'text-[15px] leading-[1.65] text-[var(--slot4-muted-text)] sm:text-[16px]',
    emphasis:
      'editable-display text-[20px] font-medium leading-[1.35] tracking-[-0.01em] text-[var(--slot4-page-text)]',
  },
  surface: {
    card: `rounded-[18px] border ${editablePalette.border} ${editablePalette.panelBg}`,
    soft: `rounded-[18px] border ${editablePalette.border} bg-[var(--slot4-raised-bg)]`,
    dark: `rounded-[24px] ${editablePalette.darkBg} ${editablePalette.darkText} border ${editablePalette.border}`,
    outlined: `rounded-[18px] border ${editablePalette.border}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-8 py-4 text-[14px] font-semibold tracking-[-0.01em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 active:scale-[0.985]',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border-strong)] bg-transparent px-8 py-4 text-[14px] font-semibold tracking-[-0.01em] text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] active:scale-[0.985]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-8 py-4 text-[14px] font-semibold text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 active:scale-[0.985]',
    ghost:
      'inline-flex items-center justify-center gap-2 text-[14px] font-semibold text-[var(--slot4-page-text)] underline-offset-[6px] transition duration-500 hover:underline hover:text-[var(--slot4-accent)]',
    small:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-2.5 text-[13px] font-semibold text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95',
  },
  badge: {
    pill:
      'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]',
    accentPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-accent)]',
    dot:
      'inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--slot4-accent)]',
  },
  media: {
    frame: 'relative overflow-hidden rounded-[16px] bg-[var(--slot4-raised-bg)]',
    frameFull: 'relative overflow-hidden rounded-[24px] bg-[var(--slot4-raised-bg)]',
    ratio: 'aspect-[4/5]',
    ratioWide: 'aspect-[16/10]',
    ratioSquare: 'aspect-square',
  },
  motion: {
    lift: 'transition-transform duration-500 hover:-translate-y-1',
    fade: 'transition-opacity duration-500 hover:opacity-80',
    zoom: 'transition-transform duration-[900ms] group-hover:scale-[1.04]',
    borderGlow: 'transition-colors duration-500 hover:border-[var(--slot4-accent)]',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; every downstream component consumes these CSS variables.',
  'Keep section order in src/editable/sections/HomeSections.tsx so a redesign can move sections without touching pages.',
  'Use dark elevated cards with thin white borders, not shadow-only cards.',
  'Buttons are pills. Never render sharp rectangular buttons.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
