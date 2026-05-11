## 2026-05-02 - Enhanced Search Feedback & Navigation
**Learning:** Adding a subtle "pop" animation (scale transition) to dynamic text like search result counts provides much more immediate and satisfying feedback than just changing the text, especially when results update instantly.
**Action:** Use CSS-triggered animations (via JS class toggle and reflow) for small data updates to provide better visual confirmation of user actions.

## 2026-05-09 - Mobile Navigation & i18n Resilience
**Learning:** Applying `data-i18n` to elements containing icons (like `<i>` tags) causes icons to be lost when the language switcher updates `textContent`. Background scrolling during active overlays (like mobile menus) reduces interaction focus.
**Action:** Always wrap text labels in `<span>` with `data-i18n` if sibling icons exist. Implement `overflow: hidden` on `body` and a global `Escape` listener for all modal or high-z-index overlays.
