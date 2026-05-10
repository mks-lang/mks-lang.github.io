## 2026-05-02 - Enhanced Search Feedback & Navigation
**Learning:** Adding a subtle "pop" animation (scale transition) to dynamic text like search result counts provides much more immediate and satisfying feedback than just changing the text, especially when results update instantly.
**Action:** Use CSS-triggered animations (via JS class toggle and reflow) for small data updates to provide better visual confirmation of user actions.

## 2026-05-10 - ARIA States for Filter Controls
**Learning:** Using `aria-pressed` on filter chips provides essential state feedback for screen reader users, making a "flat" list of buttons behave like an interactive selectable control rather than just a navigation link.
**Action:** Always implement and dynamically update `aria-pressed` for toggleable filter buttons.
