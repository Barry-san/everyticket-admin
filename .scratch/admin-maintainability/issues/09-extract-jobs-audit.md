# 09: Extract job operations and audit inspection

**What to build:** Administrators can inspect and retry jobs and browse audit history with unchanged behavior, while job operations and audit inspection have clear owners.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [ ] Extract job and audit summaries, details, and applicable actions using the proven workflow pattern.
- [ ] Preserve retry identity, allowed actions, validation, required reasons where applicable, notifications, and command/audit outcomes.
- [ ] Preserve audit presentation, linked navigation, search, filters, selection, and existing export behavior.
- [ ] Retain job command tests and add focused browser coverage for retry outcomes and audit inspection/navigation.
- [ ] Verify dialog and visual behavior; run focused tests, type checks, lint, and relevant build/browser checks.
- [ ] Coordinate shared migration edits with other workflow tickets.
- [ ] Follow the approved spec, preserve current behavior and modified/untracked work, and avoid unrelated fixes, automatic commits, or branch creation.
