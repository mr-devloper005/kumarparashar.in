import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditorialFeatureCard, RailPostCard, CompactIndexCard, getEditablePostImage, getEditableExcerpt, getEditableCategory, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-6 sm:px-10 lg:px-14'

/* ================================ HERO ================================ */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const featured = pool[0]
  const words = pagesContent.home.hero.title || []
  const description = pagesContent.home.hero.description
  const primaryCta = pagesContent.home.hero.primaryCta
  const secondaryCta = pagesContent.home.hero.secondaryCta
  const kicker = pagesContent.home.hero.badge

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
      <div className={`${container} relative`}>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
          <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-soft-muted-text)]">
            {kicker}
          </span>
        </div>

        <h1 className="editable-display mt-8 max-w-[1100px] text-[52px] font-medium leading-[0.95] tracking-[-0.03em] text-[var(--slot4-page-text)] sm:text-[86px] lg:text-[120px]">
          {words.map((word, i) => (
            <span key={word + i} className="editable-swipe-word">
              <span style={{ animationDelay: `${i * 140}ms` }}>
                {i === words.length - 1 ? (
                  <span className="text-[var(--slot4-accent)]">{word}</span>
                ) : (
                  word
                )}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <EditableReveal index={0}>
            <p className="max-w-2xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)] sm:text-[19px]">
              {description}
            </p>
          </EditableReveal>
          <EditableReveal index={1} className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={primaryCta.href} className={dc.button.primary}>
              {primaryCta.label} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={secondaryCta.href} className={dc.button.secondary}>
              {secondaryCta.label}
            </Link>
          </EditableReveal>
        </div>

        {/* Editorial feature strip — the hero image sits below the wordmark */}
        {featured ? (
          <EditableReveal index={2} className="mt-24">
            <EditorialFeatureCard
              post={featured}
              href={postHref(primaryTask, featured, primaryRoute)}
              label={pagesContent.home.hero.featureCardBadge}
            />
          </EditableReveal>
        ) : null}
      </div>
    </section>
  )
}

/* ================== STATS BAND (real-data derived) =================== */
export function EditableStatsBand({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile')
  const categoryCount = new Set(pool.map((post) => getEditableCategory(post).toLowerCase())).size

  const stats = [
    { value: String(pool.length || enabledTasks.length * 6).padStart(2, '0'), label: 'Entries in rotation' },
    { value: String(enabledTasks.length).padStart(2, '0'), label: 'Sections in the archive' },
    { value: String(categoryCount || 8).padStart(2, '0'), label: 'Live categories' },
  ]

  return (
    <section className={`${container} mt-32 sm:mt-40`}>
      <div className="grid gap-10 border-t border-[var(--editable-border)] pt-16 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <EditableReveal key={stat.label} index={i}>
            <div>
              <p className="editable-display text-[64px] font-medium leading-[0.9] tracking-[-0.05em] text-[var(--slot4-page-text)] sm:text-[88px]">
                {stat.value}
              </p>
              <p className="mt-4 editable-mono text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-soft-muted-text)]">
                {stat.label}
              </p>
            </div>
          </EditableReveal>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--editable-border)] pt-6">
        <p className="max-w-xl text-[15px] leading-[1.65] text-[var(--slot4-muted-text)]">
          A curated {SITE_CONFIG.name} feed — visuals, voices, and long-form pieces, updated as new work lands.
        </p>
        <Link href={primaryRoute} className={dc.button.ghost}>
          Enter the archive <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* ================== ABOUT / VOICE SPLIT ================== */
export function EditableAboutSplit({ primaryRoute }: Pick<HomeSectionProps, 'primaryRoute'> & Partial<HomeSectionProps>) {
  const intro = pagesContent.home.intro
  return (
    <section className={`${container} mt-32 sm:mt-40 lg:mt-48`}>
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <EditableReveal>
          <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
            {intro.badge}
          </p>
          <h2 className={`${dc.type.sectionTitle} mt-6 max-w-xl`}>{intro.title}</h2>
        </EditableReveal>
        <div className="space-y-6">
          {intro.paragraphs.map((p, i) => (
            <EditableReveal key={p} index={i}>
              <p className="text-[17px] leading-[1.7] text-[var(--slot4-muted-text)]">{p}</p>
            </EditableReveal>
          ))}
          <EditableReveal index={intro.paragraphs.length}>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={intro.primaryLink.href} className={dc.button.primary}>
                {intro.primaryLink.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={intro.secondaryLink.href} className={dc.button.secondary}>
                {intro.secondaryLink.label}
              </Link>
              <Link href={primaryRoute} className={dc.button.ghost}>
                Everything else
              </Link>
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* ================== SECTIONS DIRECTORY (renamed task labels) ================== */
export function EditableSectionsDirectory({ posts, timeSections }: Partial<HomeSectionProps> = {}) {
  const tasks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile')
  const pool = dedupePosts([...(posts || []), ...((timeSections || []).flatMap((section) => section.posts))])
  // Grid column count adapts to how many public rooms are actually enabled so
  // there are never blank cells stretched across the row.
  const cols =
    tasks.length >= 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : tasks.length === 2
        ? 'sm:grid-cols-2'
        : 'grid-cols-1'

  return (
    <section className={`${container} mt-32 sm:mt-40 lg:mt-48`}>
      <EditableReveal>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              The desk
            </p>
            <h2 className={`${dc.type.sectionTitle} mt-6 max-w-xl`}>
              Rooms of the archive.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">
            Each section carries its own rhythm — visual, editorial, referential. Step into whichever pulls you first.
          </p>
        </div>
      </EditableReveal>

      <div className={`mt-14 grid gap-px bg-[var(--editable-border)] ${cols}`}>
        {tasks.map((task, i) => {
          const theme = getTaskTheme(task.key as TaskKey)
          // Preview image — spread across the pool so each room card gets a
          // different real post image. Falls back to placeholder image.
          const previewPost = pool[i % Math.max(1, pool.length)]
          const previewImage = previewPost ? getEditablePostImage(previewPost) : ''

          return (
            <EditableReveal key={task.key} index={i} className="bg-[var(--slot4-page-bg)]">
              <Link
                href={task.route}
                className="group flex h-full flex-col justify-between gap-8 p-8 transition duration-500 hover:bg-[var(--slot4-panel-bg)] lg:p-10"
              >
                <div>
                  <span className="editable-mono text-[12px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                    {String(i + 1).padStart(2, '0')} / {String(tasks.length).padStart(2, '0')}
                  </span>
                  <h3 className="editable-display mt-6 text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--slot4-page-text)]">
                    {theme.kicker}
                  </h3>
                  <p className="mt-4 max-w-sm text-[14px] leading-[1.65] text-[var(--slot4-muted-text)]">
                    {theme.note}
                  </p>
                </div>

                {/* Preview image — the missing element from the plain card */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] border border-[var(--editable-border)] bg-[var(--slot4-raised-bg)]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={previewPost?.title || theme.kicker}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="editable-display text-[72px] font-medium tracking-[-0.05em] text-[var(--slot4-accent)] opacity-30">
                        {theme.kicker.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(11,11,11,0.7)_100%)] opacity-80 transition duration-500 group-hover:opacity-100" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-[rgba(11,11,11,0.55)] px-3 py-1.5 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur">
                    {theme.kicker}
                  </span>
                </div>

                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--slot4-page-text)] transition duration-500 group-hover:text-[var(--slot4-accent)]">
                  Enter <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Link>
            </EditableReveal>
          )
        })}
      </div>
    </section>
  )
}

/* ================== EDITORIAL RAIL (featured posts, horizontal) ================== */
export function EditableEditorialRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(1, 9)
  if (!pool.length) return null
  return (
    <section className="mt-32 sm:mt-40 lg:mt-48">
      <div className={container}>
        <EditableReveal>
          <div className="flex items-end justify-between gap-6 pb-10">
            <div>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                In rotation
              </p>
              <h2 className={`${dc.type.sectionTitle} mt-6 max-w-2xl`}>Fresh from the desk.</h2>
            </div>
            <Link href={primaryRoute} className={dc.button.ghost}>
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>
      </div>
      <div className={dc.layout.rail + ' pl-6 sm:pl-10 lg:pl-14'}>
        {pool.map((post, index) => (
          <EditableReveal key={post.id || post.slug} index={index}>
            <RailPostCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
          </EditableReveal>
        ))}
        <div className="w-6 shrink-0 sm:w-10 lg:w-14" aria-hidden="true" />
      </div>
    </section>
  )
}

/* ================== NUMBERED PROCESS / VALUE ROWS ================== */
export function EditableProcessRows({ posts, timeSections, primaryTask, primaryRoute }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(1, 6)
  if (!pool.length) return null
  return (
    <section className={`${container} mt-32 sm:mt-40 lg:mt-48`}>
      <EditableReveal>
        <div className="flex flex-col gap-6 border-b border-[var(--editable-border)] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              The reading list
            </p>
            <h2 className={`${dc.type.sectionTitle} mt-6 max-w-2xl`}>What we're watching this week.</h2>
          </div>
          <Link href={primaryRoute} className={dc.button.ghost}>
            Every entry <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </EditableReveal>
      <div>
        {pool.map((post, index) => (
          <EditableReveal key={post.id || post.slug} index={index}>
            <CompactIndexCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
          </EditableReveal>
        ))}
      </div>
    </section>
  )
}

/* ================== TIME COLLECTIONS (kept intact, restyled) ================== */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'This week', title: 'Landed in the last seven days.' },
  browse: { eyebrow: 'This month', title: 'Being read the most right now.' },
  index: { eyebrow: 'Evergreen', title: 'From the deeper shelves.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute },
          { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute },
          { key: 'index', posts: posts.slice(12, 18), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])
  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore.' }
        return (
          <section key={section.key} className={`${container} mt-32 sm:mt-40 lg:mt-48`}>
            <EditableReveal>
              <div className="flex items-end justify-between gap-6 border-b border-[var(--editable-border)] pb-10">
                <div>
                  <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                    {copy.eyebrow}
                  </p>
                  <h2 className={`${dc.type.sectionTitle} mt-6 max-w-2xl`}>{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className={dc.button.ghost}>
                  See all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </EditableReveal>
            <div className="grid gap-px bg-[var(--editable-border)] sm:grid-cols-2 lg:grid-cols-3">
              {section.posts.slice(0, 6).map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index} className="bg-[var(--slot4-page-bg)]">
                  <TimeTile post={post} href={postHref(primaryTask, post, primaryRoute)} />
                </EditableReveal>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}

function TimeTile({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 p-8 transition duration-500 hover:bg-[var(--slot4-panel-bg)]"
    >
      <div className={`${dc.media.frame} aspect-[4/3]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`}
        />
      </div>
      <div>
        <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
          {getEditableCategory(post)}
        </p>
        <h3 className="editable-display mt-3 line-clamp-2 text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[14px] leading-[1.65] text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 140)}
        </p>
      </div>
    </Link>
  )
}

/* ================== CTA BAND ================== */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section className="mt-32 sm:mt-40 lg:mt-48">
      <div className={container}>
        <EditableReveal>
          <div className="border-t border-b border-[var(--editable-border)] py-24 text-center sm:py-32">
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              {cta.badge}
            </p>
            <h2 className="editable-display mx-auto mt-8 max-w-4xl text-[44px] font-medium leading-[1] tracking-[-0.04em] text-[var(--slot4-page-text)] sm:text-[80px] lg:text-[112px]">
              {cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-[16px] leading-[1.7] text-[var(--slot4-muted-text)]">
              {cta.description}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href={cta.primaryCta.href} className={dc.button.primary}>
                {cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={cta.secondaryCta.href} className={dc.button.secondary}>
                {cta.secondaryCta.label}
              </Link>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ================== BACKWARDS-COMPAT EXPORTS (kept for HomePage.tsx wiring) ================== */
export const EditableStoryRail = EditableSectionsDirectory
export const EditableMagazineSplit = EditableAboutSplit
