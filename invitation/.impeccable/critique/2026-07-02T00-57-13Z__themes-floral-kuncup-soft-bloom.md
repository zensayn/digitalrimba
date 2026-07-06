---
target: section Kenangan Kami / soft-bloom theme
total_score: 31
p0_count: 0
p1_count: 1
timestamp: 2026-07-02T00-57-13Z
slug: themes-floral-kuncup-soft-bloom
---
# Critique: soft-bloom (Wildflower Pastel wedding invitation)

⚠️ DEGRADED: single-context (harness policy: no sub-agents spawned without explicit user request)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Music play state, countdown, RSVP loading all present; copy-rekening feedback good |
| 2 | Match System / Real World | 4 | Natural Indonesian, familiar wedding conventions (Akad/Resepsi/Amplop Digital) |
| 3 | User Control and Freedom | 3 | Map modal closable, music toggleable; RSVP not editable after submit |
| 4 | Consistency and Standards | 3 | Strong token+font system; one drift: MusicPlayer tooltip hardcodes 'Poppins' + raw lilac hexes |
| 5 | Error Prevention | 3 | RSVP submit disabled until name+attendance filled |
| 6 | Recognition Rather Than Recall | 4 | Single linear scroll, clearly labeled sections |
| 7 | Flexibility and Efficiency | 3 | Maps/Calendar deep links, one-tap copy account number |
| 8 | Aesthetic and Minimalist Design | 4 | Decoration is the product here and it is executed with system discipline |
| 9 | Error Recovery | 2 | RSVP submit is a fake 1.2s timeout; no failure state, no backend |
| 10 | Help and Documentation | 2 | Minimal contextual help; barely needed for this artifact |
| **Total** | | **31/40** | **Good** |

## Anti-Patterns Verdict
Does NOT read as AI-generated: custom watercolor asset system (garland seams, hanging vines, corner sprays), Cormorant/Imperial/Jost pairing, cream veil dissolves. Real tells found: en-dash in event times ("08.00 – 10.00 WIB"), em-dash in couple quote + page title, leftover 'Poppins' in MusicPlayer tooltip.

Detector: 20 findings — 15 design-system-color + 2 radius are NOISE (DESIGN.md is a leftover Cohere doc, wrong project); 3 broken-image warnings are false positives (all img have asset() src + onError fallback). The one real broken image (dead Unsplash 404 in gallery config) was found by HTTP check and fixed.

## Fixed this session (gallery)
- Ragged 2-col grid (1/1.25 vs 1/1 aspect per row) → curated bento: wide 16/10 opener + uniform squares + wide closer (even counts), gridColumn "1 / -1".
- PembatasBunga.webp has ~78% transparent padding (band = rows 391-617 of 1024) → cropped via aspect-ratio 1536/227 wrapper + marginTop -25.4%; removed ±140px phantom whitespace around divider.
- Dead photo URL replaced (1520854221256 → 1519225421980, verified 200); panoramic shots moved into wide slots (w=1200).
- Corner florals now follow tile column (outer edges only), no more gutter collisions.

## Priority Issues (remaining)
- [P1] PembatasBunga phantom padding also inflates GreetingSection (~92px at 360px width), CoupleSection, ClosingSection → apply same crop (shared component) or crop the asset file once.
- [P2] MusicPlayer.tsx:87 fontFamily 'Poppins' (font not loaded → falls to system sans) + hardcoded #EFE7F4/#D8CBE6/rgba lilacs; use font-label + theme vars.
- [P2] RSVP has no real backend and no error state; fake success. Harden before production.
- [P3] En/em-dash in visible copy (config times, quote, page title) per taste-skill ban; hyphen "08.00-10.00 WIB" if strictness desired.
- [P3] DESIGN.md belongs to another project (Cohere); regenerate for this theme to make the detector's palette checks meaningful.

## Working well
- Section-seam garland system + edge fades: no hard cuts across all 8 boundaries (verified by screenshot sweep).
- Entrance system: paused CSS animations on independent translate/scale props, released by one IntersectionObserver, reduced-motion respected.
- Typography: Cormorant Garamond display + Imperial Script accents + Jost labels, self-hosted via next/font.

## Personas
- Casey (distracted mobile guest): verified at 390x844; music toggle + primary content in thumb reach; images lazy-load. OK.
- Jordan (first-time guest): tap-anywhere-to-open cover + "Gulir" cue; taste-skill bans scroll cues but here guests genuinely may not know to scroll a full-screen invite — functionally justified, keep.
