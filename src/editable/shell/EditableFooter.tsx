'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { getTaskTheme } from '@/editable/theme/task-themes'
import type { TaskKey } from '@/lib/site-config'

/*
  Modda-style footer:
  - CTA band on top: massive display headline + accent pill CTA.
  - Multi-column grid: brand + description · Discovery (renamed task labels) ·
    Resources · Account.
  - Wordmark row + fine print.
*/

export function EditableFooter() {
  // `profile` is a functional task but not surfaced publicly — never link to it.
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile')
  const { session, logout } = useEditableLocalAuthSession()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
      {/* CTA band */}
      <div className="border-b border-[var(--editable-border)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-start gap-10 px-6 py-20 sm:px-10 sm:py-28 lg:flex-row lg:items-end lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
              {globalContent.footer?.tagline || 'Partner with the desk'}
            </p>
            <h2 className="editable-display mt-6 text-[44px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[64px] lg:text-[80px]">
              Bring your work to&nbsp;
              <span className="text-[var(--slot4-accent)]">{SITE_CONFIG.name}.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-4 text-[14px] font-semibold text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95"
            >
              Get in touch <ArrowUpRight className="h-4 w-4" />
            </Link>
            {session ? (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-7 py-4 text-[14px] font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)]"
              >
                Submit your piece
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-7 py-4 text-[14px] font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)]"
              >
                Create an account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
              <img src="/favicon.ico" alt="Logo" className="h-10 w-10" />
            </span>
            <span className="editable-display text-[20px] font-medium tracking-[-0.02em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-sm text-[14px] leading-[1.75] text-[var(--slot4-muted-text)]">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
        </div>

        <FooterColumn title="Discovery">
          {taskLinks.map((task) => (
            <FooterLink key={task.key} href={task.route}>
              {getTaskTheme(task.key as TaskKey).kicker}
            </FooterLink>
          ))}
          <FooterLink href="/search">Search</FooterLink>
        </FooterColumn>

        <FooterColumn title="Studio">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account">
          {session ? (
            <>
              <FooterLink href="/create">Submit</FooterLink>
              <button
                type="button"
                onClick={logout}
                className="text-left text-[14px] font-medium text-[var(--slot4-muted-text)] transition duration-500 hover:text-[var(--slot4-accent)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <FooterLink href="/login">Sign in</FooterLink>
              <FooterLink href="/signup">Get started</FooterLink>
            </>
          )}
        </FooterColumn>
      </div>

      {/* Wordmark row */}
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-end justify-between gap-6 overflow-hidden px-6 py-10 sm:px-10 lg:px-14">
          <span className="editable-display block whitespace-nowrap text-[16vw] font-medium leading-none tracking-[-0.06em] text-[var(--slot4-page-text)] sm:text-[13vw] lg:text-[10vw]">
            {SITE_CONFIG.name.toUpperCase()}.
          </span>
        </div>
      </div>

      {/* Fine print */}
      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-start justify-between gap-3 px-6 py-6 text-[12px] font-medium text-[var(--slot4-soft-muted-text)] sm:flex-row sm:items-center sm:px-10 lg:px-14">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span className="editable-mono uppercase tracking-[0.18em]">{globalContent.footer?.bottomNote || SITE_CONFIG.tagline}</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
        {title}
      </h3>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--slot4-muted-text)] transition duration-500 hover:text-[var(--slot4-accent)]"
    >
      {children}
    </Link>
  )
}
