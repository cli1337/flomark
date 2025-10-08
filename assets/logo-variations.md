# Flomark Logo Variations

## 📁 Logo Files

### Primary Logos
- `logo.svg` - Full logo with text (dark background)
- `logo-dark.svg` - Optimized for dark backgrounds
- `logo-light.svg` - Optimized for light backgrounds

### Icon Only
- `logo-icon.svg` - Just the icon (48x48)

## 🎨 Design Concept

### Icon Design
The Flomark logo combines two key elements:
1. **Flow Lines** - Representing workflow and project flow
2. **Checkmark** - Representing task completion and achievement

The design uses a gradient from blue to purple, creating a modern and professional look.

### Color Palette

```css
/* Primary Gradient */
Blue: #3b82f6 → Purple: #8b5cf6

/* Dark Mode Variant */
Light Blue: #60a5fa → Light Purple: #a78bfa

/* Text Colors */
Dark: #1e293b (for light backgrounds)
White: #ffffff (for dark backgrounds)
```

## 📐 Usage Guidelines

### Spacing
- Maintain clear space around the logo (minimum 16px)
- Don't stretch or distort the logo
- Keep aspect ratio intact

### Sizes
- **Large:** 200px+ width (websites, headers)
- **Medium:** 120-200px (navigation, cards)
- **Small:** 48-120px (favicons, mobile)
- **Icon only:** 32-64px (favicons, app icons)

### Backgrounds
- Use `logo-dark.svg` on dark backgrounds (#1a1b1e, #18191b)
- Use `logo-light.svg` on light backgrounds (white, #f8f9fa)
- Icon works on any background with proper contrast

## 🖼️ Example Usage

### In React/HTML
```jsx
// Full logo
<img src="/logo.svg" alt="Flomark" width="200" />

// Icon only
<img src="/logo-icon.svg" alt="Flomark" width="48" />
```

### As Favicon
Convert `logo-icon.svg` to:
- favicon.ico (16x16, 32x32, 48x48)
- apple-touch-icon.png (180x180)
- android-chrome-icon.png (192x192, 512x512)

## 🎯 Logo Meanings

1. **Flow Lines** = Workflow automation, smooth processes
2. **Checkmark** = Task completion, productivity
3. **Gradient** = Modern, dynamic, forward-thinking
4. **Circular Shape** = Unity, completeness, team collaboration

## 📱 Responsive Usage

```css
/* Mobile */
@media (max-width: 640px) {
  .logo-full { display: none; }
  .logo-icon { display: block; width: 40px; }
}

/* Desktop */
@media (min-width: 641px) {
  .logo-full { display: block; width: 160px; }
  .logo-icon { display: none; }
}
```

## 🔧 Customization

To change colors, edit the gradient stops in the SVG:
```xml
<linearGradient id="gradient">
  <stop offset="0%" style="stop-color:#YOUR_COLOR"/>
  <stop offset="100%" style="stop-color:#YOUR_COLOR"/>
</linearGradient>
```

---

**Need a different format?**
- PNG: Export from Figma/Illustrator
- JPG: For photography backgrounds
- ICO: For browser favicon
- WebP: For optimized web delivery

