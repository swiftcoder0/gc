import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { config } from '../config';

/**
 * Web Audio Synthesizer for luxury elevator acoustics
 * OFF by default, only enabled when user clicks the Sound Toggle.
 */
class ElevatorAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  enable() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  playDoorSlide() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(170, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.8);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.8);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.82);
    } catch (e) {}
  }

  playHum(durationSec = 2.2) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.35);
      gain.gain.setValueAtTime(0.045, now + durationSec - 0.35);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    } catch (e) {}
  }

  playDing() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [739.99, 1108.73]; // F#5 & C#6 chime
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.05 + 1.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.45);
      });
    } catch (e) {}
  }
}

/**
 * ElevatorLobby — ONE Continuous Scene Lift
 * Strictly governed by SPEC (v2) and the Single Continuous Scene rules:
 * - The lift car remains visible and in the SAME place for the entire sequence.
 * - Never swaps to a different scene, image, or page layout.
 *
 * LAYERS (z-order):
 * 1) SHAFT WALLS: Left and right vertical dark wall strips with thin horizontal gold floor lines
 *    every 120px and SVG floor numbers (01-04) that scroll vertically during transit.
 * 2) LIFT CAR: Centred, ~40% viewport width, 70% height, thick dark metal frame,
 *    two sliding chrome doors, centered real logo (screen blend mode), thin vertical gold light strips.
 * 3) FLOOR DISPLAY: Small gold digital LED display above doors showing current floor.
 * 4) BUTTON PANEL: Slim panel on right of car frame with buttons 04, 03, 02, 01 only.
 * 5) TOP BAR: Logo and Join Now. No headline, no cards, no chips.
 *
 * STATE MACHINE (GSAP timeline per click, reversible):
 * IDLE -> CLOSING (0.8s) -> MOVING (~2.2s) -> ARRIVING (0.3s) -> OPENING (1s) -> REVEAL (1.5s) -> CONTENT -> RETURN -> IDLE.
 */
export default function ElevatorLobby({ onBackToPortal }) {
  const audio = useMemo(() => new ElevatorAudioEngine(), []);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const h = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    }
  }, []);

  // Floor state: '01' | '02' | '03' | '04'
  const [currentFloor, setCurrentFloor] = useState('01');
  const [targetFloor, setTargetFloor] = useState('01');
  const [displayFloor, setDisplayFloor] = useState('01');
  const [highlightedFloor, setHighlightedFloor] = useState('01');

  // State Machine tracker
  const [stateName, setStateName] = useState('IDLE'); // 'IDLE' | 'CLOSING' | 'MOVING' | 'ARRIVING' | 'OPENING' | 'REVEAL' | 'CONTENT' | 'RETURN'
  const [isBusy, setIsBusy] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [activeFloorContent, setActiveFloorContent] = useState('01');
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState('BUILD');

  // DOM Refs for GSAP
  const sceneRootRef = useRef(null);
  const shaftLeftTrackRef = useRef(null);
  const shaftRightTrackRef = useRef(null);
  const carWrapperRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const leftGoldStripRef = useRef(null);
  const rightGoldStripRef = useRef(null);
  const dingFlashRef = useRef(null);
  const doorwayGlowRef = useRef(null);
  const contentPortalRef = useRef(null);
  const specksContainerRef = useRef(null);

  // Shaft scroll current position
  const shaftYRef = useRef(0);

  // Toggle Sound safely
  const toggleSound = () => {
    if (!soundEnabled) {
      audio.enable();
      setSoundEnabled(true);
      setTimeout(() => audio.playDing(), 150);
    } else {
      audio.disable();
      setSoundEnabled(false);
    }
  };

  // Generate 4-floor buttons: 04, 03, 02, 01 only
  const floorButtons = ['04', '03', '02', '01'];

  // Dust specks for moving state
  const dustSpecks = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(15 + (i * 5.8) + (i % 3) * 4).toFixed(1)}%`,
      top: `${(10 + (i * 6.5)).toFixed(1)}%`,
      size: `${(i % 3) * 1.2 + 1.5}px`,
      opacity: 0.2 + (i % 4) * 0.12,
    }));
  }, []);

  // --- CORE GSAP TIMELINE ENGINE ---
  const launchFloorTransition = (destFloor) => {
    if (isBusy) return;
    if (destFloor === currentFloor && stateName === 'CONTENT') return;

    setIsBusy(true);
    setTargetFloor(destFloor);
    setHighlightedFloor(destFloor);

    const fromNum = parseInt(currentFloor, 10);
    const toNum = parseInt(destFloor, 10);
    const isGoingUp = toNum > fromNum;
    const floorDistance = Math.abs(toNum - fromNum) || 1;

    // Step sequence for digital counter
    const counterSequence = [];
    if (toNum >= fromNum) {
      for (let i = fromNum; i <= toNum; i++) counterSequence.push(`0${i}`);
    } else {
      for (let i = fromNum; i >= toNum; i--) counterSequence.push(`0${i}`);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentFloor(destFloor);
        setActiveFloorContent(destFloor);
        setStateName('CONTENT');
        setIsBusy(false);
      },
    });

    // If currently in CONTENT, do RETURN first (shrink content back into doorway, brighten lift, close doors)
    if (stateName === 'CONTENT') {
      tl.call(() => setStateName('RETURN'))
        .to(contentPortalRef.current, {
          scale: 0.2,
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.8,
          ease: 'power3.in',
        })
        .to([carWrapperRef.current, shaftLeftTrackRef.current?.parentElement, shaftRightTrackRef.current?.parentElement], {
          opacity: 1.0,
          filter: 'brightness(1.0)',
          duration: 0.8,
          ease: 'power2.out',
        }, '<')
        .to([leftDoorRef.current, rightDoorRef.current], {
          x: '0%',
          duration: 0.7,
          ease: 'power2.inOut',
          onStart: () => audio.playDoorSlide(),
        });
    }

    // 1. CLOSING (0.8s) — If doors are open, slide shut; logo meets in middle
    tl.call(() => {
      setStateName('CLOSING');
      setDoorsOpen(false);
    });

    tl.to([leftDoorRef.current, rightDoorRef.current], {
      x: '0%',
      duration: 0.8,
      ease: 'power2.inOut',
      onStart: () => audio.playDoorSlide(),
    });

    // 2. MOVING (~2.2s) — Car stays centered, shaft walls scroll vertically
    tl.call(() => {
      setStateName('MOVING');
      audio.playHum(2.2);
    });

    // Moving duration
    const moveDuration = reducedMotion ? 0.8 : 2.2;
    const travelDistancePx = floorDistance * 480;
    const deltaY = isGoingUp ? travelDistancePx : -travelDistancePx;
    const newShaftY = shaftYRef.current + deltaY;
    shaftYRef.current = newShaftY;

    if (!reducedMotion) {
      // Shaft scroll: ease in over 0.5s, constant, ease out over 0.5s (power2.inOut)
      tl.to([shaftLeftTrackRef.current, shaftRightTrackRef.current], {
        y: newShaftY,
        duration: moveDuration,
        ease: 'power2.inOut',
      }, '+=0.05');

      // Car vibration by 1.5px
      tl.to(carWrapperRef.current, {
        y: '+=1.5',
        x: '+=0.8',
        repeat: 16,
        yoyo: true,
        duration: 0.07,
        ease: 'sine.inOut',
      }, '<');

      // Gold strips flickering
      tl.to([leftGoldStripRef.current, rightGoldStripRef.current], {
        opacity: 0.35,
        repeat: 14,
        yoyo: true,
        duration: 0.08,
        ease: 'power1.inOut',
      }, '<');

      // Faint dust specks drift past
      if (specksContainerRef.current) {
        tl.fromTo(specksContainerRef.current, {
          y: isGoingUp ? -60 : 60,
          opacity: 0,
        }, {
          y: isGoingUp ? 120 : -120,
          opacity: 0.8,
          duration: moveDuration,
          ease: 'power1.inOut',
        }, '<');
      }
    } else {
      // Reduced motion: smooth fade sequence
      tl.to([shaftLeftTrackRef.current, shaftRightTrackRef.current], {
        opacity: 0.4,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
      }, '+=0.05');
    }

    // Intermediate floor counter updates during the move
    const stepDuration = moveDuration / (counterSequence.length || 1);
    counterSequence.forEach((val, idx) => {
      tl.call(() => {
        setDisplayFloor(val);
      }, null, `<+=${(idx * stepDuration).toFixed(2)}`);
    });

    // 3. ARRIVING (0.3s) — Walls stop, gold "ding" flash
    tl.call(() => {
      setStateName('ARRIVING');
      setDisplayFloor(destFloor);
      audio.playDing();
      if (carWrapperRef.current) {
        gsap.set(carWrapperRef.current, { x: 0, y: 0 });
      }
      if (leftGoldStripRef.current && rightGoldStripRef.current) {
        gsap.set([leftGoldStripRef.current, rightGoldStripRef.current], { opacity: 1.0 });
      }
    });

    // Ding Flash
    tl.fromTo(dingFlashRef.current, {
      opacity: 0,
    }, {
      opacity: 0.7,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });

    // 4. OPENING (1.0s) — Doors slide apart, warm light spills out
    tl.call(() => {
      setStateName('OPENING');
      setDoorsOpen(true);
      setActiveFloorContent(destFloor);
    });

    tl.to(leftDoorRef.current, {
      x: '-100%',
      duration: 1.0,
      ease: 'power2.inOut',
      onStart: () => audio.playDoorSlide(),
    })
    .to(rightDoorRef.current, {
      x: '100%',
      duration: 1.0,
      ease: 'power2.inOut',
    }, '<')
    .to(doorwayGlowRef.current, {
      opacity: 0.85,
      duration: 0.8,
      ease: 'power2.out',
    }, '<');

    // 5. REVEAL (1.5s) — Floor content renders inside doorway & scales up to fill the screen
    tl.call(() => {
      setStateName('REVEAL');
    });

    tl.fromTo(contentPortalRef.current, {
      scale: 0.22,
      opacity: 0,
      pointerEvents: 'none',
    }, {
      scale: 1.0,
      opacity: 1.0,
      pointerEvents: 'auto',
      duration: 1.5,
      ease: 'power3.out',
      transformOrigin: 'center center',
    })
    // Lift car and shaft dim to 15% and stay faintly visible behind
    .to([carWrapperRef.current, shaftLeftTrackRef.current?.parentElement, shaftRightTrackRef.current?.parentElement], {
      opacity: 0.15,
      filter: 'brightness(0.28)',
      duration: 1.5,
      ease: 'power2.out',
    }, '<');
  };

  // Return to Lift button clicked from content screen
  const handleReturnToLift = () => {
    if (isBusy) return;
    setIsBusy(true);
    setStateName('RETURN');

    const tl = gsap.timeline({
      onComplete: () => {
        setStateName('IDLE');
        setDoorsOpen(false);
        setIsBusy(false);
      },
    });

    // REVEAL in reverse: content shrinks back into doorway
    tl.to(contentPortalRef.current, {
      scale: 0.22,
      opacity: 0,
      pointerEvents: 'none',
      duration: 1.0,
      ease: 'power3.in',
    })
    // Lift car and shaft brighten back to 100%
    .to([carWrapperRef.current, shaftLeftTrackRef.current?.parentElement, shaftRightTrackRef.current?.parentElement], {
      opacity: 1.0,
      filter: 'brightness(1.0)',
      duration: 1.0,
      ease: 'power2.out',
    }, '<')
    // Doors slide shut, logo meets in the middle (0.8s)
    .to([leftDoorRef.current, rightDoorRef.current], {
      x: '0%',
      duration: 0.8,
      ease: 'power2.inOut',
      onStart: () => audio.playDoorSlide(),
    })
    .to(doorwayGlowRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '<');
  };

  // Keyboard Navigation: ArrowUp, ArrowDown, Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isBusy) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const curIdx = floorButtons.indexOf(highlightedFloor);
        if (curIdx > 0) {
          setHighlightedFloor(floorButtons[curIdx - 1]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const curIdx = floorButtons.indexOf(highlightedFloor);
        if (curIdx < floorButtons.length - 1) {
          setHighlightedFloor(floorButtons[curIdx + 1]);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedFloor) {
          launchFloorTransition(highlightedFloor);
        }
      } else if (e.key === 'Escape' && stateName === 'CONTENT') {
        handleReturnToLift();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, highlightedFloor, stateName, currentFloor]);

  return (
    <div
      ref={sceneRootRef}
      className="relative w-full h-[100dvh] min-h-[640px] bg-[#070709] text-[#e8e8e6] overflow-hidden select-none font-sans"
    >

      {/* ==============================================================
          LAYER 5: TOP BAR (Logo + Join Now only, nothing else)
      ============================================================== */}
      <header className="absolute top-0 inset-x-0 z-50 h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/5 bg-[#070709]/75 backdrop-blur-md">
        {/* Left: Real Logo + GOTHAM COLLAGE */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md overflow-hidden bg-black/80 border border-white/15 p-0.5 flex items-center justify-center shadow-md">
            <img src="/images/gc-logo.png" alt="GC" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#e8e8e6]">
            GOTHAM COLLAGE
          </span>
        </div>

        {/* Right: Sound Toggle + Join Now */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSound}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
              soundEnabled
                ? 'border-[#F5B800] text-[#F5B800] bg-[#F5B800]/15 shadow-[0_0_10px_rgba(245,184,0,0.3)]'
                : 'border-white/15 text-[#8a8a88] bg-black/50 hover:text-white'
            }`}
          >
            {soundEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}
          </button>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              disabled={isBusy}
              className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-white transition-colors cursor-pointer mr-2"
            >
              ← Portal
            </button>
          )}

          <a
            href={config.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border border-[#F5B800] text-[#F5B800] hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_12px_rgba(245,184,0,0.3)] cursor-pointer"
          >
            Join Now
          </a>
        </div>
      </header>


      {/* ==============================================================
          LAYER 1: SHAFT WALLS (Left and Right of the Lift Car)
          Filled with thin horizontal gold floor lines every 120px and
          SVG floor numbers (01-04) that scroll vertically.
      ============================================================== */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden transition-[opacity,filter] duration-700">
        
        {/* Left Shaft Wall Strip */}
        <div
          className="absolute left-0 top-0 bottom-0 overflow-hidden border-r border-[#1a1a24] bg-[#08080b]"
          style={{ width: 'calc((100vw - min(40vw, 540px)) / 2)' }}
        >
          {/* Scrolling Vertical Track */}
          <div
            ref={shaftLeftTrackRef}
            className="absolute inset-x-0 w-full will-change-transform"
            style={{ top: '-1800px', height: '6000px' }}
          >
            {/* Repeating Pattern of 120px Gold Girder Lines & SVG Floor Numbers */}
            {Array.from({ length: 48 }).map((_, idx) => {
              const floorIdx = (idx % 4) + 1;
              const isMajorFloor = idx % 4 === 0;

              return (
                <div
                  key={`left-shaft-${idx}`}
                  className="w-full h-[120px] relative border-b border-[#F5B800]/25 flex items-end px-4 sm:px-8 pb-2"
                >
                  {/* Vertical Guide Cable */}
                  <div className="absolute top-0 bottom-0 right-10 w-[1px] bg-white/5" />
                  <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-white/5" />

                  {/* SVG Floor Label every 4th line (480px) */}
                  {isMajorFloor && (
                    <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#F5B800]/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]/70" />
                      <span>SHAFT LVL 0{floorIdx}</span>
                    </div>
                  )}
                  {!isMajorFloor && (
                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                      SECT {(idx * 120).toString().padStart(4, '0')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Shaft Wall Strip */}
        <div
          className="absolute right-0 top-0 bottom-0 overflow-hidden border-l border-[#1a1a24] bg-[#08080b]"
          style={{ width: 'calc((100vw - min(40vw, 540px)) / 2)' }}
        >
          {/* Scrolling Vertical Track */}
          <div
            ref={shaftRightTrackRef}
            className="absolute inset-x-0 w-full will-change-transform"
            style={{ top: '-1800px', height: '6000px' }}
          >
            {/* Repeating Pattern of 120px Gold Girder Lines & SVG Floor Numbers */}
            {Array.from({ length: 48 }).map((_, idx) => {
              const floorIdx = (idx % 4) + 1;
              const isMajorFloor = idx % 4 === 0;

              return (
                <div
                  key={`right-shaft-${idx}`}
                  className="w-full h-[120px] relative border-b border-[#F5B800]/25 flex items-end justify-end px-4 sm:px-8 pb-2"
                >
                  {/* Vertical Guide Cable */}
                  <div className="absolute top-0 bottom-0 left-10 w-[1px] bg-white/5" />
                  <div className="absolute top-0 bottom-0 right-12 w-[1px] bg-white/5" />

                  {/* SVG Floor Label every 4th line (480px) */}
                  {isMajorFloor && (
                    <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#F5B800]/60">
                      <span>SHAFT LVL 0{floorIdx}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]/70" />
                    </div>
                  )}
                  {!isMajorFloor && (
                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                      SECT {(idx * 120).toString().padStart(4, '0')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>


      {/* ==============================================================
          LAYER 2, 3, 4: LIFT CAR (Centred, 40% Width, 70% Height)
          Thick metal frame, sliding chrome doors, centered real logo,
          thin gold light strips, floor display, built-in button panel.
      ============================================================== */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        
        {/* Car Outer Centered Fixture */}
        <div
          ref={carWrapperRef}
          className="relative w-[340px] sm:w-[400px] md:w-[460px] lg:w-[40vw] max-w-[540px] h-[70vh] min-h-[480px] max-h-[660px] flex items-center justify-center will-change-transform transition-[opacity,filter] duration-700 pointer-events-auto"
        >
          {/* Thick Dark Metal Frame */}
          <div className="relative w-full h-full rounded-xl border-[14px] sm:border-[18px] md:border-[20px] border-[#151518] bg-[#0a0a0c] shadow-[0_30px_90px_rgba(0,0,0,0.98),inset_0_4px_16px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">

            {/* ==========================================================
                LAYER 3: FLOOR DISPLAY (above doors in transom)
            ========================================================== */}
            <div className="relative w-full h-12 bg-[#0e0e11] border-b border-[#202025] flex items-center justify-between px-5 z-30">
              <div className="flex items-center space-x-1 font-mono text-[11px]">
                <span className={`text-[#F5B800] font-bold ${stateName === 'MOVING' ? 'animate-pulse' : ''}`}>▲</span>
                <span className="text-zinc-600 font-bold">▼</span>
              </div>

              {/* Digital LED Readout in Gold */}
              <div className="px-3 py-0.5 rounded border border-[#F5B800]/40 bg-black/90 font-mono text-sm tracking-[0.25em] font-extrabold text-[#F5B800] shadow-[0_0_12px_rgba(245,184,0,0.35)]">
                LEVEL {displayFloor}
              </div>

              <div className="text-[9px] font-mono tracking-widest text-[#71717a] uppercase">
                GC VENTURE CAR
              </div>
            </div>

            {/* Doorway Opening */}
            <div className="relative flex-1 w-full overflow-hidden bg-black flex">
              
              {/* Warm Amber Light Spill from doorway when opened */}
              <div
                ref={doorwayGlowRef}
                className="absolute inset-0 pointer-events-none opacity-0 z-5 transition-opacity"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(245, 184, 0, 0.45) 0%, rgba(245, 184, 0, 0.12) 50%, transparent 85%)',
                }}
              />

              {/* Thin Vertical Gold Light Strip (Left) */}
              <div
                ref={leftGoldStripRef}
                className="absolute left-1.5 top-2 bottom-2 w-[2px] rounded-full z-25 pointer-events-none animate-pulse"
                style={{
                  backgroundColor: config.colors.gold,
                  boxShadow: `0 0 14px ${config.colors.gold}, 0 0 28px rgba(245, 184, 0, 0.6)`,
                  animationDuration: '3.0s',
                }}
              />

              {/* Thin Vertical Gold Light Strip (Right) */}
              <div
                ref={rightGoldStripRef}
                className="absolute right-1.5 top-2 bottom-2 w-[2px] rounded-full z-25 pointer-events-none animate-pulse"
                style={{
                  backgroundColor: config.colors.gold,
                  boxShadow: `0 0 14px ${config.colors.gold}, 0 0 28px rgba(245, 184, 0, 0.6)`,
                  animationDuration: '3.0s',
                }}
              />

              {/* Left Sliding Door Panel */}
              <div
                ref={leftDoorRef}
                className="relative w-1/2 h-full overflow-hidden border-r border-[#151518] z-15 will-change-transform bg-black"
                style={{ transform: 'translateX(0%)' }}
              >
                <img
                  src="/images/door-chrome.jpg"
                  alt="Elevator Door Left"
                  className="w-full h-full object-cover object-left filter brightness-95 contrast-125 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/35 pointer-events-none" />

                {/* Real Logo Left Half (transparent PNG / mix-blend-mode: screen, NO black box) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 pointer-events-none z-20 flex items-center justify-center">
                  <img
                    src="/images/gc-logo.png"
                    alt="GC Logo Left"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(245,184,0,0.65)]"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
              </div>

              {/* Right Sliding Door Panel */}
              <div
                ref={rightDoorRef}
                className="relative w-1/2 h-full overflow-hidden border-l border-[#151518] z-15 will-change-transform bg-black"
                style={{ transform: 'translateX(0%)' }}
              >
                <img
                  src="/images/door-chrome.jpg"
                  alt="Elevator Door Right"
                  className="w-full h-full object-cover object-right filter brightness-95 contrast-125 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/35 pointer-events-none" />

                {/* Real Logo Right Half (transparent PNG / mix-blend-mode: screen, NO black box) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 pointer-events-none z-20 flex items-center justify-center">
                  <img
                    src="/images/gc-logo.png"
                    alt="GC Logo Right"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(245,184,0,0.65)]"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
              </div>

              {/* Faint dust specks drifting during moving */}
              <div ref={specksContainerRef} className="absolute inset-0 pointer-events-none z-18 opacity-0">
                {dustSpecks.map((s) => (
                  <div
                    key={s.id}
                    className="absolute rounded-full bg-[#F5B800] shadow-[0_0_6px_#F5B800]"
                    style={{
                      left: s.left,
                      top: s.top,
                      width: s.size,
                      height: s.size,
                      opacity: s.opacity,
                    }}
                  />
                ))}
              </div>

              {/* Center Seam */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black shadow-[0_0_6px_black] z-25 pointer-events-none" />
            </div>

          </div>

          {/* ==========================================================
              LAYER 4: BUTTON PANEL (built into right of car frame)
              Only four buttons: 04, 03, 02, 01 from top to bottom.
          ========================================================== */}
          <div className="absolute -right-12 sm:-right-14 top-1/2 -translate-y-1/2 w-11 sm:w-13 py-4 rounded-r-xl border-y border-r border-white/10 bg-[#111114] shadow-2xl flex flex-col items-center space-y-3 z-35">
            <div className="text-[7px] font-mono uppercase tracking-widest text-[#71717a]">
              PANEL
            </div>

            {/* Buttons 04, 03, 02, 01 */}
            <div className="flex flex-col space-y-2 w-full px-1.5">
              {floorButtons.map((btnId) => {
                const isSelected = targetFloor === btnId;
                const isKeyFocused = highlightedFloor === btnId;

                return (
                  <button
                    key={btnId}
                    onClick={() => launchFloorTransition(btnId)}
                    disabled={isBusy}
                    title={`Floor ${btnId}`}
                    className={`w-full py-2 rounded-md font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#F5B800] text-black shadow-[0_0_18px_rgba(245,184,0,0.7)] scale-105'
                        : isKeyFocused
                        ? 'border border-[#F5B800] text-[#F5B800] bg-[#18181c] shadow-[0_0_12px_rgba(245,184,0,0.35)]'
                        : 'border border-white/10 bg-[#161619] text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:shadow-[0_0_12px_rgba(245,184,0,0.4)]'
                    }`}
                  >
                    {btnId}
                  </button>
                );
              })}
            </div>

            {/* Keycard Sensor Bar */}
            <div className="w-5 h-1 rounded-full bg-[#F5B800]/50 shadow-[0_0_6px_#F5B800]" />
          </div>

        </div>

      </div>


      {/* ==============================================================
          LAYER 6: REVEAL & FLOOR CONTENT
          Renders inside the doorway opening and scales up toward viewer
          to fill the screen. Lift car and shaft remain visible behind.
      ============================================================== */}
      <div
        ref={contentPortalRef}
        className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden opacity-0"
        style={{ transform: 'scale(0.22)', transformOrigin: 'center center' }}
      >
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 lg:p-20 overflow-y-auto">

          {/* Top Bar inside Content Screen: Back to Lift Button */}
          <div className="relative z-20 flex items-center justify-between w-full pt-14">
            <button
              onClick={handleReturnToLift}
              disabled={isBusy}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-white/20 bg-black/80 hover:border-[#F5B800] hover:text-[#F5B800] text-xs font-mono uppercase tracking-widest text-[#e8e8e6] transition-all shadow-xl cursor-pointer active:scale-95"
            >
              <span>← Back to lift</span>
            </button>

            {/* Current Level Pill */}
            <div className="px-3.5 py-1 rounded-full border border-[#F5B800]/40 bg-black/80 text-[11px] font-mono uppercase tracking-[0.25em] text-[#F5B800]">
              FLOOR {activeFloorContent}
            </div>
          </div>

          {/* Main Floor Copy Area (Strictly from SPEC.md) */}
          <div className="relative z-20 my-auto max-w-3xl flex flex-col space-y-6 text-left">
            
            {/* FLOOR 01: ABOUT GOTHAM */}
            {activeFloorContent === '01' && (
              <div className="flex flex-col space-y-6 animate-fade-in">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
                    ABOUT GOTHAM
                  </span>
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/80 border border-white/20 p-2 shadow-[0_0_25px_rgba(245,184,0,0.3)]">
                  <img src="/images/gc-logo.png" alt="Gotham Collage Seal" className="w-full h-full object-contain" />
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
                  STUDENT-LED VENTURE STUDIO
                </h1>

                <p className="font-sans text-base sm:text-lg lg:text-xl text-[#e8e8e6] leading-relaxed max-w-2xl font-light">
                  Gotham Collage is a student-led venture studio where ambitious students come together to build real-world projects. We believe in learning by building and creating things that solve real problems.
                </p>
              </div>
            )}

            {/* FLOOR 02: THE METHOD */}
            {activeFloorContent === '02' && (
              <div className="flex flex-col space-y-6 animate-fade-in">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
                    THE METHOD
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                  BUILD • IDENTIFY • CREATE
                </h1>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {[
                    {
                      key: 'BUILD',
                      title: 'BUILD',
                      text: 'We collaborate as students and build projects from scratch.',
                    },
                    {
                      key: 'IDENTIFY',
                      title: 'IDENTIFY',
                      text: 'After launching and validating projects, we identify people with the potential to become founders.',
                    },
                    {
                      key: 'CREATE',
                      title: 'CREATE',
                      text: 'We work with selected founders to turn successful projects into independent startups through equity partnerships.',
                    },
                  ].map((p) => {
                    const isLit = selectedPillar === p.key;
                    return (
                      <div
                        key={p.key}
                        onMouseEnter={() => setSelectedPillar(p.key)}
                        onClick={() => setSelectedPillar(p.key)}
                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          isLit
                            ? 'border-[#F5B800] bg-[#121215]/90 shadow-[0_0_25px_rgba(245,184,0,0.35)]'
                            : 'border-white/10 bg-black/60 hover:border-white/30'
                        }`}
                      >
                        <div className={`font-display text-sm tracking-wider font-extrabold mb-2 ${isLit ? 'text-[#F5B800]' : 'text-white'}`}>
                          {p.title}
                        </div>
                        <p className="text-xs sm:text-sm font-sans text-[#a1a1aa] leading-relaxed">
                          {p.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-sm sm:text-base font-mono text-[#F5B800]">
                  We don't just teach entrepreneurship. We build real things.
                </div>
              </div>
            )}

            {/* FLOOR 03: PROJECT ARCHIVE */}
            {activeFloorContent === '03' && (
              <div className="flex flex-col space-y-6 animate-fade-in">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
                    PROJECT ARCHIVE
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white">
                  PROJECT 001
                </h1>

                {/* Pill */}
                <div className="inline-flex items-center self-start px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 text-[11px] font-mono tracking-widest text-[#e8e8e6]">
                  STATUS : IN DEVELOPMENT
                </div>

                <p className="font-sans text-base sm:text-lg text-[#a1a1aa] max-w-xl">
                  Our first project is in the works. Stay tuned.
                </p>

                {/* Link: Learn More → */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowLearnMoreModal(true)}
                    className="inline-flex items-center space-x-2 text-sm font-mono uppercase tracking-wider text-[#F5B800] hover:text-white transition-colors cursor-pointer group"
                  >
                    <span>Learn More</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>

                {/* Learn More Modal */}
                {showLearnMoreModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 rounded-2xl border border-white/20 bg-[#101014] shadow-2xl flex flex-col space-y-4">
                      <div className="text-xs font-mono uppercase tracking-widest text-[#F5B800]">
                        PROJECT ARCHIVE NOTICE
                      </div>
                      <p className="text-sm font-sans text-[#e8e8e6] leading-relaxed">
                        Status: in development. Details will be shared when we launch.
                      </p>
                      <button
                        onClick={() => setShowLearnMoreModal(false)}
                        className="self-end px-4 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase text-white transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FLOOR 04: OUR VISION */}
            {activeFloorContent === '04' && (
              <div className="flex flex-col space-y-6 animate-fade-in">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
                    OUR VISION
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight max-w-2xl">
                  FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS.
                </h1>

                <p className="font-sans text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed">
                  We want to create an ecosystem where students don't have to wait for opportunities to build something meaningful.
                </p>

                <div className="pt-3">
                  <a
                    href={config.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 px-6 py-3 rounded-full border border-[#F5B800] text-[#F5B800] hover:bg-[#F5B800]/15 hover:text-white transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_18px_rgba(245,184,0,0.35)] cursor-pointer"
                  >
                    <span>Join The Movement</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            )}

          </div>

          <div className="relative z-20 pb-4 text-left text-[10px] font-mono text-[#71717a] uppercase tracking-widest">
            GOTHAM COLLAGE FOUNDRY • ALL SPEC (v2) ARCHIVES VERIFIED
          </div>

        </div>
      </div>


      {/* ==============================================================
          DING FLASH OVERLAY (on arrival)
      ============================================================== */}
      <div
        ref={dingFlashRef}
        className="fixed inset-0 z-60 pointer-events-none opacity-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(245, 184, 0, 0.65) 0%, rgba(245, 184, 0, 0.2) 50%, transparent 100%)',
        }}
      />

    </div>
  );
}
