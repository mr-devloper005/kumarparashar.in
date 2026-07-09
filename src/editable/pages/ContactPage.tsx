'use client'

import { Mail, MapPin, MessageSquare, Sparkles } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: MapPin, title: 'New directory entries', body: 'Add your entry to the directory, verify contact details, and land on the desk quickly.' },
      { icon: MessageSquare, title: 'Partnership questions', body: 'Bulk onboarding, syndication, and studio-wide submissions — walk us through the shape.' },
      { icon: Sparkles, title: 'Coverage requests', body: 'Need a new room or category? We can extend the desk to match your work.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: Mail, title: 'Journal pitches', body: 'Pitch essays, columns, and long-form pieces for The Journal — the desk reads every one.' },
      { icon: MessageSquare, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Voice, formatting, and workflow questions from the desk.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: Mail, title: 'Visual collaborations', body: 'Gallery drops, feature entries, and long-form visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: MessageSquare, title: 'Media kit', body: 'Request the desk’s current media kit or feature placement details.' },
    ]
  }
  return [
    { icon: Mail, title: 'Shelf submissions', body: 'Suggest links and references worth keeping on the shelf.' },
    { icon: MessageSquare, title: 'Curation projects', body: 'Coordinate ongoing reference programs and collections.' },
    { icon: Sparkles, title: 'Curator support', body: 'Organizing shelves, boards, and directory-linked collections.' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell>
      <main>
        <section className="border-b border-[var(--editable-border)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 pb-20 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48">
            <EditableReveal>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.contact.eyebrow}
              </p>
              <h1 className="editable-display mt-8 max-w-4xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[80px] lg:text-[104px]">
                {pagesContent.contact.title}
              </h1>
              <p className="mt-10 max-w-2xl text-[17px] leading-[1.7] text-[var(--slot4-muted-text)] sm:text-[19px]">
                {pagesContent.contact.description}
              </p>
            </EditableReveal>
          </div>
        </section>

        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            {/* Lanes */}
            <div>
              <EditableReveal>
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                  Direct routes
                </p>
                <h2 className={`${dc.type.sectionTitle} mt-6 max-w-md`}>Where messages land.</h2>
              </EditableReveal>
              <div className="mt-10 grid gap-px bg-[var(--editable-border)]">
                {lanes.map((lane, i) => (
                  <EditableReveal key={lane.title} index={i} className="bg-[var(--slot4-page-bg)]">
                    <div className="flex gap-5 p-8">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                        <lane.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="editable-display text-[22px] font-medium leading-[1.1] tracking-[-0.02em]">
                          {lane.title}
                        </h3>
                        <p className="mt-2 text-[14px] leading-[1.7] text-[var(--slot4-muted-text)]">
                          {lane.body}
                        </p>
                      </div>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-10">
              <h2 className="editable-display text-[28px] font-medium leading-[1.05] tracking-[-0.02em]">
                {pagesContent.contact.formTitle}
              </h2>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--slot4-muted-text)]">
                One form, direct to the desk.
              </p>
              <EditableContactLeadForm />
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
