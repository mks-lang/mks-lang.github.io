## 2026-05-01 - [Accessibility Foundation]
**Learning:** The application uses custom JavaScript for navigation and utility features (like copy buttons) but lacks standard ARIA attributes for state communication. Keyboard navigation is also difficult due to the lack of distinct focus indicators in the purple-themed CSS.
**Action:** Always ensure `aria-current="page"` is set for active links and use `aria-live` for dynamic content updates. Implement global `:focus-visible` styles to ensure keyboard accessibility without affecting mouse users.
