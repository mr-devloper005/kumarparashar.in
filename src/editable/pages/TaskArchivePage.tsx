import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, UserRound, BriefcaseBusiness } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// Modda-feel grids: one column that breathes for editorial/directory content.
const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-0',
  listing: 'grid gap-0 xl:grid-cols-2',
  classified: 'grid gap-8 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const displayLabel = theme.kicker
  const categoryLabel =
    category === 'all' ? 'All rooms' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  // One ad per archive per rule set — profile in-feed, article header, others none.
  const showHeaderAd = task === 'article'
  const showInFeedAd = task === 'profile'
  const inFeedIndex = 5

  return (
    <EditableSiteShell>
      <main
        style={taskThemeStyle(task)}
        className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]"
      >
        {/* -------- Header -------- */}
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_75%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-20 pt-36 sm:px-10 sm:pt-44 lg:px-14 lg:pt-48">
            <EditableReveal>
              <div className="flex items-center gap-3 editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tk-accent)]" />
                <span>{theme.kicker}</span>
              </div>
              <h1 className="editable-display mt-8 max-w-4xl text-balance text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[80px] lg:text-[104px]">
                {voice?.headline || `The ${displayLabel} archive.`}
              </h1>
              <p className="mt-8 max-w-3xl text-[17px] leading-[1.65] text-[var(--tk-muted)] sm:text-[19px]">
                {voice?.description || theme.note}
              </p>
              {voice?.chips?.length ? (
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </EditableReveal>

            {/* Filter strip */}
            <div className="mt-16 flex flex-col gap-6 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[14px] text-[var(--tk-muted)]">
                <span className="font-semibold text-[var(--tk-text)]">
                  {String(posts.length).padStart(2, '0')}
                </span>{' '}
                entries · {categoryLabel}
              </p>
              <form action={basePath} className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 appearance-none rounded-full border border-[var(--tk-line)] bg-transparent pl-5 pr-11 text-[13px] font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter room'}
                  >
                    <option value="all" className="bg-[var(--tk-bg)] text-[var(--tk-text)]">
                      All rooms
                    </option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug} className="bg-[var(--tk-bg)] text-[var(--tk-text)]">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 text-[13px] font-semibold text-[var(--tk-on-accent)] transition duration-500 hover:brightness-95">
                  Filter <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* -------- Header ad (article only) -------- */}
        {showHeaderAd ? (
          <div className="mx-auto max-w-[var(--editable-container)] px-6 pt-14 sm:px-10 lg:px-14">
            <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel className="mx-auto w-full" />
          </div>
        ) : null}

        {/* -------- Feed -------- */}
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <div key={post.id || post.slug}>
                  <EditableReveal index={index % 8}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                  {showInFeedAd && index === inFeedIndex ? (
                    <div className="my-12">
                      <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel className="mx-auto w-full" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-10 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-6 text-[28px] font-medium tracking-[-0.02em]">
                Nothing on the shelf yet
              </h2>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--tk-muted)]">
                Check back after new {displayLabel.toLowerCase()} land — the desk restocks weekly.
              </p>
            </div>
          )}

          {/* -------- Pagination -------- */}
          {posts.length ? (
            <nav className="mt-20 flex items-center justify-center gap-3 text-[13px]">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="rounded-full border border-[var(--tk-line)] px-6 py-3 font-medium transition hover:border-[var(--tk-accent)]"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="editable-mono rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-6 py-3 font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="rounded-full border border-[var(--tk-line)] px-6 py-3 font-medium transition hover:border-[var(--tk-accent)]"
                >
                  Next →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({
  post,
  task,
  basePath,
  index,
}: {
  post: SitePost
  task: TaskKey
  basePath: string
  index: number
}) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

/* --------------------------------------------------------------------------
 *  Article (Journal) — hairline-divider editorial row, image right on desktop
 * ------------------------------------------------------------------------ */
function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Feature')
  return (
    <Link
      href={href}
      className="group grid items-center gap-10 border-b border-[var(--tk-line)] py-12 transition duration-500 hover:border-[var(--tk-accent)] sm:grid-cols-[80px_minmax(0,1fr)_320px]"
    >
      <span className="editable-mono text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          {category}
        </p>
        <h2 className="editable-display mt-4 line-clamp-2 text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-[15px] leading-[1.7] text-[var(--tk-muted)]">
          {getSummary(post)}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--tk-accent)]">
          Read entry <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[var(--tk-raised)]">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-105"
        />
      </div>
    </Link>
  )
}

/* -------- Listing (studio directory) -------- */
function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link
      href={href}
      className="group grid items-center gap-6 border-b border-[var(--tk-line)] py-10 transition duration-500 hover:border-[var(--tk-accent)] sm:grid-cols-[100px_minmax(0,1fr)_auto]"
    >
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[14px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />
        )}
      </div>
      <div className="min-w-0">
        <h2 className="editable-display truncate text-[24px] font-medium tracking-[-0.02em] sm:text-[28px]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-1 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-medium text-[var(--tk-muted)]">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="h-6 w-6 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

/* -------- Classified (notice) -------- */
function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-[32px] font-medium tracking-[-0.03em] text-[var(--tk-accent)]">
          {price || 'Open offer'}
        </span>
        {condition ? (
          <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
            {condition}
          </span>
        ) : null}
      </div>
      <h2 className="editable-display mt-5 text-[20px] font-medium leading-snug tracking-[-0.02em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-[1.65] text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-[12px] font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Details inside'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

/* -------- Image (visuals) -------- */
function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-6 block break-inside-avoid overflow-hidden rounded-[16px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:border-[var(--tk-accent)]"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(11,11,11,0.9))] opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-display line-clamp-2 text-[20px] font-medium leading-snug tracking-[-0.02em] text-white">
            {post.title}
          </h2>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--tk-accent)]">
            Open frame <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* -------- Bookmark (shelf) -------- */
function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Globe className="h-5 w-5" />
        </div>
        <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
          Shelf · {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h2 className="editable-display text-[20px] font-medium leading-snug tracking-[-0.02em]">
        {post.title}
      </h2>
      <p className="line-clamp-2 text-[14px] leading-[1.65] text-[var(--tk-muted)]">{getSummary(post)}</p>
      {website ? (
        <p className="mt-auto truncate text-[12px] font-medium text-[var(--tk-accent)]">
          {cleanDomain(website)}
        </p>
      ) : null}
    </Link>
  )
}

/* -------- PDF (files) -------- */
function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'File')
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-6 w-6" />
        </div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">
          {category}
        </span>
      </div>
      <h2 className="editable-display mt-6 text-[20px] font-medium leading-snug tracking-[-0.02em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-[1.65] text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--tk-accent)]">
        Open file <Download className="h-4 w-4" />
      </span>
    </Link>
  )
}

/* -------- Profile (directory entry) -------- */
function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-[var(--tk-raised)]">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UserRound className="h-12 w-12 text-[var(--tk-muted)]" />
          </div>
        )}
      </div>
      <h2 className="editable-display mt-5 text-[20px] font-medium tracking-[-0.02em]">{post.title}</h2>
      {role ? (
        <p className="mt-2 editable-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-accent)]">
          {role}
        </p>
      ) : null}
      <p className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--tk-accent)]">
        Open entry <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </span>
    </Link>
  )
}
