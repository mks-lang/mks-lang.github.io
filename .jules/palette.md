## 2025-05-15 - Focus Indicators and Accessible Navigation

**Learning:** Consistent, high-contrast focus indicators (`:focus-visible`) are critical for keyboard navigability. Using `aria-current="page"` on navigation links improves screen reader clarity.
**Action:** Always use `var(--accent)` for focus rings and ensure active navigation states are communicated via ARIA attributes.

## 2025-05-15 - Unified Accessibility Targets

**Learning:** Standardizing the ID for the main content area (e.g., `#main-content`) across all pages simplifies shared UI components like "Skip to Content" links and improves maintainability by reducing page-specific logic in global headers.
**Action:** Always use a unified `#main-content` target for skip links and ensure dynamic components (like Roadmaps or Changelogs) mount within or replace this target while preserving the ID.
