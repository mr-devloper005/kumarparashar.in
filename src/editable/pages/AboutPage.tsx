import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
            <EditableReveal>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.about.badge}
              </p>
              <h1 className="editable-display mt-8 max-w-4xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[80px] lg:text-[104px]">
                {pagesContent.about.title}
              </h1>
              <p className="mt-10 max-w-2xl text-[19px] leading-[1.65] text-[var(--slot4-muted-text)] sm:text-[22px]">
                {pagesContent.about.description}
              </p>
            </EditableReveal>
          </div>
        </section>

        {/* PARAGRAPHS */}
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <EditableReveal>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                Notes
              </p>
              <h2 className={`${dc.type.sectionTitle} mt-6`}>How the desk works.</h2>
            </EditableReveal>
            <div className="space-y-6">
              {pagesContent.about.paragraphs.map((p, i) => (
                <EditableReveal key={p} index={i}>
                  <p className="text-[17px] leading-[1.7] text-[var(--slot4-muted-text)]">{p}</p>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className={`${dc.shell.section} pb-32`}>
          <EditableReveal>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              Principles
            </p>
            <h2 className={`${dc.type.sectionTitle} mt-6 max-w-3xl`}>
              What holds every room together.
            </h2>
          </EditableReveal>
          <div className="mt-14 grid gap-px bg-[var(--editable-border)] sm:grid-cols-3">
            {pagesContent.about.values.map((value, i) => (
              <EditableReveal key={value.title} index={i} className="bg-[var(--slot4-page-bg)]">
                <div className="p-10">
                  <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="editable-display mt-6 text-[28px] font-medium leading-[1.1] tracking-[-0.02em]">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">
                    {value.description}
                  </p>
                </div>
              </EditableReveal>
            ))}
          </div>
          <EditableReveal className="mt-16">
            <p className="text-center text-[13px] text-[var(--slot4-soft-muted-text)]">
              About {SITE_CONFIG.name}.
            </p>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
