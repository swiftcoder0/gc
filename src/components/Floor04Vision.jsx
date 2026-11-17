import React from 'react';
import { config } from '../config';

/**
 * Floor 04: OUR VISION
 * Governed strictly by SPEC (v2):
 * - Background: /public/images/floor-04-skyline.jpg (with filter-ice-cyan)
 * - Eyebrow: OUR VISION (ice cyan #8FE8FF)
 * - Title: FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS. (Unbounded)
 * - Small line from SPEC.md: "We want to create an ecosystem where students don't have to wait for opportunities to build something meaningful."
 * - Button: "Join The Movement →" (ice cyan-outlined, linking to LinkedIn in config)
 */
export default function Floor04Vision() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 z-10 overflow-hidden select-none">
      
      {/* 1. Fullscreen Background: /public/images/floor-04-skyline.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/floor-04-skyline.jpg"
          alt="Floor 04 Our Vision"
          className="w-full h-full object-cover object-center pointer-events-none filter-ice-cyan"
        />

        {/* Ambient Dark Overlays so text on the left is cleanly readable while preserving the cube & city on the right */}
        <div className="absolute inset-0 bg-[#0b0b0b]/40 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/90 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* 2. Left Main Content Area */}
      <div className="relative z-10 max-w-xl lg:max-w-2xl flex flex-col space-y-6 sm:space-y-7 animate-fade-in text-left">
        
        {/* Eyebrow Label & Level Tag */}
        <div className="inline-flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#8FE8FF] shadow-[0_0_10px_#8FE8FF]" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#8FE8FF] font-semibold">
            OUR VISION
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a8a88] border-l border-white/20 pl-3">
            LEVEL 04
          </span>
        </div>

        {/* Title: FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS. */}
        <div>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.12]">
            FROM STUDENTS TO BUILDERS.
            <br />
            <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
              FROM BUILDERS TO FOUNDERS.
            </span>
          </h1>
        </div>

        {/* Small line from SPEC.md */}
        <p className="font-sans text-sm sm:text-base lg:text-lg text-[#e8e8e6]/90 leading-relaxed max-w-lg font-normal">
          We want to create an ecosystem where students don't have to wait for opportunities to build something meaningful.
        </p>

        {/* Button: Join The Movement → (ice cyan-outlined, 1px border, 10% tint) */}
        <div className="pt-2 sm:pt-4">
          <a
            href={config.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full border border-[#8FE8FF] bg-[#8FE8FF]/10 text-[#8FE8FF] font-mono text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(143,232,255,0.35)] hover:shadow-[0_0_35px_rgba(143,232,255,0.55)] hover:bg-[#8FE8FF]/20 hover:text-white transition-all duration-300 active:scale-95"
          >
            <span className="font-semibold text-white">Join The Movement</span>
            <span className="text-[#8FE8FF] transition-transform duration-300 group-hover:translate-x-1.5 font-bold">
              →
            </span>
          </a>
        </div>

        {/* Closing Sub-Pill */}
        <div className="pt-2 flex items-center space-x-3 text-[10px] font-mono uppercase tracking-widest text-[#8a8a88]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FE8FF]" />
          <span>STUDENT VENTURE ECOSYSTEM</span>
          <span>•</span>
          <span>TOP FLOOR</span>
        </div>

      </div>

    </div>
  );
}