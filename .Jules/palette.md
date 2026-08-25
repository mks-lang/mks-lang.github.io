## 2024-05-16 - Accessible Documentation Tabs
**Learning:** Documentation tabs rendered dynamically via JS often lack ARIA roles and keyboard support. Implementing the WAI-ARIA Tabs pattern (role="tablist", "tab", "tabpanel") with a roving tabindex and arrow key navigation significantly improves accessibility for screen reader and keyboard-only users without impacting the visual design.
**Action:** Always implement ARIA tab patterns when creating or modifying tabbed interfaces, ensuring 'aria-controls', 'aria-labelledby', and 'aria-selected' are correctly synchronized with the active state.
