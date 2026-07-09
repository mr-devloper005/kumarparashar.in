import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/signup',
    title: 'Get started',
    description: pagesContent.auth.signup.metadataDescription,
  })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[var(--editable-container)] items-center gap-16 px-6 py-24 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24 lg:px-14">
          <EditableReveal>
            <div className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-10">
              <h1 className="editable-display text-[28px] font-medium tracking-[-0.02em]">
                {pagesContent.auth.signup.formTitle}
              </h1>
              <EditableLocalSignupForm />
              <p className="mt-8 text-[13px] text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--slot4-accent)] underline-offset-[6px] hover:underline"
                >
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.auth.signup.badge}
            </p>
            <h2 className="editable-display mt-8 max-w-xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[72px] lg:text-[88px]">
              {pagesContent.auth.signup.title}
            </h2>
            <p className="mt-8 max-w-md text-[16px] leading-[1.65] text-[var(--slot4-muted-text)]">
              {pagesContent.auth.signup.description}
            </p>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
