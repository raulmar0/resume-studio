# Resume Studio

ATS-friendly resume builder for real job hunts: multiple versions, fast edits, clean PDF exports that recruiters (and parsers) can actually read.

Built with Next.js 16 + Supabase + `@react-pdf/renderer`.

## Quick start

```bash
pnpm install
cp .env.local.example .env.local   # fill in Supabase URL + key
pnpm dev
```

Open http://localhost:3000.

## Stack

- **Framework**: Next.js 16 App Router + React 19 + TypeScript (Turbopack)
- **Styling**: Tailwind v4 + shadcn/ui (Base UI primitives)
- **Backend**: Supabase (Postgres + Auth + RLS)
- **PDF**: `@react-pdf/renderer` — native PDF, selectable text, ATS-parseable
- **Editor state**: Zustand + Immer + zundo (undo/redo)
- **Drag & drop**: @dnd-kit/sortable
- **Forms**: React Hook Form + Zod (validation at boundaries)

## Project layout

```
app/
  page.tsx                  marketing landing
  (auth)/                   login / signup / forgot / reset
  auth/
    actions.ts              server actions (signup, login, signOut, …)
    callback/route.ts       OAuth + email confirmation handler
  (app)/                    nav-bar wrapped pages
    dashboard/              resume list, create, duplicate, delete, rename
  editor/[id]/              full-screen editor (two-pane: sections + PDF preview)
  resumes/actions.ts        server actions for resume CRUD + autosave + snapshots

components/
  templates/                Minimal / Modern / Classic — react-pdf components
  editor/                   Toolbar, SectionPanel, ContactCard, SectionCard,
                            ThemePanel, AddSectionMenu, sections/*
  preview/PDFPreview.tsx    <PDFViewer> wrapper (no-SSR dynamic import)
  dashboard/                NavBar, UserMenu, ResumeCard, NewResumeDialog

lib/
  supabase/{client,server,proxy,types}.ts
  schemas/resume.ts         Zod ResumeDocument + discriminated section union
  stores/resume-editor.ts   Zustand store with Immer mutations + zundo
  stores/use-autosave.ts    800ms debounced sync hook
  pdf/export.ts             download helper (pdf().toBlob())
  templates/{registry,components}.ts   template metadata + component map
  ai/                       placeholder — wire AI features here (see below)

proxy.ts                    session refresh + (app)/* auth gate
supabase/migrations/        init + harden_function_security
```

## Database

Three tables, all with RLS scoped to `auth.uid()`:

- `profiles` — extends `auth.users` (display_name, tier='free')
- `resumes` — one row per resume version (title, template_id, theme, document jsonb)
- `resume_snapshots` — version history, capped to 20 per resume via trigger

A trigger auto-creates a profile row on signup. `updated_at` is touched on every update.

## Auth

Email/password and Google OAuth via Supabase.

**Google OAuth setup** (required before the "Continue with Google" button works):
1. Go to Supabase → Authentication → Providers → Google
2. Enable the provider and paste your Google OAuth client ID + secret
3. Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI in your Google Cloud OAuth client

## AI features — v2 backlog

Not built yet. The architecture leaves seams (`lib/ai/`, server actions, Supabase Edge Functions) so you can wire any provider later without touching the editor.

- [ ] Bullet rewrite — action-verb + metric rewriting of a selected bullet
- [ ] Job-description tailoring — paste a JD, AI duplicates and reorders your resume to match
- [ ] ATS keyword gap analysis — side-by-side JD vs. resume, highlight missing keywords
- [ ] AI summary generation — produce a 2-line summary from experience + skills
- [ ] Cover letter generation — from resume + JD
- [ ] Grammar / clarity pass on a whole document
- [ ] AI-suggested skills based on job title

Pick a provider when you're ready (Anthropic Claude, OpenAI, Vercel AI SDK). Proxy calls through a Supabase Edge Function so the API key never reaches the client.

## Other v2+ backlog

- [ ] DOCX export
- [ ] Public profile URL (`/u/[slug]`) + share-by-link with view-only access
- [ ] More templates (6+, including ATS-safe two-column)
- [ ] Stripe billing + tier gating (`free` = 2 resumes / 3 templates; `pro` = unlimited + AI)
- [ ] Snapshot diff view + restore UI (snapshots are stored already, no UI yet)
- [ ] Mobile-responsive editor (v1 is desktop-first)
- [ ] Real-time collab (Supabase Realtime channels)

## Verification checklist

End-to-end checks before declaring v1 shipped:

1. **Auth round-trip** — sign up → confirm email → log in → log out → reset password.
2. **Multi-version flow** — create resume A → fill it → duplicate → rename → edit duplicate → confirm A unchanged.
3. **Autosave** — edit a field, wait 1s, hard-refresh, confirm persisted. Disable network, edit, confirm "Offline" pill, re-enable, confirm recovery.
4. **PDF ATS check** — export PDF, open in macOS Preview, select all text, copy. Every section's text appears as plain selectable text.
5. **PDF in a real ATS** — upload exported PDF to resumeworded.com or a free Jobscan check → fields parsed.
6. **RLS** — log in as user B, attempt `GET /editor/<user-A-id>` → 404 / redirect. Run `select * from resumes` from anon key → 0 rows.
7. **Template parity** — same document renders cleanly in all 3 templates on a 2-page resume.
8. **Performance** — Lighthouse on `/` ≥ 90 perf/a11y/SEO; editor TTI ≤ 2s.
9. **Build + types** — `pnpm build` and `pnpm exec tsc --noEmit` clean.
