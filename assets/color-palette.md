# 🎨 Flomark Color Palette

## Primary Colors

### Main Background
```css
--background: #18191b
bg-[#18191b]
```
**Dark charcoal - Main app background**

### Foreground/Text
```css
--foreground: #ffffff
text-white
```
**Pure white - Primary text color**

---

## UI Component Colors

### Backgrounds & Surfaces

#### Glass/Modal Backgrounds
```css
bg-white/10          /* rgba(255, 255, 255, 0.1) - Glassmorphism */
bg-white/5           /* rgba(255, 255, 255, 0.05) - Subtle glass */
bg-white/20          /* rgba(255, 255, 255, 0.2) - Stronger glass */
backdrop-blur-xl     /* Blur effect for glass */
```

#### Card/Surface
```css
--card: #f0f0f0
--card-foreground: #18191b
```

#### Popover
```css
--popover: #2c2c2c       /* Dark gray */
--popover-foreground: #ffffff
```

### Borders

```css
border-white/10      /* rgba(255, 255, 255, 0.1) - Subtle border */
border-white/20      /* rgba(255, 255, 255, 0.2) - Normal border */
border-white/40      /* rgba(255, 255, 255, 0.4) - Strong border */
--border: #404040    /* Dark gray border */
```

### Text Colors

```css
text-white           /* #ffffff - Primary text */
text-gray-300        /* Light gray - Secondary text */
text-gray-400        /* Medium gray - Labels, placeholders */
text-gray-500        /* Darker gray - Muted text */
text-gray-600        /* Even darker - Disabled states */
```

---

## Accent Colors

### Primary Blue (Main brand color)
```css
#3b82f6              /* Blue 500 - Primary actions */
#2563eb              /* Blue 600 - Hover state */
#1d4ed8              /* Blue 700 - Active state */

/* With opacity */
rgba(59, 130, 246, 0.5)   /* Focus rings */
rgba(59, 130, 246, 0.2)   /* Highlights */
rgba(59, 130, 246, 0.08)  /* Subtle backgrounds */
```

### Secondary Purple
```css
#8b5cf6              /* Purple 500 - Secondary accent */
#7c3aed              /* Purple 600 - Hover */
#6d28d9              /* Purple 700 - Active */
```

### Cyan/Teal
```css
#06b6d4              /* Cyan 500 - Info/accents */
#0891b2              /* Cyan 600 - Hover */
```

### Green (Success)
```css
#10b981              /* Green 500 - Success states */
#059669              /* Green 600 - Hover */
```

### Red (Destructive/Error)
```css
--destructive: #e74c3c     /* Red - Error/delete */
#ef4444                     /* Red 500 - Alternative */
#dc2626                     /* Red 600 - Hover */
```

### Orange/Amber (Warning)
```css
#f59e0b              /* Amber 500 - Warning */
#d97706              /* Amber 600 - Hover */
```

### Pink
```css
#ec4899              /* Pink 500 - Accent option */
```

### Indigo
```css
#6366f1              /* Indigo 500 - Alternative accent */
```

---

## Gradients

### Blue to Purple (Primary)
```css
linear-gradient(135deg, #3b82f6, #8b5cf6)
```

### Cyan to Blue
```css
linear-gradient(135deg, #06b6d4, #3b82f6)
```

### Green to Cyan
```css
linear-gradient(135deg, #10b981, #06b6d4)
```

### Orange to Red
```css
linear-gradient(135deg, #f59e0b, #ef4444)
```

### Indigo to Purple
```css
linear-gradient(135deg, #6366f1, #8b5cf6)
```

### Pink to Purple
```css
linear-gradient(135deg, #ec4899, #8b5cf6)
```

---

## Button Colors

### Primary Button
```css
bg-white             /* #ffffff - Background */
hover:bg-gray-100    /* #f3f4f6 - Hover */
text-black           /* #000000 - Text */
```

### Secondary/Outline Button
```css
border-white/20      /* Border */
bg-white/5           /* Background */
hover:bg-white/10    /* Hover background */
text-white           /* Text */
```

### Destructive Button
```css
bg-red-500           /* #ef4444 - Background */
hover:bg-red-600     /* #dc2626 - Hover */
text-white           /* Text */
```

### Success Button
```css
bg-green-500         /* #10b981 - Background */
hover:bg-green-600   /* #059669 - Hover */
text-white           /* Text */
```

### Ghost Button
```css
text-gray-400        /* Default text */
hover:text-white     /* Hover text */
hover:bg-white/10    /* Hover background */
```

---

## Interactive States

### Hover States
```css
hover:bg-white/10    /* Subtle background */
hover:bg-white/20    /* Stronger background */
hover:text-white     /* Text brightening */
hover:border-white/40 /* Border brightening */
```

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-blue-500
focus:border-transparent
```

### Active/Pressed States
```css
active:bg-white/30
active:scale-95      /* Slight scale down */
```

### Disabled States
```css
disabled:opacity-50
disabled:cursor-not-allowed
```

---

## Shadows & Elevations

### Subtle Shadow
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12)
```

### Normal Shadow
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Medium Shadow
```css
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15)
```

### Large Shadow (Drag & Drop)
```css
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), 
            0 10px 15px rgba(0, 0, 0, 0.15)
```

### Glow Effects (Blue)
```css
box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5),
            0 8px 20px rgba(59, 130, 246, 0.2)
```

---

## Scrollbar

### Scrollbar Thumb
```css
background: rgba(255, 255, 255, 0.1)    /* Default */
hover: rgba(255, 255, 255, 0.2)         /* Hover */
active: rgba(255, 255, 255, 0.3)        /* Active */
```

### Scrollbar Track
```css
background: transparent                  /* Track */
background: rgba(255, 255, 255, 0.02)   /* Subtle track */
```

---

## Opacity Scale

```css
opacity-0     /* 0% */
opacity-5     /* 5% */
opacity-10    /* 10% */
opacity-20    /* 20% */
opacity-30    /* 30% */
opacity-40    /* 40% */
opacity-50    /* 50% */
opacity-60    /* 60% */
opacity-70    /* 70% */
opacity-80    /* 80% */
opacity-90    /* 90% */
opacity-100   /* 100% */
```

---

## Typography

### Font Family
```css
font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;
```

### Font Weights
```css
font-light    /* 300 */
font-normal   /* 400 */
font-medium   /* 500 */
font-semibold /* 600 */
font-bold     /* 700 */
```

---

## Border Radius

```css
--radius: 0.5rem              /* 8px - Base */
--radius-sm: calc(0.5rem - 4px)  /* 4px */
--radius-md: calc(0.5rem - 2px)  /* 6px */
--radius-lg: 0.5rem              /* 8px */
--radius-xl: calc(0.5rem + 4px)  /* 12px */

/* Common usage */
rounded-lg    /* 8px */
rounded-xl    /* 12px */
rounded-full  /* 9999px - Pills/circles */
```

---

## Usage Examples

### Modal/Dialog
```jsx
<div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-lg">
  <input className="bg-white/5 border-white/20 text-white placeholder-gray-400" />
  <button className="bg-white hover:bg-gray-100 text-black">Save</button>
</div>
```

### Card
```jsx
<div className="bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
  <h3 className="text-white font-semibold">Title</h3>
  <p className="text-gray-400">Description</p>
</div>
```

### Button Group
```jsx
<button className="text-gray-400 hover:text-white">Cancel</button>
<button className="bg-blue-500 hover:bg-blue-600 text-white">Confirm</button>
```

---

## Design Tokens Quick Reference

| Element | Color | Variable |
|---------|-------|----------|
| Main BG | `#18191b` | Dark charcoal |
| Glass BG | `white/10` | Glassmorphic surface |
| Border | `white/20` | Subtle border |
| Text | `white` | Primary text |
| Secondary Text | `gray-400` | Labels/meta |
| Primary Action | `blue-500` `#3b82f6` | Buttons/links |
| Success | `green-500` `#10b981` | Success states |
| Error | `red-500` `#ef4444` | Error states |
| Warning | `amber-500` `#f59e0b` | Warning states |

---

**Tip:** Use `backdrop-blur-xl` with `bg-white/10` for the signature glassmorphism effect!

