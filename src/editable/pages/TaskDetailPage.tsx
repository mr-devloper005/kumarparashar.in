import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Verified,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableReadingProgress } from '@/editable/shell/EditableReadingProgress'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(
  task: TaskKey,
  params: Promise<{ slug?: string; username?: string }>
) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({
  task,
  params,
}: {
  task: TaskKey
  params: Promise<{ slug?: string; username?: string }>
}) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // Related pool: every task, including profile, shows related entries from
  // its own room so the detail page surfaces genuinely related posts.
  const relatedTask: TaskKey = task
  const relatedPool = await fetchTaskPosts(relatedTask, 7)
  const related = relatedPool.filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return (
    <TaskDetailView
      task={task}
      post={post}
      related={related}
      relatedTask={relatedTask}
      comments={comments}
    />
  )
}

/* -------------------------------- helpers -------------------------------- */
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const dedupeUrls = (urls: Array<string | null | undefined>): string[] =>
  Array.from(new Set(urls.map((url) => (typeof url === 'string' ? url.trim() : '')).filter((url) => url.length > 0)))

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar', 'cover']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  const deduped = Array.from(new Set([...media, ...images, ...singleImages].filter(Boolean)))
  return deduped.slice(0, 16)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) ||
    asText(content.description) ||
    asText(content.details) ||
    post.summary ||
    'Details will appear here once available.'
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')
const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`
  )
const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) =>
      `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`
  )
const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })
const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )
const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const comparableText = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  const leadKey = comparableText(lead)
  return leadKey && comparableText(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

const readingTime = (post: SitePost) => {
  const words = stripHtml(getBody(post)).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

const wordCount = (post: SitePost) => stripHtml(getBody(post)).split(/\s+/).filter(Boolean).length

// Extract H2s from body (for the "In this piece" outline)
const extractOutline = (post: SitePost): string[] => {
  const body = getBody(post)
  const html = /<[a-z][\s\S]*>/i.test(body) ? body : ''
  const matches: string[] = []
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const clean = stripHtml(m[1])
    if (clean) matches.push(clean)
    if (matches.length >= 6) break
  }
  return matches
}

// First plain-text paragraph of the body (for a highlighted "pull-quote"
// treatment when we don't have a distinct standfirst).
const firstParagraph = (post: SitePost, maxWords = 30) => {
  const body = getBody(post)
  const clean = stripHtml(body)
  const words = clean.split(/\s+/).slice(0, maxWords).join(' ')
  return words.length < clean.length ? `${words}…` : words
}

/* ----------------------------- entry point ----------------------------- */
export function TaskDetailView({
  task,
  post,
  related,
  relatedTask,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  relatedTask?: TaskKey
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const rTask = relatedTask || task
  return (
    <EditableSiteShell>
      <main
        style={taskThemeStyle(task)}
        className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]"
      >
        {task === 'listing' ? <ListingDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} relatedTask={rTask} /> : null}
        {task === 'article' ? (
          <ArticleDetail post={post} related={related} relatedTask={rTask} comments={comments} />
        ) : null}
      </main>
    </EditableSiteShell>
  )
}

/* --------------------------- shared blocks ---------------------------- */
function BackLink({ task, forceHome = false }: { task: TaskKey; forceHome?: boolean }) {
  // Profile detail is reachable by direct URL only — its back link points
  // home, never to a hidden archive.
  const theme = getTaskTheme(task)
  const taskConfig = getTaskConfig(task)
  const href = forceHome ? '/' : taskConfig?.route || '/'
  const label = forceHome ? 'Back to home' : `Back to ${theme.kicker}`
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--tk-muted)] transition duration-500 hover:text-[var(--tk-accent)]"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  )
}

function Kicker({
  task,
  children,
  showLabel = true,
}: {
  task: TaskKey
  children?: React.ReactNode
  showLabel?: boolean
}) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-3 editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--tk-accent)]" />
      {showLabel ? <span>{theme.kicker}</span> : null}
      {children ? (
        <>
          {showLabel ? <span className="text-[var(--tk-muted)]">·</span> : null}
          <span className="text-[var(--tk-muted)]">{children}</span>
        </>
      ) : null}
    </div>
  )
}

function Divider() {
  return <div className="my-14 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-10 max-w-none text-[var(--tk-text)] ${
        compact ? 'text-[15px] leading-[1.7]' : 'text-[17px] leading-[1.8]'
      }`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div
          key={label}
          className="rounded-[14px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5"
        >
          <div className="flex items-center gap-2 editable-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
            <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
          </div>
          <p className="mt-3 break-words text-[15px] font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-16">
      <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
        {label}
      </p>
      <div className={`mt-5 grid gap-4 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            className="aspect-[4/3] rounded-[14px] border border-[var(--tk-line)] object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--tk-line)] p-5 text-[13px] font-semibold">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'On the map'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({
  website,
  phone,
  email,
  bare = false,
}: {
  website?: string
  phone?: string
  email?: string
  bare?: boolean
}) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link
          href={website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
        >
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-[13px] font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-[13px] font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]"
        >
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
        Quick actions
      </p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-[13px]">
      <span className="editable-mono font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

/* ============================================================================
 *  PROFILE DETAIL — premium, fully new layout
 *  Reachable by direct URL only; never linked from public UI.
 * ========================================================================== */
function ProfileDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const images = getImages(post)
  const avatar = images[0]
  const cover = images[1] || images[0]
  const gallery = images.slice(2)

  const role = getField(post, ['role', 'designation', 'title'])
  const company = getField(post, ['company', 'org', 'organization'])
  const location = getField(post, ['location', 'address', 'city'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const mapSrc = mapSrcFor(post)
  const tagList = Array.isArray(post.tags) ? post.tags.slice(0, 8) : []
  const initials = post.title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('')

  return (
    <>
      {/* ------------------ HERO with cover + overlapping avatar ------------------ */}
      <section className="relative">
        {/* Cover band */}
        <div className="relative h-[380px] w-full overflow-hidden bg-[var(--tk-raised)] sm:h-[480px] lg:h-[560px]">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.35)_0%,rgba(11,11,11,0.55)_50%,var(--tk-bg)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-[380px] bg-[radial-gradient(60%_60%_at_50%_100%,var(--tk-glow),transparent_72%)]" />

          {/* Top toolbar */}
          <div className="relative z-10 mx-auto flex max-w-[var(--editable-container)] items-center justify-between px-6 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
            <BackLink task="profile" forceHome />
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[rgba(11,11,11,0.5)] px-3.5 py-1.5 editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)] backdrop-blur">
              {getTaskTheme('profile').kicker}
            </span>
          </div>
        </div>

        {/* Overlapping identity card */}
        <div className="relative z-10 -mt-40 mx-auto max-w-[var(--editable-container)] px-6 sm:-mt-56 sm:px-10 lg:-mt-64 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
            <EditableReveal>
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-[var(--tk-line)] bg-[var(--tk-raised)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center editable-display text-[92px] font-medium text-[var(--tk-accent)]">
                      {initials || <UserRound className="h-24 w-24" />}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-3 -right-3 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 editable-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-on-accent)] shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                  <Verified className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </EditableReveal>

            <EditableReveal index={1} className="min-w-0 pb-4">
              <h1 className="editable-display text-[52px] font-medium leading-[0.95] tracking-[-0.035em] sm:text-[88px] lg:text-[112px]">
                {post.title}
              </h1>
              {role || company ? (
                <p className="mt-6 text-[18px] font-medium text-[var(--tk-text)] sm:text-[22px]">
                  {[role, company].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                {website ? (
                  <Link
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
                  >
                    Visit official site <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-6 py-3 text-[13px] font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </a>
                ) : null}
              </div>
            </EditableReveal>
          </div>
        </div>
      </section>

      {/* ------------------ FACTS BAND ------------------ */}
      <section className="mx-auto mt-24 max-w-[var(--editable-container)] px-6 sm:mt-32 sm:px-10 lg:px-14">
        <div className="grid gap-px overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-line)] sm:grid-cols-3">
          <FactCell icon={MapPin} label="Based in" value={location || '—'} />
          
          <FactCell
            icon={Globe2}
            label="On the web"
            value={website ? website.replace(/^https?:\/\//, '').replace(/\/$/, '') : '—'}
          />
          <FactCell icon={ShieldCheck} label="Status" value="Verified" accent />
        </div>
      </section>

      {/* ------------------ BODY + STICKY SIDEBAR ------------------ */}
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="min-w-0">
            <EditableReveal>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                Full note
              </p>
              <h2 className="editable-display mt-4 text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]">
                About the entry.
              </h2>
            </EditableReveal>
            <BodyContent post={post} />

            {tagList.length ? (
              <div className="mt-14">
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  Tagged
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {gallery.length ? (
              <div className="mt-16">
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  Portfolio
                </p>
                <div className="mt-5 columns-1 gap-4 sm:columns-2 [column-fill:_balance]">
                  {gallery.slice(0, 10).map((image, index) => (
                    <figure
                      key={`${image}-${index}`}
                      className="mb-4 overflow-hidden rounded-[14px] border border-[var(--tk-line)] bg-[var(--tk-raised)] break-inside-avoid"
                    >
                      <img src={image} alt="" className="w-full object-cover" />
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}

            {mapSrc ? (
              <div className="mt-16">
                <MapBox src={mapSrc} label={location || post.title} />
              </div>
            ) : null}
          </article>

          {/* ---------- Sticky sidebar ---------- */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Contact card */}
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                Direct routes
              </p>
              <div className="mt-6 space-y-2">
                {location ? (
                  <ContactRow
                    icon={MapPin}
                    label={location}
                    href={mapSrc ? `https://maps.google.com/?q=${encodeURIComponent(location)}` : undefined}
                    external={Boolean(mapSrc)}
                  />
                ) : null}
                {phone ? <ContactRow icon={Phone} label={phone} href={`tel:${phone}`} /> : null}
                {email ? <ContactRow icon={Mail} label={email} href={`mailto:${email}`} /> : null}
                {website ? (
                  <ContactRow
                    icon={Globe2}
                    label={website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    href={website}
                    external
                  />
                ) : null}
              </div>
              {website ? (
                <Link
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
                >
                  Visit official site <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {/* Quick facts card */}
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                At a glance
              </p>
              <div className="mt-5 grid gap-3">
                <MetaRow label="Location" value={location || '—'} />
                
                <MetaRow label="Tags" value={tagList.length ? String(tagList.length) : '—'} />
              </div>
            </div>

            {/* Trust panel */}
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                Verified
              </p>
              <div className="mt-5 space-y-3.5">
                <TrustRow icon={Verified} label="Identity confirmed" />
                <TrustRow icon={CheckCircle2} label="Contact details reviewed" />
                <TrustRow icon={Sparkles} label="Active on the desk" />
              </div>
            </div>

            {/* Sidebar ad */}
            <Ads
              slot="sidebar"
              size={pickRandom(getSlotSizes('sidebar'))}
              showLabel
              className="mx-auto w-full"
            />
          </aside>
        </div>
      </section>

      {/* Related strip pulls from the public library — never more profiles */}
      <RelatedStrip
        task={relatedTask}
        related={related}
        title={`More from ${getTaskTheme(relatedTask).kicker}`}
      />
    </>
  )
}

function FactCell({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof MapPin
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="bg-[var(--tk-bg)] p-7">
      <div className="flex items-center gap-2 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
        <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
      </div>
      <p
        className={`mt-4 text-[16px] font-medium sm:text-[17px] ${
          accent ? 'inline-flex items-center gap-2 text-[var(--tk-accent)]' : 'text-[var(--tk-text)]'
        }`}
      >
        {accent ? <Verified className="h-4 w-4" /> : null}
        {value}
      </p>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  href,
  external = false,
}: {
  icon: typeof MapPin
  label: string
  href?: string
  external?: boolean
}) {
  const inner = (
    <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] leading-6 text-[var(--tk-text)] transition duration-500 hover:bg-[var(--tk-raised)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </span>
  )
  if (!href) return <div>{inner}</div>
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="block"
    >
      {inner}
    </Link>
  )
}

function TrustRow({ icon: Icon, label }: { icon: typeof Verified; label: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] font-medium text-[var(--tk-text)]">
      <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--tk-line)] pb-3 last:border-b-0 last:pb-0">
      <span className="editable-mono shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
        {label}
      </span>
      <span
        className="min-w-0 flex-1 break-words text-right text-[13px] font-semibold leading-[1.4] text-[var(--tk-text)]"
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

/* ============================================================================
 *  ARTICLE DETAIL — premium, fully new editorial layout
 * ========================================================================== */
function ArticleDetail({
  post,
  related,
  relatedTask,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  relatedTask: TaskKey
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  const hero = images[0]
  const secondary = images[1]
  const category = categoryOf(post, 'Feature')
  const rtime = readingTime(post)
  const words = wordCount(post)
  const outline = extractOutline(post)
  const author = post.authorName || SITE_CONFIG.name
  const tagList = Array.isArray(post.tags) ? post.tags.slice(0, 8) : []

  return (
    <>
      {/* Reading progress bar */}
      <EditableReadingProgress />

      {/* ================= HERO (split layout) ================= */}
      <section className="relative overflow-hidden border-b border-[var(--tk-line)]">
        <div className="mx-auto max-w-[var(--editable-container)] px-6 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
          <BackLink task="article" />

          <div className="mt-14 grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            {/* Left — chip row + big headline + byline */}
            <EditableReveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                  {getTaskTheme('article').kicker}
                </span>
                <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  {category}
                </span>
                <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  <Clock3 className="mr-1.5 inline h-3.5 w-3.5" />
                  {rtime} min read
                </span>
                <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  {words.toLocaleString()} words
                </span>
              </div>

              <h1 className="editable-display mt-10 text-balance text-[52px] font-medium leading-[0.94] tracking-[-0.035em] sm:text-[80px] lg:text-[104px]">
                {post.title}
              </h1>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] editable-display text-[16px] font-medium text-[var(--tk-accent)]">
                    {author.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <span className="editable-display block text-[15px] font-medium text-[var(--tk-text)]">
                      {author}
                    </span>
                    <span className="editable-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tk-muted)]">
                      Desk contributor
                    </span>
                  </span>
                </span>
              </div>
            </EditableReveal>

            {/* Right — hero image (portrait) */}
            <EditableReveal index={1}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {hero ? (
                  <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-[var(--tk-muted)]" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-[linear-gradient(180deg,transparent,rgba(11,11,11,0.85))] p-5 pt-16">
                  <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
                    Cover · {category}
                  </span>
                  <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                    {rtime}′
                  </span>
                </div>
              </div>
            </EditableReveal>
          </div>
        </div>
      </section>

      {/* ================= BODY + SIDEBAR ================= */}
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 lg:max-w-[740px]">
            {/* Meta strip at the top of the body column */}
            <div className="flex flex-wrap items-center gap-3 border-b border-[var(--tk-line)] pb-6 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
              <span className="text-[var(--tk-accent)]">Entry {post.slug.slice(0, 8)}</span>
              <span>·</span>
              <span>{category}</span>
              <span>·</span>
              <span>{rtime} min read</span>
            </div>

            <BodyContent post={post} />

            {/* Optional secondary image mid-piece */}
            {secondary ? (
              <figure className="mt-16 overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                <img src={secondary} alt="" className="w-full object-cover" />
                <figcaption className="border-t border-[var(--tk-line)] bg-[var(--tk-surface)] px-6 py-4 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  From the piece · {category}
                </figcaption>
              </figure>
            ) : null}

            {/* Repeated CTA callout */}
            <div className="mt-16 rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-10">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
                Continue with the desk
              </p>
              <h3 className="editable-display mt-5 text-[28px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
                Every entry lands here first — subscribe or contribute yours.
              </h3>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
                >
                  Get started <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]"
                >
                  Submit an entry
                </Link>
              </div>
            </div>

            {tagList.length ? (
              <div className="mt-14">
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  Tagged
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <ImageStrip images={images.slice(2)} label="From the piece" large />

            {/* Share row */}
            <div className="mt-16 flex items-center gap-4 border-y border-[var(--tk-line)] py-6 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
              <Share2 className="h-4 w-4 text-[var(--tk-accent)]" /> Pass this piece along
            </div>

            {/* Ad — inside article */}
            <div className="mt-16">
              <Ads
                slot="article-bottom"
                size={pickRandom(getSlotSizes('article-bottom'))}
                showLabel
                className="mx-auto w-full"
              />
            </div>

            <EditableArticleComments slug={post.slug} comments={comments} />
          </article>

          {/* Sticky sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                Author
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] editable-display text-[16px] font-medium text-[var(--tk-accent)]">
                  {author.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="editable-display truncate text-[16px] font-medium">{author}</p>
                  <p className="truncate text-[12px] text-[var(--tk-muted)]">Desk contributor</p>
                </div>
              </div>
              <p className="mt-5 text-[13px] leading-[1.65] text-[var(--tk-muted)]">
                Writing on {category.toLowerCase()} for the {SITE_CONFIG.name} desk.
              </p>
            </div>

            {outline.length ? (
              <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  In this piece
                </p>
                <ol className="mt-5 space-y-3.5 text-[13px] leading-[1.55] text-[var(--tk-text)]">
                  {outline.map((heading, i) => (
                    <li key={heading} className="flex gap-3">
                      <span className="editable-mono w-7 shrink-0 text-[var(--tk-accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="line-clamp-2">{heading}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-accent)] p-7 text-[var(--tk-on-accent)]">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em]">
                Never miss an entry
              </p>
              <h3 className="editable-display mt-4 text-[24px] font-medium leading-[1.1] tracking-[-0.02em]">
                Subscribe to the desk.
              </h3>
              <Link
                href="/signup"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-on-accent)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-accent)] transition hover:brightness-125"
              >
                Get started <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                Piece stats
              </p>
              <div className="mt-5 grid gap-3">
                <MetaRow label="Length" value={`${words.toLocaleString()} words`} />
                <MetaRow label="Reading" value={`${rtime} min`} />
                <MetaRow label="Category" value={category} />
                <MetaRow label="Sections" value={outline.length ? String(outline.length) : '—'} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <RelatedStrip
        task={relatedTask}
        related={related}
        title={`More from ${getTaskTheme(relatedTask).kicker}`}
      />
    </>
  )
}

/* ============================ OTHER TASK DETAILS ======================= */
function ListingDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
      <BackLink task="listing" />
      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />
              )}
            </div>
            <div className="min-w-0">
              <Kicker task="listing" />
              <h1 className="editable-display mt-4 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
                {post.title}
              </h1>
            </div>
          </div>
          {leadText(post) ? (
            <p className="mt-8 max-w-2xl text-[19px] leading-[1.65] text-[var(--tk-muted)]">
              {leadText(post)}
            </p>
          ) : null}
          <InfoGrid
            items={[
              ['Location', address, MapPin],
              ['Phone', phone, Phone],
              ['Email', email, Mail],
              ['Website', website, Globe2],
            ]}
          />
          <Divider />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
        </aside>
      </div>
      <RelatedStrip task={relatedTask} related={related} title="More studios" />
    </section>
  )
}

function ClassifiedDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-14 px-6 pb-24 pt-32 sm:px-10 sm:pt-40 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-14 lg:pt-48">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-8 rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
            <Kicker task="classified" />
            <h1 className="editable-display mt-5 text-[28px] font-medium leading-[1.05] tracking-[-0.02em]">
              {post.title}
            </h1>
            <p className="editable-display mt-6 text-[48px] font-medium tracking-[-0.03em] text-[var(--tk-accent)]">
              {price || 'Open offer'}
            </p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
                >
                  <Phone className="h-4 w-4" /> Call now
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-[13px] font-semibold transition hover:border-[var(--tk-accent)]"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task={relatedTask} related={related} title="More notices" />
    </>
  )
}

function ImageDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
        <BackLink task="image" />
        <div className="mt-12 grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure
                key={`${image}-${index}`}
                className="mb-6 break-inside-avoid overflow-hidden rounded-[16px] border border-[var(--tk-line)] bg-[var(--tk-surface)]"
              >
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
              <Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Visual entry
            </span>
            <h1 className="editable-display mt-8 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
              {post.title}
            </h1>
            {leadText(post) ? (
              <p className="mt-6 text-[17px] leading-[1.7] text-[var(--tk-muted)]">{leadText(post)}</p>
            ) : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task={relatedTask} related={related} title="More visuals" />
    </>
  )
}

function BookmarkDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:pt-40 lg:pt-48">
        <BackLink task="sbm" />
        <div className="mt-12 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-7 w-7" />
        </div>
        <div className="mt-6">
          <Kicker task="sbm" />
        </div>
        <h1 className="editable-display mt-4 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
          {post.title}
        </h1>
        {leadText(post) ? (
          <p className="mt-6 text-[19px] leading-[1.65] text-[var(--tk-muted)]">{leadText(post)}</p>
        ) : null}
        {website ? (
          <Link
            href={website}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
          >
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task={relatedTask} related={related} title="More from the shelf" />
    </>
  )
}

function PdfDetail({ post, related, relatedTask }: { post: SitePost; related: SitePost[]; relatedTask: TaskKey }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
      <BackLink task="pdf" />
      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
              <FileText className="h-9 w-9" />
            </div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'File')}</Kicker>
              <h1 className="editable-display mt-3 text-[36px] font-medium leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
                {post.title}
              </h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-12 overflow-hidden rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-5">
                <span className="text-[13px] font-semibold">File preview</span>
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-[12px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
                >
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={post.title}
                className="h-[78vh] w-full bg-[var(--tk-raised)]"
              />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
              <p className="text-[13px] font-semibold">Get this file</p>
              <p className="mt-2 text-[13px] leading-[1.65] text-[var(--tk-muted)]">
                Open or download the full document in a new tab.
              </p>
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-[13px] font-semibold text-[var(--tk-on-accent)] transition hover:brightness-95"
              >
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
      <RelatedStrip task={relatedTask} related={related} title="More files" />
    </section>
  )
}

/* ============================ RELATED STRIP ============================ */
function RelatedStrip({ task, related, title }: { task: TaskKey; related: SitePost[]; title: string }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-32">
        <EditableReveal>
          <div className="flex items-end justify-between gap-6">
            <h2 className="editable-display text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[48px]">
              {title}
            </h2>
            <Link
              href={taskConfig?.route || '/'}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--tk-accent)]"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, i) => (
            <EditableReveal key={item.id || item.slug} index={i}>
              <RelatedCard task={task} post={item} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[var(--tk-raised)]">
        {image ? (
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
          </div>
        )}
      </div>
      <div className="p-1">
        <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          {categoryOf(post, getTaskTheme(task).kicker)}
        </p>
        <h3 className="editable-display mt-3 line-clamp-2 text-[17px] font-medium leading-[1.15] tracking-[-0.01em]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-[var(--tk-muted)]">
          {stripHtml(summaryText(post))}
        </p>
      </div>
    </Link>
  )
}
