## 2025-05-15 - Standardizing Content Anchors for A11y
**Learning:** Adding a "Skip to Content" link is more effective when the primary content container has a unified ID across all pages. This allows for a single, reliable global anchor in the header/navigation while ensuring focus management works consistently.
**Action:** Always verify that every page has a `<main>` or similar container with `id="main-content"` and `tabindex="-1"` when implementing site-wide accessibility features.

## 2025-05-15 - CSS Variable Consistency
**Learning:** Undefined CSS variables (like `--text-dim`) can lead to unintended visual regressions or invisible text if not properly mapped to a fallback or global theme variable.
**Action:** Use a global base CSS file (like `base.css`) to define all semantic tokens and audit page-specific CSS to ensure they only use these predefined tokens.
