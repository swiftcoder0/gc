import React, { useState, useEffect } from 'react';
import { config } from '../config';

/**
 * Floor 02: THE METHOD
 * Governed strictly by SPEC (v2):
 * - If /public/images/floor-02-method.jpg exists, use as background; otherwise black background with soft fog and thin gold light strips in code.
 * - Three glowing white pillars labelled: BUILD, IDENTIFY, CREATE
 * - Hover or tap lights a pillar in gold and shows its line from SPEC.md:
 *     BUILD: we collaborate as students and build projects from scratch
 *     IDENTIFY: after launching and validating projects, we identify people with the potential to become founders
 *     CREATE: we work with selected founders to turn successful projects into independent startups through equity partnerships
 * - Closing line: "We don't just teach entrepreneurship. We build real things."
 * - Only copy from SPEC.md, short and punchy.
 */
export default function Floor02Method() {
  const [bgImageExists, setBgImageExists] = useState(false);
  const [activePillar, setActivePillar] = useState('BUILD'); // 'BUILD' | 'IDENTIFY' | 'CREATE'

  // Check if optional custom background exists
  useEffect(() => {
    const img = new Image();
    img.src = '/images/floor-02-method.jpg';
    img.onload = () => setBgImageExists(true);
    img.onerror = () => setBgImageExists(false);
  }, []);

  const pillars = [
    {
      id: 'BUILD',
      num: '01',
      label: 'BUILD',
      line: 'we collaborate as students and build projects from scratch',
    },
    {
      id: 'IDENTIFY',
      num: '02',
      label: 'IDENTIFY',
      line: 'after launching and validating projects, we identify people with the potential to become founders',
    },
    {
      id: 'CREATE',
      num: '03',
      label: 'CREATE',
      line: 'we work with selected founders to turn successful projects into independent startups through equity partnerships',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 z-10 overflow-hidden select-none">
      
      {/* 1. Background: Custom image or atmospheric procedural black fog with gold light strips */}
      {bgImageExists ? (
        <div className="absolute inset-0 z-0">
          <img
            src="/images/floor-02-method.jpg"
            alt="Floor 02 The Method"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
          <div className="absolute inset-0 bg-[#0b0b0b]/60 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Deep Black Base */}
          <div className="absolute inset-0 bg-[#0b0b0b]" />

          {/* Grid Perspective Floor */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-grid-pattern opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" />

          {/* Procedural Fog Glows */}
          <div
            className="absolute -top-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-12 left-1/4 w-96 h-96 rounded-full blur-[130px] opacity-15 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${config.colors.goldGlow} 0%, transparent 70%)` }}
          />

          {/* Thin Vertical Gold Light Strips in Code */}
          <div
            className="absolute left-[10%] top-0 bottom-0 w-[1px] opacity-35 animate-pulse"
            style={{
              backgroundColor: config.colors.gold,
              boxShadow: `0 0 12px ${config.colors.gold}, 0 0 24px rgba(245,184,0,0.45)`,
              animationDuration: '3.8s',
            }}
          />
          <div
            className="absolute right-[15%] top-0 bottom-0 w-[1px] opacity-30 animate-pulse"
            style={{
              backgroundColor: config.colors.gold,
              boxShadow: `0 0 12px ${config.colors.gold}, 0 0 24px rgba(245,184,0,0.45)`,
              animationDuration: '4.5s',
            }}
          />

          {/* Horizon Floor Reflective Fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-[#0b0b0b]/80 to-transparent" />
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="relative z-10 max-w-4xl flex flex-col space-y-6 sm:space-y-8 animate-fade-in">
        
        {/* Eyebrow Label & Level Tag */}
        <div className="inline-flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
            THE METHOD
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a8a88] border-l border-white/20 pl-3">
            LEVEL 02
          </span>
        </div>

        {/* Section Title */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
            BUILD • IDENTIFY • CREATE
          </h1>
        </div>

        {/* 3. Three Glowing White Pillars (Hover or tap lights a pillar in gold) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {pillars.map((pillar) => {
            const isPillarActive = activePillar === pillar.id;

            return (
              <div
                key={pillar.id}
                onMouseEnter={() => setActivePillar(pillar.id)}
                onClick={() => setActivePillar(pillar.id)}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md ${
                  isPillarActive
                    ? 'border-[#F5B800] bg-black/85 shadow-[0_0_30px_rgba(245,184,0,0.4)] -translate-y-2'
                    : 'border-white/20 bg-black/60 shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:border-[#F5B800]/60 hover:shadow-[0_0_25px_rgba(245,184,0,0.25)] hover:-translate-y-1'
                }`}
              >
                {/* Pillar Ambient Glow Halo */}
                <div
                  className={`absolute -inset-10 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${
                    isPillarActive ? 'opacity-40' : 'opacity-10 group-hover:opacity-25'
                  }`}
                  style={{
                    background: isPillarActive
                      ? config.colors.goldGlow
                      : 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  }}
                />

                {/* Vertical Glowing Pillar Core Line */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-[3px] transition-all duration-300 ${
                    isPillarActive
                      ? 'bg-[#F5B800] shadow-[0_0_15px_#F5B800]'
                      : 'bg-white/40 group-hover:bg-[#F5B800] shadow-[0_0_10px_white]'
                  }`}
                />

                {/* Pillar Header (Number & Label) */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
                  <span
                    className={`font-mono text-xs tracking-widest font-bold transition-colors ${
                      isPillarActive ? 'text-[#F5B800]' : 'text-zinc-400 group-hover:text-[#F5B800]'
                    }`}
                  >
                    PHASE {pillar.num}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isPillarActive
                        ? 'bg-[#F5B800] shadow-[0_0_8px_#F5B800] scale-125'
                        : 'bg-white/40 group-hover:bg-[#F5B800]'
                    }`}
                  />
                </div>

                {/* Pillar Name (Glowing White by default, Gold on Active) */}
                <div className="relative z-10 my-4 sm:my-5">
                  <h3
                    className={`font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider transition-colors duration-300 ${
                      isPillarActive
                        ? 'text-[#F5B800] drop-shadow-[0_0_15px_rgba(245,184,0,0.6)]'
                        : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:text-zinc-100'
                    }`}
                  >
                    {pillar.label}
                  </h3>
                </div>

                {/* Pillar Line from SPEC.md */}
                <div className="relative z-10 min-h-[50px] sm:min-h-[60px] flex items-center">
                  <p
                    className={`font-sans text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                      isPillarActive
                        ? 'text-[#e8e8e6] font-medium'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {pillar.line}
                  </p>
                </div>

                {/* Bottom Active Pillar Indicator Bar */}
                <div className="relative z-10 pt-3">
                  <div className="w-full h-[1px] bg-white/10">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPillarActive ? 'w-full bg-[#F5B800] shadow-[0_0_8px_#F5B800]' : 'w-0 bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Closing Line from SPEC.md */}
        <div className="pt-2 sm:pt-4">
          <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center space-x-3.5 shadow-xl max-w-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shadow-[0_0_6px_#F5B800]" />
            <p className="font-mono text-xs sm:text-sm uppercase tracking-wider text-[#e8e8e6] font-semibold">
              We don't just teach entrepreneurship. We build real things.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}