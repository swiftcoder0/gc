# Image Assets Directory (`public/assets/images`)

Place all static images, branding assets, logos, profile avatars, and backgrounds here.

## Supported Formats
- PNG (`.png`)
- JPEG / JPG (`.jpg`, `.jpeg`)
- WebP (`.webp`)
- SVG (`.svg`)
- GIF (`.gif`)

## How to Reference in Code
Any file placed in this folder is publicly served at `/assets/images/<filename>`:

### In React Components:
```jsx
// Example 1: Standard Image
<img src="/assets/images/my-logo.png" alt="Gotham Logo" className="w-12 h-12" />

// Example 2: Fullscreen Background
<div className="fixed inset-0 z-0">
  <img 
    src="/assets/images/gotham-tower.png" 
    alt="Background" 
    className="w-full h-full object-cover" 
  />
</div>
```

### In CSS / Tailwind:
```css
background-image: url('/assets/images/gotham-tower.png');
```

## Current Default Assets:
- `gotham-logo.jpg`: The official Gotham Collage crest / monogram.
- `gotham-tower.png`: High-resolution cinematic Gotham Tower night cityscape background.
