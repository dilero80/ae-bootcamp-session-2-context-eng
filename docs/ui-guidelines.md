# UI Guidelines

These guidelines define the visual and accessibility expectations for the TODO app.

## Components and Visual Style

- Use Material Design components and interaction patterns for common UI elements, including forms, menus, dialogs, and task lists.
- Use a red-and-white palette: deep red for primary actions and emphasis, white for the main surfaces, and dark neutral text for readable content. Use lighter red shades sparingly for secondary surfaces or highlights.
- Check foreground and background contrast for every text, icon, and control state. Meet WCAG 2.2 AA contrast requirements; do not assume that a color passes without checking it.
- Style buttons with a Stripe-inspired appearance: clean, compact, and clearly labeled, with consistent padding, restrained corner rounding, and distinct hover, pressed, disabled, and focus states. Keep button colors within the red-and-white palette.

## Accessibility

The app must conform to WCAG 2.2 Level AA. In particular:

- Use semantic HTML elements and native controls where appropriate.
- Support full keyboard navigation for all functionality, with a logical focus order and no keyboard traps.
- Provide visible focus indicators for every interactive element.
- Meet minimum WCAG AA color contrast ratios for text and non-text UI components.
- Give every control an accessible name; associate each form input with a programmatic label.
- Use ARIA attributes only where needed to provide semantics or state not already conveyed by native HTML.
- Ensure screen readers can identify content, controls, errors, and status changes.
- Manage focus correctly when dialogs and overlays open and close; keep focus within modal dialogs while open and return it to the invoking control when closed.
- Make touch targets at least 44 by 44 CSS pixels.
- Keep content and functionality usable at 200% zoom without loss of information or functionality.
- Never rely on color alone to communicate meaning; pair color with text, icons, patterns, or another visual cue.