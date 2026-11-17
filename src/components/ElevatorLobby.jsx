import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import Floor01About from './Floor01About';
import Floor02Method from './Floor02Method';
import Floor03Archive from './Floor03Archive';
import Floor04Vision from './Floor04Vision';

/**
 * Web Audio Synthesizer for soft luxury elevator acoustics
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
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 0.7);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) {}
  }

  playHum(durationSec = 1.2) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.2);
      gain.gain.setValueAtTime(0.035, now + durationSec - 0.2);
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
      // Soft luxury dual-tone chime (F#5 740Hz and C#6 1108Hz)
      const freqs = [739.99, 1108.73];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.06 + 1.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 1.35);
      });
    } catch (e) {}
  }
}

/**
 * ElevatorLobby — Screen 2: The Gotham Elevator
 * Governed strictly by SPEC (v2) and State Machine:
 * - States: 'lobby', 'closing', 'moving', 'opening', 'floor'
 * - Clicking a floor:
 *     1. Button fills gold
 *     2. Doors slide shut with logo meeting in the middle
 *     3. Panel counts to chosen floor with slight flicker & opposite animation directions for up/down
 *     4. Soft gold "ding" flash
 *     5. Doors slide open onto dark screen showing floor number
 * - Floor panel stays visible on every floor for continuous jumps
 * - Clicks during a ride are ignored
 * - Works with arrow keys (Up / Down) and Enter
 * - Optional soft elevator sound (OFF by default, toggled by user)
 * - Nav links map to floors:
 *     Projects = floor 03
 *     The Elevator = lobby
 *     About = floor 01
 *     Join Now = LinkedIn from config
 */
export default function ElevatorLobby({ onBackToPortal }) {
  const { openMemberLogin } = useAuth();

  // Audio Engine Instance
  const audio = useMemo(() => new ElevatorAudioEngine(), []);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Simple State Machine: 'lobby' | 'closing' | 'moving' | 'opening' | 'floor'
  const [rideState, setRideState] = useState('lobby');

  // Floor states: 'lobby' | '01' | '02' | '03' | '04'
  const [currentFloor, setCurrentFloor] = useState('lobby');
  const [targetFloor, setTargetFloor] = useState('lobby');
  const [displayFloor, setDisplayFloor] = useState('00');
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const [doorsOpen, setDoorsOpen] = useState(true); // Open initially in lobby
  const [isFlickering, setIsFlickering] = useState(false);
  const [dingFlash, setDingFlash] = useState(false);
  const [highlightedFloor, setHighlightedFloor] = useState('01');

  // Reference floors list
  const floors = [
    {
      id: '04',
      name: 'OUR VISION',
      eyebrow: 'OUR VISION',
      headline: 'FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS.',
      description: 'We want to create an ecosystem where students don\'t have to wait for opportunities to build something meaningful.',
      badge: 'FOUNDRY GOAL',
      actionText: 'Join The Movement →',
      actionUrl: config.socials.linkedin,
    },
    {
      id: '03',
      name: 'PROJECT ARCHIVE',
      eyebrow: 'PROJECT ARCHIVE',
      headline: 'PROJECT 001',
      description: 'Our first project is in the works. Stay tuned.',
      badge: 'STATUS : IN DEVELOPMENT',
      actionText: 'Learn More →',
      actionPanel: 'Status: in development. Details will be shared when we launch.',
    },
    {
      id: '02',
      name: 'THE METHOD',
      eyebrow: 'THE METHOD',
      headline: 'BUILD • IDENTIFY • CREATE',
      description: 'We don\'t just teach entrepreneurship. We build real things.',
      badge: 'FOUNDRY METHODOLOGY',
      steps: [
        { label: '01. BUILD', text: 'We collaborate as students and build projects from scratch.' },
        { label: '02. IDENTIFY', text: 'After launching and validating projects, we identify people with the potential to become founders.' },
        { label: '03. CREATE', text: 'We work with selected founders to turn successful projects into independent startups through equity partnerships.' },
      ],
    },
    {
      id: '01',
      name: 'ABOUT GOTHAM',
      eyebrow: 'ABOUT GOTHAM',
      headline: 'STUDENT-LED VENTURE STUDIO FOUNDRY',
      description: 'Gotham Collage is a student-led venture studio where ambitious students come together to build real-world projects. We believe in learning by building and creating things that solve real problems.',
      badge: 'ORIGIN & MISSION',
    },
  ];

  // Full sequence ordering: lobby is index 0
  const floorOrder = ['lobby', '01', '02', '03', '04'];

  // Guard: clicks during a ride are ignored
  const isRideInProgress = rideState === 'closing' || rideState === 'moving' || rideState === 'opening';

  // Toggle Sound safely
  const toggleSound = () => {
    if (!soundEnabled) {
      audio.enable();
      setSoundEnabled(true);
      // Play a quick test confirmation chime
      setTimeout(() => audio.playDing(), 150);
    } else {
      audio.disable();
      setSoundEnabled(false);
    }
  };

  // Helper: jump between floors
  const handleFloorJump = (destination) => {
    if (isRideInProgress) return; // Clicks during ride ignored
    if (destination === currentFloor) return; // Already on this floor

    const curIdx = floorOrder.indexOf(currentFloor);
    const tarIdx = floorOrder.indexOf(destination);
    const dir = tarIdx > curIdx ? 'up' : 'down';

    setDirection(dir);
    setTargetFloor(destination);
    setHighlightedFloor(destination === 'lobby' ? '01' : destination);

    // 1. STATE: 'closing'
    setRideState('closing');
    setDoorsOpen(false); // Doors slide shut with logo meeting in the middle
    audio.playDoorSlide();

    // 2. STATE: 'moving' (after doors shut)
    setTimeout(() => {
      setRideState('moving');
      audio.playHum(1.4);

      // Digital counting flicker sequence
      const steps = [];
      if (dir === 'up') {
        for (let i = curIdx; i <= tarIdx; i++) {
          steps.push(floorOrder[i] === 'lobby' ? '00' : floorOrder[i]);
        }
      } else {
        for (let i = curIdx; i >= tarIdx; i--) {
          steps.push(floorOrder[i] === 'lobby' ? '00' : floorOrder[i]);
        }
      }

      // Step through intermediate floors
      const stepDuration = 1200 / (steps.length || 1);
      steps.forEach((stepVal, idx) => {
        setTimeout(() => {
          setDisplayFloor(stepVal);
          setIsFlickering(true);
          setTimeout(() => setIsFlickering(false), stepDuration * 0.4);
        }, idx * stepDuration);
      });

      // 3. STATE: 'opening' (after counting ends)
      setTimeout(() => {
        setRideState('opening');
        setDingFlash(true);
        audio.playDing();
        setDisplayFloor(destination === 'lobby' ? '00' : destination);

        // Doors slide open
        setTimeout(() => {
          setDoorsOpen(true);
          audio.playDoorSlide();
        }, 200);

        // 4. STATE: 'floor' or 'lobby' (settled)
        setTimeout(() => {
          setCurrentFloor(destination);
          setRideState(destination === 'lobby' ? 'lobby' : 'floor');
          setDingFlash(false);
          setDirection(null);
        }, 1000);
      }, 1400);
    }, 850);
  };

  // Keyboard navigation: ArrowUp, ArrowDown, Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isRideInProgress) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const selectable = ['01', '02', '03', '04'];
        const curIdx = selectable.indexOf(highlightedFloor);
        if (curIdx < selectable.length - 1) {
          setHighlightedFloor(selectable[curIdx + 1]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const selectable = ['01', '02', '03', '04'];
        const curIdx = selectable.indexOf(highlightedFloor);
        if (curIdx > 0) {
          setHighlightedFloor(selectable[curIdx - 1]);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedFloor && highlightedFloor !== currentFloor) {
          handleFloorJump(highlightedFloor);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRideInProgress, highlightedFloor, currentFloor]);

  // Readout helpers
  const currentFloorData = floors.find((f) => f.id === currentFloor);
  const activeLevelDisplay = currentFloor === 'lobby' ? '00' : currentFloor;

  return (
    <div className="relative w-full h-[100dvh] min-h-[700px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans">
      
      {/* 1. Fullscreen Background: /public/images/lobby-bg.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/lobby-bg.jpg"
          alt="Gotham Elevator Lobby"
          className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            transform:
              rideState === 'moving'
                ? direction === 'up'
                  ? 'scale(1.03) translateY(-14px)'
                  : 'scale(1.03) translateY(14px)'
                : 'scale(1.0) translateY(0px)',
          }}
        />

        {/* Ambient Dark Overlays for Extreme Contrast */}
        <div className="absolute inset-0 bg-[#0b0b0b]/40 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full md:w-5/12 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-full md:w-5/12 bg-gradient-to-l from-[#0b0b0b] via-[#0b0b0b]/75 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/95 via-[#0b0b0b]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar — Nav links map to floors */}
      <header className="relative z-30 w-full px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between">
        {/* Left: Logo + GOTHAM COLLAGE (clicking returns to lobby) */}
        <button
          onClick={() => handleFloorJump('lobby')}
          disabled={isRideInProgress}
          className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/70 border border-white/20 p-0.5 flex items-center justify-center group-hover:border-[#F5B800]/50 transition-colors shadow-lg">
            <img src="/images/gc-logo.png" alt="GC" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] text-[#e8e8e6] group-hover:text-white transition-colors">
            GOTHAM COLLAGE
          </span>
        </button>

        {/* Centre: Nav Links mapped to floors */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
          {/* Projects = floor 03 */}
          <button
            onClick={() => handleFloorJump('03')}
            disabled={isRideInProgress}
            className={`transition-colors duration-200 cursor-pointer ${
              currentFloor === '03' ? 'text-[#F5B800] font-semibold' : 'hover:text-white'
            }`}
          >
            Projects
          </button>

          {/* The Elevator = lobby */}
          <button
            onClick={() => handleFloorJump('lobby')}
            disabled={isRideInProgress}
            className={`transition-colors duration-200 cursor-pointer ${
              currentFloor === 'lobby' ? 'text-[#F5B800] font-semibold' : 'hover:text-white'
            }`}
          >
            The Elevator
          </button>

          {/* About = floor 01 */}
          <button
            onClick={() => handleFloorJump('01')}
            disabled={isRideInProgress}
            className={`transition-colors duration-200 cursor-pointer ${
              currentFloor === '01' ? 'text-[#F5B800] font-semibold' : 'hover:text-white'
            }`}
          >
            About
          </button>

          {/* Join Now = LinkedIn from config */}
          <a
            href={config.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-[#F5B800] text-zinc-300 font-semibold"
          >
            Join Now
          </a>
        </nav>

        {/* Right: Sound Toggle + Portal Return + Member Login */}
        <div className="flex items-center space-x-3">
          {/* Sound Toggle (OFF by default, only starts after user clicks) */}
          <button
            onClick={toggleSound}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
              soundEnabled
                ? 'border-[#F5B800] text-[#F5B800] bg-[#F5B800]/15 shadow-[0_0_12px_rgba(245,184,0,0.35)]'
                : 'border-white/20 text-[#8a8a88] bg-black/60 hover:text-white hover:border-white/40'
            }`}
            title="Toggle Soft Elevator Audio"
          >
            <span>{soundEnabled ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}</span>
          </button>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              disabled={isRideInProgress}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border border-white/20 text-[#a1a1aa] hover:text-white hover:border-white/50 bg-black/60 transition-all cursor-pointer mr-1"
            >
              ← Portal
            </button>
          )}

          <button
            onClick={openMemberLogin}
            disabled={isRideInProgress}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border border-[#F5B800] text-[#F5B800] bg-[#0b0b0b]/70 hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_15px_rgba(245,184,0,0.3)] cursor-pointer active:scale-95"
          >
            Enter Portal
          </button>
        </div>
      </header>

      {/* 3. Main Center Stage */}
      <div className="relative z-20 h-[calc(100%-140px)] px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        
        {/* Main Stage Content: Floor 01 / Floor 02 / Floor 03 / Floor 04 / or Elevator Doors & Lobby View */}
        {currentFloor === '01' && doorsOpen && !isRideInProgress ? (
          /* Floor 01: ABOUT GOTHAM (Glowing Logo + Slow Typing Text) */
          <div className="w-full lg:w-3/4 h-full flex items-center justify-center animate-fade-in overflow-y-auto">
            <Floor01About />
          </div>
        ) : currentFloor === '02' && doorsOpen && !isRideInProgress ? (
          /* Floor 02: THE METHOD (3 Glowing White Pillars with Gold Hover) */
          <div className="w-full lg:w-3/4 h-full flex items-center justify-center animate-fade-in overflow-y-auto">
            <Floor02Method />
          </div>
        ) : currentFloor === '03' && doorsOpen && !isRideInProgress ? (
          /* Floor 03: PROJECT ARCHIVE (Project 001 + Status in Development + Learn More) */
          <div className="w-full lg:w-3/4 h-full flex items-center justify-center animate-fade-in overflow-y-auto">
            <Floor03Archive />
          </div>
        ) : currentFloor === '04' && doorsOpen && !isRideInProgress ? (
          /* Floor 04: OUR VISION (From Students to Builders + Join The Movement) */
          <div className="w-full lg:w-3/4 h-full flex items-center justify-center animate-fade-in overflow-y-auto">
            <Floor04Vision />
          </div>
        ) : (
          /* Lobby View / In-Transit Elevator Ride with Sliding Doors & Logo */
          <>
            {/* Left Side: Elevator Title & Story Sub */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-4 sm:space-y-6 text-left animate-fade-in z-20">
              <div className="inline-flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
                  {currentFloor === 'lobby' ? 'THE ELEVATOR' : `LEVEL ${currentFloor}`}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.1]">
                {currentFloor === 'lobby' ? (
                  <>
                    CHOOSE YOUR
                    <br />
                    <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
                      FLOOR.
                    </span>
                  </>
                ) : (
                  currentFloorData?.name || 'TRANSIT'
                )}
              </h1>

              <p className="font-sans text-sm sm:text-base text-[#a1a1aa] leading-relaxed max-w-sm">
                {currentFloor === 'lobby'
                  ? 'Explore the depths of Gotham.'
                  : currentFloorData?.description}
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center space-x-3 px-3.5 py-2 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md text-[11px] font-mono text-[#a1a1aa]">
                  <span>NAVIGATE:</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">▲</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">▼</span>
                  <span className="px-2 py-0.5 rounded bg-[#F5B800]/20 text-[#F5B800] font-bold">ENTER</span>
                </div>
              </div>

              {/* Ride State Status Pill */}
              <div className="pt-1">
                <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md">
                  <span className={`w-1.5 h-1.5 rounded-full ${isRideInProgress ? 'bg-[#F5B800] animate-ping' : 'bg-emerald-400'}`} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa]">
                    {rideState === 'lobby' && 'LOBBY READY'}
                    {rideState === 'closing' && 'DOORS CLOSING...'}
                    {rideState === 'moving' && `TRANSIT ${direction?.toUpperCase()}...`}
                    {rideState === 'opening' && 'ARRIVED'}
                    {rideState === 'floor' && `FLOOR ${currentFloor} OPEN`}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Live Elevator Doors & Aperture Screen */}
            <div className="relative flex items-center justify-center gap-4 sm:gap-6 z-20">
              
              {/* Elevator Door Surround Box */}
              <div className="relative w-[280px] sm:w-[350px] md:w-[390px] lg:w-[420px] aspect-[3/4.2] max-h-[540px] flex items-center justify-center">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#2d2d2d] bg-[#0a0a0a] shadow-[0_15px_50px_rgba(0,0,0,0.95)] flex items-center justify-center p-3 sm:p-3.5">
                  
                  {/* Header: Up/Down Direction Arrows + Digital Floor Display */}
                  <div className="absolute top-3.5 inset-x-0 flex items-center justify-between px-6 z-25 pointer-events-none">
                    <div className="flex items-center space-x-2 bg-black/90 px-2.5 py-1 rounded border border-white/10 font-mono text-[11px]">
                      <span className={`${direction === 'up' || (!direction && currentFloor !== '04') ? 'text-[#F5B800] animate-pulse' : 'text-zinc-700'}`}>▲</span>
                      <span className={`${direction === 'down' || (!direction && currentFloor !== '01' && currentFloor !== 'lobby') ? 'text-[#F5B800] animate-pulse' : 'text-zinc-700'}`}>▼</span>
                    </div>

                    {/* Digital Floor Indicator (Counts with slight flicker, pulses gold on ding) */}
                    <div
                      className={`font-mono text-xs tracking-widest uppercase bg-black/95 px-3 py-1 rounded border transition-all duration-300 font-bold ${
                        dingFlash
                          ? 'border-[#F5B800] text-white bg-[#F5B800]/30 shadow-[0_0_20px_#F5B800] scale-110'
                          : isFlickering
                          ? 'border-[#F5B800]/80 text-[#F5B800] opacity-60'
                          : 'border-[#F5B800]/40 text-[#F5B800] shadow-[0_0_12px_rgba(245,184,0,0.35)]'
                      }`}
                    >
                      LEVEL {rideState === 'moving' ? displayFloor : activeLevelDisplay}
                    </div>
                  </div>

                  {/* Left Pulsing Gold Light Strip */}
                  <div
                    className={`absolute left-2.5 sm:left-3 top-14 bottom-6 w-[2px] rounded-full z-25 pointer-events-none transition-all duration-300 ${
                      dingFlash ? 'opacity-100 shadow-[0_0_30px_#F5B800]' : 'animate-pulse'
                    }`}
                    style={{
                      backgroundColor: config.colors.gold,
                      boxShadow: dingFlash
                        ? `0 0 25px ${config.colors.gold}, 0 0 50px rgba(245, 184, 0, 0.9)`
                        : `0 0 16px ${config.colors.gold}, 0 0 32px rgba(245, 184, 0, 0.65)`,
                      animationDuration: '3.2s',
                    }}
                  />

                  {/* Right Pulsing Gold Light Strip */}
                  <div
                    className={`absolute right-2.5 sm:right-3 top-14 bottom-6 w-[2px] rounded-full z-25 pointer-events-none transition-all duration-300 ${
                      dingFlash ? 'opacity-100 shadow-[0_0_30px_#F5B800]' : 'animate-pulse'
                    }`}
                    style={{
                      backgroundColor: config.colors.gold,
                      boxShadow: dingFlash
                        ? `0 0 25px ${config.colors.gold}, 0 0 50px rgba(245, 184, 0, 0.9)`
                        : `0 0 16px ${config.colors.gold}, 0 0 32px rgba(245, 184, 0, 0.65)`,
                      animationDuration: '3.2s',
                    }}
                  />

                  {/* Elevator Aperture: Dark Floor Screen Behind the Live Doors */}
                  <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 flex shadow-inner bg-[#0b0b0b]">
                    
                    {/* 1. Behind the Doors: Dark Screen Showing Floor Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-5 bg-gradient-to-b from-[#141414] via-[#0b0b0b] to-[#080808]">
                      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#F5B800]/40 bg-[#F5B800]/10 text-[#F5B800] text-[10px] font-mono tracking-[0.25em] uppercase mb-3">
                        <span>LEVEL {activeLevelDisplay}</span>
                      </div>

                      <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white mb-2">
                        {currentFloor === 'lobby' ? 'LOBBY' : currentFloorData?.name}
                      </h2>

                      <p className="text-[11px] sm:text-xs font-sans text-zinc-400 max-w-[240px] leading-relaxed">
                        {currentFloor === 'lobby'
                          ? 'The Grand Lobby of Gotham Collage.'
                          : currentFloorData?.description}
                      </p>

                      <div
                        className="absolute bottom-4 w-40 h-10 rounded-full blur-2xl opacity-25 pointer-events-none"
                        style={{ background: config.colors.goldGlow }}
                      />
                    </div>

                    {/* 2. Motion Streaks / Vertical Animation for Up/Down */}
                    {rideState === 'moving' && (
                      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                        <div
                          className="w-full h-full opacity-35 animate-pulse"
                          style={{
                            background:
                              direction === 'up'
                                ? 'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(245, 184, 0, 0.2) 15px, rgba(245, 184, 0, 0.2) 30px)'
                                : 'repeating-linear-gradient(180deg, transparent, transparent 15px, rgba(245, 184, 0, 0.2) 15px, rgba(245, 184, 0, 0.2) 30px)',
                          }}
                        />
                      </div>
                    )}

                    {/* 3. Left Sliding Door Panel */}
                    <div
                      className="relative w-1/2 h-full overflow-hidden border-r border-[#1a1a1a] z-15 will-change-transform"
                      style={{
                        transform: doorsOpen ? 'translateX(-100%)' : 'translateX(0%)',
                        transition: 'transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      }}
                    >
                      <img
                        src="/images/door-chrome.jpg"
                        alt="Elevator Door Left"
                        className="w-full h-full object-cover object-left filter brightness-95 contrast-125 select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35 pointer-events-none" />

                      {/* Left half of the logo pinned to the right edge */}
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 pointer-events-none z-20">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-black/75 border border-white/20 p-3 flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-md">
                          <img
                            src="/images/gc-logo.png"
                            alt="Gotham Collage Seal Left"
                            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,184,0,0.5)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Right Sliding Door Panel */}
                    <div
                      className="relative w-1/2 h-full overflow-hidden border-l border-[#1a1a1a] z-15 will-change-transform"
                      style={{
                        transform: doorsOpen ? 'translateX(100%)' : 'translateX(0%)',
                        transition: 'transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      }}
                    >
                      <img
                        src="/images/door-chrome.jpg"
                        alt="Elevator Door Right"
                        className="w-full h-full object-cover object-right filter brightness-95 contrast-125 select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-transparent to-black/35 pointer-events-none" />

                      {/* Right half of the logo pinned to the left edge */}
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-black/75 border border-white/20 p-3 flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-md">
                          <img
                            src="/images/gc-logo.png"
                            alt="Gotham Collage Seal Right"
                            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,184,0,0.5)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. Center Door Seam Recess */}
                    {!doorsOpen && (
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black shadow-[0_0_6px_rgba(0,0,0,0.9)] z-25 pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>

              {/* Up/Down Direction Arrows Beside the Doors */}
              <div className="hidden sm:flex flex-col items-center justify-center space-y-3 p-2.5 rounded-xl border border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md shadow-2xl">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#a1a1aa] writing-mode-vertical">
                  CALL
                </div>
                
                <button
                  onClick={() => {
                    const selectable = ['01', '02', '03', '04'];
                    const curIdx = selectable.indexOf(currentFloor);
                    if (curIdx < selectable.length - 1) {
                      handleFloorJump(selectable[curIdx + 1]);
                    }
                  }}
                  disabled={isRideInProgress || currentFloor === '04'}
                  className={`w-9 h-9 rounded-lg border font-mono text-sm flex items-center justify-center transition-all duration-300 ${
                    isRideInProgress || currentFloor === '04'
                      ? 'border-white/5 bg-black/20 text-zinc-700 cursor-not-allowed'
                      : 'border-white/15 bg-black/60 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:bg-[#F5B800]/15 hover:shadow-[0_0_15px_rgba(245,184,0,0.4)] cursor-pointer active:scale-95'
                  }`}
                  title="Call Elevator Up"
                >
                  ▲
                </button>

                <button
                  onClick={() => {
                    const selectable = ['01', '02', '03', '04'];
                    const curIdx = selectable.indexOf(currentFloor);
                    if (curIdx > 0) {
                      handleFloorJump(selectable[curIdx - 1]);
                    } else if (currentFloor !== 'lobby') {
                      handleFloorJump('lobby');
                    }
                  }}
                  disabled={isRideInProgress || currentFloor === 'lobby'}
                  className={`w-9 h-9 rounded-lg border font-mono text-sm flex items-center justify-center transition-all duration-300 ${
                    isRideInProgress || currentFloor === 'lobby'
                      ? 'border-white/5 bg-black/20 text-zinc-700 cursor-not-allowed'
                      : 'border-white/15 bg-black/60 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:bg-[#F5B800]/10 hover:shadow-[0_0_15px_rgba(245,184,0,0.4)] cursor-pointer active:scale-95'
                  }`}
                  title="Call Elevator Down"
                >
                  ▼
                </button>
              </div>

            </div>
          </>
        )}

        {/* Right Side: Floor Panel (stays visible on every floor so user can jump at any time) */}
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end justify-center animate-fade-in z-20">
          <div className="flex flex-col items-center space-y-4 p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#0e0e0e]/85 backdrop-blur-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#a1a1aa] pb-2 border-b border-white/10 w-full justify-center">
              <span>FLOOR SELECTOR</span>
            </div>

            {/* Vertical Stack: 04, 03, 02, 01 */}
            <div className="flex flex-col space-y-3 w-44 sm:w-48">
              {floors.map((floor) => {
                const isSelected = (currentFloor === floor.id && !isRideInProgress) || (isRideInProgress && targetFloor === floor.id);
                const isKeyboardFocused = highlightedFloor === floor.id;

                return (
                  <button
                    key={floor.id}
                    onClick={() => handleFloorJump(floor.id)}
                    disabled={isRideInProgress}
                    className={`group relative flex items-center justify-between px-4 py-3 rounded-xl border font-mono transition-all duration-300 text-xs ${
                      isRideInProgress
                        ? isSelected
                          ? 'border-[#F5B800] bg-[#F5B800] text-black font-extrabold shadow-[0_0_25px_rgba(245,184,0,0.7)] scale-[1.03] cursor-wait'
                          : 'border-white/10 bg-[#121212]/50 text-zinc-600 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#F5B800] bg-[#F5B800] text-black font-extrabold shadow-[0_0_22px_rgba(245,184,0,0.65)] scale-[1.03] cursor-pointer'
                        : isKeyboardFocused
                        ? 'border-[#F5B800]/80 bg-[#141414] text-[#F5B800] shadow-[0_0_15px_rgba(245,184,0,0.3)] cursor-pointer'
                        : 'border-white/15 bg-[#141414]/90 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:shadow-[0_0_18px_rgba(245,184,0,0.4)] hover:scale-102 cursor-pointer'
                    }`}
                  >
                    <span className="font-display text-sm tracking-wider">
                      {floor.id}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider truncate max-w-[95px] ${
                        isSelected
                          ? 'text-black/85 font-bold'
                          : 'text-[#8a8a88] group-hover:text-[#F5B800]'
                      }`}
                    >
                      {floor.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-black shadow-[0_0_6px_black]" />
                    )}
                  </button>
                );
              })}

              {/* Lobby Button */}
              <button
                onClick={() => handleFloorJump('lobby')}
                disabled={isRideInProgress}
                className={`group relative flex items-center justify-between px-4 py-2.5 rounded-xl border font-mono transition-all duration-300 text-xs ${
                  isRideInProgress
                    ? targetFloor === 'lobby'
                      ? 'border-[#F5B800] bg-[#F5B800] text-black font-extrabold shadow-[0_0_20px_rgba(245,184,0,0.6)] cursor-wait'
                      : 'border-white/10 bg-[#121212]/50 text-zinc-600 cursor-not-allowed'
                    : currentFloor === 'lobby'
                    ? 'border-[#F5B800] bg-[#F5B800] text-black font-extrabold shadow-[0_0_20px_rgba(245,184,0,0.6)] cursor-pointer'
                    : 'border-white/15 bg-[#141414]/90 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:shadow-[0_0_15px_rgba(245,184,0,0.3)] cursor-pointer'
                }`}
              >
                <span className="font-display text-xs tracking-wider">00</span>
                <span className={`text-[10px] uppercase tracking-wider ${currentFloor === 'lobby' ? 'text-black font-bold' : 'text-[#8a8a88] group-hover:text-[#F5B800]'}`}>
                  LOBBY
                </span>
                {currentFloor === 'lobby' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                )}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex sm:hidden items-center justify-center space-x-3 pt-2 w-full border-t border-white/10">
              <button
                onClick={() => {
                  const selectable = ['01', '02', '03', '04'];
                  const curIdx = selectable.indexOf(currentFloor);
                  if (curIdx < selectable.length - 1) handleFloorJump(selectable[curIdx + 1]);
                }}
                disabled={isRideInProgress || currentFloor === '04'}
                className="w-8 h-8 rounded-lg border border-white/15 bg-black/60 flex items-center justify-center text-xs text-[#a1a1aa] hover:border-[#F5B800] hover:text-[#F5B800] transition-all cursor-pointer"
              >
                ▲
              </button>
              <button
                onClick={() => {
                  const selectable = ['01', '02', '03', '04'];
                  const curIdx = selectable.indexOf(currentFloor);
                  if (curIdx > 0) handleFloorJump(selectable[curIdx - 1]);
                  else if (currentFloor !== 'lobby') handleFloorJump('lobby');
                }}
                disabled={isRideInProgress || currentFloor === 'lobby'}
                className="w-8 h-8 rounded-lg border border-white/15 bg-black/60 flex items-center justify-center text-xs text-[#a1a1aa] hover:border-[#F5B800] hover:text-[#F5B800] transition-all cursor-pointer"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}