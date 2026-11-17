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
        
        {/* Tiny Label in Accent Colour */}
        <div className="inline-flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#8FE8FF] shadow-[0_0_10px_#8FE8FF]" />
          <span className="font-sans font-medium text-[11px] sm:text-[12px] uppercase tracking-[0.35em] text-[#8FE8FF]">
            WHO WE ARE
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a8a88] border-l border-white/20 pl-3">
            LEVEL 01
          </span>
        </div>

        {/* Headline: "We're people who build." (Unbounded, mixing weight 200 and 700, max 8 words) */}
        <div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            <span className="font-[200] text-[#bdbdb8]">We're people </span>
            <span className="font-[700] text-[#e8e8e6]">who build.</span>
          </h1>
        </div>

        {/* Short Lines (one at a time, 0.5s fade-in, upward move, 0.25s stagger) */}
        <div className="space-y-3 pt-2 text-base sm:text-lg lg:text-xl font-sans text-[#e8e8e6] leading-relaxed">
          <div className="animate-fade-line-1 text-[#bdbdb8]">
            Investors kept asking: "Where's your team?"
          </div>
          <div className="animate-fade-line-2 text-white">
            So we became <span className="text-[#8FE8FF] font-semibold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>one.</span>
          </div>
          <div className="animate-fade-line-3 text-[#a1a1aa] text-sm sm:text-base">
            Gotham Collage is a student-led venture studio.
          </div>
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