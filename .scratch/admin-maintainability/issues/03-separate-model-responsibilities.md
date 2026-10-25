# 03: Separate model responsibilities while preserving commands

**What to build:** Existing administration workflows execute through the same business-command interface while types, demo fixtures, and presentation formatting have clear owners.

**Blocked by:** 02 — Remove verified unused code and dependencies.

**Status:** ready-for-agent

- [x] Separate entity/command types, seed construction, and formatting from command implementation and update all affected consumers.
- [x] Preserve applyCommand's state, command, and time inputs, synchronous success/error behavior, resulting state, and audit effects.
- [x] Keep cross-record updates cohesive, including Organizer blocking, Payment exception resolution, and Refund rejection; do not split commands by entity merely to shorten files.
- [x] Preserve demo seed behavior and money/date formatting without introducing runtime features or a new state library.
- [x] Keep existing behavioral command tests passing without rewriting them around private implementation details; add focused characterization tests where moving uncovered behavior requires them.
- [x] Validate affected workflows, focused/full tests as appropriate, type checks, lint, and production build; report failures and unavailable checks explicitly.
- [x] Follow the approved spec, preserve modified/untracked work, and make no unrelated behavior fixes, automatic commits, or branch creation.

## Implementation evidence

- Split the mixed administration model into `types.ts`, `seed.ts`, `format.ts`, `calculations.ts`, and a cohesive `commands.ts`; updated application and test consumers and removed the obsolete `model.ts` module.
- Preserved the `applyCommand(state, command, now?)` boundary and kept its command switch intact, including Organizer/Event, Payment exception/Order/Event/Refund, and Refund/Order/Payment exception updates.
- Centralized presentation formatting consumers, including administrator initials in the dashboard layout, without adding runtime behavior, dependencies, or state abstractions.
- Preserved the existing behavioral tests at the public command seam; no private-module tests or additional characterization tests were needed for the mechanical moves.
- `bun run validate` passed: 10 tests/45 assertions, application and tooling type checks, Biome lint across 33 files, the Vite production build, and the Chromium navigation smoke test.
- Preserved the existing modified/untracked baseline and made no branch or commit.
