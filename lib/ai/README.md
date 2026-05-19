# `lib/ai/` — AI features placeholder

This folder is intentionally empty in v1.

When you wire AI features (see the v2+ backlog in the root README), put the
provider-agnostic interface here:

```
lib/ai/
  client.ts          single export `aiClient` — thin wrapper around the provider SDK
  prompts/           prompt templates (bullet-rewrite, jd-tailor, etc.)
  rewrite-bullet.ts  example feature
```

Call AI from **Supabase Edge Functions** (deploy via `supabase functions deploy`),
not the Next.js server, so the provider API key stays out of your Vercel env.
The Next side then calls `supabase.functions.invoke('rewrite-bullet', { body: {…} })`.

Provider options:
- **Anthropic Claude** — `claude-sonnet-4-6` is the right default for cost/quality
- **OpenAI** — `gpt-4o-mini` for cheap, `gpt-4o` for quality
- **Vercel AI SDK** — provider-agnostic; lets you swap without code changes
