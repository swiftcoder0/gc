import React from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

/**
 * CenteredLogoScreen — Milestone Phase 1
 * Displays a pure black cinematic canvas (#0b0b0b) with the real Gotham Collage logo centered.
 * Provides discreet portal access in the corner to preserve existing member & admin login workflows.
 */
export default function CenteredLogoScreen() {
  const { openMemberLogin } = useAuth();

  return (
    <div className="relative min-h-screen w-full bg-[#0b0b0b] text-[#e8e8e6] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.colors.goldGlow} 0%, rgba(11, 11, 11, 0) 60%)`,
        }}
      />

      {/* Top Right: Portal / Admin Login Access */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={openMemberLogin}
          className="px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 border border-[#F5B800]/40 text-[#F5B800] hover:text-white hover:border-[#F5B800] hover:bg-[#F5B800]/10 hover:shadow-[0_0_15px_rgba(245,184,0,0.3)] active:scale-95"
          title="Access Member & Admin Portal"
        >
          Portal Login →
        </button>
      </div>

      {/* Center: The Real Logo from /public/images/gc-logo.png */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="relative group">
          {/* Subtle Outer Glow Ring */}
          <div 
            className="absolute -inset-4 rounded-full opacity-40 blur-xl transition-opacity duration-700 group-hover:opacity-75"
            style={{ background: config.colors.goldGlow }}
          />

          {/* Real Logo File */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden bg-black/80 border border-white/20 p-2 flex items-center justify-center shadow-2xl transition-transform duration-500 hover:scale-105">
            <img
              src={config.brand.logoPath}
              alt="Gotham Collage Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to reference path or jpg if needed
                if (!e.currentTarget.src.includes('gc%20log.jpeg')) {
                  e.currentTarget.src = '/images/gc log.jpeg';
                }
              }}
            />
          </div>
        </div>

        {/* Minimal Typography: Unbounded for Title, Inter for Tagline */}
        <div className="space-y-2 pt-2">
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-[0.2em] text-[#e8e8e6]">
            GOTHAM COLLAGE
          </h1>
          <p className="text-xs sm:text-sm font-sans tracking-widest uppercase text-[#8a8a88]">
            {config.brand.tagline}
          </p>
        </div>
      </div>

      {/* Bottom Center: Minimal Status Indicator */}
      <div className="absolute bottom-6 text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-600">
        FOUNDERS ARE BUILT <span className="text-[#F5B800]">HERE.</span>
      </div>
    </div>
  );
}
