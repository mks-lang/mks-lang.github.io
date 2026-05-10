## 2026-05-02 - Enhanced Search Feedback & Navigation
**Learning:** Adding a subtle "pop" animation (scale transition) to dynamic text like search result counts provides much more immediate and satisfying feedback than just changing the text, especially when results update instantly.
**Action:** Use CSS-triggered animations (via JS class toggle and reflow) for small data updates to provide better visual confirmation of user actions.

## 2026-05-14 - Semantic State for Filter Chips
**Learning:** Visual-only active states on filter chips (like color changes) are inaccessible to screen reader users. Implementing `aria-pressed` provides the necessary semantic feedback to indicate which filter is currently active in a multi-option toggle group.
**Action:** Always pair visual active classes (e.g., `.active`) on interactive filter buttons with the `aria-pressed` attribute, ensuring it is toggled dynamically in the selection logic.
