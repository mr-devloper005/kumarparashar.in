'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Modda-style navbar:
  - Only static links (About, Contact) in the center — never task/archive routes.
  - Right side: search icon → /search, then auth actions.
  - Sticky, dark, hairline bottom border, pill CTA on the right.
*/

const staticLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-500 ${
        scrolled
          ? 'border-[var(--editable-border)] bg-[rgba(11,11,11,0.86)] backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-6 px-6 sm:px-10 lg:px-14">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition duration-500 group-hover:rotate-[8deg]">
           <img src="/favicon.ico" alt="Logo" className="h-9 w-9" />
          </span>
          <span className="editable-display block max-w-[220px] truncate text-[18px] font-medium tracking-[-0.02em] text-[var(--slot4-page-text)]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Center static links — never task routes */}
        <div className="ml-6 hidden items-center gap-1 md:flex">
          {staticLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition duration-500 ${
                  active
                    ? 'text-[var(--slot4-accent)]'
                    : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-5 py-2.5 text-[13px] font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Submit <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[13px] font-semibold text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center rounded-full border border-[var(--editable-border-strong)] px-5 py-2.5 text-[13px] font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[13px] font-semibold text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 sm:inline-flex"
              >
                Get started <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-6 py-6 md:hidden">
          <div className="grid gap-1.5">
            <Link
              href="/"
              className="rounded-full border border-[var(--editable-border)] px-4 py-3 text-[13px] font-medium text-[var(--slot4-page-text)]"
            >
              Home
            </Link>
            {staticLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--editable-border)] px-4 py-3 text-[13px] font-medium text-[var(--slot4-page-text)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="rounded-full border border-[var(--editable-border)] px-4 py-3 text-[13px] font-medium text-[var(--slot4-page-text)]"
            >
              Search
            </Link>
            {session ? (
              <>
                <Link href="/create" className="rounded-full border border-[var(--editable-border-strong)] px-4 py-3 text-[13px] font-semibold text-[var(--slot4-page-text)]">
                  Submit
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-[var(--slot4-accent)] px-4 py-3 text-left text-[13px] font-semibold text-[var(--slot4-on-accent)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-[var(--editable-border-strong)] px-4 py-3 text-[13px] font-semibold text-[var(--slot4-page-text)]">
                  Sign in
                </Link>
                <Link href="/signup" className="rounded-full bg-[var(--slot4-accent)] px-4 py-3 text-[13px] font-semibold text-[var(--slot4-on-accent)]">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
