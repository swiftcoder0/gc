/**
 * GOTHAM COLLAGE — Central Configuration File
 * Single source of truth for colors, fonts, links, and navigation.
 * Per SPEC (v2) HARD RULES: Do not change without explicit permission.
 */

export const config = {
  brand: {
    name: 'Gotham Collage',
    legalName: 'Gotham Collage',
    tagline: 'Building Projects. Creating Founders. Launching Startups.',
    heroLabel: 'WELCOME TO GOTHAM COLLAGE',
    heroHeadline: {
      part1: 'IDEAS ARE EVERYWHERE.',
      part2: 'FOUNDERS ARE BUILT',
      accent: 'HERE.',
    },
    subLine: 'A venture studio built by ambitious minds.',
    buttonText: 'Enter Our World →',
    logoPath: '/images/gc-logo.png',
  },

  // Color Palette (SPEC v2: Black, charcoal, white, silver + ONE warm gold accent <10%)
  colors: {
    black: '#0b0b0b',
    charcoal: '#141414',
    surface: '#121212',
    border: '#222222',
    text: '#e8e8e6',
    textMuted: '#8a8a88',
    white: '#ffffff',
    silver: '#c0c0c0',
    silverMuted: '#8f9299',
    gold: '#F5B800',
    goldGlow: 'rgba(245, 184, 0, 0.5)',
    goldSoftGlow: 'rgba(245, 184, 0, 0.25)',
    goldBorder: 'rgba(245, 184, 0, 0.4)',
  },

  // Typography (SPEC v2)
  fonts: {
    heading: 'Unbounded, sans-serif',
    body: 'Inter, sans-serif',
  },

  // Navigation Links
  nav: [
    { label: 'Projects', href: '#projects' },
    { label: 'The Elevator', href: '#elevator' },
    { label: 'About', href: '#about' },
    { label: 'Join Now', href: 'https://www.linkedin.com/company/gotham-collage', external: true },
  ],

  // Social Links (SPEC v2: Show icon ONLY if URL is populated)
  socials: {
    linkedin: 'https://www.linkedin.com/company/gotham-collage',
    x: '',        // Hidden until real URL provided
    youtube: '',  // Hidden until real URL provided
    discord: '',  // Hidden until real URL provided
  },

  // Image Asset Paths from /public/images
  images: {
    logo: '/images/gc-logo.png',
    portalHero: '/images/Lone Wanderer Before the Golden Portal.png',
    elevatorLobby: '/images/Luxurious Black Marble Elevator Lobby.png',
    elevatorDoors: '/images/Futuristic Golden-Lit Marble Lobby.png',
    methodBackdrop: '/images/Sleek Vertical Brushed Steel.png',
    orbArchive: '/images/Futuristic Orb in a Glass Display.png',
    cubeVision: '/images/Futuristic Glass Cube with Golden Orbit.png',
  },
};

export default config;
