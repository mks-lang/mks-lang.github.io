## 2026-05-02 - Enhanced Search Feedback & Navigation
**Learning:** Adding a subtle "pop" animation (scale transition) to dynamic text like search result counts provides much more immediate and satisfying feedback than just changing the text, especially when results update instantly.
**Action:** Use CSS-triggered animations (via JS class toggle and reflow) for small data updates to provide better visual confirmation of user actions.

## 2026-05-03 - Accessible Filter States
**Learning:** Using the `aria-pressed` attribute on filter chips/buttons provides critical state feedback for screen readers in dynamic filtering interfaces, ensuring that users with assistive technologies can understand which filters are active.
**Action:** Always implement `aria-pressed` on toggleable filter elements and manage its state dynamically in JavaScript alongside visual classes like `.active`.
