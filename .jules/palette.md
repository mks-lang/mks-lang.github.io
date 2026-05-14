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

## 2026-05-14 - Consistent Visibility Toggling & Environment Constraints
**Learning:** Mixing CSS-based visibility (using a `.hidden` class) and native attribute-based visibility (`hidden` attribute) can lead to conflicts if not handled carefully. Additionally, environment-specific methods like `String.prototype.replaceAll` can break CI/build pipelines in certain environments like Cloudflare Workers. Using `aria-live="polite"` on empty state containers is essential for ensuring dynamic result changes are communicated to screen reader users.
**Action:** Favor the native `hidden` attribute for simple JS-driven visibility toggles and always include `aria-live` on dynamic state containers. Use global regex for string replacement to maintain broad compatibility.
