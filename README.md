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

The overview displays the existing backend summary totals. Events, Users, Orders, Refunds, Payouts, Fee rules, and Audit log read directly from the backend. Search and filters use the server capabilities for each resource, with pagination and filters in the URL.

View details opens a dedicated `/<resource>/<id>` page, with list search, filters, and pagination preserved in the return link. Legacy `?record=<id>` links redirect to these pages.

Each detail page makes one cancellable request to its authenticated record-by-ID endpoint. Detail caches use the resource and ID; originating filters only control the back link. Cached collection records provide a preview with actions disabled until fresh detail data succeeds. Missing IDs show an unavailable state; other failures support retry.

Detail pages group rich event, profile, order, refund, payout, fee-rule and audit data into sections, including ticket configuration, ready media URLs, payment attempts, selected refund tickets, monetary breakdowns, and administrator identities. Historical and scheduled fee rules can be opened by ID and display their version. “Replace active fee rule” changes the global active rule.

Reconciliation and Jobs & media retain routes with an unavailable state. Administrator provisioning, global search, and unsupported analytics have no active controls. Payout recording records an external transfer; it does not initiate one. Refund approval and execution are separate operations.

The active integration lives in src/features/live: contracts, query/API handling, action payloads, forms, details, and screens are separate modules. Axios carries application requests, React Query owns their cache, and React Hook Form handles editable values. Better Auth's client owns its session protocol. Server mutations complete before caches refresh. Money stays in integer kobo and dates are presented in Africa/Lagos time.

## Validation

```sh
bun run test
bun run typecheck
bun run lint
bun run build
```

The default test command runs the focused live-contract and record detail API checks. Run `bun run test:e2e:details` for the active-route browser suite with mocked API and authentication responses. Earlier demo screens, reducer fixtures, and browser tests remain in the working tree for reference because they contain pre-existing work; they are disconnected from the active routes and default validation. They should not be used to validate live backend integration.

The backend has one focused credentialed-CORS HTTP check, alongside its existing auth-origin test. No production financial actions are exercised by these checks.
