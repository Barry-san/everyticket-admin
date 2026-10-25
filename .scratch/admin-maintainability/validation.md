# Administration maintainability validation

## Baseline (2026-10-24)

Captured before ticket 01 tooling changes with Bun 1.4.4 and the existing working tree:

| Gate | Command | Baseline result |
| --- | --- | --- |
| Dependency install | `bun install --frozen-lockfile --ignore-scripts` | Passed; 381 installs across 428 packages, no changes. |
| Existing tests | `bun test tests` | Passed; 10 tests, 45 assertions. |
| Application types | `bun run tsc -p tsconfig.app.json --noEmit` | Passed. |
| Tooling types | `bun run tsc -p tsconfig.node.json --noEmit` | Passed. |
| Lint | `bun run lint` | Passed for 35 files, but resolved a globally installed `biome`; `node_modules/.bin/biome` did not exist. |
| Production build | `bun run build` | Passed; TypeScript build and Vite 8.3.4 production bundle completed. |
| Browser smoke | No project command existed. | Not run; browser tooling and a reproducible browser installation were absent. |

There were no baseline failures in the checks that could run. The absent project-local
lint executable and browser test command were reproducibility gaps addressed by this
ticket, not application regressions.

## Final results (2026-10-24)

A clean verification removed the ignored `node_modules` directory and ran
`bun install --frozen-lockfile --ignore-scripts`. Bun installed 383 packages from
`bun.lock`; `node_modules/.bin/biome` reported 2.5.15 and
`node_modules/.bin/playwright` reported 1.45.3.

`bun run validate` then passed every configured gate:

- 10 model tests with 45 assertions;
- application and tooling TypeScript checks;
- project-local Biome lint across 39 files;
- the Vite 8.3.4 production build; and
- one Chromium browser smoke test covering demo workspace startup and navigation
  from Overview to Refunds.

No final checks were unable to run. The browser test requires a loopback server and
the separately installed Playwright Chromium build; in the agent environment it had
to run outside the terminal sandbox because sandboxed port binding is prohibited.
No manual visual-regression review was performed because this ticket did not change
application rendering or styles.

## Known pre-existing discrepancy

`src/lib/env.ts` does not interpret every explicit `VITE_DEMO_MODE` value according
to the behavior documented in `README.md`. This ticket records the discrepancy only;
it does not alter demo access, session handling, authentication, or sign-out behavior.
