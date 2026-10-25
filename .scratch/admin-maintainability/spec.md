# Administration App Maintainability Cleanup

Status: ready-for-agent

## Problem Statement

The administration app mixes unrelated responsibilities in large modules, making it difficult for maintainers to locate behavior, understand changes, and safely evolve individual workflows. Records orchestration, summaries, details, and action forms are concentrated together; domain types, demo fixtures, formatting, and business commands also share a module. Reporting calculations and browser effects are interleaved with rendering.

Apparently unused code and speculative dependencies add navigation and maintenance cost. Divergent package-manager lockfiles and reliance on globally available lint tooling undermine reproducibility. Existing command tests provide useful protection, but several UI interactions, reporting calculations, and browser effects are not covered.

The cleanup must improve maintainability without changing the experience or business behavior that Administrators currently rely on.

## Solution

Refactor the existing app incrementally into cohesive modules organized around workflows and genuinely shared behavior. Keep each workflow's summaries, details, and action forms together, with shared records mechanics underneath. Preserve the existing business-command interface and cross-record updates. Separate fixtures, presentation helpers, pure reporting calculations, and browser effects according to their responsibilities.

Standardize on Bun, make validation tooling project-local, and remove code and dependencies only after verifying that they have no current runtime, build, test, configuration, or tooling purpose. Do not retain scaffolding solely for hypothetical future use.

Establish the approach with Refund review, then apply it to the remaining workflows where it improves locality. Protect touched behavior with focused characterization tests and browser checks. Keep each increment independently verifiable, without redesigning screens or silently fixing unrelated bugs.

## User Stories

1. As a maintainer, I want each workflow's summaries, details, and forms located together, so that changing one workflow does not require navigating unrelated workflows.
2. As a maintainer, I want shared records mechanics separated from workflow-specific behavior, so that table, search, selection, and pagination changes have a clear owner.
3. As a maintainer, I want small, useful module interfaces, so that extracting code does not merely replace long files with complicated indirection.
4. As a maintainer, I want a consistent pattern proven on Refund review, so that subsequent extractions follow an approach validated against real interactions.
5. As an Administrator, I want Refund approval to start processing rather than imply completion, so that the cleanup preserves the actual Refund lifecycle.
6. As an Administrator, I want Refund rejection and related Payment exception behavior preserved, so that linked records remain consistent.
7. As an Administrator, I want Payment exception resolution to preserve its fulfilment constraints and related updates, so that restructuring does not change resolution outcomes.
8. As an Administrator, I want Payout recording to preserve external-transfer references and repeat-recording safeguards, so that the cleanup does not alter accounting behavior.
9. As an Administrator, I want Organizer and Event actions to preserve their linked effects, so that platform controls remain consistent.
10. As an Administrator, I want Fee rules to affect future Orders without changing historical Order fees, so that existing commercial records remain intact.
11. As a maintainer, I want cross-record commands kept cohesive behind their existing interface, so that transactional behavior is not scattered across UI modules.
12. As a maintainer, I want domain types, demo fixtures, and presentation helpers separated by responsibility, so that I can find and modify each without reading unrelated command logic.
13. As a maintainer, I want reporting calculations accessible through a pure interface, so that financial totals and date-period behavior can be verified without rendering screens.
14. As an Administrator, I want dashboard totals, period selection, and charts to retain their current behavior, so that structural changes do not change reported results.
15. As an Administrator, I want record search, filters, selection, pagination, and URL behavior preserved, so that existing navigation remains dependable.
16. As an Administrator, I want action forms to preserve validation, amount conversion, confirmation, and success or failure behavior, so that operations produce the same results.
17. As an Administrator, I want dialogs, notifications, keyboard interactions, and scroll restoration to keep working, so that extraction does not regress usability.
18. As an Administrator, I want exported CSV content and escaping behavior preserved, so that exports remain usable and retain existing formula-prefix protection.
19. As an Administrator, I want the same visual layout and responsive behavior, so that a maintainability cleanup does not become an unexpected redesign.
20. As an Administrator, I want login, session handling, and sign-out behavior preserved, so that the cleanup does not change access to the app.
21. As a maintainer, I want unused modules, assets, and dependencies removed only with usage evidence, so that cleanup reduces clutter without breaking implicit consumers.
22. As a maintainer, I want speculative scaffolding removed when it serves no current purpose, so that future plans do not impose unnecessary present-day maintenance.
23. As a contributor, I want one supported package manager and authoritative lockfile, so that dependency installation is consistent.
24. As a contributor, I want validation tools installed as project dependencies, so that checks do not depend on a particular developer's global environment.
25. As a maintainer, I want tests focused on observable behavior, so that tests survive internal reorganization and expose actual regressions.
26. As a maintainer, I want small, independently verifiable increments, so that failures can be attributed to a limited change.
27. As a contributor, I want existing modified and untracked work preserved, so that restructuring builds on the current app without losing in-progress work.
28. As a maintainer, I want unrelated defects recorded separately, so that structural cleanup is distinguishable from intentional behavior changes.

## Implementation Decisions

### Scope and preservation

- Assess the whole app, but deliver incremental changes rather than a sweeping rewrite. Not every module needs splitting: modify modules where responsibility separation improves readability, locality, or verification.
- Preserve current screens, interactions, business rules, authentication behavior, and externally observable interfaces. Do not introduce schema or backend contract changes.
- Treat the current working tree, including modified and untracked implementation, as the starting point. Do not reset, discard, or overwrite unrelated work. No automatic branch creation or commits are authorized by this spec.
- Keep intentional bug fixes separate. In particular, the observed demo-mode flag discrepancy must not be silently corrected during extraction.

### Workflow ownership

- Keep each workflow's summaries, record details, and action forms together.
- Keep shared URL state, filters, search, pagination, selection, table composition, and dialog placement in shared records mechanics where genuinely common.
- Avoid replacing the current large module with equally broad modules containing all summaries, all details, or all forms.
- Avoid a universal configurable page framework, speculative abstractions, and pass-through layers that make behavior harder to follow.
- Start substantive workflow extraction with Refund review. Use it to prove the pattern before extending it to other records workflows, including Payment exception resolution and Payout recording.

### Business model and reporting

- Preserve the synchronous applyCommand interface, including its state, command, and time inputs, success/error behavior, and audit effects.
- Keep coupled updates cohesive: Organizer blocking can affect Events; Payment exception resolution can affect Orders, Events, and Refunds; Refund rejection can reopen resolution.
- Separate entity and command types, demo seed construction, and presentation formatting from command implementation. Do not split command logic by entity merely to reduce file length.
- Extract reporting calculations behind a pure interface taking state, selected period, and an explicit time anchor. Preserve existing financial definitions, date boundaries, and chart behavior.
- Separate chart geometry only if doing so yields a useful independently understandable module; do not add layers solely for symmetry.
- Retain the existing state approach and synchronous action semantics. Do not introduce a replacement state library, repositories, or hypothetical backend adapters.

### Shared rendering, browser effects, and styling

- Separate table/pagination, modal lifecycle, toast lifecycle, and small presentation primitives where they have distinct responsibilities.
- Keep modal open-count and body-scroll restoration behavior cohesive, including nested-dialog behavior.
- Separate pure CSV serialization from the browser download effect, preserving escaping and formula-prefix protection.
- Organize styles by ownership where useful, preserving import order, specificity, responsive rules, and appearance. Avoid token redesign or simultaneous visual cleanup.
- Do not infer unused CSS from absence of literal class strings; account for dynamically constructed classes.

### Dependency and dead-code cleanup

- Bun is the sole supported package manager. Maintain its authoritative lockfile, remove the redundant npm lockfile, and align contributor instructions and scripts where necessary.
- Ensure lint and other required validation tooling are declared project dependencies rather than relying on globally installed executables.
- Verify usage across application entry points, lazy loading, configuration, CSS imports, generators, scripts, tests, and public asset URLs before deletion.
- Remove verified-unused code and dependencies, including scaffolding added solely for future use. Candidate findings are not proof of safe deletion.
- Recheck the idle React Query provider and dependency for consumers, then remove them if the observed lack of consumers is confirmed.
- Recheck unreachable generated UI and its dependency/configuration chain before removing it. Retire associated generator configuration only when it no longer serves a current purpose; do not leave dangling aliases or stylesheet imports.
- Verify other candidates such as starter styles, an unreachable authentication layout, unused validation dependencies, and public assets individually.
- Do not remove packages that remain necessary through CSS imports, compiler configuration, authentication, build tooling, or other indirect consumers.
- Prefer existing dependencies and patterns. Adding targeted browser-testing tooling is explicitly approved; unrelated new runtime dependencies are not part of the plan.

### Delivery order

1. Establish reproducible tooling and capture baseline validation results.
2. Remove verified leftovers in small, reviewable changes.
3. Add targeted protection and extract Refund review as the first workflow.
4. Extend the validated organization to remaining workflows and shared responsibilities, extracting pure reporting and supporting modules in independently verifiable increments.
5. Complete whole-app regression checks, visual checks for affected screens, and a final usage/dependency review.

## Testing Decisions

### Approved test seams

The user approved preserving the command interface, extracting pure reporting calculations, and adding targeted browser tests during the design interview. Prefer these high-level seams rather than creating tests for every extracted file:

- **Business-command interface:** exercise observable results, errors, cross-record updates, and audit effects through applyCommand. Preserve existing behavioral tests across internal moves.
- **Reporting interface:** test returned financial totals and period results with deterministic state and explicit time. Test existing behavior before extraction; do not silently redefine reporting semantics.
- **Administrator-facing browser workflows:** exercise navigation, record selection, form submission, and visible success/failure through the app. Begin with Refund review and expand only to touched behavior and critical shared interactions.
- **Pure CSV output:** test escaping and formula-prefix protection directly where browser-only assertions would obscure edge cases; verify the download effect at the browser seam as appropriate.

### Prior art and coverage

- Existing model tests cover Refund approval versus completion, rejection and reopening, Payout references and repeated recording, Organizer blocking and Event suspension, Payment exception fulfilment and repeated resolution, Fee rule timing and historical Order values, job retry identity, Administrator provisioning, required reasons, and money display.
- Retain those tests as the foundation rather than rewriting them to mirror new file boundaries.
- Add characterization coverage before moving uncovered financial calculations, date-range boundaries, or action-form conversions such as naira to integer kobo and effective-time construction.
- Refund review browser coverage should verify opening a record, available actions, required reasons, approve/reject submission, visible linked outcomes, and dialog behavior after success or failure.
- Protect touched shared interactions: URL-backed search/selection, filters, pagination, modal focus and keyboard behavior, nested scroll restoration, notifications, and CSV download.
- Verify login/session/sign-out behavior when shared layout or provider changes could affect it. Keep the separate demo-mode defect explicit rather than treating its correction as a test-driven refactor.
- Use explicit visual checks of affected screens at representative desktop and narrow viewport sizes when rendering or styles change. Passing model or browser assertions alone is not proof of visual parity.
- Tests should assert observable behavior and public interfaces, not file organization, private helpers, or incidental rendering structure. Avoid blanket snapshot replacement and a repository-wide coverage target.

### Validation gates

- Record baseline lint, application/tooling type checks, existing tests, and production-build results before substantive changes; distinguish pre-existing failures from regressions.
- Run focused tests and type checks during each increment. Run the full test suite, lint, type checks, production build, and relevant browser checks at completion.
- Verify clean dependency installation using Bun's lockfile without relying on globally installed validation tools. Ensure new test tooling has reproducible configuration and documented execution requirements.
- Report checks that could not run and why. Do not claim visual or browser validation based only on static checks.
- Review the final changes against both repository standards and this behavior-preserving spec.

## Out of Scope

- New product features, redesigned screens, changed business rules, or changed authentication behavior.
- Fixing the demo-mode discrepancy or other unrelated defects as part of structural changes.
- Backend integration, database/schema changes, new persistence behavior, or hypothetical backend abstractions.
- A new state-management library or changed asynchronous command semantics.
- A universal records-page framework, arbitrary file-size limits, or splitting every function into a separate module.
- Adopting the unused generated UI as a replacement design system.
- Broad visual redesign, token consolidation, or altered responsive behavior.
- Blanket test coverage expansion, unrelated strictness migrations, or new CI infrastructure without a separate decision.
- Automatic commits, branch creation, or discarding existing work.

## Further Notes

- The design interview settled scope, workflow ownership, command preservation, Refund review as the first extraction, removal of verified speculative scaffolding, Bun standardization, and targeted browser tooling.
- The repository uses a single domain context. Administrator and Organizer remain distinct; Order is not synonymous with Payment; Refund approval is not completion; Payouts exclude platform fees; Fee rules preserve historical Order fees.
- No new domain vocabulary or hard-to-reverse architecture decision was introduced. No new glossary entry or ADR is required by this plan.
- The read-only survey reported passing existing model tests, application/tooling type checks, and lint. Lint relied on a globally available executable. Production build and browser validation were not performed during that survey. Re-establish the baseline during implementation rather than treating the survey as final validation.
- The survey identified substantial existing modified and untracked work. Preserve it throughout implementation.
- The demo-mode condition was observed to conflict with the documented meaning of its flag. This is a separate behavioral defect to track, not permission to alter authentication/configuration semantics here.
- Implementation tickets should be generated separately from this spec, sized for a fresh context window, and declare genuine blocking dependencies. This spec does not itself create those tickets.
