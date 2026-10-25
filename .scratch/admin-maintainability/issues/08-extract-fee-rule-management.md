# 08: Extract Fee rule management

**What to build:** Administrators can inspect and schedule Fee rules with unchanged validation and financial semantics, while presentation and scheduling forms have a cohesive owner.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [ ] Extract Fee rule summaries, details, action availability, and scheduling forms using the established workflow pattern.
- [ ] Characterize and preserve fixed/percentage handling, amount conversion, effective-time construction, required reasons, and validation before moving uncovered behavior.
- [ ] Preserve the rule that new Fee rules apply to future Orders while historical Orders retain their original fee.
- [ ] Preserve command outcomes, audit effects, notifications, and dialog success/failure behavior.
- [ ] Retain model tests and add targeted browser tests for scheduling and invalid submissions.
- [ ] Verify selection/navigation and visual parity; run focused tests, type checks, lint, and relevant build/browser checks.
- [ ] Coordinate shared migration edits with other workflow tickets.
- [ ] Follow the approved spec, preserve modified/untracked work, and avoid unrelated fixes, automatic commits, or branch creation.
