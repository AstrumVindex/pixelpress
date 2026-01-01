# PixelPress - Browser-Based Image Compression Tool

## Overview

PixelPress is a privacy-first, browser-based image compression and optimization tool. All image processing happens entirely in the user's browser using client-side JavaScript - no images are ever uploaded to servers. The application supports compressing PNG, JPEG, and WebP formats with smart compression algorithms that detect text-like images (documents, screenshots) and preserve quality accordingly.

The project is built as a multi-page SEO-optimized architecture with dedicated landing pages for each compression format, designed for organic search traffic and monetization readiness.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for async state, React hooks for local state
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Multi-Page SEO Structure
The application uses dedicated pages for each tool rather than a single-page app approach:
- `/` - Home page (general image compression)
- `/compress-png` - PNG-specific compression
- `/compress-jpeg` - JPEG-specific compression
- `/compress-webp` - WebP conversion and compression
- `/resize-image` - Image resizing tool
- `/privacy` and `/terms` - Legal pages

Each tool page dynamically updates `<title>` and `<meta description>` tags for SEO.

### Image Compression Engine
- **Library**: `browser-image-compression` for client-side processing
- **Smart Detection**: Custom algorithm detects text-like images (documents, screenshots) by analyzing pixel data for color variance, edge sharpness, and white areas
- **Quality Protection**: Non-linear quality mapping prevents over-compression; minimum quality floor of 0.6-0.7 for text images
- **Format Handling**: Automatically uses lossless PNG for text-heavy images, WebP for photos

### Backend Architecture
- **Framework**: Express.js (minimal - serves static files only)
- **Purpose**: The backend exists only to serve the built frontend and handle SPA routing fallback
- **No API Processing**: All image processing is client-side; no server endpoints for image handling

### Database
- **ORM**: Drizzle ORM configured with PostgreSQL
- **Current Usage**: Database schema exists but is not actively used since the app is client-side only
- **Schema Location**: `shared/schema.ts` contains Zod schemas for compression settings validation

## External Dependencies

### Core Image Processing
- `browser-image-compression` - Client-side image compression library

### UI Components
- `@radix-ui/*` - Headless UI primitives (accordion, dialog, slider, tabs, etc.)
- `shadcn/ui` - Pre-styled component library built on Radix
- `lucide-react` - Icon library
- `framer-motion` - Animation library
- `react-dropzone` - Drag-and-drop file upload handling

### Data & Validation
- `zod` - Schema validation for compression settings
- `@tanstack/react-query` - Server state management (minimal use)
- `drizzle-orm` - Database ORM (configured but not heavily used)

### SEO & PWA
- Static `sitemap.xml` and `robots.txt` served from Express
- PWA manifest at `/manifest.json`
- JSON-LD structured data in `index.html`

### Build & Development
- Vite with React plugin
- TypeScript for type safety
- Tailwind CSS with PostCSS
- esbuild for production server bundling