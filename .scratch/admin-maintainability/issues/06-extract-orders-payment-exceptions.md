# 06: Extract Order inspection and Payment exception resolution

**What to build:** Administrators can inspect Orders and resolve Payment exceptions through unchanged linked workflows, with workflow-owned presentation and cohesive cross-record commands.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [x] Extract Order inspection and reconciliation summaries, details, and action forms using the established workflow pattern.
- [x] Preserve linked navigation, payment-attempt presentation, action availability, required reasons, form conversions, and validation.
- [x] Preserve fulfilment constraints, repeat-resolution safeguards, and effects on Orders, Events, Refunds, and audit history through the existing command interface.
- [x] Keep business updates cohesive rather than distributing coupled mutations among UI modules.
- [x] Retain command regression tests and add targeted browser tests for inspection, resolution outcomes, invalid actions, and visible linked results.
- [x] Verify affected URL selection, dialogs, notifications, and appearance; run focused tests, type checks, lint, and relevant build/browser checks.
- [x] Coordinate shared migration edits with other workflow tickets without inventing additional blocking dependencies.
- [x] Follow the approved spec, preserve existing modified/untracked work, and avoid unrelated fixes, automatic commits, or branch creation.

## Implementation evidence

- Added `order-payment-workflows.tsx` as the cohesive workflow module for Order inspection and Payment exception resolution, owning page copy, summaries, table presentation, details, action availability, confirmation forms, and command construction.
- Updated the Orders and Reconciliation routes to import their dedicated workflow components and removed their branches from the generic records module. Kept shared URL/search/filter mechanics in `useRecords` and retained selector projections for global search.
- Preserved the synchronous `applyCommand` boundary without changes, including exact-payment and capacity constraints, repeat-resolution safeguards, linked Order/Event/Refund updates, and audit history.
- Added Chromium browser coverage for Order inspection, payment-attempt presentation, linked exception navigation, fulfilment and tracked-Refund outcomes, disabled invalid fulfilment, required reasons, command-error retention, dialogs, notifications, linked visible results, and desktop/narrow visual comparisons.
- `bun run validate` passed: 10 command/model tests (45 assertions), application and tooling type checks, Biome lint across 38 files, the Vite production build, and 10 Chromium browser tests.
