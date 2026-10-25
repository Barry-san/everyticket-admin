# 02: Remove verified unused code and dependencies

**What to build:** The app starts, builds, and retains its existing navigation and authentication with verified-unused code, dependencies, assets, and speculative scaffolding removed.

**Blocked by:** 01 — Establish reproducible Bun tooling and validation.

**Status:** ready-for-agent

- [x] Verify candidates against runtime entry points, lazy loading, tests, scripts, configuration, generators, CSS imports, and public asset URLs before deletion; record evidence and retain uncertain candidates.
- [x] Recheck the idle React Query provider and dependency for consumers and remove them if their lack of current purpose is confirmed.
- [x] Recheck unreachable generated UI, its dependencies, and generator configuration; remove confirmed-unused parts without dangling aliases or stylesheet imports.
- [x] Assess starter styles, the unreachable authentication layout, unused validation dependencies, and public assets individually.
- [x] Retain packages with current indirect consumers, including compiler, CSS, authentication, and build integrations. Do not equate missing source imports with non-use.
- [x] Update Bun dependency metadata consistently and verify installation, build, type checks, lint, tests, and relevant browser smoke checks.
- [x] Follow the approved spec: preserve behavior and existing modified/untracked work, avoid unrelated fixes and speculative replacement abstractions, and do not automatically commit or create branches.

## Implementation evidence

- Traced the runtime from `src/main.tsx` through `src/App.tsx` and every lazy route in `src/routes/index.tsx`, then searched application source, tests, scripts, configuration, CSS imports, generator aliases, and public URLs for each candidate.
- React Query had no query/mutation/cache consumer beyond the idle provider in `src/App.tsx`; removed the provider and direct dependency.
- `src/layouts/authLayout.tsx` was unreachable. It was the only external consumer of `src/components/ui/`; the UI files were otherwise a closed generated chain. Removed that layout, the generated components, `src/lib/utils.ts`, `components.json`, their shadcn/animation stylesheet imports, and direct dependencies `@base-ui/react`, `class-variance-authority`, `cn`, `shadcn`, and `tw-animate-css`.
- `src/App.css` had no import and contained only starter UI rules; removed it. `public/icons.svg` had no URL or symbol consumer; removed it. Retained `public/favicon.svg` and `public/everyticket-logo.svg` because `index.html` and the rendered brand reference them.
- Removed the unused direct `zod` declaration. Better Auth's independently declared transitive Zod requirement remains in `bun.lock`.
- Retained Geist, Tailwind and its Vite plugin, Lucide, Better Auth, React Router, Babel/React Compiler, TypeScript, Vite, Biome, and Playwright because current source, CSS, compiler configuration, scripts, or browser checks consume them.
- Updated `package.json` and `bun.lock` with Bun 1.4.4. `bun install --frozen-lockfile --ignore-scripts` checked 116 installs across 175 packages with no changes.
- `bun run validate` passed: 10 model tests/45 assertions, application and tooling type checks, Biome lint across 29 files, the Vite production build, and the Chromium navigation smoke test.
- Preserved the existing modified/untracked baseline and made no branch or commit.
- Final standards and spec-fidelity reviews reported no findings.
