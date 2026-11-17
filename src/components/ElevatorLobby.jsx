import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { config } from '../config';
import { useAuth } from '../context/AuthContext';

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
 * Strictly governed by SPEC (v2) and Latest Requirements:
 * 1) BACKGROUND: Clean deep-black space (#0b0b0b) with canvas starfield
 *    - ~140 stars (desktop) / 70 stars (phones) in 3 depth layers
 *    - Mostly white with ~10% ice cyan (#8FE8FF)
 *    - IDLE: slow drift & gentle twinkling; dark vignette & faint pale glow behind lift
 *    - MOVING: stars stretch into vertical streaks in direction of travel (ease in 0.5s, hold, ease out 0.5s)
 *    - ARRIVAL: soft ice cyan glow pulse behind lift
 *    - Lightweight: requestAnimationFrame, DPR capped at 2, reduced-motion fallback
 * 2) RETURN GESTURE:
 *    - Double-click / double-tap anywhere on content area (ignoring links/buttons)
 *    - Two-finger tap on touchscreens (touches start together & end within 300ms without moving)
 *    - Pressing Escape
 *    - Subtle hint for first 4 seconds only: "Double-tap to return to the lift"
 *    - "Back to lift" button fallback preserved for accessibility
 * 3) SIZE:
 *    - Lift car 25% larger: ~24-28% viewport width and 78% viewport height, centered
 *    - Button panel & floor display scale proportionally with the car
 */
export default function ElevatorLobby({ onBackToPortal }) {
  const { openMemberLogin, openAdminLogin } = useAuth();
  const audio = useMemo(() => new ElevatorAudioEngine(), []);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const h = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', h);

      const mobileMq = window.matchMedia('(max-width: 767px)');
      const mh = (e) => setIsMobileScreen(e.matches);
      mobileMq.addEventListener('change', mh);

      return () => {
        mq.removeEventListener('change', h);
        mobileMq.removeEventListener('change', mh);
      };
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
  const [showHint, setShowHint] = useState(false);

  // DOM Refs
  const sceneRootRef = useRef(null);
  const canvasRef = useRef(null);
  const arrivalPulseRef = useRef(null);
  const carWrapperRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const leftGoldStripRef = useRef(null);
  const rightGoldStripRef = useRef(null);
  const dingFlashRef = useRef(null);
  const doorwayGlowRef = useRef(null);
  const contentPortalRef = useRef(null);

  // Motion physics ref for Canvas Starfield
  const starMotionRef = useRef({
    velocity: 0,   // 0 (idle) to 1 (full speed)
    streak: 0,     // 0 (circle) to 1 (stretched line)
    direction: 1,  // 1 = stars move down (going up); -1 = stars move up (going down)
  });

  // Touch gesture tracker for Return Gesture
  const touchTrackRef = useRef({
    twoFingerStart: null,
    startX1: 0,
    startY1: 0,
    startX2: 0,
    startY2: 0,
    lastSingleTap: 0,
  });

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

  // Lift floor buttons with labels: 04 Vision, 03 Project 001, 02 Method, 01 Who we are
  const floorConfig = [
    { id: '04', label: 'Vision' },
    { id: '03', label: 'Project 001' },
    { id: '02', label: 'Method' },
    { id: '01', label: 'Who we are' },
  ];
  const floorButtons = ['04', '03', '02', '01'];

  // ==============================================================
  // 1. CANVAS STARFIELD ENGINE (Lightweight, rAF, 3 depth layers)
  // ==============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Star counts: 140 on desktop, 60 on mobile phones (Requirement 3: ~60 stars and lighter effects)
    const isMobile = width <= 767;
    const targetCount = isMobile ? 60 : 140;
    const stars = [];

    // 3 depth layers: 0 = Far, 1 = Mid, 2 = Near
    for (let i = 0; i < targetCount; i++) {
      const layer = i % 3; // 0, 1, 2
      const isCyan = Math.random() < 0.10; // ~10% ice cyan #8FE8FF
      let baseRadius = 0.6;
      let baseAlpha = 0.3;
      let speedFactor = 0.35;

      if (layer === 1) {
        baseRadius = 1.1;
        baseAlpha = 0.55;
        speedFactor = 0.75;
      } else if (layer === 2) {
        baseRadius = 1.7;
        baseAlpha = 0.85;
        speedFactor = 1.35;
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        layer,
        isCyan,
        radius: baseRadius,
        baseAlpha,
        alpha: baseAlpha,
        speedFactor,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
      });
    }

    // Performance monitor
    let lastTime = performance.now();
    let lowFpsCount = 0;

    const render = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      // Adjust star count if frame rate drops
      if (delta > 36) { // below ~28 FPS
        lowFpsCount++;
        if (lowFpsCount > 30 && stars.length > 50) {
          stars.splice(0, 10);
          lowFpsCount = 0;
        }
      } else {
        lowFpsCount = Math.max(0, lowFpsCount - 1);
      }

      ctx.clearRect(0, 0, width, height);

      const { velocity, streak, direction } = starMotionRef.current;
      const isReduced = reducedMotion;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle update
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.25;
        star.alpha = Math.max(0.12, Math.min(1.0, star.baseAlpha + twinkle));

        // Movement update
        if (!isReduced) {
          // Base idle drift + Moving high-speed transit
          const baseDrift = star.speedFactor * 0.12;
          const travelSpeed = velocity * star.speedFactor * 26;
          const vy = (baseDrift + travelSpeed) * direction;

          star.y += vy;
          if (star.y > height + 50) star.y = -40;
          if (star.y < -50) star.y = height + 40;
        }

        const colorStr = star.isCyan
          ? `rgba(143, 232, 255, ${star.alpha})`
          : `rgba(255, 255, 255, ${star.alpha})`;

        // Moving streaks vs Idle points
        if (!isReduced && streak > 0.05) {
          const streakLength = streak * star.speedFactor * 36;
          const tailY = star.y - streakLength * direction;

          ctx.beginPath();
          ctx.strokeStyle = colorStr;
          ctx.lineWidth = Math.max(1, star.radius * (star.layer === 2 ? 1.4 : 1.1));
          ctx.lineCap = 'round';
          ctx.moveTo(star.x, tailY);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);


  // ==============================================================
  // 2. CORE GSAP REVERSIBLE TIMELINE ENGINE
  // ==============================================================
  const launchFloorTransition = (destFloor) => {
    if (isBusy) return;
    if (destFloor === currentFloor && stateName === 'CONTENT') return;

    setIsBusy(true);
    setTargetFloor(destFloor);
    setHighlightedFloor(destFloor);
    setShowHint(false);

    const fromNum = parseInt(currentFloor, 10);
    const toNum = parseInt(destFloor, 10);
    const isGoingUp = toNum > fromNum;

    // Set direction in starfield: 1 = stars move down (going up); -1 = stars move up (going down)
    starMotionRef.current.direction = isGoingUp ? 1 : -1;

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

        // Show "Double-tap to return to the lift" hint for first 4 seconds only
        setShowHint(true);
        setTimeout(() => {
          setShowHint(false);
        }, 4000);
      },
    });

    // If currently in CONTENT, run RETURN first (shrink content, brighten car, close doors)
    if (stateName === 'CONTENT') {
      tl.call(() => setStateName('RETURN'))
        .to(contentPortalRef.current, {
          scale: 0.22,
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.8,
          ease: 'power3.in',
        })
        .to(carWrapperRef.current, {
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

    // 1. CLOSING (0.8s) — Doors slide shut, logo meets in middle
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

    // 2. MOVING (~2.2s) — Car stays centered, stars stretch into streaks
    tl.call(() => {
      setStateName('MOVING');
      audio.playHum(2.2);
    });

    const moveDuration = reducedMotion ? 0.8 : 2.2;

    if (!reducedMotion) {
      // Ease in speed & streak over 0.5s, hold, ease out over 0.5s
      tl.to(starMotionRef.current, {
        velocity: 1.0,
        streak: 1.0,
        duration: 0.5,
        ease: 'power2.in',
      })
      .to(starMotionRef.current, {
        velocity: 1.0,
        streak: 1.0,
        duration: 1.2,
      })
      .to(starMotionRef.current, {
        velocity: 0.0,
        streak: 0.0,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Car vibration by 1.5px
      tl.to(carWrapperRef.current, {
        y: '+=1.5',
        x: '+=0.8',
        repeat: 16,
        yoyo: true,
        duration: 0.07,
        ease: 'sine.inOut',
      }, '<-1.7');

      // Gold strips flickering
      tl.to([leftGoldStripRef.current, rightGoldStripRef.current], {
        opacity: 0.35,
        repeat: 14,
        yoyo: true,
        duration: 0.08,
        ease: 'power1.inOut',
      }, '<');
    }

    // Digital counter updates through intermediate floors
    const stepDuration = moveDuration / (counterSequence.length || 1);
    counterSequence.forEach((val, idx) => {
      tl.call(() => {
        setDisplayFloor(val);
      }, null, `<+=${(idx * stepDuration).toFixed(2)}`);
    });

    // 3. ARRIVING (0.3s) — Stars return to drift, gold "ding" flash + glow pulse behind lift
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

    // Soft Gold Glow Pulse Behind the Lift on Arrival
    if (arrivalPulseRef.current) {
      tl.fromTo(arrivalPulseRef.current, {
        opacity: 0,
        scale: 0.85,
      }, {
        opacity: 0.75,
        scale: 1.25,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      }, '<');
    }

    // Ding Screen Flash
    tl.fromTo(dingFlashRef.current, {
      opacity: 0,
    }, {
      opacity: 0.65,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    }, '<');

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

    // 5. REVEAL (1.5s) — Floor content renders inside doorway & scales up to fill screen
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
    // Lift car dims to 15% and stays faintly visible behind
    .to(carWrapperRef.current, {
      opacity: 0.15,
      filter: 'brightness(0.35)',
      duration: 1.5,
      ease: 'power2.out',
    }, '<');
  };

  // ==============================================================
  // 3. RETURN GESTURE ENGINE (Double-tap, two-finger tap, Escape)
  // ==============================================================
  const handleReturnToLift = () => {
    if (isBusy || stateName !== 'CONTENT') return;
    setIsBusy(true);
    setShowHint(false);
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
    // Lift car brightens back to 100%
    .to(carWrapperRef.current, {
      opacity: 1.0,
      filter: 'brightness(1.0)',
      duration: 1.0,
      ease: 'power2.out',
    }, '<')
    // Doors slide shut, logo meets in middle (0.8s)
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

  // Double-click handler on content area (disables selection, ignores buttons/links)
  const handleContentDoubleClick = (e) => {
    if (e.target.closest('a, button, input, textarea, select')) return;
    e.preventDefault();
    handleReturnToLift();
  };

  // Touch gesture handlers (Two-finger tap & mobile double-tap)
  const handleTouchStart = (e) => {
    if (e.target.closest('a, button, input, textarea, select')) return;
    const now = Date.now();

    // Two-finger tap detection: two touches start together
    if (e.touches.length === 2) {
      touchTrackRef.current.twoFingerStart = now;
      touchTrackRef.current.startX1 = e.touches[0].clientX;
      touchTrackRef.current.startY1 = e.touches[0].clientY;
      touchTrackRef.current.startX2 = e.touches[1].clientX;
      touchTrackRef.current.startY2 = e.touches[1].clientY;
      return;
    }

    // Single touch double-tap detection
    if (e.touches.length === 1) {
      const timeSinceLast = now - touchTrackRef.current.lastSingleTap;
      if (timeSinceLast < 320 && timeSinceLast > 50) {
        handleReturnToLift();
        touchTrackRef.current.lastSingleTap = 0;
      } else {
        touchTrackRef.current.lastSingleTap = now;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchTrackRef.current.twoFingerStart) {
      const elapsed = Date.now() - touchTrackRef.current.twoFingerStart;
      touchTrackRef.current.twoFingerStart = null;
      // Ends within 300ms without moving
      if (elapsed <= 300) {
        handleReturnToLift();
      }
    }
  };

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (stateName === 'CONTENT') {
          handleReturnToLift();
        }
        return;
      }

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, highlightedFloor, stateName, currentFloor]);

  return (
    <div
      ref={sceneRootRef}
      className="relative w-full h-[100dvh] min-h-[640px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans"
    >

      {/* ==============================================================
          LAYER 1: CLEAN DEEP-BLACK SPACE & CANVAS STARFIELD
          - About 140 stars (desktop) / 70 stars (phones) in 3 depth layers
          - Soft dark vignette and faint warm glow behind the lift
          - Arrival soft gold glow pulse
      ============================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Very Soft Dark Vignette */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.85)_100%)]" />

      {/* Faint Pale Ambient Glow Behind the Lift */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_50%_50%,rgba(143,232,255,0.08)_0%,transparent_50%)]" />

      {/* Arrival Soft Ice Cyan Glow Pulse Behind the Lift */}
      <div
        ref={arrivalPulseRef}
        className="absolute inset-0 pointer-events-none z-2 opacity-0 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(143, 232, 255, 0.40) 0%, rgba(143, 232, 255, 0.12) 40%, transparent 68%)',
        }}
      />


      {/* ==============================================================
          TOP BAR (Logo + Join Now only, clean and minimal)
      ============================================================== */}
      <header className="absolute top-0 inset-x-0 z-50 h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/5 bg-[#0b0b0b]/60 backdrop-blur-md">
        {/* Left: Real Logo + GOTHAM COLLAGE */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md overflow-hidden bg-black/80 border border-white/15 p-0.5 flex items-center justify-center shadow-md">
            <img src="/images/gc-logo.png" alt="GC" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#e8e8e6]">
            GOTHAM COLLAGE
          </span>
        </div>

        {/* Right: Sound Toggle + Sign In (Member & Admin) + Join Now */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleSound}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
              soundEnabled
                ? 'border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 shadow-[0_0_10px_rgba(143,232,255,0.3)]'
                : 'border-white/15 text-[#8a8a88] bg-black/50 hover:text-white'
            }`}
          >
            {soundEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}
          </button>

          {/* Sign In Dropdown */}
          <div className="relative group">
            <button
              onClick={openMemberLogin}
              className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-wider border border-white/15 text-[#a1a1aa] hover:text-white hover:border-white/35 bg-black/50 transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>Sign In</span>
              <span className="text-[8px] text-[#71717a] group-hover:text-white transition-colors">▾</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 py-1.5 bg-[#121215]/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <button
                onClick={openMemberLogin}
                className="w-full text-left px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider text-[#e8e8e6] hover:bg-white/10 hover:text-[#8FE8FF] transition-colors cursor-pointer"
              >
                Member Portal
              </button>
              <button
                onClick={openAdminLogin}
                className="w-full text-left px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Admin Console
              </button>
            </div>
          </div>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              disabled={isBusy}
              className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-white transition-colors cursor-pointer mr-1"
            >
              ← Portal
            </button>
          )}

          <a
            href={config.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white shadow-[0_0_12px_rgba(143,232,255,0.3)] cursor-pointer"
          >
            Join Now
          </a>
        </div>
      </header>


      {/* ==============================================================
          LAYER 2, 3, 4: LIFT CAR (~25% larger, centered)
          - Width: ~24-28% of viewport width (lg:w-[26vw])
          - Height: ~78% of viewport height (h-[78vh])
          - Button panel & floor display scale proportionally with car
      ============================================================== */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        
        {/* Car Outer Centered Fixture (24-28% width, 78% height on desktop; 80% width, 58% height on mobile) */}
        <div
          ref={carWrapperRef}
          className="relative w-[320px] sm:w-[380px] md:w-[420px] lg:w-[26vw] xl:w-[26vw] min-w-[340px] max-w-[460px] h-[78vh] min-h-[520px] max-h-[760px] flex items-center justify-center will-change-transform transition-[opacity,filter] duration-700 pointer-events-auto mobile-lift-fixture"
        >
          {/* Thick Dark Metal Frame */}
          <div className="relative w-full h-full rounded-xl border-[16px] sm:border-[20px] border-[#151518] bg-[#0a0a0c] shadow-[0_30px_90px_rgba(0,0,0,0.98),inset_0_4px_16px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">

            {/* ==========================================================
                LAYER 3: FLOOR DISPLAY (above doors in transom)
            ========================================================== */}
            <div className="relative w-full h-13 bg-[#0e0e11] border-b border-[#202025] flex items-center justify-between px-5 z-30">
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                <span className={`text-[#8FE8FF] font-bold ${stateName === 'MOVING' ? 'animate-pulse' : ''}`}>▲</span>
                <span className="text-zinc-600 font-bold">▼</span>
              </div>

              {/* Digital LED Readout in Ice Cyan */}
              <div className="px-3.5 py-1 rounded border border-[#8FE8FF]/40 bg-black/95 font-mono text-sm sm:text-base tracking-[0.25em] font-extrabold text-[#8FE8FF] shadow-[0_0_14px_rgba(143,232,255,0.35)]">
                LEVEL {displayFloor}
              </div>

              <div className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase">
                GC CAR
              </div>
            </div>

            {/* Doorway Opening */}
            <div className="relative flex-1 w-full overflow-hidden bg-black flex">
              
              {/* Ice Cyan Light Spill from doorway when opened */}
              <div
                ref={doorwayGlowRef}
                className="absolute inset-0 pointer-events-none opacity-0 z-5 transition-opacity"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(143, 232, 255, 0.45) 0%, rgba(143, 232, 255, 0.12) 50%, transparent 85%)',
                }}
              />

              {/* Thin Vertical Ice Cyan Light Strip (Left) */}
              <div
                ref={leftGoldStripRef}
                className="absolute left-1.5 top-2 bottom-2 w-[2px] rounded-full z-25 pointer-events-none animate-pulse"
                style={{
                  backgroundColor: config.colors.accent,
                  boxShadow: `0 0 14px ${config.colors.accent}, 0 0 28px rgba(143, 232, 255, 0.6)`,
                  animationDuration: '3.0s',
                }}
              />

              {/* Thin Vertical Ice Cyan Light Strip (Right) */}
              <div
                ref={rightGoldStripRef}
                className="absolute right-1.5 top-2 bottom-2 w-[2px] rounded-full z-25 pointer-events-none animate-pulse"
                style={{
                  backgroundColor: config.colors.accent,
                  boxShadow: `0 0 14px ${config.colors.accent}, 0 0 28px rgba(143, 232, 255, 0.6)`,
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
                  src={isMobileScreen ? '/images/mobile/door-chrome-mobile.jpg' : '/images/door-chrome.jpg'}
                  alt="Elevator Door Left"
                  className="w-full h-full object-cover object-left filter brightness-95 contrast-125 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/35 pointer-events-none" />

                {/* Real Logo Left Half (transparent PNG / mix-blend-mode: screen, NO black box) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 pointer-events-none z-20 flex items-center justify-center">
                  <img
                    src={isMobileScreen ? '/images/mobile/gc-logo-transparent-mobile.png' : '/images/gc-logo-transparent.png'}
                    alt="GC Logo Left"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(143,232,255,0.65)]"
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
                  src={isMobileScreen ? '/images/mobile/door-chrome-mobile.jpg' : '/images/door-chrome.jpg'}
                  alt="Elevator Door Right"
                  className="w-full h-full object-cover object-right filter brightness-95 contrast-125 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/35 pointer-events-none" />

                {/* Real Logo Right Half (transparent PNG / mix-blend-mode: screen, NO black box) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 pointer-events-none z-20 flex items-center justify-center">
                  <img
                    src={isMobileScreen ? '/images/mobile/gc-logo-transparent-mobile.png' : '/images/gc-logo-transparent.png'}
                    alt="GC Logo Right"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(143,232,255,0.65)]"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
              </div>

              {/* Center Door Seam */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black shadow-[0_0_6px_black] z-25 pointer-events-none" />
            </div>

          </div>

          {/* ==========================================================
              LAYER 4: BUTTON PANEL (built into right of car frame on desktop,
              horizontal row below lift on mobile with >= 48x48px buttons)
          ========================================================== */}
          <div className="absolute -right-32 sm:-right-40 md:-right-44 top-1/2 -translate-y-1/2 w-32 sm:w-40 md:w-44 py-4 px-2 rounded-r-xl border-y border-r border-white/10 bg-[#111114]/95 backdrop-blur-md shadow-2xl flex flex-col items-center space-y-3 z-35 mobile-lift-panel">
            <div className="text-[7px] font-mono uppercase tracking-widest text-[#71717a] mobile-lift-panel-label">
              PANEL
            </div>

            {/* Buttons 04, 03, 02, 01 with labels */}
            <div className="flex flex-col space-y-2.5 w-full mobile-lift-panel-grid">
              {floorConfig.map((item) => {
                const isSelected = targetFloor === item.id;
                const isKeyFocused = highlightedFloor === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => launchFloorTransition(item.id)}
                    disabled={isBusy}
                    title={`Floor ${item.id} - ${item.label}`}
                    className={`w-full py-2 px-2.5 rounded-md font-mono transition-all duration-200 flex items-center justify-between cursor-pointer mobile-lift-floor-btn ${
                      isSelected
                        ? 'border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 shadow-[0_0_15px_rgba(143,232,255,0.45)] scale-105'
                        : isKeyFocused
                        ? 'border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 shadow-[0_0_12px_rgba(143,232,255,0.35)]'
                        : 'border border-white/10 bg-[#161619] text-[#e8e8e6] hover:border-[#8FE8FF] hover:text-[#8FE8FF] hover:bg-[#8FE8FF]/10 hover:shadow-[0_0_12px_rgba(143,232,255,0.4)]'
                    }`}
                  >
                    <span className="font-bold text-xs mobile-lift-floor-btn-num">{item.id}</span>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider pl-1.5 truncate mobile-lift-floor-btn-label ${isSelected ? 'text-[#8FE8FF] font-semibold' : 'text-zinc-400'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Keycard Sensor Bar */}
            <div className="w-6 h-1 rounded-full bg-[#8FE8FF]/50 shadow-[0_0_6px_#8FE8FF] mobile-lift-panel-sensor" />
          </div>

        </div>

      </div>


      {/* ==============================================================
          REVEAL & FLOOR CONTENT (Scales up from doorway center)
          With Return Gestures:
          - Double-click or double-tap anywhere on content area
          - Two-finger tap on touchscreens
          - Escape key
          - Subtle hint at bottom for first 4 seconds
          - "Back to lift" button fallback
      ============================================================== */}
      <div
        ref={contentPortalRef}
        onDoubleClick={handleContentDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden opacity-0 select-none"
        style={{ transform: 'scale(0.22)', transformOrigin: 'center center' }}
      >
        {/* Floor 04 Background: Final Cube Screen (Used ONLY on Floor 04) */}
        {activeFloorContent === '04' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <img
              src={isMobileScreen ? '/images/mobile/floor-04-skyline-mobile.jpg' : '/images/floor-04-skyline.jpg'}
              alt="Floor 04 Cube Skyline"
              className="w-full h-full object-cover object-right filter-ice-cyan"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
        )}

        {/* Floor 03 Background: Project Archive */}
        {activeFloorContent === '03' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
            <img
              src={isMobileScreen ? '/images/mobile/floor-03-archive-mobile.jpg' : '/images/floor-03-archive.jpg'}
              alt="Floor 03 Archive"
              className="w-full h-full object-cover object-center filter-ice-cyan"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
          </div>
        )}

        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 lg:p-20 overflow-y-auto mobile-content-container">

          {/* Top Bar inside Content Screen: Back to Lift Button & Floor Badge */}
          <div className="relative z-20 flex items-center justify-between w-full pt-14">
            <button
              onClick={handleReturnToLift}
              disabled={isBusy}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-white/20 bg-black/80 hover:border-[#8FE8FF] hover:text-[#8FE8FF] text-xs font-mono uppercase tracking-widest text-[#e8e8e6] transition-all shadow-xl cursor-pointer active:scale-95 mobile-back-btn"
            >
              <span>← Back to lift</span>
            </button>

            {/* Current Level Pill */}
            <div className="px-3.5 py-1 rounded-full border border-[#8FE8FF]/40 bg-black/80 text-[11px] font-mono uppercase tracking-[0.25em] text-[#8FE8FF]">
              FLOOR {activeFloorContent}
            </div>
          </div>

          {/* Main Floor Copy Area (Strictly from SPEC.md) */}
          <div className="relative z-20 my-auto max-w-4xl flex flex-col space-y-6 text-left w-full mobile-content-inner">
            
            {/* FLOOR 01: WHO WE ARE */}
            {activeFloorContent === '01' && (
              <div className="flex flex-col space-y-5 animate-fade-in max-w-2xl py-8">
                {/* Tiny Label in Accent Colour: Inter 500, uppercase, 11-12px, letter spacing 0.35em */}
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF]">
                  WHO WE ARE
                </div>

                {/* Headline: "We're people who build." (Unbounded, mixing weight 200 and 700, max 8 words) */}
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mobile-content-headline">
                  <span className="font-[200] text-[#bdbdb8]">We're people </span>
                  <span className="font-[700] text-[#e8e8e6]">who build.</span>
                </h1>

                {/* Lines (one at a time, 0.5s fade, slight upward move, 0.25s stagger) */}
                <div className="space-y-3 pt-2 text-base sm:text-lg lg:text-xl font-sans text-[#e8e8e6] leading-relaxed mobile-content-body">
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
              </div>
            )}

            {/* FLOOR 02: THE METHOD */}
            {activeFloorContent === '02' && (
              <div className="flex flex-col space-y-6 animate-fade-in max-w-3xl py-8">
                {/* Tiny Label in Accent Colour: Inter 500, uppercase, 11-12px, letter spacing 0.35em */}
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF]">
                  THE METHOD
                </div>

                {/* Three large words, each with one line (BUILD, IDENTIFY, CREATE) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 mobile-method-stack">
                  {[
                    {
                      key: 'BUILD',
                      word: 'BUILD',
                      line: 'Real projects, made together.',
                    },
                    {
                      key: 'IDENTIFY',
                      word: 'IDENTIFY',
                      line: "We spot who's ready to lead.",
                    },
                    {
                      key: 'CREATE',
                      word: 'CREATE',
                      line: 'Strong projects become startups, with equity partnerships.',
                    },
                  ].map((p, idx) => {
                    const isLit = selectedPillar === p.key;
                    const animClass = idx === 0 ? 'animate-fade-line-1' : idx === 1 ? 'animate-fade-line-2' : 'animate-fade-line-3';

                    return (
                      <div
                        key={p.key}
                        onMouseEnter={() => setSelectedPillar(p.key)}
                        onClick={() => setSelectedPillar(p.key)}
                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer mobile-method-item ${animClass} ${
                          isLit
                            ? 'border-[#8FE8FF] bg-[#8FE8FF]/10 shadow-[0_0_25px_rgba(143,232,255,0.35)]'
                            : 'border-white/10 bg-black/60 hover:border-white/30'
                        }`}
                      >
                        <div
                          className={`font-display text-lg sm:text-xl tracking-wider font-[700] mb-2 transition-colors ${
                            isLit ? 'text-[#8FE8FF]' : 'text-white'
                          }`}
                          style={isLit ? { textShadow: '0 0 20px rgba(143,232,255,0.45)' } : {}}
                        >
                          {p.word}
                        </div>
                        <p className="text-xs sm:text-sm font-sans text-[#a1a1aa] leading-relaxed mobile-content-body">
                          {p.line}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Closing Line */}
                <div className="pt-2 text-sm sm:text-base font-mono text-[#e8e8e6] animate-fade-line-4 mobile-content-body">
                  We don't teach entrepreneurship.{' '}
                  <span className="text-[#8FE8FF] font-semibold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
                    We build it.
                  </span>
                </div>
              </div>
            )}

            {/* FLOOR 03: PROJECT ARCHIVE */}
            {activeFloorContent === '03' && (
              <div className="flex flex-col space-y-5 animate-fade-in max-w-2xl py-8">
                {/* Tiny Label in Accent Colour */}
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF]">
                  PROJECT ARCHIVE
                </div>

                {/* Headline: "PROJECT 001" (Unbounded, mixing weight 200 and 700) */}
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mobile-content-headline">
                  <span className="font-[200] text-[#bdbdb8]">PROJECT </span>
                  <span className="font-[700] text-[#e8e8e6]">001</span>
                </h1>

                {/* Pill: STATUS: IN DEVELOPMENT */}
                <div className="inline-flex items-center self-start px-3.5 py-1.5 rounded-full border border-[#8FE8FF]/40 bg-[#8FE8FF]/10 text-[11px] font-mono tracking-widest text-[#8FE8FF] animate-fade-line-1">
                  STATUS: IN DEVELOPMENT
                </div>

                {/* Line */}
                <div className="pt-1 text-base sm:text-lg lg:text-xl font-sans text-[#e8e8e6] leading-relaxed animate-fade-line-2 mobile-content-body">
                  Something is being built. You'll see it{' '}
                  <span className="text-[#8FE8FF] font-semibold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
                    here first.
                  </span>
                </div>

                {/* Link: Learn More → (Opens small panel) */}
                <div className="pt-2 animate-fade-line-3">
                  <button
                    onClick={() => setShowLearnMoreModal(true)}
                    className="inline-flex items-center space-x-2 text-sm font-mono uppercase tracking-wider text-[#8FE8FF] hover:text-white transition-colors cursor-pointer group min-h-[44px]"
                  >
                    <span>Learn More</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>

                {/* Learn More Modal */}
                {showLearnMoreModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 rounded-2xl border border-white/20 bg-[#101014] shadow-2xl flex flex-col space-y-4">
                      <div className="text-xs font-mono uppercase tracking-widest text-[#8FE8FF]">
                        PROJECT ARCHIVE NOTICE
                      </div>
                      <p className="text-sm font-sans text-[#e8e8e6] leading-relaxed mobile-content-body">
                        Status: in development. Details will be shared when we launch.
                      </p>
                      <button
                        onClick={() => setShowLearnMoreModal(false)}
                        className="self-end min-h-[44px] px-5 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase text-white transition-colors cursor-pointer"
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
              <div className="flex flex-col space-y-5 animate-fade-in max-w-2xl py-8">
                {/* Tiny Label in Accent Colour */}
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF]">
                  OUR VISION
                </div>

                {/* Headline: "Students shouldn't have to wait to build." (Unbounded, mixing weight 200 and 700, max 8 words) */}
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-2xl mobile-content-headline">
                  <span className="font-[200] text-[#bdbdb8]">Students shouldn't </span>
                  <span className="font-[700] text-[#e8e8e6]">have to wait to build.</span>
                </h1>

                {/* Line */}
                <div className="pt-1 text-sm sm:text-base lg:text-lg font-mono uppercase tracking-wider text-[#e8e8e6] leading-relaxed animate-fade-line-1 mobile-content-body">
                  FROM STUDENTS TO{' '}
                  <span className="text-[#8FE8FF] font-bold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
                    BUILDERS.
                  </span>{' '}
                  FROM BUILDERS TO{' '}
                  <span className="text-[#8FE8FF] font-bold" style={{ textShadow: '0 0 20px rgba(143,232,255,0.45)' }}>
                    FOUNDERS.
                  </span>
                </div>

                {/* Button: Join The Movement → + Scroll to Story Hint */}
                <div className="pt-3 animate-fade-line-2 flex flex-wrap items-center gap-4">
                  <a
                    href={config.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 px-6 py-3 rounded-full border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_18px_rgba(143,232,255,0.35)] cursor-pointer min-h-[48px]"
                  >
                    <span>Join The Movement</span>
                    <span>→</span>
                  </a>

                  {/* Scroll to Story indicator */}
                  <a
                    href="#story-1"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('story-1')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-white transition-colors cursor-pointer min-h-[44px]"
                  >
                    <span>Read The Story</span>
                    <span>↓</span>
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* ==============================================================
              THE STORY SECTION & FINAL SCREEN (Scrollable from Floor 04)
              Four full-height screens for the story + one full-height final screen
          ============================================================== */}
          {activeFloorContent === '04' && (
            <div className="relative z-20 w-full flex flex-col pt-16">
              
              {/* STORY SCREEN 1 */}
              <div
                id="story-1"
                className="min-h-screen mobile-story-section w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
              >
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
                  THE STORY · PART I
                </div>
                <h2 className="font-display mobile-story-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight max-w-4xl">
                  <span className="font-[200] text-[#bdbdb8]">We started </span>
                  <span className="font-[700] text-[#e8e8e6]">small.</span>
                </h2>
              </div>

              {/* STORY SCREEN 2 */}
              <div
                id="story-2"
                className="min-h-screen mobile-story-section w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
              >
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
                  THE STORY · PART II
                </div>
                <h2 className="font-display mobile-story-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl">
                  <span className="font-[200] text-[#bdbdb8]">A few minds. One rule: </span>
                  <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
                    build, don't just talk.
                  </span>
                </h2>
              </div>

              {/* STORY SCREEN 3 */}
              <div
                id="story-3"
                className="min-h-screen mobile-story-section w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
              >
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
                  THE STORY · PART III
                </div>
                <h2 className="font-display mobile-story-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl">
                  <span className="font-[200] text-[#bdbdb8]">When a project shows promise, </span>
                  <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
                    we back the people behind it.
                  </span>
                </h2>
              </div>

              {/* STORY SCREEN 4 */}
              <div
                id="story-4"
                className="min-h-screen mobile-story-section w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/5"
              >
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-6">
                  THE STORY · PART IV
                </div>
                <h2 className="font-display mobile-story-title text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight max-w-4xl">
                  <span className="font-[200] text-[#bdbdb8]">We're not an investment fund or a VC firm. </span>
                  <span className="font-[700] text-[#8FE8FF]" style={{ textShadow: '0 0 25px rgba(143,232,255,0.45)' }}>
                    We're builders.
                  </span>
                </h2>
              </div>

              {/* FINAL SCREEN */}
              <div
                id="final-screen"
                className="min-h-screen mobile-final-section w-full flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 border-t border-white/10"
              >
                <div className="font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.35em] text-[#8FE8FF] mb-8">
                  THE GOTHAM MOTTO
                </div>
                <h2 className="font-display mobile-story-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-4xl mb-10">
                  <span className="font-[200] text-[#bdbdb8]">THE FUTURE IS BUILT, </span>
                  <span className="font-[700] text-[#e8e8e6]">NOT WAITED FOR.</span>
                </h2>
                <a
                  href={config.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 px-8 py-4 rounded-full border border-[#8FE8FF] text-[#8FE8FF] bg-[#8FE8FF]/10 hover:bg-[#8FE8FF]/20 hover:text-white transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(143,232,255,0.45)] cursor-pointer active:scale-95 min-h-[48px]"
                >
                  <span>Join The Movement</span>
                  <span>→</span>
                </a>
              </div>

            </div>
          )}

          {/* Bottom Return Hint (Shown for first 4 seconds only) */}
          <div className="relative z-20 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-widest">
            <span className="text-[#71717a]">
              GOTHAM COLLAGE FOUNDRY • ALL SPEC (v2) ARCHIVES VERIFIED
            </span>

            {/* Subtle Hint: Double-tap to return to the lift */}
            <div
              className={`transition-opacity duration-700 pointer-events-none px-3.5 py-1.5 rounded-full border border-[#8FE8FF]/30 bg-black/80 text-[#8FE8FF] shadow-[0_0_12px_rgba(143,232,255,0.25)] ${
                showHint ? 'opacity-90' : 'opacity-0'
              }`}
            >
              Double-tap to return to the lift
            </div>
          </div>

        </div>
      </div>


      {/* ==============================================================
          DING SCREEN FLASH OVERLAY (on arrival)
      ============================================================== */}
      <div
        ref={dingFlashRef}
        className="fixed inset-0 z-60 pointer-events-none opacity-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(143, 232, 255, 0.65) 0%, rgba(143, 232, 255, 0.2) 50%, transparent 100%)',
        }}
      />

    </div>
  );
}
