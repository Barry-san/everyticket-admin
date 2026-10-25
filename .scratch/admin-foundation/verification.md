# Administration foundation verification

Verified on 24 October 2026.

## Automated checks

- `bun run build`: production compilation and bundling pass.
- `bun run lint`: pass with no warnings.
- `bun run test`: 10 tests, 45 assertions, all pass.
- `git diff --check`: pass.

The persistent model tests cover refund processing versus completion, unique
payout references, organizer blocking, safe and idempotent fulfilment, mismatched
payments, refund rejection reopening resolution, fee snapshots, integer-kobo
fees, delivery retries, administrator provisioning, and precise currency display.

## Browser checks

Headless Google Chrome via temporary Playwright tooling, with runtime errors and
network requests observed:

- All ten sections render without page overflow at 1440, 768, 390, and 320 pixels.
- Desktop sidebar and mobile drawer navigate correctly; mobile navigation dismisses.
- Global search opens linked details; record search and clearing empty results work.
- CSV export downloads the expected file.
- Refund approval updates the request, linked order, and audit history.
- Payout recording captures the external reference.
- Mismatched payments cannot be fulfilled and can create tracked refunds.
- Manual fulfilment updates the linked order after capacity confirmation.
- Failed job retries preserve identity and remain queued.
- Future fixed fee scheduling preserves fractional naira precisely.
- Administrator provisioning works; duplicate emails show an inline error.
- Organizer blocking suspends published events; restoration requires an active organizer.
- Nested dialogs release page scrolling after dismissal.
- Non-demo auth redirects unauthenticated users to login and fails closed on errors
  (service responses mocked in the browser).
- Demo navigation makes no backend requests and produces no runtime errors.

Desktop, mobile overview, mobile events, and detail screenshots were inspected.
Temporary browser scripts and screenshots live under `/private/tmp/everyticket-*`.

## Integration boundary

Operational data is intentionally in memory and resets on refresh. No real
messages, transfers, tickets, or refunds are issued. Gateway confirmation, worker
execution, scheduled fee activation, server authorization, and durable audit
storage require backend integration. Better Auth's live service was not contacted.
