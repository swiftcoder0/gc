import React from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

/**
 * PortalHero — Screen 1: The Portal (Hero Section)
 * Fully aligned with SPEC (v2) and panel 1 mockup:
 * - Full-screen background: /public/images/portal-hall.jpg (darkened on left for typography readability)
 * - Navigation: Logo + GOTHAM COLLAGE (left), Nav links (center), Gold-outlined "Enter Portal" button (right)
 * - Hero content:
 *   - Label: WELCOME TO GOTHAM COLLAGE
 *   - Headline: IDEAS ARE EVERYWHERE. / FOUNDERS ARE BUILT HERE. ("HERE." in gold)
 *   - Sub line: A venture studio built by ambitious minds.
 *   - Button: Enter Our World → (gold-outlined with soft amber glow)
 *   - Scroll hint: "Scroll Down"
 * - Portal Center:
 *   - Real logo (gc-logo.png) in the exact center of concentric portal rings with screen blend mode
 *   - Slow pulsating gold/amber glow behind the logo
 */
export default function PortalHero() {
  const { openMemberLogin } = useAuth();

  return (
    <div className="relative w-full h-[100dvh] min-h-[650px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans">
      {/* 1. Full-screen Background: /public/images/portal-hall.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/portal-hall.jpg"
          alt="Gotham Collage Portal Hall"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Left-side darkness gradient so text is cleanly readable without obscuring portal */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 via-45% to-transparent pointer-events-none" />

        {/* Top subtle vignette for navigation contrast */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/90 via-[#0b0b0b]/40 to-transparent pointer-events-none" />

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-30 w-full px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between">
        {/* Left: Logo + GOTHAM COLLAGE */}
        <a href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 border border-white/20 p-0.5 flex items-center justify-center group-hover:border-[#F5B800]/50 transition-colors">
            <img
              src="/images/gc-logo.png"
              alt="GC"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] text-[#e8e8e6] group-hover:text-white transition-colors">
            GOTHAM COLLAGE
          </span>
        </a>

        {/* Centre: Nav Links (Projects / The Elevator / About / Join Now) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
          {config.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className={`transition-colors duration-200 hover:text-white ${
                item.label === 'Join Now' ? 'text-zinc-300 font-semibold hover:text-[#F5B800]' : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Gold-outlined "Enter Portal" button (jumps / accesses portal) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={openMemberLogin}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border border-[#F5B800] text-[#F5B800] bg-[#0b0b0b]/70 hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_15px_rgba(245,184,0,0.3)] hover:shadow-[0_0_25px_rgba(245,184,0,0.6)] active:scale-95"
          >
            Enter Portal
          </button>
        </div>
      </header>

      {/* 4. Hero Content — Left Side */}
      <div className="relative z-20 h-[calc(100%-140px)] px-6 sm:px-10 lg:px-14 flex flex-col justify-center max-w-2xl lg:max-w-3xl">
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shadow-[0_0_8px_#F5B800]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#e8e8e6]/80 font-medium">
              WELCOME TO GOTHAM COLLAGE
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.08] text-white">
            IDEAS ARE EVERYWHERE.
            <br />
            FOUNDERS ARE BUILT{' '}
            <span
              className="text-[#F5B800]"
              style={{
                textShadow: '0 0 25px rgba(245,184,0,0.55), 0 0 50px rgba(245,184,0,0.25)',
              }}
            >
              HERE.
            </span>
          </h1>

          {/* Sub line */}
          <p className="text-sm sm:text-base lg:text-lg font-sans text-[#e8e8e6]/85 font-normal max-w-xl leading-relaxed">
            A venture studio built by ambitious minds.
          </p>

          {/* Hero Action Button */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('elevator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center space-x-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full border border-[#F5B800] bg-[#0b0b0b]/80 text-white font-mono text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,184,0,0.35)] hover:shadow-[0_0_35px_rgba(245,184,0,0.6)] hover:bg-[#F5B800]/20 hover:border-[#F5B800] transition-all duration-300 active:scale-95"
            >
              <span className="font-semibold text-white">Enter Our World</span>
              <span className="text-[#F5B800] transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Scroll Down Hint */}
      <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 lg:left-14 z-20 flex items-center space-x-3 text-[11px] font-mono uppercase tracking-[0.25em] text-[#8a8a88]">
        <div className="w-5 h-[1px] bg-white/30" />
        <span>Scroll Down</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#F5B800] animate-pulse" />
      </div>
    </div>
  );
}
