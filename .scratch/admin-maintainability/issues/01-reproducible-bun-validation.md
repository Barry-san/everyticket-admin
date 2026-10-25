# 01: Establish reproducible Bun tooling and validation

**What to build:** A contributor can install and validate the current administration app using Bun and project-local tools, including a minimal browser smoke test.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] Record baseline results for existing tests, application/tooling type checks, lint, and production build; distinguish pre-existing failures from regressions.
- [x] Make Bun the sole supported package manager, retain its authoritative lockfile, remove the redundant npm lockfile, and align contributor instructions.
- [x] Declare required validation tooling as project dependencies; verify installation and checks do not rely on globally installed tools.
- [x] Add reproducible browser-testing tooling and a minimal smoke test that exercises the app, documenting execution and browser-installation requirements.
- [x] Preserve existing authentication and demo-mode semantics. Record the known demo-mode discrepancy separately rather than correcting it.
- [x] Preserve current modified and untracked work; do not reset, discard unrelated changes, create branches, or commit automatically.
- [x] Follow the approved Administration App Maintainability Cleanup spec. Report validation results and any checks that could not run.

## Comments

Implemented on 2026-10-24 without changing application, authentication, or demo-mode
code. Baseline and final command results, including the pre-existing demo-mode
discrepancy, are recorded in `../validation.md`. All final validation gates passed
from a clean Bun install. The work remains uncommitted as required by this ticket.
