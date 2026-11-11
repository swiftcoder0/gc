/**
 * Gotham Collage Asset Manifest
 * Central registry for all static media paths (images, audio, video).
 * All assets in /public/assets/ are served directly at /assets/
 */

export const ASSET_PATHS = {
  // Image Assets (/public/assets/images/)
  images: {
    logo: '/assets/images/gotham-logo.jpg',
    towerBackground: '/assets/images/gotham-tower.png',
  },

  // Audio Assets (/public/assets/audio/)
  audio: {
    // Add audio file paths here, e.g.:
    // welcomeAmbient: '/assets/audio/ambient.mp3',
    // buttonClick: '/assets/audio/click.mp3',
  },

  // Video Assets (/public/assets/video/)
  video: {
    gothamTowerBackground: '/assets/video/gotham-tower-background.mp4',
  },
};

export default ASSET_PATHS;
