# Records workflow extraction pattern

Use Refund review in `src/features/admin/refund-review.tsx` as the reference extraction.

## Ownership

Keep one administrator workflow’s page header, summary metrics, table columns, record details, action availability, confirmation copy, form fields, and command construction in its workflow module. The route imports that module directly.

Keep cross-record business updates in `applyCommand`; workflow modules construct commands and render their observable results rather than duplicating business rules.

## Shared mechanics

Reuse `useRecords(rows)` for URL-backed search and record selection plus in-page status/category filters. Reuse `DataTable` for pagination and shared primitives for dialogs, notifications, details, and formatting. Add shared mechanics only after both the extracted workflow and an existing workflow need them.

Keep global-search row projection in `selectors.ts` while it remains a cross-workflow concern.

## Verification

Characterize the workflow through the browser before moving it. Cover record opening and linked navigation, available actions, required fields, command failure with the dialog retained, successful submission with the dialog closed, notification text, and visible post-command state. Capture desktop and narrow screenshots before extraction and compare them afterward.

Retain command tests for lifecycle rules and linked-record effects; browser tests should not reproduce those internal assertions.
