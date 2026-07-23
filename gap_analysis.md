YouthLink Uganda
Code Gap Analysis & Remediation Sprint Plan
Prepared for: YouthLink engineering & product team
Date: 23 July 2026
Scope: Codebase audit (React/Vite/Supabase) + competitive context vs. BrighterMonday Uganda and The Ugandan Jobline
 Executive Summary
YouthLink is a coherent MVP — not a prototype. Role-based routing, row-level security on every table, a working skill-matching algorithm with test coverage, and real-time notification plumbing are all in place. The codebase reflects real engineering discipline.
That said, the audit surfaced 4 critical items, 6 high-priority items, and 5 medium-priority items. Three of the critical items — a public CV storage bucket, a notification system that never gets written to, and a matching API that silently fails in production — should be fixed before any meaningful user growth, because they directly undermine the trust story that is YouthLink's main competitive lever against BrighterMonday Uganda and The Ugandan Jobline.
This document lays out every finding, then converts the fix list into a 4-sprint plan (roughly one engineer, one sprint = 1 week). Competitive/strategic features (SMS alerts, mobile money, employer verification UX, etc.) are documented for context but intentionally held out of this sprint plan, per scope agreed for this pass.
1. Code Gap Analysis
1.1 Critical — fix before scaling
These items involve either a live data-privacy exposure or a feature that silently doesn't work in production.

#	Gap	Why it matters / Fix
1	CVs are stored in a public, unauthenticated Supabase bucket. ManageJob.jsx builds links as .../storage/v1/object/public/cvs/... — anyone with the URL can pull a student's CV (name, phone, address) without logging in.	Move the `cvs` bucket to private; generate short-lived signed URLs server-side (or via a Supabase Edge Function) only for the employer who owns the listing being viewed.
2	Notifications are half-wired. NotificationContext, the real-time subscription, and the /notifications page all exist, but nothing ever inserts a row — applying for a job or an employer changing an applicant's status (ManageJob.jsx updateStatus) never writes to the notifications table.	Add a Postgres trigger on applications INSERT/UPDATE that writes a notification row for the relevant user_id, OR insert explicitly inside handleApply() and updateStatus(). Trigger approach is more robust — covers future write paths too.
3	useMatches.js calls fetch('/api/match') (a local Express server, server.js) for every listing on every dashboard load. This endpoint isn't part of the Vercel deploy path in the README, so in production it always fails and silently falls back to client scoring (wrapped in .catch(() => null)).	Either deploy the Express matcher as a Supabase Edge Function / serverless function and point the fetch at it, or delete the fetch call entirely and rely purely on calculateMatchScore() client-side — right now it's dead code that adds a failed network request per listing on every dashboard load.
4	cv_parsed_skills exists as a DB column (clearly meant for CV-parsing/auto-extracted skills) but is never written to or read anywhere in the app.	Decide: build a real CV-parsing step (even a simple keyword extractor) or drop the column. Right now it signals a feature that doesn't exist to anyone inspecting the schema.
1.2 High priority
These won't break today, but will break at the next order of magnitude of users, or represent missing trust/safety controls a job platform in this market needs.

#	Gap	Why it matters / Fix
5	No pagination anywhere. Jobs.jsx fetches all active listings on every filter change with no .range()/limit.	Add server-side pagination (e.g. .range(from, to)) plus a 'Load more' or page control once listings exceed ~50.
6	Search is a single ilike on job title only — no matching against skills or description, no ranking, no debounce on type-as-you-search.	Move to Postgres full-text search (tsvector) across title + description + skills_required, or add a debounce + broaden the ilike to more fields as an interim step.
7	listings.views exists in the schema but is never incremented — employer 'analytics' has no real data behind it.	Increment views on JobDetail.jsx mount (server-side RPC to avoid client-side inflation/spam).
8	No admin/moderation layer. Any user can self-register as an employer and post a live listing immediately — is_active defaults to true and employers.is_verified is never enforced anywhere.	Add an admin review queue: new employers start unverified and their first listing requires approval before is_active flips to true. Surface the is_verified badge on employer pages once enforced.
9	Test coverage is thin — one matching unit test, one Playwright smoke spec. No coverage on auth flows, application submission, or RLS edge cases.	Add integration tests for signUp/signIn, apply flow, and status-change flow; add a couple of RLS-focused tests using the Supabase test client.
10	Employer 'size' field has a DB check constraint but no confirmed UI to set it during employer onboarding.	Verify PostJob.jsx / employer profile flow actually surfaces this field; add it if missing so employer profile pages aren't perpetually blank there.
1.3 Medium priority
#	Gap	Why it matters / Fix
11	No SMS or email delivery layer — all communication depends on a user opening the app.	Documented in Section 3 as a strategic item; not sprinted in this pass.
12	No mobile money integration despite programs.cost existing in the schema.	Documented in Section 3; not sprinted in this pass.
13	No rate-limiting/anti-spam on the apply endpoint — a script could spam-apply to every listing.	Add a simple per-user rate limit (DB-level unique constraint already prevents duplicate applies to the same listing, but not spam across many listings).
14	No visible image optimization/CDN configuration for logos and avatars.	Use Supabase's image transformation params or a CDN in front of the storage bucket once traffic justifies it.
15	Matching algorithm is a simple fixed-weight heuristic (skills 60%, location 25%, availability 15%, type 10%) — reasonable v1, but easy to game and ignores experience/education level.	Fine for now; revisit weighting once real application-outcome data exists to validate against.
2. Sprint-by-Sprint Fix Plan
Assumes one full-time engineer per sprint (1 sprint ≈ 1 week). Adjust pacing if working part-time or with more than one engineer — Sprint 1 items should not ship without each other, since they're the trust-critical set.
Sprint 1 — Trust & Data Integrity (Critical)
Goal: close the data-exposure gap and make the features that already exist in the UI actually function end-to-end.
Task	Priority	Effort	Owner	Gap Ref
Migrate `cvs` storage bucket to private; implement signed-URL generation for employer CV access	Critical	2 days	Backend	Gap 1
Audit all other storage buckets (logos, avatars) for correct public/private settings	Critical	0.5 day	Backend	Gap 1
Add DB trigger (or explicit inserts) to populate notifications on application create/status-change	Critical	1.5 days	Backend	Gap 2
Decide fate of /api/match: deploy as serverless function or remove the fetch call and dead server.js path	Critical	1 day	Backend	Gap 3
Decide fate of cv_parsed_skills: implement minimal keyword extraction on CV upload, or drop column	Critical	1 day (drop) / 3 days (build)	Backend	Gap 4
Sprint 2 — Scale Readiness (High)
Goal: make the app behave correctly once listing/user counts grow past a few dozen.
Task	Priority	Effort	Owner	Gap Ref
Add server-side pagination to Jobs.jsx listing queries	High	1.5 days	Frontend	Gap 5
Implement Postgres full-text search across title/description/skills_required	High	2 days	Backend	Gap 6
Add view-count increment via RPC on job detail load	High	0.5 day	Backend	Gap 7
Verify/add employer 'size' field in onboarding UI	High	0.5 day	Frontend	Gap 10
Sprint 3 — Trust & Safety (High)
Goal: employer verification and moderation, so growth doesn't outpace platform integrity.
Task	Priority	Effort	Owner	Gap Ref
Build admin review queue: new employers start unverified, first listing requires approval	High	3 days	Full-stack	Gap 8
Surface 'Verified employer' badge on employer public pages once enforced	High	0.5 day	Frontend	Gap 8
Add per-user apply rate-limiting	Medium	1 day	Backend	Gap 13
Sprint 4 — Hardening
Goal: close out remaining medium items and raise test confidence before the next feature push.
Task	Priority	Effort	Owner	Gap Ref
Add integration tests: auth flows, apply flow, status-change flow	Medium	2.5 days	QA/Backend	Gap 9
Add RLS-focused test cases using Supabase test client	Medium	1.5 days	Backend	Gap 9
Image optimization/CDN pass for logos and avatars	Medium	1 day	Frontend	Gap 14
 3. Competitive Context (for reference — not sprinted this pass)
Included here so the fix list above is legible against the market backdrop. These are backlog items for a later planning pass, per current scope.
BrighterMonday Uganda
•	Established 2014; 200,000+ jobseeker profiles; 8,000+ employers to date.
•	Mobile app with push notifications, saved jobs, job alerts, CV/cover-letter builder, mock interviews.
•	Moving into skills-first programs (e.g. "Gen-Kazi" with universities) — but as partner events, not core product.
The Ugandan Jobline
•	Primarily a listings/content site — postings link out via "Read More," no visible in-app apply, tracking, or matching.
•	Strong in NGO, government, and corporate listings specifically.
Where YouthLink's existing architecture already gives it an edge
•	In-app apply + status tracking (submitted → shortlisted → accepted) — Jobline has no equivalent.
•	A youth-specific data model (availability, looking_for, stipended programs table) that BrighterMonday treats as a generalist afterthought.
•	Once Sprint 1–3 land: verified employers + private CV storage = a genuine trust claim neither incumbent is making loudly.
Backlog for later strategic planning
•	SMS/USSD delivery channel (e.g. Africa's Talking) to reach low-data/feature-phone users BrighterMonday's app-only alerts miss.
•	Mobile money integration for paid programs (programs.cost already exists in schema).
•	CV-coaching / mock-interview tooling to match BrighterMonday's career-services suite, if desired.

End of document.
