# OrderProcessAlternative Animation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the right-column card stacking order so item 1 is the hidden base and item 5 ends on top, and add a smooth GSAP parallax float to the left column.

**Architecture:** Two additive changes to a single component file — explicit z-index inline styles enforce correct GSAP pin stacking, and a new GSAP `scrub` tween on a new `leftColRef` adds parallax movement to the left column without removing its CSS sticky base.

**Tech Stack:** Next.js 16.1.6, React 19.2.3, GSAP 3.15.0 + ScrollTrigger, TypeScript, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/components/OrderProcessAlternative.tsx` | Modify | Add `style={{ zIndex: i + 1 }}` to row wrappers; add `leftColRef` + GSAP parallax tween |

---

## Task 1: Fix right-column stacking z-index

**Files:**
- Modify: `frontend/components/OrderProcessAlternative.tsx`

The GSAP `ScrollTrigger.pin` behaviour does not guarantee z-index ordering when multiple elements pin at the same viewport offset. Adding an explicit inline `z-index` on each row wrapper ensures item 1 (i=0, z=1) is always below item 5 (i=4, z=5).

- [ ] **Step 1: Open the file**

  `frontend/components/OrderProcessAlternative.tsx`

- [ ] **Step 2: Locate the row wrapper `<div>` inside the `.map()` (line ~149)**

  The target line currently reads:
  ```tsx
  <div
    key={item.id}
    className="order-alt-row-wrapper w-full bg-white relative border-t border-[#d9d9dd]/50 overflow-hidden"
  >
  ```

- [ ] **Step 3: Add the `style` prop**

  Replace that opening tag with:
  ```tsx
  <div
    key={item.id}
    className="order-alt-row-wrapper w-full bg-white relative border-t border-[#d9d9dd]/50 overflow-hidden"
    style={{ zIndex: i + 1 }}
  >
  ```

  Result: item 1 (index 0) gets `z-index: 1`; item 5 (index 4) gets `z-index: 5`.

- [ ] **Step 4: Start the dev server and verify visually**

  ```bash
  cd /Users/pangkywaradjodi/rimba-fisik/frontend
  pnpm dev
  ```

  Open `http://localhost:3000` (or wherever `OrderProcessAlternative` renders), scroll to the section, and confirm:
  - Item 1 pins first and is immediately covered as items 2–5 scroll up.
  - Item 5 is the final card visible on top after all five have pinned.
  - No card "jumps" in front of an earlier-pinned card unexpectedly.

- [ ] **Step 5: Commit**

  ```bash
  cd /Users/pangkywaradjodi/rimba-fisik
  git add frontend/components/OrderProcessAlternative.tsx
  git commit -m "fix(order-process-alt): enforce z-index stacking order on pinned rows"
  ```

---

## Task 2: Add left-column GSAP parallax float

**Files:**
- Modify: `frontend/components/OrderProcessAlternative.tsx`

The left column keeps its `sticky top-[180px]` CSS class (so it stays visible during the section). A GSAP `scrub` tween adds a subtle `-12%` upward drift over the section's scroll range, giving the column a sense of depth rather than feeling completely locked.

- [ ] **Step 1: Add `leftColRef` alongside the existing refs (line ~15)**

  Current refs block:
  ```tsx
  const containerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  ```

  Add a third ref immediately below:
  ```tsx
  const containerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  ```

- [ ] **Step 2: Attach `leftColRef` to the left sticky column `<div>` (line ~129)**

  The left column div currently reads:
  ```tsx
  <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start sticky top-[180px] h-fit pr-0 md:pr-4 lg:pr-8 z-10 pb-8">
  ```

  Add `ref={leftColRef}`:
  ```tsx
  <div ref={leftColRef} className="md:col-span-5 lg:col-span-4 flex flex-col items-start sticky top-[180px] h-fit pr-0 md:pr-4 lg:pr-8 z-10 pb-8">
  ```

- [ ] **Step 3: Add the parallax tween inside the existing `gsap.context()` block**

  The `useEffect` block currently contains (line ~96):
  ```ts
  let ctx = gsap.context(() => {
    const rows = gsap.utils.toArray(".order-alt-row-wrapper");

    rows.forEach((row: any, i: number) => {
      ScrollTrigger.create({
        // ... pin logic
      });
    });

  }, containerRef);
  ```

  Add the parallax tween **after** the `rows.forEach(...)` block, before the closing `}, containerRef)`:
  ```ts
  let ctx = gsap.context(() => {
    const rows = gsap.utils.toArray(".order-alt-row-wrapper");

    rows.forEach((row: any, i: number) => {
      ScrollTrigger.create({
        trigger: row,
        start: "top 180px",
        end: "bottom 580px",
        endTrigger: listContainerRef.current,
        pin: row,
        pinSpacing: false,
        invalidateOnRefresh: true,
        id: `alt-${i + 1}`
      });
    });

    // Left column parallax float
    gsap.to(leftColRef.current, {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1.5,
      },
    });

  }, containerRef);
  ```

- [ ] **Step 4: Verify the parallax visually in the browser**

  With the dev server still running (`pnpm dev`), scroll to the section and confirm:
  - The left column content (tagline, heading, subtitle, CTA button) drifts upward subtly as you scroll through the section — it does **not** jump or snap.
  - The column stays visible throughout the section scroll (CSS sticky keeps it in range).
  - After leaving the section the left column returns to its natural flow position.

- [ ] **Step 5: Commit**

  ```bash
  cd /Users/pangkywaradjodi/rimba-fisik
  git add frontend/components/OrderProcessAlternative.tsx
  git commit -m "feat(order-process-alt): add GSAP parallax float to left sticky column"
  ```

---

## Self-Review Checklist (completed inline)

- **Spec coverage:** Change 1 (z-index) → Task 1. Change 2 (parallax) → Task 2. ✅
- **Placeholder scan:** No TBD/TODO. All code blocks are complete. ✅
- **Type consistency:** `leftColRef` declared as `useRef<HTMLDivElement>(null)` in Task 2 Step 1 and used in Task 2 Steps 2 and 3. ✅
- **Constraint check:** No new deps added. `sticky top-[180px]` class not removed. Pin loop untouched. ✅
