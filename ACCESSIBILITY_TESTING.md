# Accessibility Testing Guide

This document provides instructions for testing the Te Puo website with screen readers and other accessibility tools to ensure compliance with WCAG 2.1 AA standards.

## Why Accessibility Matters

Accessibility ensures that people with disabilities can perceive, understand, navigate, and interact with the website. This includes:
- People who are blind or have low vision (using screen readers)
- People with motor disabilities (using keyboard navigation)
- People with cognitive disabilities
- People with hearing impairments

## Implemented Accessibility Features

### Semantic HTML ✅

The site uses proper semantic HTML5 elements:
- `<header>` for page headers
- `<nav>` for navigation menus
- `<main>` for main content
- `<section>` for content sections
- `<article>` for jewelry cards
- `<footer>` for page footers

### Alt Text for Images ✅

All images have descriptive alt text:
```html
<img src="jewelry.jpg" alt="Collier artisanal en terre dorodango avec finition brillante" loading="lazy">
```

### Keyboard Navigation ✅

All interactive elements are keyboard accessible:
- Navigation links
- Map controls (Leaflet.js provides keyboard support)
- Markers on the map

### Color Contrast ✅

The color palette uses earth tones with sufficient contrast:
- Text on light backgrounds: Dark brown (#3E2723) on sand (#E8DCC4)
- Text on dark backgrounds: White (#FFFFFF) on earth dark (#5D4E37)

### ARIA Attributes

Error messages use `role="alert"` for screen reader announcements:
```javascript
errorDiv.setAttribute('role', 'alert');
```

## Screen Reader Testing

### Recommended Screen Readers

**Windows**:
- **NVDA** (Free, open-source) - Recommended
- **JAWS** (Commercial, most popular)
- **Narrator** (Built into Windows)

**macOS**:
- **VoiceOver** (Built into macOS) - Recommended

**Linux**:
- **Orca** (Free, open-source)

**Mobile**:
- **TalkBack** (Android)
- **VoiceOver** (iOS)

### Testing with NVDA (Windows)

#### Installation

1. Download NVDA from [nvaccess.org](https://www.nvaccess.org/download/)
2. Run the installer
3. Follow the setup wizard
4. NVDA will start automatically

#### Basic NVDA Commands

| Action | Command |
|--------|---------|
| Start/Stop NVDA | `Ctrl + Alt + N` |
| Stop speech | `Ctrl` |
| Read next line | `Down Arrow` |
| Read previous line | `Up Arrow` |
| Read next element | `Tab` |
| Read previous element | `Shift + Tab` |
| Click element | `Enter` or `Space` |
| List headings | `Insert + F7` |
| List links | `Insert + F7`, then select "Links" |
| Navigate by heading | `H` (next) / `Shift + H` (previous) |
| Navigate by landmark | `D` (next) / `Shift + D` (previous) |

#### Testing Procedure with NVDA

1. **Start NVDA**: Press `Ctrl + Alt + N`
2. **Open the website**: Navigate to `https://tepuo.com` in your browser
3. **Test navigation**:
   - Press `H` to jump between headings
   - Press `D` to jump between landmarks (header, nav, main, footer)
   - Press `Tab` to move through interactive elements
4. **Test content reading**:
   - Press `Down Arrow` to read line by line
   - Listen for proper announcement of images (alt text)
   - Verify collection names and jewelry descriptions are read correctly
5. **Test the map page**:
   - Navigate to Points de Vente page
   - Verify map controls are announced
   - Test marker interactions with keyboard
6. **Test error states**:
   - Disconnect internet or modify config to trigger errors
   - Verify error messages are announced with `role="alert"`

### Testing with VoiceOver (macOS)

#### Activation

1. **Enable VoiceOver**: Press `Cmd + F5`
2. **Disable VoiceOver**: Press `Cmd + F5` again

#### Basic VoiceOver Commands

| Action | Command |
|--------|---------|
| Start/Stop VoiceOver | `Cmd + F5` |
| VoiceOver modifier | `Ctrl + Option` (VO) |
| Read next item | `VO + Right Arrow` |
| Read previous item | `VO + Left Arrow` |
| Interact with element | `VO + Shift + Down Arrow` |
| Stop interacting | `VO + Shift + Up Arrow` |
| Open rotor | `VO + U` |
| Navigate by heading | `VO + Cmd + H` |
| Click element | `VO + Space` |

#### Testing Procedure with VoiceOver

1. **Start VoiceOver**: Press `Cmd + F5`
2. **Open Safari**: VoiceOver works best with Safari on macOS
3. **Navigate to the website**: `https://tepuo.com`
4. **Use the rotor**: Press `VO + U` to open the rotor
   - Select "Headings" to see all headings
   - Select "Links" to see all links
   - Select "Landmarks" to see page regions
5. **Navigate through content**:
   - Use `VO + Right Arrow` to move through elements
   - Listen for proper announcements
6. **Test interactive elements**:
   - Navigate to links with `Tab`
   - Activate with `VO + Space`

### Testing with Narrator (Windows)

#### Activation

1. **Start Narrator**: Press `Win + Ctrl + Enter`
2. **Stop Narrator**: Press `Win + Ctrl + Enter` again

#### Basic Narrator Commands

| Action | Command |
|--------|---------|
| Start/Stop Narrator | `Win + Ctrl + Enter` |
| Read next item | `Caps Lock + Right Arrow` |
| Read previous item | `Caps Lock + Left Arrow` |
| Read current item | `Caps Lock + Enter` |
| Navigate by heading | `H` (next) / `Shift + H` (previous) |
| Navigate by link | `K` (next) / `Shift + K` (previous) |
| Navigate by landmark | `D` (next) / `Shift + D` (previous) |

## Keyboard Navigation Testing

Test the site using only the keyboard (no mouse):

### Test Checklist

- [ ] **Tab through all interactive elements**
  - Navigation links should be reachable
  - Focus indicator should be visible
  - Tab order should be logical (top to bottom, left to right)

- [ ] **Navigate the menu**
  - Press `Tab` to reach navigation
  - Press `Enter` to activate links
  - Verify you can reach all pages

- [ ] **Test the jewelry page**
  - Verify you can tab through jewelry cards
  - Images should not be focusable (they're not interactive)
  - Links (if any) should be focusable

- [ ] **Test the map page**
  - Map should be keyboard accessible
  - Press `Tab` to reach map controls
  - Use arrow keys to pan the map
  - Press `+` and `-` to zoom
  - Press `Enter` on markers to open popups

- [ ] **Test focus visibility**
  - All focused elements should have a visible outline
  - Focus should never be lost (always visible)

### Focus Indicator Styling

Ensure focus indicators are visible:

```css
/* In styles/main.css */
a:focus,
button:focus,
input:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Never remove outlines without providing an alternative */
*:focus {
  outline: 2px solid var(--color-accent);
}
```

## Automated Accessibility Testing

### Browser Extensions

#### axe DevTools (Recommended)

1. Install [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
2. Open DevTools (`F12`)
3. Click on the "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review issues by severity:
   - Critical (must fix)
   - Serious (should fix)
   - Moderate (nice to fix)
   - Minor (optional)

#### WAVE (Web Accessibility Evaluation Tool)

1. Install [WAVE Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
2. Navigate to your page
3. Click the WAVE icon
4. Review:
   - Errors (red) - must fix
   - Alerts (yellow) - review
   - Features (green) - good practices
   - Structural elements (blue) - page structure

#### Lighthouse Accessibility Audit

1. Open Chrome DevTools (`F12`)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review issues and recommendations
6. Target score: 95+ (out of 100)

### Command Line Testing

#### Pa11y

```bash
# Install Pa11y
npm install -g pa11y

# Test a page
pa11y https://tepuo.com

# Test with specific standard
pa11y --standard WCAG2AA https://tepuo.com

# Test all pages
pa11y https://tepuo.com
pa11y https://tepuo.com/bijoux.html
pa11y https://tepuo.com/points-vente.html

# Generate HTML report
pa11y --reporter html https://tepuo.com > accessibility-report.html
```

#### axe-core CLI

```bash
# Install axe-cli
npm install -g @axe-core/cli

# Test a page
axe https://tepuo.com

# Test with specific tags
axe https://tepuo.com --tags wcag2a,wcag2aa

# Save results to file
axe https://tepuo.com --save results.json
```

## Common Accessibility Issues to Check

### Images

- [ ] All `<img>` elements have `alt` attributes
- [ ] Alt text is descriptive (not just "image" or filename)
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have detailed descriptions

### Headings

- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipping)
- [ ] Each page has exactly one `<h1>`
- [ ] Headings describe the content that follows
- [ ] Headings are not used just for styling

### Links

- [ ] Link text is descriptive (not "click here" or "read more")
- [ ] Links have sufficient color contrast
- [ ] Links have visible focus indicators
- [ ] Links to external sites indicate they open in new window (if applicable)

### Forms (if added in future)

- [ ] All inputs have associated `<label>` elements
- [ ] Required fields are indicated
- [ ] Error messages are clear and associated with inputs
- [ ] Form can be completed using only keyboard

### Color and Contrast

- [ ] Text has sufficient contrast ratio:
  - Normal text: 4.5:1 minimum
  - Large text (18pt+): 3:1 minimum
- [ ] Information is not conveyed by color alone
- [ ] Links are distinguishable from surrounding text

### Dynamic Content

- [ ] Loading states are announced to screen readers
- [ ] Error messages use `role="alert"`
- [ ] Dynamic content updates are announced
- [ ] Focus is managed when content changes

## Testing Checklist

Use this checklist to verify accessibility:

### Homepage (index.html)

- [ ] Page has descriptive `<title>`
- [ ] Main heading (`<h1>`) is present and descriptive
- [ ] All images have alt text
- [ ] Navigation is keyboard accessible
- [ ] Semantic HTML is used (header, nav, main, footer)
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announces content correctly

### Bijoux Page (bijoux.html)

- [ ] Collections are properly structured with headings
- [ ] Jewelry cards use semantic HTML (`<article>`)
- [ ] All jewelry images have descriptive alt text
- [ ] Loading state is announced
- [ ] Error messages are announced with `role="alert"`
- [ ] Empty state message is accessible
- [ ] Keyboard navigation works through all cards

### Points de Vente Page (points-vente.html)

- [ ] Map has descriptive label or heading
- [ ] Map is keyboard accessible
- [ ] Markers can be activated with keyboard
- [ ] Popup content is accessible
- [ ] Alternative text list of locations (if provided)
- [ ] Loading and error states are announced

## Responsive Design Testing

Test accessibility on different devices:

### Desktop
- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Verify focus indicators are visible

### Tablet
- [ ] Test touch interactions
- [ ] Verify text is readable (not too small)
- [ ] Test with VoiceOver (iPad) or TalkBack (Android)

### Mobile
- [ ] Test with mobile screen readers
- [ ] Verify touch targets are large enough (44x44px minimum)
- [ ] Test in portrait and landscape orientations
- [ ] Verify pinch-to-zoom works

## WCAG 2.1 Level AA Compliance

The Te Puo website aims to meet WCAG 2.1 Level AA standards:

### Perceivable
- ✅ Text alternatives for images
- ✅ Sufficient color contrast
- ✅ Responsive and adaptable layout
- ✅ Content distinguishable from background

### Operable
- ✅ Keyboard accessible
- ✅ Sufficient time to read content
- ✅ No seizure-inducing content
- ✅ Navigable with clear structure

### Understandable
- ✅ Readable text content
- ✅ Predictable navigation
- ✅ Input assistance (error messages)

### Robust
- ✅ Valid HTML
- ✅ Compatible with assistive technologies
- ✅ Semantic markup

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

### Tools
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Tool](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing Services
- [Accessibility Insights](https://accessibilityinsights.io/)
- [Tenon.io](https://tenon.io/)
- [Siteimprove](https://siteimprove.com/)

## Reporting Issues

If accessibility issues are found:

1. Document the issue:
   - What page/component
   - What assistive technology
   - Expected vs actual behavior
   - WCAG criterion violated

2. Prioritize by severity:
   - Critical: Blocks access to content
   - High: Significantly impairs experience
   - Medium: Causes inconvenience
   - Low: Minor issue

3. Fix and retest:
   - Implement fix
   - Test with same assistive technology
   - Verify fix doesn't break other functionality
   - Run automated tests again

## Summary

The Te Puo website implements accessibility best practices:

✅ Semantic HTML structure
✅ Alt text for all images
✅ Keyboard navigation support
✅ Sufficient color contrast
✅ Screen reader compatible
✅ ARIA attributes for dynamic content

**Testing recommendations**:
1. Test with NVDA or VoiceOver
2. Test keyboard navigation
3. Run axe DevTools scan
4. Verify Lighthouse accessibility score 95+
5. Test on mobile with TalkBack/VoiceOver

**Target**: WCAG 2.1 Level AA compliance
