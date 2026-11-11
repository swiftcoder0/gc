# Video Assets Directory (`public/assets/video`)

Place all background video loops, cinematic teasers, motion graphics, and presentation videos here.

## Supported Formats
- MP4 (`.mp4` with H.264 / AAC)
- WebM (`.webm` with VP9 / Opus)
- MOV (`.mov`)

## How to Reference in Code
Any file placed here is directly served at `/assets/video/<filename>`:

### In React Components:
```jsx
// Example 1: Fullscreen Ambient Background Video Loop
<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/assets/video/gotham-skyline.mp4" type="video/mp4" />
    <source src="/assets/video/gotham-skyline.webm" type="video/webm" />
  </video>
</div>

// Example 2: Interactive Player with Controls
<video controls className="w-full rounded-xl shadow-2xl">
  <source src="/assets/video/intro.mp4" type="video/mp4" />
</video>
```
