# PixelPress Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Figma's clean tool interface, Notion's information hierarchy, and TinyPNG's focused workflow. Glassmorphism aesthetic with purple-centric scheme creates a modern, premium feel while maintaining professional utility.

## Core Design Principles
1. **Glassy Transparency**: Frosted glass effects with subtle backdrop blur for primary containers
2. **Purple Dominance**: Purple as primary accent, gradients for CTAs and highlights
3. **Workflow Clarity**: Clear visual hierarchy guiding users through compression process
4. **Spatial Breathing**: Generous spacing emphasizing key actions

---

## Typography
**Primary Font**: Inter (Google Fonts)  
**Secondary Font**: JetBrains Mono (for file sizes/technical data)

**Hierarchy**:
- Hero Headline: 4xl/5xl, font-bold, tracking-tight
- Section Titles: 3xl, font-semibold
- Body: base/lg, font-normal, leading-relaxed
- Technical Labels: sm, font-mono, uppercase tracking-wide
- Buttons: sm/base, font-medium

---

## Layout System
**Spacing Scale**: Tailwind units 4, 6, 8, 12, 16, 24, 32  
**Container**: max-w-7xl, consistent px-4 md:px-6 lg:px-8  
**Section Padding**: py-16 md:py-24 lg:py-32  
**Component Gaps**: gap-6 to gap-8 for grids, gap-4 for smaller elements

---

## Component Library

### Hero Section (Full-width, ~85vh)
- **Background**: Large hero image showing colorful compressed images or abstract pixel patterns with purple overlay gradient
- **Content**: Centered, frosted glass card (backdrop-blur-xl) containing headline, subheadline, dual CTAs
- **CTA Buttons**: Purple gradient primary ("Start Compressing Free"), blurred semi-transparent secondary ("View Examples") - both with backdrop-blur-md backgrounds
- **Trust Badge**: Below CTAs, small text "No signup required • Process 100% client-side"

### Upload Zone (Primary Interaction)
- Large dashed border container with gradient purple outline on hover
- Centered icon (cloud upload), headline, file requirements
- Drag-drop active state with solid purple glow
- Supported formats grid below (JPEG, PNG, WebP, GIF cards with icons)

### Processing Dashboard
- Split layout: Left sidebar (uploaded files list with thumbnails), Right panel (active file view)
- Glassmorphic file cards showing: thumbnail, filename, original size, compression slider, format selector
- Before/After comparison view with vertical slider divider
- Real-time size reduction indicator with percentage badge

### Settings Panel
- Floating glassmorphic sidebar (right-aligned on desktop)
- Grouped controls: Quality slider, Format dropdown, Resize toggle, Advanced options accordion
- Each control group in subtle frosted container with purple accent borders

### Features Grid (3-column desktop, 1-column mobile)
- Cards with: gradient purple icon, feature title, 2-line description
- Features: Batch Processing, Multiple Formats, Lossless Option, Instant Preview, Privacy First, Batch Download
- Subtle hover lift effect with increased backdrop blur

### Results Section
- Statistics dashboard: Total files processed, Average compression %, Time saved
- Large numerals in purple gradient, labels in muted text
- Download all button (prominent purple gradient)

### Footer
- Three columns: Product links, Resources, Social
- Newsletter signup with frosted input field and purple gradient button
- "Built with privacy in mind" tagline with shield icon

---

## Glassmorphism Implementation
- **Background**: White/light with 60-80% opacity, backdrop-blur-lg to backdrop-blur-xl
- **Borders**: 1px solid white/20% opacity or purple/10%
- **Shadows**: Subtle colored shadows (purple tint at 5-10% opacity)
- **Layering**: Multiple glass layers for depth (navigation over hero, cards over background)

---

## Icons
**Library**: Heroicons (outline for navigation, solid for features)  
Key icons: CloudArrowUp, Photo, AdjustmentsHorizontal, ArrowPath, Shield, Download

---

## Images
**Hero Background**: Abstract composition of compressed image thumbnails arranged in geometric pattern with purple gradient overlay (source from Unsplash: "technology gradient purple" or "abstract pixels")  
**Feature Section**: Small decorative before/after comparison screenshots showing compression results  
**Optional Background Elements**: Subtle geometric shapes or gradient orbs floating behind glass containers

---

## Accessibility
- All glass containers maintain 4.5:1 contrast minimum with text
- Focus states with visible purple outline rings
- Labels for all form inputs and controls
- Keyboard navigation through compression workflow
- Screen reader announcements for compression progress