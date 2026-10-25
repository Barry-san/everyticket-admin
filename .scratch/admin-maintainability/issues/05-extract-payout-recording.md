# 05: Extract Payout recording

**What to build:** Administrators can inspect Payouts and record externally made transfers with unchanged results, while Payout summaries, details, and forms have a cohesive owner.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [ ] Apply the proven workflow pattern to Payout summaries, details, action availability, and recording forms without duplicating shared records mechanics.
- [ ] Preserve Payout amounts excluding platform fees, required transfer references and reasons, existing validation, and repeat-recording safeguards.
- [ ] Preserve synchronous command outcomes, dialog success/failure behavior, notifications, linked navigation, and audit effects.
- [ ] Retain command tests and add focused browser coverage for recording a transfer and rejected/invalid submissions.
- [ ] Verify relevant search/selection and visual behavior; run focused tests, type checks, lint, and applicable build/browser checks.
- [ ] Coordinate edits to shared migration code with other workflow tickets; shared-file overlap is not an additional logical dependency.
- [ ] Follow the approved spec: preserve current behavior and modified/untracked work, avoid unrelated fixes, and do not automatically commit or create branches.
