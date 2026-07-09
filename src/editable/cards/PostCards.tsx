import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* --------------------------------------------------------------------------- */
/*  Modda-style dark cards. Elevated panel + hairline border + soft image lift. */
/* --------------------------------------------------------------------------- */

export function EditorialFeatureCard({
  post,
  href,
  label = 'Featured',
}: {
  post: SitePost
  href: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className={`group relative block min-w-0 overflow-hidden ${dc.surface.dark} ${dc.motion.borderGlow}`}
    >
      <div className={`${dc.media.frameFull} aspect-[16/10] rounded-none`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0)_0%,rgba(11,11,11,0.4)_55%,rgba(11,11,11,0.92)_100%)]" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16">
          <span className={dc.badge.accentPill}>{label}</span>
          <h3 className="editable-display mt-6 max-w-4xl text-[36px] font-medium leading-[0.98] tracking-[-0.03em] text-white sm:text-[56px] lg:text-[72px]">
            {post.title}
          </h3>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.7] text-white/72 sm:text-[16px]">
            {getEditableExcerpt(post, 180)}
          </p>
          <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--slot4-accent)]">
            Read on <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.borderGlow}`}
    >
      <div className={`${dc.media.frame} aspect-[4/5] rounded-none`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`}
        />
        <span className="absolute left-5 top-5 editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
          No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6">
        <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
        <h3 className="editable-display mt-3 line-clamp-3 text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className={`mt-3 line-clamp-2 text-[14px] leading-[1.65] ${pal.mutedText}`}>
          {getEditableExcerpt(post, 130)}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid items-start gap-6 border-b border-[var(--editable-border)] py-8 transition duration-500 hover:border-[var(--slot4-accent)] sm:grid-cols-[80px_minmax(0,1fr)_auto]`}
    >
      <span className="editable-mono text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
          {getEditableCategory(post)}
        </p>
        <h3 className="editable-display mt-2 line-clamp-2 text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-[28px]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[14px] leading-[1.7] text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 140)}
        </p>
      </div>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition duration-500 group-hover:border-[var(--slot4-accent)] group-hover:bg-[var(--slot4-accent)] group-hover:text-[var(--slot4-on-accent)]">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 items-center gap-8 overflow-hidden border-b border-[var(--editable-border)] py-10 transition duration-500 hover:border-[var(--slot4-accent)] sm:grid-cols-[260px_minmax(0,1fr)_auto]`}
    >
      <div className={`${dc.media.frame} aspect-[4/3] rounded-[14px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`}
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
            {getEditableCategory(post)}
          </span>
          <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-soft-muted-text)]">
            · Entry {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <h2 className="editable-display mt-3 line-clamp-2 text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-[36px]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 200)}
        </p>
      </div>
      <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition duration-500 group-hover:border-[var(--slot4-accent)] group-hover:bg-[var(--slot4-accent)] group-hover:text-[var(--slot4-on-accent)] sm:inline-flex">
        <ArrowUpRight className="h-5 w-5" />
      </span>
    </Link>
  )
}
