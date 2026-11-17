import React, { useState } from 'react';
import { config } from '../config';

/**
 * Floor 03: PROJECT ARCHIVE
 * Governed strictly by SPEC (v2):
 * - Background: /public/images/floor-03-archive.jpg (with filter-ice-cyan)
 * - Eyebrow: PROJECT ARCHIVE (ice cyan #8FE8FF)
 * - Title: PROJECT 001 (Unbounded)
 * - Pill: STATUS : IN DEVELOPMENT
 * - Text: "Our first project is in the works. Stay tuned."
 * - Link: "Learn More →" (ice cyan)
 * - Clicking "Learn More →" opens a small panel that says only:
 *   "Status: in development. Details will be shared when we launch."
 * - Hard rule: Do not add any other project details.
 */
export default function Floor03Archive() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 z-10 overflow-hidden select-none">
      
      {/* 1. Fullscreen Background: /public/images/floor-03-archive.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/floor-03-archive.jpg"
          alt="Floor 03 Project Archive"
          className="w-full h-full object-cover object-center pointer-events-none filter-ice-cyan"
        />

        {/* Ambient Dark Overlays so text on the left is cleanly readable while preserving the orb on the right */}
        <div className="absolute inset-0 bg-[#0b0b0b]/35 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/90 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* 2. Left Main Content Area */}
      <div className="relative z-10 max-w-xl lg:max-w-2xl flex flex-col space-y-6 sm:space-y-7 animate-fade-in text-left">
        
        {/* Tiny Label in Accent Colour */}
        <div className="inline-flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#8FE8FF] shadow-[0_0_10px_#8FE8FF]" />
          <span className="font-sans font-medium text-[11px] sm:text-[12px] uppercase tracking-[0.35em] text-[#8FE8FF]">
            PROJECT ARCHIVE
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a8a88] border-l border-white/20 pl-3">
            LEVEL 03
          </span>
        </div>

        {/* Title: PROJECT 001 (Unbounded mixing weight 200 and 700) */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-none">
            <span className="font-[200] text-[#bdbdb8]">PROJECT </span>
            <span className="font-[700] text-[#e8e8e6]">001</span>
          </h1>

          {/* Pill: STATUS: IN DEVELOPMENT */}
          <div className="pt-1">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#8FE8FF]/50 bg-[#8FE8FF]/10 text-[#8FE8FF] text-xs font-mono tracking-widest uppercase font-semibold shadow-[0_0_15px_rgba(143,232,255,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FE8FF] animate-ping" />
              <span>STATUS: IN DEVELOPMENT</span>
            </span>
          </div>
        </div>

        {/* Line from SPEC.md */}
        <p className="font-sans text-sm sm:text-base lg:text-lg text-[#e8e8e6] leading-relaxed max-w-lg font-normal">
          Something is being built. You'll see it <span className="text-[#8FE8FF] font-semibold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>here first.</span>
        </p>

        {/* Link: Learn More → (in ice cyan) */}
        <div className="pt-2">
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center space-x-2.5 text-xs sm:text-sm font-mono tracking-wider uppercase text-[#8FE8FF] hover:text-white transition-all duration-300 cursor-pointer"
          >
            <span className="border-b border-[#8FE8FF]/60 group-hover:border-white pb-0.5 font-bold">
              Learn More
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1.5 text-base">
              →
            </span>
          </button>
        </div>

        {/* Small classified scene indicator */}
        <div className="pt-4 flex items-center space-x-3 text-[10px] font-mono uppercase tracking-widest text-[#8a8a88]">
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">ARCHIVE ID: GC-001</span>
          <span>•</span>
          <span>CLASSIFIED REPOSITORY</span>
        </div>

      </div>

      {/* 3. Small Modal Panel (Says ONLY: "Status: in development. Details will be shared when we launch.") */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl border border-white/20 bg-[#0e0e0e] shadow-[0_15px_50px_rgba(0,0,0,0.95)] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#8FE8FF] shadow-[0_0_8px_#8FE8FF]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#8FE8FF] font-semibold">
                  PROJECT 001
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full border border-white/20 bg-black/50 flex items-center justify-center text-xs text-[#a1a1aa] hover:text-white hover:border-white/50 transition-all cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Exactly the SPEC.md content — NO extra details */}
            <div className="py-2">
              <p className="font-sans text-sm sm:text-base text-[#e8e8e6] leading-relaxed">
                Status: in development. Details will be shared when we launch.
              </p>
            </div>

            {/* Dismiss button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(143,232,255,0.25)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}