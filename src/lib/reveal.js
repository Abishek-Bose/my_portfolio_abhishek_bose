// Shared viewport config for every scroll-reveal on the site.
//
// The bug this exists to prevent: framer-motion's `whileInView` only fires
// while an element actually *intersects* the viewport. Jump the page far enough
// in one go — End key, scrollbar drag, trackpad fling, restored scroll position
// — and an element can pass from below the fold to above it without ever
// intersecting. The IntersectionObserver reports "not intersecting" both before
// and after, so it never fires, and with `once: true` it never gets a second
// chance: the content sits at opacity 0 permanently.
//
// Expanding the observer root far upward makes "has reached or passed the
// viewport" count as in-view, so a skipped section still reveals. Downward
// scrolling is unaffected — an element still triggers as it crosses the bottom
// edge, because anything still *below* that edge remains outside the root.
const SKIP_PROOF_ROOT = "9999px 0px 0px 0px";

export function revealViewport(amount = 0.3) {
  return { once: true, amount, margin: SKIP_PROOF_ROOT };
}
