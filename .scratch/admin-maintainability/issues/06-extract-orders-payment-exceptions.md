# 06: Extract Order inspection and Payment exception resolution

**What to build:** Administrators can inspect Orders and resolve Payment exceptions through unchanged linked workflows, with workflow-owned presentation and cohesive cross-record commands.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [ ] Extract Order inspection and reconciliation summaries, details, and action forms using the established workflow pattern.
- [ ] Preserve linked navigation, payment-attempt presentation, action availability, required reasons, form conversions, and validation.
- [ ] Preserve fulfilment constraints, repeat-resolution safeguards, and effects on Orders, Events, Refunds, and audit history through the existing command interface.
- [ ] Keep business updates cohesive rather than distributing coupled mutations among UI modules.
- [ ] Retain command regression tests and add targeted browser tests for inspection, resolution outcomes, invalid actions, and visible linked results.
- [ ] Verify affected URL selection, dialogs, notifications, and appearance; run focused tests, type checks, lint, and relevant build/browser checks.
- [ ] Coordinate shared migration edits with other workflow tickets without inventing additional blocking dependencies.
- [ ] Follow the approved spec, preserve existing modified/untracked work, and avoid unrelated fixes, automatic commits, or branch creation.
