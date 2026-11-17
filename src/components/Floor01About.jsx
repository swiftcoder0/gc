import React, { useState, useEffect } from 'react';
import { config } from '../config';

/**
 * Floor 01: ABOUT GOTHAM
 * Conforms strictly to SPEC (v2):
 * - If /public/images/floor-01-about.jpg exists, use as background; otherwise black background with soft fog and thin gold light strips in code.
 * - Glowing real logo with slow pulse glow.
 * - Text from SPEC.md typing in slowly:
 *   "Gotham Collage is a student-led venture studio where ambitious students come together to build real-world projects. We believe in learning by building and creating things that solve real problems."
 */
export default function Floor01About() {
  const [bgImageExists, setBgImageExists] = useState(false);
  const fullText = "Gotham Collage is a student-led venture studio where ambitious students come together to build real-world projects. We believe in learning by building and creating things that solve real problems.";
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Check if optional custom background exists
  useEffect(() => {
    const img = new Image();
    img.src = '/images/floor-01-about.jpg';
    img.onload = () => setBgImageExists(true);
    img.onerror = () => setBgImageExists(false);
  }, []);

  // Slow typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTypingDone(false);
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 28); // ~28ms per character for smooth deliberate slow cadence

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 z-10 overflow-hidden select-none">
      
      {/* 1. Background: Custom image or atmospheric procedural black fog with gold light strips */}
      {bgImageExists ? (
        <div className="absolute inset-0 z-0">
          <img
            src="/images/floor-01-about.jpg"
            alt="Floor 01 About"
            className="w-full h-full object-cover object-center pointer-events-none filter-ice-cyan"
          />
          <div className="absolute inset-0 bg-[#0b0b0b]/60 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Deep Black Background */}
          <div className="absolute inset-0 bg-[#0b0b0b]" />

          {/* Grid Ground Perspective */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-grid-pattern opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" />

          {/* Soft Ambient Fog Clouds */}
          <div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[140px] opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${config.colors.glow} 0%, transparent 70%)` }}
          />

          {/* Thin Vertical Ice Cyan Light Strips in Code */}
          <div
            className="absolute left-[12%] top-0 bottom-0 w-[1px] opacity-40 animate-pulse"
            style={{
              backgroundColor: config.colors.accent,
              boxShadow: `0 0 12px ${config.colors.accent}, 0 0 25px rgba(143,232,255,0.5)`,
              animationDuration: '4s',
            }}
          />
          <div
            className="absolute right-[18%] top-0 bottom-0 w-[1px] opacity-30 animate-pulse"
            style={{
              backgroundColor: config.colors.accent,
              boxShadow: `0 0 10px ${config.colors.accent}, 0 0 20px rgba(143,232,255,0.4)`,
              animationDuration: '5s',
            }}
          />
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[1px] opacity-15"
            style={{
              backgroundColor: config.colors.accent,
              boxShadow: `0 0 8px ${config.colors.accent}`,
            }}
          />

          {/* Horizon Floor Reflective Sheen */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-[#0b0b0b]/80 to-transparent" />
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="relative z-10 max-w-2xl lg:max-w-3xl flex flex-col space-y-6 sm:space-y-8 animate-fade-in">
        
        {/* Eyebrow Label */}
        <div className="inline-flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#8FE8FF] shadow-[0_0_10px_#8FE8FF]" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#8FE8FF] font-semibold">
            ABOUT GOTHAM
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a8a88] border-l border-white/20 pl-3">
            LEVEL 01
          </span>
        </div>

        {/* Logo and Headline Lockup */}
        <div className="flex items-center space-x-5 sm:space-x-7">
          {/* Glowing Seal Logo */}
          <div className="relative flex-shrink-0 group">
            {/* Slow Pulse Glow Behind the Logo */}
            <div
              className="absolute -inset-3 sm:-inset-4 rounded-full blur-xl opacity-60 animate-pulse"
              style={{
                background: `radial-gradient(circle, ${config.colors.glow} 0%, rgba(143,232,255,0.1) 70%, transparent 100%)`,
                animationDuration: '3.5s',
              }}
            />

            {/* Logo Badge */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/80 border border-white/20 p-2.5 sm:p-3 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <img
                src="/images/gc-logo.png"
                alt="Gotham Collage Emblem"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_14px_rgba(143,232,255,0.6)]"
              />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-none">
              GOTHAM COLLAGE
            </h1>
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#a1a1aa] mt-2">
              STUDENT-LED VENTURE STUDIO
            </p>
          </div>
        </div>

        {/* Slow Typing Body Text from SPEC.md */}
        <div className="relative p-5 sm:p-7 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl min-h-[140px] sm:min-h-[160px] flex items-center">
          <p className="font-sans text-sm sm:text-base lg:text-lg text-[#e8e8e6] leading-relaxed font-normal">
            {displayedText}
            {/* Blinking Cursor */}
            <span
              className={`inline-block w-2 sm:w-2.5 h-4 sm:h-5 ml-1 bg-[#8FE8FF] align-middle transition-opacity duration-100 ${
                isTypingDone ? 'animate-pulse' : 'opacity-100'
              }`}
            />
          </p>
        </div>

        {/* Bottom Metadata Hint */}
        <div className="flex items-center space-x-6 text-[11px] font-mono uppercase tracking-wider text-[#8a8a88]">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>FOUNDRY STATUS: ACTIVE</span>
          </div>
          <span>•</span>
          <span>EST. 2026</span>
        </div>

      </div>
    </div>
  );
}