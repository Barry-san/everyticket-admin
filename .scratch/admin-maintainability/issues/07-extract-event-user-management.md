# 07: Extract Event and user-management workflows

**What to build:** Administrators can manage Events and users with unchanged controls and linked outcomes, while each workflow owns its summaries, details, and actions.

**Blocked by:** 04 — Extract Refund review as the reference workflow.

**Status:** ready-for-agent

- [ ] Apply the established workflow organization to Event and user-management summaries, details, action availability, and forms.
- [ ] Preserve existing Event controls and Organizer blocking effects, including suspension of published Events, without spreading related mutations across UI modules.
- [ ] Preserve Administrator provisioning and existing user-management validation, reasons, notifications, and audit behavior.
- [ ] Maintain the distinction between Administrators who operate this app and Organizers who use a separate dashboard.
- [ ] Retain cross-record command tests and add focused browser coverage for representative Event controls, Organizer blocking, and Administrator provisioning.
- [ ] Verify linked navigation, search/selection, dialog outcomes, and affected appearance; run focused tests, type checks, lint, and relevant build/browser checks.
- [ ] Coordinate shared migration edits with other workflow tickets.
- [ ] Follow the approved spec, preserve behavior and existing work, and make no unrelated fixes, automatic commits, or new branches.
