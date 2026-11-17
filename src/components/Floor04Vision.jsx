import React from 'react';
import { config } from '../config';

/**
 * Floor 04: OUR VISION & STORY & FINAL SCREEN
 * Governed strictly by SPEC (v2):
 * - Label: OUR VISION (Inter 500, uppercase, 11-12px, letter spacing 0.35em)
 * - Headline: "Students shouldn't have to wait to build." (Unbounded mixing weight 200 and 700, max 8 words)
 * - Line: "FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS." (BUILDERS / FOUNDERS glow)
 * - Button: "Join The Movement →"
 * - Story Section: four lines, each on its own full-height screen
 * - Final Screen: "THE FUTURE IS BUILT, NOT WAITED FOR." + "Join The Movement →"
 */
export default function Floor04Vision() {
  return (
    <div className="relative w-full min-h-screen flex flex-col z-10 overflow-x-hidden select-none">
      
      {/* 1. Background: /public/images/floor-04-skyline.jpg */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/floor-04-skyline.jpg"
          alt="Floor 04 Skyline"
          className="w-full h-full object-cover object-right filter-ice-cyan opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* 2. Main Floor 04 Content (First Screen) */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-4xl text-left">
        <div className="flex flex-col space-y-5 animate-fade-in py-8">
          {/* Label in Accent Colour */}
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF]">
            OUR VISION
          </div>

          {/* Headline: "Students shouldn't have to wait to build." */}
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-2xl">
            <span className="font-[200] text-[#bdbdb8]">Students shouldn't </span>
            <span className="font-[700] text-[#e8e8e6]">have to wait to build.</span>
          </h1>

          {/* Line: FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS. */}
          <div className="pt-1 text-sm sm:text-base lg:text-lg font-mono uppercase tracking-wider text-[#e8e8e6] leading-relaxed animate-fade-line-1">
            FROM STUDENTS TO{' '}
            <span className="text-[#8FE8FF] font-bold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
              BUILDERS.
            </span>{' '}
            FROM BUILDERS TO{' '}
            <span className="text-[#8FE8FF] font-bold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
              FOUNDERS.
            </span>
          </div>

          {/* Button: Join The Movement → */}
          <div className="pt-3 animate-fade-line-2 flex flex-wrap items-center gap-4">
            <a
              href={config.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-full border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_18px_rgba(143,232,255,0.35)] cursor-pointer"
            >
              <span>Join The Movement</span>
              <span>→</span>
            </a>

            <a
              href="#story-1"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('story-1')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
            >
              <span>Read The Story</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Story Section (4 full-height screens) */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Story Screen 1 */}
        <div
          id="story-1"
          className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
        >
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
            THE STORY · PART I
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight max-w-4xl">
            <span className="font-[200] text-[#bdbdb8]">We started </span>
            <span className="font-[700] text-[#e8e8e6]">small.</span>
          </h2>
        </div>

        {/* Story Screen 2 */}
        <div
          id="story-2"
          className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
        >
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
            THE STORY · PART II
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl">
            <span className="font-[200] text-[#bdbdb8]">A few minds. One rule: </span>
            <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
              build, don't just talk.
            </span>
          </h2>
        </div>

        {/* Story Screen 3 */}
        <div
          id="story-3"
          className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
        >
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
            THE STORY · PART III
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl">
            <span className="font-[200] text-[#bdbdb8]">When a project shows promise, </span>
            <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
              we back the people behind it.
            </span>
          </h2>
        </div>

        {/* Story Screen 4 */}
        <div
          id="story-4"
          className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
        >
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
            THE STORY · PART IV
          </div>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight max-w-4xl">
            <span className="font-[200] text-[#bdbdb8]">We're not an investment fund or a VC firm. </span>
            <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
              We're builders.
            </span>
          </h2>
        </div>

        {/* Final Screen */}
        <div
          id="final-screen"
          className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/10"
        >
          <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-8">
            THE GOTHAM MOTTO
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl mb-10">
            <span className="font-[200] text-[#bdbdb8]">THE FUTURE IS BUILT, </span>
            <span className="font-[700] text-[#e8e8e6]">NOT WAITED FOR.</span>
          </h2>
          <a
            href={config.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-full border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(143,232,255,0.45)] cursor-pointer active:scale-95"
          >
            <span>Join The Movement</span>
            <span>→</span>
          </a>
        </div>
      </div>

    </div>
  );
}
