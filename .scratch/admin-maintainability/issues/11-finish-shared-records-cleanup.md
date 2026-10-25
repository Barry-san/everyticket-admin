# 11: Finish shared records, dialog, notification, and export cleanup

**What to build:** All migrated workflows use cohesive shared records mechanics, dialogs, notifications, and exports without leftover workflow branches or obsolete migration layers.

**Blocked by:** 05 — Extract Payout recording; 06 — Extract Order inspection and Payment exception resolution; 07 — Extract Event and user-management workflows; 08 — Extract Fee rule management; 09 — Extract job operations and audit inspection.

**Status:** ready-for-agent

- [ ] Use evidence from completed workflow migrations to settle shared table, search, filter, pagination, URL selection, and composition interfaces; avoid a universal page framework.
- [ ] Remove migrated workflow-specific behavior and obsolete migration code from shared mechanics without removing active consumers.
- [ ] Separate modal lifecycle, notification lifecycle, and presentation responsibilities where useful while preserving their existing interfaces and behavior.
- [ ] Keep modal open-count and body-scroll restoration cohesive; protect nested dialogs, focus, keyboard behavior, and cleanup.
- [ ] Separate pure CSV serialization from the browser download effect; test quoting, escaping, and formula-prefix protection and verify downloads.
- [ ] Protect shared search/filter/pagination, URL selection, dialog success/failure, and notification behavior through targeted browser tests.
- [ ] Verify affected visual behavior and run focused/full tests as appropriate, type checks, lint, build, and relevant browser checks.
- [ ] Follow the approved spec, preserve current behavior and modified/untracked work, and avoid unrelated fixes, automatic commits, or branch creation.
