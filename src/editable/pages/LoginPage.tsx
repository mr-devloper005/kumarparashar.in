import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/login',
    title: 'Sign in',
    description: pagesContent.auth.login.metadataDescription,
  })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[var(--editable-container)] items-center gap-16 px-6 py-24 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:px-14">
          <EditableReveal>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.auth.login.badge}
            </p>
            <h1 className="editable-display mt-8 max-w-xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[72px] lg:text-[88px]">
              {pagesContent.auth.login.title}
            </h1>
            <p className="mt-8 max-w-md text-[16px] leading-[1.65] text-[var(--slot4-muted-text)]">
              {pagesContent.auth.login.description}
            </p>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-10">
              <h2 className="editable-display text-[28px] font-medium tracking-[-0.02em]">
                {pagesContent.auth.login.formTitle}
              </h2>
              <EditableLocalLoginForm />
              <p className="mt-8 text-[13px] text-[var(--slot4-muted-text)]">
                New to the desk?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-[var(--slot4-accent)] underline-offset-[6px] hover:underline"
                >
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
