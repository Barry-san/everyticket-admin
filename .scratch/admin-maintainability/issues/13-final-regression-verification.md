# 13: Complete whole-app regression and cleanup verification

**What to build:** Contributors have evidence that the integrated cleanup is reproducible, preserves the administration experience, and removes verified leftovers without leaving broken consumers.

**Blocked by:** 12 — Organize styles by ownership and verify visual parity.

**Status:** ready-for-agent

- [ ] Verify clean installation using Bun's authoritative lockfile and project-local validation tooling.
- [ ] Run the full test suite, application/tooling type checks, lint, production build, and relevant browser checks; report exact failures or unavailable checks without claiming unperformed validation.
- [ ] Verify navigation, login/session/sign-out, core workflow outcomes, URL-backed selection, dialogs, notifications, exports, Overview reporting, and responsive appearance at the appropriate test/manual seams.
- [ ] Complete a final usage and dependency review accounting for indirect configuration, CSS, scripts, lazy loading, and public assets; confirm no stale imports, aliases, migration layers, or unused speculative scaffolding remain among verified candidates.
- [ ] Review the integrated changes against repository standards and the approved spec, including cohesive commands, workflow locality, and absence of unnecessary abstraction.
- [ ] Separate pre-existing defects, including the demo-mode discrepancy, from regressions; fix cleanup-caused regressions without broadening into unrelated behavior changes.
- [ ] Summarize delivered module organization, removed dependencies/code with evidence, validation results, and unresolved limitations for maintainers.
- [ ] This is an integration check, not permission for preceding tickets to land broken or defer their own validation.
- [ ] Preserve existing modified/untracked work; do not automatically commit, create branches, or modify/close the parent spec.
