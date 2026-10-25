# 04: Extract Refund review as the reference workflow

**What to build:** Administrators can find, inspect, approve, and reject Refunds with unchanged outcomes, while Refund summaries, details, and review forms are owned together.

**Blocked by:** 03 — Separate model responsibilities while preserving commands.

**Status:** ready-for-agent

- [x] Colocate Refund summaries, details, action availability, and forms behind a small useful interface.
- [x] Extract only the shared records mechanics needed to support this workflow while other workflows continue working; avoid a universal page-definition framework.
- [x] Preserve required reasons, command construction, linked-record navigation, notifications, and dialog behavior on success and failure.
- [x] Preserve approval as processing, not completion, repeat-review safeguards, and rejection effects on related Payment exceptions.
- [x] Add targeted browser tests covering record opening, approve/reject paths, validation, and visible outcomes; retain existing command tests for linked-record changes.
- [x] Verify search, URL selection, and affected layout behavior; capture relevant visual checks rather than inferring parity from model tests.
- [x] Validate focused tests, type checks, lint, build, and applicable browser checks. Document the resulting workflow pattern for subsequent extractions.
- [x] Follow the approved spec, preserve existing work, and avoid unrelated fixes, automatic commits, or branch creation.

## Implementation evidence

- Added `refund-review.tsx` as the Refund workflow module, owning page copy, summary metrics, table presentation, record details, action availability, confirmation dialogs, forms, and Refund command construction.
- Added `useRecords(rows)` as the small shared seam for URL-backed search/selection and status/category filtering; retained shared `DataTable` pagination and existing dialog/notification primitives without introducing a page-definition framework.
- Removed Refund-specific branches from the generic records page. Kept Refund row projection in `selectors.ts` because global search remains a cross-workflow consumer.
- Added browser coverage for search and URL selection, status filtering, pagination state, CSV download, record opening and linked Order navigation, approve/reject actions, native required-reason validation, command-error display with the dialog retained, success notifications, focus/Escape and nested scroll restoration, dialog closure, and visible Processing/Rejected outcomes.
- Captured and compared desktop and 390px-wide Chromium screenshots before and after extraction. The unchanged full-page comparisons passed after implementation; the final baselines use fixed viewports because Chromium dialog captures alternated document heights during the full validation run.
- Retained command-interface coverage for approval as Processing, repeat-review rejection, and Payment exception reopening after Refund rejection.
- Documented the reusable approach in `.scratch/admin-maintainability/workflow-pattern.md`.
- `bun run validate` passed: 10 command/model tests (45 assertions), application and tooling type checks, Biome lint across 36 files, the Vite production build, and 6 Chromium browser tests including visual comparisons.
