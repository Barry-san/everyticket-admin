# 10: Extract and characterize Overview reporting

**What to build:** Administrators see the same Overview totals and charts, calculated through a pure reporting interface that maintainers can test without rendering the dashboard.

**Blocked by:** 03 — Separate model responsibilities while preserving commands.

**Status:** ready-for-agent

- [ ] Characterize existing reporting before extraction, including received payments, platform revenue, Refund deductions, outstanding Refunds/Payouts, review counts, date boundaries, and chart buckets.
- [ ] Extract a pure reporting interface accepting state, selected period, and an explicit time anchor; have the Overview consume its results.
- [ ] Preserve existing financial definitions, period semantics, selected-period behavior, and chart output; record apparent defects separately.
- [ ] Separate chart geometry only when doing so produces a useful independently understandable module, not merely another layer.
- [ ] Add deterministic tests of observable reporting results rather than private helpers or file organization.
- [ ] Verify the rendered Overview and period interactions, including desktop/narrow visual checks; run focused tests, type checks, lint, and relevant build/browser checks.
- [ ] This ticket can proceed independently of records extractions once its blocker is complete.
- [ ] Follow the approved spec, preserve existing work, and avoid unrelated behavior changes, automatic commits, or branch creation.
