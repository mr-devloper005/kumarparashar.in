import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  One shared Modda visual language. Only the kicker / note copy varies
  per task so each surface keeps a little voice, but tokens are unified.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const MODDA_FONT =
  "'Geist', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: true,
  fontDisplay: MODDA_FONT,
  fontBody: MODDA_FONT,
  bg: '#0b0b0b',
  surface: '#141414',
  raised: '#1d1d1d',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
  line: 'rgba(255,255,255,0.10)',
  accent: '#dce233',
  accentSoft: 'rgba(220,226,51,0.10)',
  onAccent: '#0b0b0b',
  glow: 'rgba(220,226,51,0.18)',
  radius: '18px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

// User-visible kicker text — never say "Article", "Profile", or "Post" here.
export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'The Journal', note: 'Long-form reads, guides, and editorial pieces from the desk.' },
  listing: { ...base, kicker: 'Studios', note: 'Vetted studios and businesses, presented as a working directory.' },
  classified: { ...base, kicker: 'Notices', note: 'Fresh notices, offers, and time-boxed opportunities.' },
  image: { ...base, kicker: 'Visuals', note: 'Photography, illustration, and standout visual work.' },
  sbm: { ...base, kicker: 'Shelf', note: 'Curated links, references, and resources worth saving.' },
  pdf: { ...base, kicker: 'Files', note: 'Downloadable guides, reports, and reference material.' },
  profile: { ...base, kicker: 'Directory', note: 'Voices, makers, and people shaping the community.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
