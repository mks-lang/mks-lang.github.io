# 🎨 Palette's Journal

## 2025-05-15 - [Screen Reader Clarity in Search]
**Learning:** Including keyboard shortcut hints like `(/)` directly in an `aria-label` creates unnecessary noise for screen reader users, as the hint is often redundant or confusing when read aloud.
**Action:** Keep shortcut hints in the `placeholder` attribute (for visual users) but provide a clean, descriptive string for the `aria-label`.

## 2025-05-15 - [Feedback Loops & Click Spam]
**Learning:** Rapidly clicking a button with a timed feedback state (like "Copy" -> "Copied") can cause flickering or inconsistent UI states if the timer is not guarded.
**Action:** Implement a state check (guard) in the click handler to ignore subsequent clicks while the "success" state is active.

## 2025-05-15 - [Consistent Empty States]
**Learning:** Users expect consistent feedback across similar features. If the Examples search has an empty state, the Changelog search should too.
**Action:** Reuse existing "reworking" components and animations to create a unified experience for zero-result scenarios.
