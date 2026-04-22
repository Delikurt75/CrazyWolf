# Accessibility (a11y) Checklist

## Issues to Fix

### Images & Media
- [ ] Add `alt` text to ALL images (country flags, feature icons, etc.)
- [ ] Ensure decorative images use `alt=""` (empty alt) and `role="presentation"`
- [ ] Add `aria-label` to icon-only buttons

### Color & Contrast
- [ ] Ensure text contrast ratio is at least 4.5:1 (WCAG AA)
- [ ] Don't rely on color alone to convey information
- [ ] Test with color blindness simulators

### Keyboard Navigation
- [ ] All interactive elements must be reachable via Tab key
- [ ] Visible focus indicators on all focusable elements
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] Skip-to-content link at top of page
- [ ] Escape key closes modals/dropdowns

### Forms (Login, Signup, Search)
- [ ] All form inputs have associated `<label>` elements
- [ ] Error messages are clear and associated with the field via `aria-describedby`
- [ ] Required fields marked with `aria-required="true"`
- [ ] Form validation errors announced to screen readers
- [ ] Password field has show/hide toggle with `aria-label`

### Semantic HTML
- [ ] Use proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Only ONE `<h1>` per page
- [ ] Use `<nav>`, `<main>`, `<footer>`, `<aside>` landmarks
- [ ] Use `<button>` for actions, `<a>` for navigation
- [ ] Lists use `<ul>` / `<ol>` + `<li>`

### ARIA
- [ ] Dropdown menus use `aria-expanded`, `aria-haspopup`
- [ ] Loading states use `aria-busy="true"`
- [ ] Dynamic content regions use `aria-live="polite"`
- [ ] Modal dialogs use `role="dialog"` and `aria-modal="true"`

### Language
- [ ] `<html lang="en">` attribute set
- [ ] Turkish content sections marked with `lang="tr"`

### Motion & Animation
- [ ] Respect `prefers-reduced-motion` media query
- [ ] No auto-playing animations that can't be paused

## Quick Fix: Skip Navigation Link
```html
<!-- Add as first element in <body> -->
<a href="#main-content" class="skip-link" style="
  position: absolute;
  top: -40px;
  left: 0;
  background: #7c83ff;
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  transition: top 0.2s;
">Skip to main content</a>

<style>
  .skip-link:focus {
    top: 0;
  }
</style>

<!-- Then wrap your main content -->
<main id="main-content">
  <!-- page content -->
</main>
```

## Testing Tools
1. **Lighthouse** — Built into Chrome DevTools → Audits tab
2. **axe DevTools** — Browser extension for automated accessibility testing
3. **WAVE** — web.dev accessibility evaluation tool
4. **Screen Reader** — Test with VoiceOver (Mac) or NVDA (Windows)
5. **Keyboard** — Navigate entire site using only Tab, Enter, Escape, Arrow keys
