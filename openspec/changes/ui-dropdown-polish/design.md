## Context

The app uses Tailwind v4 and Base UI, not Radix. Existing CSS declares HSL channel variables but has no `@theme inline` color aliases, so semantic utility classes are missing. Select values are string IDs and their roots lack `items` label mappings. The select list uses nowrap/nonshrinking labels and focus selectors rather than Base UI highlighted/selected data attributes. The current frontend build fails, including an unsupported `DialogTrigger asChild` and product confirmation functions never rendered.

## Decisions

- Retain the existing blue identity, rounded controls, dark mode, shared primitives, and dashboard zero-data cards. Use semantic surface layers and measured shadows; no additional UI framework or network fonts.
- Map HSL variables through Tailwind v4 `@theme inline`, and define a class-based dark variant. Preserve compatibility with existing `hsl(var(...))` usage.
- Keep the Base UI select primitive. Pass `items` for known labels, use `null` for an unselected value, bind labels to triggers, and handle API states explicitly.
- Use anchored popup positioning rather than overlaying the current option on its trigger. Constrain width/height to the viewport; let the list scroll and long options wrap. Highlight using Base UI data attributes.
- Keep UI changes frontend-only. Reuse actual backend routes and DTOs; do not change business data during tests.
- Use a Vite-served test-only entry to render real page components inside MemoryRouter/AuthContext. Intercept API requests with explicit synthetic fixtures for deterministic edge cases and writes. No fake credentials or authentication tokens. The production build has only `index.html` as its entry, excluding the test harness.
- Run read-only live API checks separately. Authentication and database write correctness are not implied by fixture-based browser tests.

## Verification

Reproduce bugs before fixes with Playwright, then run the same assertions after each narrow change. Cover every page, new/edit variants, all three dropdown contexts, keyboard/pointer behavior, long/large option lists, asynchronous empty/error states, confirmation cancel and repeated submission, both themes, and mobile/tablet/desktop widths. Run TypeScript, Vite build, lint, OpenSpec validation and diff review.
