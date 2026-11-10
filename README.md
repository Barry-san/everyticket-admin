# Everyticket Administration

Everyticket's platform administrator app. Organizers use a separate dashboard.

## Run locally

Use the Bun version declared in package.json. Copy .env.example to .env.local, set the two URLs, then run:

```sh
bun install --frozen-lockfile
bun run dev
```

VITE_BACKEND_URL includes the canonical /api/v1 prefix. VITE_AUTH_URL is the Better Auth server origin (authentication is mounted at /api/auth). Sign in with an existing active administrator Profile. There is no demo session or fallback data.

In the backend repository, configure ADMIN_APP_URL to the admin frontend's exact origin. The API and Better Auth share the explicit browser-origin allow-list. PUBLIC_APP_URL continues to identify the customer frontend; localhost:5173 is accepted outside production. Actual production URL values belong in deployment configuration. The existing backend requires secure cross-site session cookies; use HTTPS for deployed applications and verify local browser cookie handling when connecting to a remote API.

## Live workflows

The overview displays the existing backend summary totals. Events, Users, Orders, Refunds, Payouts, Fee rules, and Audit log read directly from the backend. Search and filters use the server capabilities for each resource, with pagination and filters in the URL. Details use records on the current page. The fee-rule screen shows the active rule only. Refund review uses the amounts provided by the existing list response; selected-ticket details are unavailable.

Reconciliation and Jobs & media retain routes with an unavailable state. Administrator provisioning, global search, and unsupported analytics have no active controls. Payout recording records an external transfer; it does not initiate one. Refund approval and execution are separate operations.

The active integration lives in src/features/live: contracts, query/API handling, action payloads, forms, details, and screens are separate modules. Axios carries application requests, React Query owns their cache, and React Hook Form handles editable values. Better Auth's client owns its session protocol. Server mutations complete before caches refresh. Money stays in integer kobo and dates are presented in Africa/Lagos time.

## Validation

```sh
bun run test
bun run typecheck
bun run lint
bun run build
```

The default test command runs only the focused live-contract checks. Earlier demo screens, reducer fixtures, and browser tests remain in the working tree for reference because they contain pre-existing work; they are disconnected from the active routes and default validation. They should not be used to validate live backend integration.

The backend has one focused credentialed-CORS HTTP check, alongside its existing auth-origin test. No production financial actions are exercised by these checks.
