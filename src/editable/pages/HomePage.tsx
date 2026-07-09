import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import {
  EditableHomeCta,
  EditableHomeHero,
  EditableStatsBand,
  EditableAboutSplit,
  EditableSectionsDirectory,
  EditableEditorialRail,
  EditableProcessRows,
  EditableTimeCollections,
} from '@/editable/sections/HomeSections'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 300

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

export default async function HomePage() {
  // Public surface leads with the Reference Library (pdf). Fall back to the
  // first enabled non-profile task if pdf isn't enabled. Profile is functional
  // but never surfaced publicly.
  const publicTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile')
  const primaryTask = ((publicTasks.find((task) => task.key === 'pdf')?.key ||
    publicTasks[0]?.key ||
    'article') as TaskKey)
  const primaryRoute = SITE_CONFIG.taskViews[primaryTask] || `/${primaryTask}`
  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const primaryPosts = uniquePosts(
    taskFeed.find(({ task }) => task.key === primaryTask)?.posts || taskFeed.flatMap(({ posts }) => posts)
  ).slice(0, 24)
  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTask, { limit: 8, timeoutMs: 2500 })
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')

  const homeProps = { primaryTask, primaryRoute, posts: primaryPosts, timeSections }

  return (
    <EditableSiteShell>
      <main>
        <SchemaJsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <EditableHomeHero {...homeProps} />
        <div className="mx-auto mt-16 w-full max-w-[var(--editable-container)] px-6 sm:px-10 lg:px-14">
          <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel eager className="mx-auto w-full" />
        </div>
        <EditableStatsBand {...homeProps} />
        <EditableAboutSplit {...homeProps} />
        <EditableSectionsDirectory {...homeProps} />
        <EditableEditorialRail {...homeProps} />
        <EditableProcessRows {...homeProps} />
        <EditableTimeCollections {...homeProps} />
        <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}
