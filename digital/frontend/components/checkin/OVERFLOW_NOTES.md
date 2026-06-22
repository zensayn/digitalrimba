# Check-in Overflow Notes

- Iteration 1: Base 375px layout risk came from fixed counter and camera square using viewport width. Fix: both top counter and page shell use `w-full max-w-[375px]`, shell has `overflow-x-hidden`, and child rows use `min-w-0`, `shrink-0`, `truncate`, or `break-words`.
- Verification: static CSS contract is `data-testid="checkin-shell"` with computed `max-width: 375px`. Playwright browser install completed, but local rendered navigation was blocked by existing Clerk middleware/session-key loop before route HTML returned.
- Iteration 2: Tried exact `app/(checkin)/[eventCode]/page.tsx` path. Next rejected it because root dynamic route `app/[locale]` already owns the same dynamic path. No overflow CSS change; removed conflicting file and kept `/checkin/[eventCode]`.
- Iteration 3: Removed backend/SSE drift and restored required placeholder async functions. No overflow CSS change; `max-w-[375px]`, `overflow-x-hidden`, `min-w-0`, and truncation remain the guard rails.
- Iteration 4: Interruption left `OperatorCheckIn.tsx` deleted and nested check-in layout had `<html>/<body>`. Restored component and made group layout return `children` only. No overflow CSS change; shell still uses `max-w-[375px]`.
- Iteration 5: Playwright harness showed no horizontal overflow (`scrollWidth` 375) but computed `maxWidth` was `none` when Tailwind arbitrary class was not generated in the isolated harness. Fix: keep `max-w-[375px]` and add inline `style={{ maxWidth: 375 }}` to the fixed counter and shell wrapper.
