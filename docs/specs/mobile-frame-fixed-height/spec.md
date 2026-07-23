# Spec: Mobile viewport preset becomes a fixed-height device frame

Confirmed 2026-07-23 in a shape-idea session. The prototype shell's mobile
viewport preset (`.sh-vp-390` in
`skills/build-prototype/templates/shell.html`) currently sets only
`min-height: 660px`, so the phone frame grows with content. This spec fixes
the frame's height so fold, pinned bottom UI, and scroll behavior are judged
honestly. Companion records: ADR
[0004](../../decisions/0004-prototype-returns-full-surface-single-file.md)
(shell charter) and `docs/specs/prototype-rebuild/spec.md` (shell contract).

## Goal

A real phone has a fixed viewport; a frame that grows with content cannot
answer the questions a mobile prototype exists to settle: what is visible
without scrolling (the fold), how bottom-pinned UI behaves, and how long
content feels to scroll. The mobile preset therefore renders a fixed-height,
internally scrolling device frame.

## Confirmed decisions

1. **Fixed height, clamped to the review window.** `.sh-vp-390 .sh-stage`
   replaces `min-height: 660px` with
   `height: min(844px, calc(100dvh - <chrome offset>)); overflow-y: auto`.
   844px pairs with the 390px width (iPhone logical resolution 390×844).
   The chrome offset (sticky bar plus margins) is measured during
   implementation, not guessed here.
2. **Clamp over exact device height.** Chosen from three rendered variants
   (growing / clamped / exact 844px) reviewed side by side; the user picked
   the clamp. Exact device height overflows ordinary review windows, cutting
   the frame off and stacking page scroll on top of frame scroll; the clamp
   keeps the whole frame visible at the cost of exact device proportions.
3. **Fixed means floor and ceiling.** Short content still shows a full-height
   phone, so empty states are judged at real screen proportions instead of a
   collapsed frame.
4. **Tablet preset unchanged.** `.sh-vp-768` stays a width preset that grows
   with content: the shell already draws 390 as a device (thick bezel,
   rounded) and 768 as a thin-bordered width check, fold questions bite on
   mobile, and a fixed 1024px frame fits no ordinary review window.
5. **Pinning rule enters the shell contract.** The shell's contract comment
   gains one line: pin in-frame bars (tab bars, CTAs) with
   `position: sticky`; `position: fixed` escapes the frame and pins to the
   browser window.
6. **Applies from the skeleton pass.** The fold is part of structure; the
   frame behaves identically in both passes.
7. **Template-only change.** No retrofit of preserved
   `docs/specs/<slug>/prototype.html` files.

## Verification evidence

A disposable side-by-side spike (three frames, same dummy screen: 14-item
list plus sticky bottom CTA) verified in a browser: in the growing frame the
CTA pins to the browser window, not the frame; in the clamped frame the CTA
stays pinned to the frame's bottom edge during internal scroll (CTA bottom
709px against frame bottom 719px with a 10px bezel); the exact-844 frame
overflows a 720px-high window, hiding the CTA until the page itself scrolls.

## Assumptions

- Viewport cycle labels ("vp: 390") and the mobile-first bootstrap
  (`class="sh-vp-390"` on `<body>`) are unchanged.
- The shell comment block's viewport line is updated to mention the fixed
  height, since the comment is the template's contract surface.

## Deferred / out of scope

- Scaling the frame (`transform: scale`) to preserve exact device
  proportions in short windows: compromises pixel-true text and adds chrome
  complexity; revisit only if clamped proportions mislead in practice.
- Fixing the tablet preset's height.
- Simulating notch / home-indicator safe areas.

## Remaining risks

- `100dvh` on closed rendering surfaces: old webviews may need a
  `100vh` fallback line before the `dvh` declaration.
- Scroll chaining: reaching the end of the frame's inner scroll hands
  further wheel input to the page; acceptable, but `overscroll-behavior`
  can damp it if it annoys during review.
- Prototypes of long mobile-web pages now scroll inside the frame rather
  than with the page; this matches real devices, but reviewers used to the
  old behavior may need the one-line contract comment to understand why.
