# 12: Organize styles by ownership and verify visual parity

**What to build:** Styles follow the settled module ownership while Administrators retain the same desktop and narrow-screen appearance and interactions.

**Blocked by:** 10 — Extract and characterize Overview reporting; 11 — Finish shared records, dialog, notification, and export cleanup.

**Status:** ready-for-agent

- [ ] Reorganize styles where useful around tokens/base, workspace shell, shared controls, and workflow ownership without forcing unnecessary splits.
- [ ] Preserve effective import order, specificity, cascade, responsive rules, and dynamic class behavior.
- [ ] Do not redesign tokens, controls, layouts, or responsive behavior as part of restructuring.
- [ ] Verify usage before removing any styles; absent literal class references are not proof of non-use.
- [ ] Compare affected screens and interaction states before/after at representative desktop and narrow widths, including Overview, records, navigation, dialogs, and notifications.
- [ ] Record visual-check evidence and limitations; do not infer visual parity solely from passing logic tests.
- [ ] Run relevant browser checks, tests, type checks, lint, and production build; resolve regressions introduced by this ticket.
- [ ] Follow the approved spec, preserve existing work, and avoid unrelated fixes, automatic commits, or branch creation.
