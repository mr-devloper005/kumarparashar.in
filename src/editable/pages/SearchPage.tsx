import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme } from '@/editable/theme/task-themes'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images)
    ? (content.images.find((item) => typeof item === 'string') as string | undefined)
    : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => {
  const raw = post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
  return stripHtml(raw).replace(/\s+/g, ' ').trim()
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [
    post.title,
    post.summary,
    content.description,
    content.body,
    content.excerpt,
    content.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
  ].some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const derived = (getPostTaskKey(post) as TaskKey | null) || 'article'
  // Guardrail: profile is filtered upstream; route anything unexpected to article.
  const task: TaskKey = derived === 'profile' ? 'article' : derived
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const roomLabel = getTaskTheme(task).kicker

  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 border-b border-[var(--editable-border)] py-10 transition duration-500 hover:border-[var(--slot4-accent)] sm:flex-row"
    >
      {image ? (
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[14px] bg-[var(--slot4-raised-bg)] sm:w-[280px]">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 editable-mono text-[11px] font-medium uppercase tracking-[0.22em]">
          <span className="text-[var(--slot4-soft-muted-text)]">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-[var(--slot4-accent)]">{roomLabel}</span>
        </div>
        <h2 className="editable-display mt-4 line-clamp-2 text-[28px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[36px]">
          {post.title}
        </h2>
        {summary ? (
          <p className="mt-4 line-clamp-2 text-[15px] leading-[1.65] text-[var(--slot4-muted-text)]">{summary}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined
  )
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
      ? []
      : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  // Profile posts are functional but never shown in public search — filter them out.
  const results = posts
    .filter((post) => matches(post, normalized, category, task))
    .filter((post) => getPostTaskKey(post) !== 'profile')
    .slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile')

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* HERO + FORM */}
        <section className="border-b border-[var(--editable-border)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 pb-20 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
            <EditableReveal>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.search.hero.badge}
              </p>
              <h1 className="editable-display mt-8 max-w-4xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[80px] lg:text-[104px]">
                {pagesContent.search.hero.title}
              </h1>
              <p className="mt-8 max-w-2xl text-[17px] leading-[1.7] text-[var(--slot4-muted-text)]">
                {pagesContent.search.hero.description}
              </p>
            </EditableReveal>

            <EditableReveal index={1} className="mt-14">
              <form
                action="/search"
                className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5 sm:p-6"
              >
                <input type="hidden" name="master" value="1" />
                <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3">
                  <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder={pagesContent.search.hero.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                  />
                </label>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3">
                    <Filter className="h-4 w-4 text-[var(--slot4-accent)]" />
                    <input
                      name="category"
                      defaultValue={category}
                      placeholder="Category"
                      className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                    />
                  </label>
                  <select
                    name="task"
                    defaultValue={task}
                    className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3 text-[13px] font-medium text-[var(--slot4-page-text)] outline-none"
                  >
                    <option value="">All rooms</option>
                    {enabledTasks.map((item) => (
                      <option key={item.key} value={item.key}>
                        {getTaskTheme(item.key as TaskKey).kicker}
                      </option>
                    ))}
                  </select>
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95">
                    Search <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </EditableReveal>
          </div>
        </section>

        {/* RESULTS */}
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <EditableReveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-8">
              <div>
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                  {String(results.length).padStart(2, '0')} results
                </p>
                <h2 className={`${dc.type.sectionTitle} mt-6`}>
                  {query ? `“${query}”` : pagesContent.search.resultsTitle}
                </h2>
              </div>
              <Link href="/article" className={dc.button.ghost}>
                Open The Journal <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>

          {results.length ? (
            <div>
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index % 8}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[24px] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-14 text-center">
              <p className="editable-display text-[32px] font-medium tracking-[-0.02em]">No matches on the desk.</p>
              <p className="mt-4 text-[14px] leading-[1.65] text-[var(--slot4-muted-text)]">
                Try a different keyword, room, or category.
              </p>
            </div>
          )}

          {/* Footer ad */}
          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
