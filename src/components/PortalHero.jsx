import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import ElevatorLobby from './ElevatorLobby';

/**
 * PortalHero — Screen 1: The Portal
 * Continuous 3-second transition into The Gotham Elevator:
 * 1) Camera zooms toward the centre of the portal. Rings light up from the outside in.
 * 2) As zoom reaches the centre, light builds to a bright warm-white flash (about 0.4s).
 * 3) Lift scene fades up out of that flash (lift frame, doors with logo, button panel, starfield),
 *    with brightness settling down to normal over about 0.8s.
 * 4) Zero intermediate cube, image, or placeholder squares.
 * 5) Lift scene is pre-mounted and preloaded so nothing pops in.
 * 6) Accent: Ice Cyan (#8FE8FF) with soft glow rgba(143, 232, 255, 0.45).
 */
export default function PortalHero() {
  const { openMemberLogin, openAdminLogin } = useAuth();

  // Support direct hash linking (e.g. #lobby, #floor-03, #floor-04)
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (
        hash.includes('lobby') ||
        hash.includes('floor') ||
        hash.includes('elevator') ||
        hash.includes('project') ||
        hash.includes('about')
      ) {
        return 'lobby';
      }
    }
    return 'portal';
  });

  const [isHoveringPortalButton, setIsHoveringPortalButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false));

  // Listen for small screen changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobileScreen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // DOM Refs
  const containerRef = useRef(null);
  const portalRootRef = useRef(null);
  const lobbyLayerRef = useRef(null);
  const bgRef = useRef(null);
  const outerRingRef = useRef(null);
  const midRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const centerGlowRef = useRef(null);
  const fogRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const scrollDownRef = useRef(null);
  const warmFlashRef = useRef(null);

  // Hero Copy Entrance Animation Refs
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const labelRef = useRef(null);
  const buttonRef = useRef(null);

  // Preferences
  const isReducedMotion = useRef(false);
  const isMobile = useRef(false);

  // Preload lift assets immediately on mount
  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isMobile.current = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;

    // Preload lift images into memory
    ['/images/door-chrome.jpg', '/images/gc-logo-transparent.png'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Hero Copy Entrance Animation
  useEffect(() => {
    if (currentView !== 'portal') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({ delay: 0.15 });

    if (reduced) {
      tl.fromTo(
        [line1Ref.current, line2Ref.current, labelRef.current, buttonRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power1.out' }
      );
    } else {
      // 1. "Don't wait." fades in with a slight upward move (0.8s)
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      // 2. "BUILD." appears with a quick gold glow pulse (0.6s)
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.15'
      );
      tl.fromTo(
        line2Ref.current,
        { textShadow: '0 0 0px rgba(245,184,0,0)' },
        {
          textShadow: '0 0 35px rgba(245,184,0,0.85), 0 0 65px rgba(245,184,0,0.45)',
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
          onComplete: () => {
            if (line2Ref.current) {
              line2Ref.current.style.textShadow = '0 0 25px rgba(245,184,0,0.45)';
            }
          },
        },
        '<+=0.1'
      );

      // 3. Label below headline
      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.15'
      );

      // 4. Button
      tl.fromTo(
        buttonRef.current,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
        '-=0.15'
      );
    }

    return () => tl.kill();
  }, [currentView]);

  // 1. Mouse Parallax on Idle Portal
  useEffect(() => {
    if (currentView !== 'portal') return;

    const handleMouseMove = (e) => {
      if (isReducedMotion.current || isMobile.current || isTransitioning) return;

      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1
      const yNorm = (e.clientY - innerHeight / 2) / (innerHeight / 2); // -1 to 1

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
          x: xNorm * 20,
          y: yNorm * 10,
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

  // 2. Continuous 3-Second Transition: Portal -> Warm-White Flash -> Elevator Lift
  const triggerFlyThrough = () => {
    if (isTransitioning || currentView === 'lobby') return;
    setIsTransitioning(true);

    // prefers-reduced-motion: clean simple short fade
    if (isReducedMotion.current) {
      if (warmFlashRef.current) {
        gsap.to(warmFlashRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power1.in',
          onComplete: () => {
            if (portalRootRef.current) portalRootRef.current.style.display = 'none';
            if (lobbyLayerRef.current) lobbyLayerRef.current.style.opacity = '1';
            setCurrentView('lobby');
            setIsTransitioning(false);
            gsap.to(warmFlashRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' });
          },
        });
      } else {
        setCurrentView('lobby');
        setIsTransitioning(false);
      }
      return;
    }

    // Full 3.0-Second Continuous Cinematic Sequence
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentView('lobby');
        setIsTransitioning(false);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '#lobby');
        }
      },
    });

    // 0.0s - 0.35s: Fade out hero text content, scroll down hint, and top navigation
    if (contentRef.current) {
      tl.to(contentRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }
    if (scrollDownRef.current) {
      tl.to(scrollDownRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }
    if (headerRef.current) {
      tl.to(headerRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }

    // 0.0s - 2.2s: Camera zooms directly toward portal center (69.2% 45.2%)
    if (bgRef.current) {
      tl.to(
        bgRef.current,
        {
          scale: 7.2,
          transformOrigin: '69.2% 45.2%',
          duration: 2.2,
          ease: 'power2.in',
        },
        0
      );
    }

    // 0.1s - 1.8s: Concentric rings illuminate from OUTSIDE to INSIDE
    // Outer Ring lights up first
    if (outerRingRef.current) {
      tl.to(
        outerRingRef.current,
        {
          opacity: 0.9,
          scale: 1.15,
          duration: 0.6,
          ease: 'power1.out',
        },
        0.2
      );
    }

    // Middle Ring lights up next (ice cyan tone)
    if (midRingRef.current) {
      tl.to(
        midRingRef.current,
        {
          opacity: 0.95,
          scale: 1.25,
          duration: 0.6,
          ease: 'power1.out',
        },
        0.65
      );
    }

    // Inner Ring lights up with intense brilliant glow
    if (innerRingRef.current) {
      tl.to(
        innerRingRef.current,
        {
          opacity: 1.0,
          scale: 1.45,
          duration: 0.7,
          ease: 'power2.out',
        },
        1.1
      );
    }

    // Central Core light bloom expands
    if (centerGlowRef.current) {
      tl.to(
        centerGlowRef.current,
        {
          opacity: 1.0,
          scale: 4.0,
          duration: 1.1,
          ease: 'power2.in',
        },
        1.1
      );
    }

    // 1.8s - 2.2s (about 0.4s): Light builds into a bright warm-white/cyan flash
    if (warmFlashRef.current) {
      tl.to(
        warmFlashRef.current,
        {
          opacity: 1.0,
          duration: 0.4,
          ease: 'power2.in',
        },
        1.8
      );
    }

    // At 2.2s: Behind the peak flash, seamlessly reveal the preloaded lift scene
    tl.call(() => {
      if (portalRootRef.current) {
        portalRootRef.current.style.display = 'none';
      }
      if (lobbyLayerRef.current) {
        lobbyLayerRef.current.style.opacity = '1';
        lobbyLayerRef.current.style.pointerEvents = 'auto';
        gsap.set(lobbyLayerRef.current, { filter: 'brightness(1.8)' });
      }
    }, null, 2.2);

    // 2.2s - 3.0s (about 0.8s): The lift scene fades up out of that flash,
    // and the brightness settles down to normal over about 0.8s
    if (warmFlashRef.current) {
      tl.to(
        warmFlashRef.current,
        {
          opacity: 0.0,
          duration: 0.8,
          ease: 'power2.out',
        },
        2.2
      );
    }

    if (lobbyLayerRef.current) {
      tl.to(
        lobbyLayerRef.current,
        {
          filter: 'brightness(1.0)',
          duration: 0.8,
          ease: 'power2.out',
        },
        2.2
      );
    }
  };

  // 3. Smooth return back to Portal from Lift
  const handleBackToPortal = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (warmFlashRef.current) {
      gsap.to(warmFlashRef.current, {
        opacity: 0.5,
        duration: 0.25,
        onComplete: () => {
          if (lobbyLayerRef.current) {
            lobbyLayerRef.current.style.opacity = '0';
            lobbyLayerRef.current.style.pointerEvents = 'none';
          }
          if (portalRootRef.current) {
            portalRootRef.current.style.display = 'block';
            portalRootRef.current.style.opacity = '1';
          }
          if (bgRef.current) {
            gsap.set(bgRef.current, { scale: 1.03, x: 0, y: 0 });
          }
          if (outerRingRef.current) gsap.set(outerRingRef.current, { opacity: 0.15, scale: 1.0 });
          if (midRingRef.current) gsap.set(midRingRef.current, { opacity: 0.2, scale: 1.0 });
          if (innerRingRef.current) gsap.set(innerRingRef.current, { opacity: 0.35, scale: 1.0 });
          if (centerGlowRef.current) gsap.set(centerGlowRef.current, { opacity: 0.25, scale: 1.0 });
          if (contentRef.current) gsap.set(contentRef.current, { opacity: 1.0, x: 0, y: 0 });
          if (line1Ref.current) gsap.set(line1Ref.current, { opacity: 1, y: 0 });
          if (line2Ref.current) gsap.set(line2Ref.current, { opacity: 1, y: 0, textShadow: '0 0 25px rgba(245,184,0,0.45)' });
          if (labelRef.current) gsap.set(labelRef.current, { opacity: 1, y: 0 });
          if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 1, y: 0, scale: 1 });
          if (headerRef.current) gsap.set(headerRef.current, { opacity: 1.0 });

          setCurrentView('portal');
          setIsTransitioning(false);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          gsap.to(warmFlashRef.current, { opacity: 0, duration: 0.35 });
        },
      });
    } else {
      setCurrentView('portal');
      setIsTransitioning(false);
    }
  };

  // 4. Scroll Down Gesture Trigger
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] min-h-[640px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans"
    >
      {/* ==============================================================
          LAYER 1: PRE-MOUNTED ELEVATOR LOBBY
          Pre-rendered & preloaded underneath so nothing pops in.
          Canvas starfield, doors, and car frame are ready instantly.
      ============================================================== */}
      <div
        ref={lobbyLayerRef}
        className="absolute inset-0 z-0 transition-[filter] duration-700"
        style={{
          opacity: currentView === 'lobby' ? 1 : 0,
          pointerEvents: currentView === 'lobby' && !isTransitioning ? 'auto' : 'none',
        }}
      >
        <ElevatorLobby onBackToPortal={handleBackToPortal} />
      </div>

      {/* ==============================================================
          LAYER 2: PORTAL HERO SCENE (on top, z-10)
      ============================================================== */}
      <div
        ref={portalRootRef}
        className="absolute inset-0 z-10 overflow-hidden"
        style={{
          display: currentView === 'lobby' && !isTransitioning ? 'none' : 'block',
          pointerEvents: currentView === 'portal' && !isTransitioning ? 'auto' : 'none',
        }}
      >
        {/* Fullscreen Background Image with Concentric Portal Rings (filtered to ice cyan) */}
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 will-change-transform scale-[1.03] transition-[filter] duration-700 ease-out"
          style={{
            filter: isHoveringPortalButton
              ? 'hue-rotate(145deg) saturate(0.85) brightness(1.25) contrast(1.1) drop-shadow(0 0 25px rgba(143,232,255,0.35))'
              : 'hue-rotate(145deg) saturate(0.85) brightness(1.02) contrast(1.0)',
          }}
        >
          <img
            src={isMobileScreen ? '/images/mobile/portal-hall-mobile.jpg' : '/images/portal-hall.jpg'}
            alt="Gotham Collage Portal Hall"
            className="w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Concentric Portal Light Rings (Centered at 69.2% X, 45.2% Y on desktop, centered at 50% X, 32% Y on mobile top 60%) */}
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 mobile-portal-rings"
            style={{ left: isMobileScreen ? '50%' : '69.2%', top: isMobileScreen ? '32%' : '45.2%' }}
          >
            {/* Outer Ring */}
            <div
              ref={outerRingRef}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] rounded-full border border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(255,255,255,0.25)] transition-opacity duration-500 mobile-portal-outer-ring ${
                isHoveringPortalButton ? 'opacity-40' : 'opacity-15'
              }`}
            />

            {/* Middle Ring (Ice Cyan) */}
            <div
              ref={midRingRef}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border border-[#8FE8FF]/50 shadow-[0_0_40px_rgba(143,232,255,0.5),inset_0_0_30px_rgba(143,232,255,0.3)] transition-opacity duration-500 mobile-portal-mid-ring ${
                isHoveringPortalButton ? 'opacity-60' : 'opacity-20'
              }`}
            />

            {/* Inner Core Ring */}
            <div
              ref={innerRingRef}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-2 border-white shadow-[0_0_50px_rgba(255,255,255,0.9),inset_0_0_25px_rgba(255,255,255,0.7)] transition-opacity duration-500 mobile-portal-inner-ring ${
                isHoveringPortalButton ? 'opacity-85' : 'opacity-35'
              }`}
            />

            {/* Core Center Glow Bloom */}
            <div
              ref={centerGlowRef}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 rounded-full blur-2xl transition-all duration-700 mobile-portal-center-glow ${
                isHoveringPortalButton ? 'opacity-90 scale-130' : 'opacity-25 scale-100'
              }`}
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(143,232,255,0.45) 45%, transparent 75%)',
              }}
            />
          </div>

          {/* Left-side darkness gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 via-45% to-transparent pointer-events-none" />

          {/* Top subtle vignette */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/90 via-[#0b0b0b]/40 to-transparent pointer-events-none" />

          {/* Bottom edge fade */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
        </div>

        {/* Ambient Fog Layer */}
        <div
          ref={fogRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 z-10 opacity-30 will-change-transform"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top Navigation Bar */}
        <header
          ref={headerRef}
          className="relative z-30 w-full px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between"
        >
          {/* Left: Logo + GOTHAM COLLAGE */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 border border-white/20 p-0.5 flex items-center justify-center group-hover:border-[#8FE8FF]/50 transition-colors">
              <img
                src="/images/gc-logo-transparent.png"
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
                onClick={(e) => {
                  if (item.label === 'The Elevator') {
                    e.preventDefault();
                    triggerFlyThrough();
                  }
                }}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={`transition-colors duration-200 hover:text-white ${
                  item.label === 'Join Now' ? 'text-zinc-300 font-semibold hover:text-[#8FE8FF]' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right: Sign In (Member & Admin) + Ice Cyan-outlined "Enter Portal" button (Rule 3: 1px border, text, 10% tint, soft glow) */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {/* Sign In Dropdown */}
            <div className="relative group">
              <button
                onClick={openMemberLogin}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-white border border-white/15 hover:border-white/35 bg-black/50 hover:bg-black/80 transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <span>Sign In</span>
                <span className="text-[9px] text-[#71717a] group-hover:text-white transition-colors">▾</span>
              </button>
              <div className="absolute right-0 mt-2 w-44 py-1.5 bg-[#121215]/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <button
                  onClick={openMemberLogin}
                  className="w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#e8e8e6] hover:bg-white/10 hover:text-[#8FE8FF] transition-colors cursor-pointer"
                >
                  Member Portal
                </button>
                <button
                  onClick={openAdminLogin}
                  className="w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Admin Console
                </button>
              </div>
            </div>

            <button
              onClick={triggerFlyThrough}
              onMouseEnter={() => setIsHoveringPortalButton(true)}
              onMouseLeave={() => setIsHoveringPortalButton(false)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white shadow-[0_0_15px_rgba(143,232,255,0.45)] hover:shadow-[0_0_25px_rgba(143,232,255,0.7)] active:scale-95 cursor-pointer"
            >
              Enter Portal
            </button>
          </div>

          {/* Mobile Right: Menu Button (Strictly for mobile <= 767px via md:hidden) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-full border border-white/20 bg-black/60 text-[#e8e8e6] text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 active:scale-95 cursor-pointer shadow-lg touch-manipulation"
            >
              <span>Menu</span>
              <span className="text-sm">☰</span>
            </button>
          </div>
        </header>

        {/* Full-screen Mobile Overlay Menu (Strictly md:hidden) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-[#0b0b0b]/98 backdrop-blur-xl flex flex-col justify-between p-6 animate-fade-in md:hidden select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 border border-white/20 p-0.5 flex items-center justify-center">
                  <img
                    src="/images/mobile/gc-logo-transparent-mobile.png"
                    alt="GC"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-display text-sm font-extrabold uppercase tracking-[0.22em] text-[#e8e8e6]">
                  GOTHAM COLLAGE
                </span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
                className="min-w-[44px] min-h-[44px] rounded-full border border-white/20 bg-white/5 text-[#e8e8e6] text-lg flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
              >
                ✕
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col space-y-6 my-auto text-center py-6">
              {config.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (item.label === 'The Elevator') {
                      e.preventDefault();
                      triggerFlyThrough();
                    }
                  }}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="font-display text-2xl uppercase tracking-widest text-[#e8e8e6] hover:text-[#8FE8FF] transition-colors py-2 active:scale-95"
                >
                  {item.label}
                </a>
              ))}

              {/* Enter Portal Main Action */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerFlyThrough();
                  }}
                  className="w-full max-w-xs mx-auto min-h-[48px] py-3.5 px-6 rounded-full border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(143,232,255,0.4)] active:scale-95 cursor-pointer touch-manipulation"
                >
                  Enter Portal →
                </button>
              </div>
            </div>

            {/* Footer Login Options */}
            <div className="border-t border-white/10 pt-4 flex flex-col space-y-3 text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                Authentication
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openMemberLogin();
                  }}
                  className="min-h-[48px] py-3 px-4 rounded-xl border border-white/20 bg-[#161619] text-xs font-mono uppercase tracking-wider text-[#e8e8e6] active:scale-95 cursor-pointer touch-manipulation"
                >
                  Member Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAdminLogin();
                  }}
                  className="min-h-[48px] py-3 px-4 rounded-xl border border-white/20 bg-[#161619] text-xs font-mono uppercase tracking-wider text-zinc-400 active:scale-95 cursor-pointer touch-manipulation"
                >
                  Admin Console
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Content: Centred horizontally in the lower-centre of the screen over the walkway path */}
        <div
          ref={contentRef}
          className="absolute bottom-8 sm:bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20 flex flex-col items-center text-center will-change-transform pointer-events-auto mobile-hero-content"
        >
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            
            {/* Headline */}
            <h1 className="flex flex-col items-center justify-center leading-none tracking-tight">
              {/* Line 1: Don't wait. */}
              <span
                ref={line1Ref}
                className="font-display font-[200] text-[#bdbdb8] text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.04em] block mobile-hero-line-1"
              >
                Don't wait.
              </span>

              {/* Line 2: BUILD. */}
              <span
                ref={line2Ref}
                className="font-display font-[700] text-[#e8e8e6] text-4xl sm:text-6xl md:text-7xl lg:text-8xl mt-1 sm:mt-2 block mobile-hero-line-2"
                style={{
                  textShadow: '0 0 25px rgba(245,184,0,0.45)',
                }}
              >
                BUILD.
              </span>
            </h1>

            {/* Tiny Label: Inter 500, uppercase, 11-12px, letter spacing 0.35em, grey, below headline */}
            <div
              ref={labelRef}
              className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8a8a88] pt-1 mobile-hero-label"
            >
              GOTHAM COLLAGE · STUDENT-LED VENTURE STUDIO
            </div>

            {/* Button: Enter → (Gold outline style and glow, smaller) */}
            <div ref={buttonRef} className="pt-2 sm:pt-3">
              <button
                onClick={triggerFlyThrough}
                onMouseEnter={() => setIsHoveringPortalButton(true)}
                onMouseLeave={() => setIsHoveringPortalButton(false)}
                className="group inline-flex items-center space-x-2 px-5 py-2 rounded-full border border-[#F5B800] bg-[#F5B800]/10 text-[#F5B800] font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(245,184,0,0.4)] hover:shadow-[0_0_25px_rgba(245,184,0,0.7)] hover:bg-[#F5B800]/20 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer mobile-hero-enter-btn"
              >
                <span className="font-semibold">Enter</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ==============================================================
          LAYER 3: BRIGHT WARM-WHITE / CYAN FLASH OVERLAY (z-30)
          Builds to 1.0 at 2.2s, then fades to 0.0 over 0.8s as lift emerges.
      ============================================================== */}
      <div
        ref={warmFlashRef}
        className="fixed inset-0 z-30 pointer-events-none opacity-0 will-change-transform"
        style={{
          background:
            'radial-gradient(circle at 69.2% 45.2%, #ffffff 0%, #f4fcff 40%, #e2f7ff 75%, rgba(143, 232, 255, 0.45) 100%)',
        }}
      />
    </div>
  );
}
