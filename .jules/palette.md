## 2026-05-02 - Enhanced Search Feedback & Navigation
**Learning:** Adding a subtle "pop" animation (scale transition) to dynamic text like search result counts provides much more immediate and satisfying feedback than just changing the text, especially when results update instantly.
**Action:** Use CSS-triggered animations (via JS class toggle and reflow) for small data updates to provide better visual confirmation of user actions.

## 2026-05-03 - Accessible Filter States
**Learning:** Using the `aria-pressed` attribute on filter chips/buttons provides critical state feedback for screen readers in dynamic filtering interfaces, ensuring that users with assistive technologies can understand which filters are active.
**Action:** Always implement `aria-pressed` on toggleable filter elements and manage its state dynamically in JavaScript alongside visual classes like `.active`.

## 2026-05-12 - Preserving Icons in Localized Elements
**Learning:** In this repository's i18n system, applying `data-i18n` to a parent element (like an `<a>` or `<button>`) that contains both an icon (`<i>`) and a text label will cause the icon to be deleted when the translation is applied (as `textContent` overwrites all inner HTML).
**Action:** Always wrap the text label in a `<span>` with the `data-i18n` attribute if the element contains other children like icons.

## 2026-05-12 - Centralized Overlay State Management
**Learning:** Managing side effects like background scroll locking (`overflow: hidden` on body) and keyboard dismissal (Escape key) across multiple triggers (burger, backdrop, links, Esc key) is prone to state desync.
**Action:** Centralize all overlay transitions into a single `toggle[Component](open)` function that handles both visual classes and global side effects consistently.

## 2026-05-13 - Search Feedback & Accessibility
**Learning:** Dynamic filtering interfaces need explicit feedback for all users. Adding an empty state container with `aria-live="polite"` ensures screen reader users are notified when a search returns no results. Additionally, keyboard shortcut hints (like `(/)`) should be kept in the `placeholder` and excluded from the `aria-label` to keep assistive technology output clean and semantic.
**Action:** Implement `aria-live="polite"` on empty states for dynamic lists and maintain strict separation between semantic labels and visual shortcut hints.
