# Administration app foundation

Implementation: complete (frontend demo)

## Agreed scope

Build Everyticket's platform administrator console. Organizers use a separate app.
Deliver usable Overview, Events, Users, Orders, Refunds, Payouts, Fee Rules,
Reconciliation, Jobs & Media, and Audit Log sections with linked demo data,
search, filters, details, and confirmed state-changing actions.

Refine the prototype's plum sidebar, cream canvas, and rounded white panels.
Use Cowrywise's clarity and financial trust and Tix Africa's event personality
as design direction. Reference inspection was HTML/CSS only; Tix blocked access.

Support desktop, tablet, and phone. Mobile navigation uses a drawer; records
remain readable and financial comparisons can scroll horizontally.

## Demo boundaries

One demo administrator with all sections available. Explicit development demo
mode bypasses backend authentication. Changes are in memory and reset on refresh.
Keep the existing Better Auth integration usable when demo mode is disabled.
Use NGN (integer kobo), Africa/Lagos timestamps, and 24-hour times.

## Operational rules

- Organizers publish events; administrators moderate them.
- Suspension prevents checkout while preserving historical records.
- Blocking preserves records and does not silently undo event suspensions when reversed.
- Refund approval and gateway-confirmed completion are distinct states.
- Organizer payouts exclude platform fees and record external transfer references.
- Fee versions apply to future orders; historical snapshots stay unchanged.
- Payment exceptions require explicit resolution and notes; fulfilment needs safe capacity.
- Job retries do not issue duplicate tickets.
- Sensitive changes create audit entries.

## Verification

Build and lint the app. Verify financial and state transitions with focused tests.
Check navigation, empty results, confirmations, responsive layouts, and demo access.
