# Everyticket Administration

Everyticket's platform administrator app. Organizers use a separate dashboard.
Built with React, TypeScript, Vite, React Router, Tailwind, and Better Auth.

## Prerequisites

Install [Bun 1.4.4](https://bun.sh/) or the version declared by `packageManager`
in `package.json`. Bun is the only supported package manager; `bun.lock` is the
authoritative dependency lockfile.

## Run locally

```sh
bun install --frozen-lockfile
bun run dev
```

Development opens a demo administrator session by default, with no backend requests.
All records are dummy data. Changes last until refresh. To configure explicitly,
copy `.env.example` to `.env.local` and adjust the values.

Project validation uses only dependencies installed by Bun:

```sh
bun run test
bun run typecheck
bun run lint
bun run build
```

The browser smoke test uses Playwright's Chromium build. Install that browser once
per machine (and again when Playwright requests an updated build), then run it:

```sh
bun run test:e2e:install
bun run test:e2e
```

`bun run validate` runs the model tests, both application and tooling type checks,
lint, the production build, and the Chromium smoke test. It expects the browser
installation above to be available.

For a built demo preview:

```sh
VITE_DEMO_MODE=true bun run build
bun run preview
```

## What's included

Overview, Events, Users, Orders, Refunds, Payouts, Fee Rules, Reconciliation,
Jobs & Media, and Audit Log. Records support search, filters, details, and CSV
export. Sensitive actions require reasons, update linked records, and add audit
entries. The interface adapts to desktop, tablet, and phone; wide financial
comparisons scroll within their tables. Global search supports Cmd/Ctrl K.

Demo money values use integer kobo. Display uses NGN and Africa/Lagos dates.
Approval does not complete a refund. Payout recording never initiates a transfer.
Job retries remain queued until a worker is connected. Scheduled fee rules remain
scheduled until the backend can activate them.

## Backend connection

Set `VITE_DEMO_MODE=false` and `VITE_AUTH_URL` to enable Better Auth sign-in.
Production builds do not enable demo access unless explicitly requested.
Authentication errors block the workspace instead of falling through.

Known behavior: the current demo-mode flag condition does not match that documented
meaning for every explicit flag value. This maintainability pass records the
pre-existing discrepancy but intentionally does not change authentication or demo
semantics.

The operational data remains mocked even with backend sign-in. Replace the
`AdminProvider` boundary in `src/features/admin/store.tsx` with API queries and
mutations when endpoints are available. `model.ts` contains the demo entities and
validated state transitions; `selectors.ts` supplies display records. Keep server
validation, administrator authorization, money calculations, audit persistence,
and exactly-once fulfilment in the backend. Frontend checks are only interaction
validation. The existing Query Client is available for that integration.

The agreed scope is in `.scratch/admin-foundation/spec.md` and domain vocabulary
is in `GLOSSARY.md`.
