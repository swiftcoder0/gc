import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

/**
 * PortalHero — Screen 1: The Portal with Full Interactions
 * 
 * Interactions:
 * 1. Parallax Depth: Mouse movement shifts background, fog layer, and hero content by different amounts.
 *    (Disabled on phones and when prefers-reduced-motion is active).
 * 2. Hover Glow: Hovering "Enter Our World" or "Enter Portal" intensely amplifies the portal's amber/gold glow.
 * 3. Fly-Through Sequence:
 *    - Triggered by clicking either button or scrolling down once.
 *    - Zooms toward portal center (50.9% 42.7%) for ~2.5s with brightness building up.
 *    - Cross-fades into /images/portal-city.jpg, followed by a crisp white flash.
 *    - Transitions into an empty black placeholder called "lobby".
 *    - Mobile/reduced-motion: Instant, lightweight fade directly to "lobby".
 */
export default function PortalHero() {
  const { openMemberLogin } = useAuth();

  // State
  const [currentView, setCurrentView] = useState('portal'); // 'portal' | 'lobby'
  const [isHoveringPortalButton, setIsHoveringPortalButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for GSAP & Parallax
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const fogRef = useRef(null);
  const contentRef = useRef(null);
  const portalGlowRef = useRef(null);
  const flashOverlayRef = useRef(null);
  const cityOverlayRef = useRef(null);

  // Check preferences
  const isReducedMotion = useRef(false);
  const isMobile = useRef(false);

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isMobile.current = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  }, []);

  // 1. Parallax Depth on Mouse Movement
  useEffect(() => {
    if (currentView !== 'portal') return;

    const handleMouseMove = (e) => {
      if (isReducedMotion.current || isMobile.current || isTransitioning) return;

      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1
      const yNorm = (e.clientY - innerHeight / 2) / (innerHeight / 2); // -1 to 1

      // Subtle, layered parallax depth
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          x: xNorm * -14,
          y: yNorm * -8,
          duration: 1.2,
          ease: 'power1.out',
        });
      }

      if (fogRef.current) {
        gsap.to(fogRef.current, {
          x: xNorm * 22,
          y: yNorm * 12,
          duration: 1.6,
          ease: 'power1.out',
        });
      }

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: xNorm * -6,
          y: yNorm * -4,
          duration: 1.0,
          ease: 'power1.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentView, isTransitioning]);

  // 2. Fly-through Transition Handler
  const triggerFlyThrough = () => {
    if (isTransitioning || currentView === 'lobby') return;
    setIsTransitioning(true);

    // Lighter Mode for Phones & Reduced Motion: Immediate clean transition
    if (isReducedMotion.current || isMobile.current) {
      if (flashOverlayRef.current) {
        gsap.to(flashOverlayRef.current, {
          opacity: 1,
          duration: 0.25,
          onComplete: () => {
            setCurrentView('lobby');
            setIsTransitioning(false);
            gsap.to(flashOverlayRef.current, { opacity: 0, duration: 0.35 });
          },
        });
      } else {
        setCurrentView('lobby');
        setIsTransitioning(false);
      }
      return;
    }

    // Full 2.5s Cinematic Fly-through Sequence
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentView('lobby');
        setIsTransitioning(false);
      },
    });

    // Fade out text UI immediately
    if (contentRef.current) {
      tl.to(contentRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);
    }

    // Zoom camera directly toward portal rings center (50% 50%)
    if (bgRef.current) {
      tl.to(
        bgRef.current,
        {
          scale: 5.5,
          transformOrigin: '50% 50%',
          filter: 'brightness(3.5) contrast(1.2)',
          duration: 2.5,
          ease: 'power2.in',
        },
        0
      );
    }

    // Intensely amplify the WHITE portal light tunnel
    if (portalGlowRef.current) {
      tl.to(
        portalGlowRef.current,
        {
          opacity: 1,
          scale: 4.5,
          duration: 2.3,
          ease: 'power2.in',
        },
        0
      );
    }

    // Cross-fade into /images/portal-city.jpg near the climax of the zoom (at 1.7s)
    if (cityOverlayRef.current) {
      tl.to(
        cityOverlayRef.current,
        {
          opacity: 1,
          scale: 1.15,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        1.7
      );
    }

    // Short crisp white flash at 2.35s
    if (flashOverlayRef.current) {
      tl.to(
        flashOverlayRef.current,
        {
          opacity: 1,
          duration: 0.22,
          ease: 'power3.in',
        },
        2.32
      );
      // Flash fades out over the new lobby
      tl.to(
        flashOverlayRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
        },
        2.54
      );
    }
  };

  // 3. Scroll Down Once Trigger
  useEffect(() => {
    if (currentView !== 'portal') return;

    let touchStartY = 0;

    const handleWheel = (e) => {
      if (e.deltaY > 25 && !isTransitioning) {
        triggerFlyThrough();
      }
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      if (touchStartY - touchEndY > 45 && !isTransitioning) {
        triggerFlyThrough();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentView, isTransitioning]);

  // View: Lobby Placeholder
  if (currentView === 'lobby') {
    return (
      <div className="relative w-full h-[100dvh] bg-[#0b0b0b] text-[#e8e8e6] flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
        {/* Subtle Ambient Backlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${config.colors.goldGlow} 0%, transparent 65%)`,
          }}
        />

        {/* Center: Lobby Placeholder Information */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#F5B800]/40 bg-[#F5B800]/10 text-[#F5B800] text-[10px] font-mono tracking-[0.25em] uppercase">
            <span>FLOOR 00</span>
            <span>•</span>
            <span>THE ELEVATOR LOBBY</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            lobby
          </h2>

          <p className="text-xs sm:text-sm font-sans text-[#8a8a88] max-w-sm leading-relaxed">
            Welcome to the threshold of Gotham Collage. Select your floor to explore the studio archives and foundry methods.
          </p>

          <div className="pt-4 flex items-center space-x-4">
            <button
              onClick={() => {
                // Reset to portal view
                setCurrentView('portal');
                setIsTransitioning(false);
              }}
              className="px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase border border-white/20 text-[#a1a1aa] hover:text-white hover:border-white/50 hover:bg-white/5 transition-all"
            >
              ← Back to Portal
            </button>

            <button
              onClick={openMemberLogin}
              className="px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase border border-[#F5B800] text-[#F5B800] bg-[#0b0b0b] hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_15px_rgba(245,184,0,0.3)] transition-all"
            >
              Portal Login →
            </button>
          </div>
        </div>

        {/* Flash Overlay (for transitions back and forth) */}
        <div
          ref={flashOverlayRef}
          className="pointer-events-none fixed inset-0 z-50 bg-white opacity-0"
        />
      </div>
    );
  }

  // View: The Portal (Screen 1)
  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] min-h-[650px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans"
    >
      {/* 1. Fullscreen Background Image with Parallax & Zoom Container */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 will-change-transform scale-[1.03]"
      >
        <img
          src="/images/portal-hall.jpg"
          alt="Gotham Collage Portal Hall"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Left-side darkness gradient so text is cleanly readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 via-45% to-transparent pointer-events-none" />

        {/* Top subtle vignette for navigation contrast */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/90 via-[#0b0b0b]/40 to-transparent pointer-events-none" />

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* 2. Interactive Portal Light Glow Layer (Pure WHITE radiant glow, centers exactly at 50% 50%) */}
      <div
        ref={portalGlowRef}
        className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
          isHoveringPortalButton ? 'opacity-95 scale-140' : 'opacity-40 scale-100'
        }`}
        style={{ left: '50%', top: '50%' }}
      >
        <div
          className="w-44 h-44 sm:w-64 sm:h-64 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 35%, rgba(255,255,255,0.15) 65%, transparent 80%)',
          }}
        />
      </div>

      {/* 3. Fog Layer with Independent Parallax Speed */}
      <div
        ref={fogRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 z-10 opacity-30 will-change-transform"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
      />

      {/* 4. Cross-fade City Skyline Overlay for Fly-Through Transition (/images/portal-city.jpg) */}
      <div
        ref={cityOverlayRef}
        className="pointer-events-none absolute inset-0 z-25 opacity-0 will-change-transform"
      >
        <img
          src="/images/portal-city.jpg"
          alt="Gotham City Beyond"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0b0b0b]/40" />
      </div>

      {/* 5. Flash Transition Overlay */}
      <div
        ref={flashOverlayRef}
        className="pointer-events-none fixed inset-0 z-50 bg-white opacity-0"
      />

      {/* 6. Top Navigation Bar */}
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

        {/* Right: Gold-outlined "Enter Portal" button (Intensifies glow on hover + triggers fly-through on click) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerFlyThrough}
            onMouseEnter={() => setIsHoveringPortalButton(true)}
            onMouseLeave={() => setIsHoveringPortalButton(false)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border border-[#F5B800] text-[#F5B800] bg-[#0b0b0b]/70 hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_15px_rgba(245,184,0,0.3)] hover:shadow-[0_0_30px_rgba(245,184,0,0.7)] active:scale-95"
          >
            Enter Portal
          </button>
        </div>
      </header>

      {/* 7. Hero Content with Foreground Parallax Depth */}
      <div
        ref={contentRef}
        className="relative z-20 h-[calc(100%-140px)] px-6 sm:px-10 lg:px-14 flex flex-col justify-center max-w-2xl lg:max-w-3xl will-change-transform"
      >
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

          {/* Hero Action Button: "Enter Our World →" (Intensifies portal glow on hover, triggers fly-through on click) */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={triggerFlyThrough}
              onMouseEnter={() => setIsHoveringPortalButton(true)}
              onMouseLeave={() => setIsHoveringPortalButton(false)}
              className="group inline-flex items-center space-x-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full border border-[#F5B800] bg-[#0b0b0b]/80 text-white font-mono text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,184,0,0.35)] hover:shadow-[0_0_40px_rgba(245,184,0,0.75)] hover:bg-[#F5B800]/20 hover:border-[#F5B800] transition-all duration-300 active:scale-95"
            >
              <span className="font-semibold text-white">Enter Our World</span>
              <span className="text-[#F5B800] transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 8. Scroll Down Hint (Clicking it also triggers the fly-through) */}
      <button
        onClick={triggerFlyThrough}
        className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 lg:left-14 z-20 flex items-center space-x-3 text-[11px] font-mono uppercase tracking-[0.25em] text-[#8a8a88] hover:text-white transition-colors cursor-pointer group"
      >
        <div className="w-5 h-[1px] bg-white/30 group-hover:w-8 group-hover:bg-[#F5B800] transition-all" />
        <span>Scroll Down</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#F5B800] animate-pulse" />
      </button>
    </div>
  );
}
