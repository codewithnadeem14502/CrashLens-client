# crashLens-client — Claude Code conventions

React 19, Vite, Tailwind v4, Radix UI. Feature-folder architecture under `src/` — see
the root `/Users/mohdnadeem/Desktop/crashLens/CLAUDE.md` for the full breakdown
(`features/<domain>/api`, `pages/`, `shared/api/client.js`, `shared/auth/`).

No test suite existed before Module 3 (Frontend Correctness & Data Layer). As of Module
1 (backend-only), this repo hasn't been touched yet — this file will fill in with real
conventions (React Query usage, `<ProtectedRoute>` usage, design-token rules) as those
modules land. Don't invent conventions here ahead of the module that establishes them.

## Known, confirmed-true facts (useful before Module 3 starts)

- **P0 bug to fix in Module 3:** `IssuesPage.jsx`'s filter/search/sort only operates on
  the current in-memory page of 5 results; `status`/`severity` filter state is never
  actually sent to `listIssues()` as query params. Fix must drive a real re-fetch with
  filters as query params, not a client-side memo over a partial page.
- ~9-line duplicated loading/error/toast pattern exists independently in 7+ page
  components — Module 3 introduces React Query and migrates the issue list/detail pages
  first (touched anyway for the P0 fix), the rest opportunistically later.
- 5x duplicated inline ternary+`Navigate` pattern in `AppRoutes.jsx` — Module 3
  introduces a shared `<ProtectedRoute>` and moves to nested `<Route>`/`<Outlet>`.
- Stack-trace parser only handles strict V8/Node format — confirmed low-urgency (fails
  safe, plain-text fallback, no `dangerouslySetInnerHTML` anywhere in the codebase).
  Left as-is until a future pass, noted so it isn't rediscovered as new.
- `src/styles/app 2.css` is confirmed orphaned/unused — delete it when Module 3 or 4
  touches this area.

## Design tokens

Once Module 5 lands, real conventions go here and in `DESIGN_SYSTEM.md` at this repo's
root. Until then: `app.css` has a real CSS-custom-property token layer that's
inconsistently applied (not absent) — don't add new hardcoded hex/font-size values if
you're touching styling before Module 5, prefer the existing tokens even if the token
set isn't fully enforced yet.
