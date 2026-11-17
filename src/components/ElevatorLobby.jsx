import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

/**
 * ElevatorLobby — Screen 2: The Gotham Elevator Lobby
 * Governed strictly by SPEC (v2) and panel 2 of the reference mockup:
 * - Fullscreen Background: /public/images/lobby-bg.jpg
 * - Center Doorway: Live two sliding elevator door panels textured with /public/images/door-chrome.jpg
 * - Centered Logo: Real logo (/public/images/gc-logo.png) centered across the vertical door seam
 * - Thin vertical gold light strips on both sides that pulse softly (#F5B800)
 * - Left Side:
 *   - Eyebrow: THE ELEVATOR in gold (#F5B800)
 *   - Title: CHOOSE YOUR FLOOR (Unbounded display)
 *   - Sub line: "Explore the depths of Gotham." (Inter sans)
 * - Right Side:
 *   - Floor panel showing 04, 03, 02, 01 from top to bottom
 *   - Up/down direction arrows beside the doors
 *   - Selected floor filled gold, hover lights button in gold
 * - No ride animation yet.
 */
export default function ElevatorLobby({ onBackToPortal }) {
  const { openMemberLogin } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState('01'); // Default selected floor is 01

  const floors = [
    { id: '04', name: 'OUR VISION', description: 'From students to builders. From builders to founders.' },
    { id: '03', name: 'PROJECT ARCHIVE', description: 'Project 001 — Status: In Development' },
    { id: '02', name: 'THE METHOD', description: 'Build • Identify • Create' },
    { id: '01', name: 'ABOUT GOTHAM', description: 'Student-led venture studio foundry' },
  ];

  // Helper to step floors up/down
  const handleNextFloorUp = () => {
    const currentIndex = floors.findIndex((f) => f.id === selectedFloor);
    if (currentIndex > 0) setSelectedFloor(floors[currentIndex - 1].id);
  };

  const handleNextFloorDown = () => {
    const currentIndex = floors.findIndex((f) => f.id === selectedFloor);
    if (currentIndex < floors.length - 1) setSelectedFloor(floors[currentIndex + 1].id);
  };

  const currentFloorIdx = floors.findIndex((f) => f.id === selectedFloor);
  const canGoUp = currentFloorIdx > 0;
  const canGoDown = currentFloorIdx < floors.length - 1;

  return (
    <div className="relative w-full h-[100dvh] min-h-[700px] bg-[#0b0b0b] text-[#e8e8e6] overflow-hidden select-none font-sans">
      {/* 1. Fullscreen Background: /public/images/lobby-bg.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/lobby-bg.jpg"
          alt="Gotham Elevator Lobby"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Dark Gradients for Maximum Typographic & Door Legibility */}
        <div className="absolute inset-0 bg-[#0b0b0b]/35 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full md:w-5/12 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0b]/85 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-full md:w-5/12 bg-gradient-to-l from-[#0b0b0b] via-[#0b0b0b]/75 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0b0b0b]/95 via-[#0b0b0b]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0b0b] to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="relative z-30 w-full px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between">
        {/* Left: Logo + GOTHAM COLLAGE */}
        <a href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/70 border border-white/20 p-0.5 flex items-center justify-center group-hover:border-[#F5B800]/50 transition-colors shadow-lg">
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
                item.label === 'The Elevator' ? 'text-[#F5B800] font-semibold' : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Portal Access Button & Back to Portal */}
        <div className="flex items-center space-x-3">
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border border-white/20 text-[#a1a1aa] hover:text-white hover:border-white/50 bg-black/60 transition-all mr-1 active:scale-95"
            >
              ← Portal
            </button>
          )}

          <button
            onClick={openMemberLogin}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border border-[#F5B800] text-[#F5B800] bg-[#0b0b0b]/70 hover:bg-[#F5B800]/15 hover:text-white shadow-[0_0_15px_rgba(245,184,0,0.3)] active:scale-95"
          >
            Enter Portal
          </button>
        </div>
      </header>

      {/* 3. Main Center Stage */}
      <div className="relative z-20 h-[calc(100%-140px)] px-6 sm:px-10 lg:px-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8">
        
        {/* Left Side: Eyebrow in gold, Title, Sub line, Active level */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-4 sm:space-y-6 text-left animate-fade-in z-20">
          {/* Eyebrow in Gold */}
          <div className="inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#F5B800] shadow-[0_0_10px_#F5B800]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F5B800] font-semibold">
              THE ELEVATOR
            </span>
          </div>

          {/* Title in Unbounded Display */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.1]">
            CHOOSE YOUR
            <br />
            <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
              FLOOR.
            </span>
          </h1>

          {/* Sub Line */}
          <p className="font-sans text-sm sm:text-base text-[#a1a1aa] leading-relaxed max-w-sm">
            Explore the depths of Gotham.
          </p>

          {/* Active Level Detail Pill */}
          <div className="pt-2 sm:pt-4">
            <div className="inline-flex flex-col space-y-1.5 p-3.5 sm:p-4 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md max-w-xs shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#F5B800] font-semibold">
                  FLOOR {selectedFloor}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] animate-ping" />
              </div>
              <span className="text-xs sm:text-sm font-display uppercase tracking-wider text-white font-bold">
                {floors.find((f) => f.id === selectedFloor)?.name}
              </span>
              <span className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-snug">
                {floors.find((f) => f.id === selectedFloor)?.description}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Elevator Doors in the Central Doorway + Arrows Beside the Doors */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 z-20">
          
          {/* Main Elevator Door Structure */}
          <div className="relative w-[280px] sm:w-[350px] md:w-[390px] lg:w-[420px] aspect-[3/4.2] max-h-[540px] flex items-center justify-center">
            
            {/* Outer Elevator Portal Architectural Surround */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#2d2d2d] bg-[#0d0d0d] shadow-[0_15px_50px_rgba(0,0,0,0.95)] flex items-center justify-center p-3 sm:p-3.5">
              
              {/* Top Digital Floor & Direction Indicator Header */}
              <div className="absolute top-3.5 inset-x-0 flex items-center justify-between px-6 z-20 pointer-events-none">
                <div className="flex items-center space-x-2 bg-black/85 px-2.5 py-1 rounded border border-white/10 font-mono text-[11px]">
                  <span className={`${canGoUp ? 'text-[#F5B800] animate-pulse' : 'text-zinc-600'}`}>▲</span>
                  <span className={`${canGoDown ? 'text-[#F5B800] animate-pulse' : 'text-zinc-600'}`}>▼</span>
                </div>

                <div className="font-mono text-xs tracking-widest uppercase bg-black/90 px-3 py-1 rounded border border-[#F5B800]/40 text-[#F5B800] font-bold shadow-[0_0_12px_rgba(245,184,0,0.35)]">
                  LEVEL {selectedFloor}
                </div>
              </div>

              {/* Left Pulsing Gold Light Strip */}
              <div
                className="absolute left-2.5 sm:left-3 top-14 bottom-6 w-[2px] rounded-full z-20 animate-pulse pointer-events-none"
                style={{
                  backgroundColor: config.colors.gold,
                  boxShadow: `0 0 16px ${config.colors.gold}, 0 0 32px rgba(245, 184, 0, 0.65)`,
                  animationDuration: '3.2s',
                }}
              />

              {/* Right Pulsing Gold Light Strip */}
              <div
                className="absolute right-2.5 sm:right-3 top-14 bottom-6 w-[2px] rounded-full z-20 animate-pulse pointer-events-none"
                style={{
                  backgroundColor: config.colors.gold,
                  boxShadow: `0 0 16px ${config.colors.gold}, 0 0 32px rgba(245, 184, 0, 0.65)`,
                  animationDuration: '3.2s',
                }}
              />

              {/* Interior Elevator Aperture with Sliding Chrome Door Panels */}
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 flex shadow-inner bg-[#141414]">
                
                {/* Left Door Panel (Textured with door-chrome.jpg) */}
                <div className="relative w-1/2 h-full overflow-hidden border-r border-[#1a1a1a]">
                  <img
                    src="/images/door-chrome.jpg"
                    alt="Elevator Door Left"
                    className="w-full h-full object-cover object-left filter brightness-95 contrast-125 select-none pointer-events-none"
                  />
                  {/* Metallic brushed vertical sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35 pointer-events-none" />
                </div>

                {/* Right Door Panel (Textured with door-chrome.jpg) */}
                <div className="relative w-1/2 h-full overflow-hidden border-l border-[#1a1a1a]">
                  <img
                    src="/images/door-chrome.jpg"
                    alt="Elevator Door Right"
                    className="w-full h-full object-cover object-right filter brightness-95 contrast-125 select-none pointer-events-none"
                  />
                  {/* Metallic brushed vertical sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-transparent to-black/35 pointer-events-none" />
                </div>

                {/* Center Door Seam Recess */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black shadow-[0_0_6px_rgba(0,0,0,0.9)] z-10" />

                {/* Real Logo Centered Across the Doors */}
                <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
                  <div className="relative flex items-center justify-center">
                    {/* Subtle Pulsing Gold Ambient Aura */}
                    <div
                      className="absolute w-32 h-32 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
                      style={{ background: config.colors.goldGlow, animationDuration: '4s' }}
                    />

                    {/* Logo Seal */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-black/60 border border-white/20 p-3.5 flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-md">
                      <img
                        src="/images/gc-logo.png"
                        alt="Gotham Collage Seal"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,184,0,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Up/Down Direction Arrows Beside the Doors */}
          <div className="hidden sm:flex flex-col items-center justify-center space-y-3 p-2.5 rounded-xl border border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md shadow-2xl">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#a1a1aa] writing-mode-vertical">
              CALL
            </div>
            {/* Up Arrow Button */}
            <button
              onClick={handleNextFloorUp}
              disabled={!canGoUp}
              className={`w-9 h-9 rounded-lg border font-mono text-sm flex items-center justify-center transition-all duration-300 ${
                canGoUp
                  ? 'border-white/15 bg-black/60 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:bg-[#F5B800]/15 hover:shadow-[0_0_15px_rgba(245,184,0,0.4)] active:scale-95'
                  : 'border-white/5 bg-black/20 text-zinc-700 cursor-not-allowed'
              }`}
              title="Next Floor Up"
            >
              ▲
            </button>
            {/* Down Arrow Button */}
            <button
              onClick={handleNextFloorDown}
              disabled={!canGoDown}
              className={`w-9 h-9 rounded-lg border font-mono text-sm flex items-center justify-center transition-all duration-300 ${
                canGoDown
                  ? 'border-white/15 bg-black/60 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:bg-[#F5B800]/15 hover:shadow-[0_0_15px_rgba(245,184,0,0.4)] active:scale-95'
                  : 'border-white/5 bg-black/20 text-zinc-700 cursor-not-allowed'
              }`}
              title="Next Floor Down"
            >
              ▼
            </button>
          </div>

        </div>

        {/* Right Side: Floor Panel showing 04, 03, 02, 01 from top to bottom */}
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end justify-center animate-fade-in z-20">
          <div className="flex flex-col items-center space-y-4 p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#0e0e0e]/85 backdrop-blur-md shadow-2xl">
            {/* Floor Selector Header */}
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#a1a1aa] pb-2 border-b border-white/10 w-full justify-center">
              <span>FLOOR SELECTOR</span>
            </div>

            {/* Vertical Stack: 04, 03, 02, 01 */}
            <div className="flex flex-col space-y-3 w-44 sm:w-48">
              {floors.map((floor) => {
                const isSelected = selectedFloor === floor.id;
                return (
                  <button
                    key={floor.id}
                    onClick={() => setSelectedFloor(floor.id)}
                    className={`group relative flex items-center justify-between px-4 py-3 rounded-xl border font-mono transition-all duration-300 text-xs ${
                      isSelected
                        ? 'border-[#F5B800] bg-[#F5B800] text-black font-extrabold shadow-[0_0_22px_rgba(245,184,0,0.65)] scale-[1.03]'
                        : 'border-white/15 bg-[#141414]/90 text-[#e8e8e6] hover:border-[#F5B800] hover:text-[#F5B800] hover:shadow-[0_0_18px_rgba(245,184,0,0.4)] hover:scale-102'
                    }`}
                  >
                    <span className="font-display text-sm tracking-wider">
                      {floor.id}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider truncate max-w-[95px] ${
                      isSelected ? 'text-black/85 font-bold' : 'text-[#8a8a88] group-hover:text-[#F5B800]'
                    }`}>
                      {floor.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-black shadow-[0_0_6px_black]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile / Compact Direction Controls */}
            <div className="flex sm:hidden items-center justify-center space-x-3 pt-2 w-full border-t border-white/10">
              <button
                onClick={handleNextFloorUp}
                disabled={!canGoUp}
                className="w-8 h-8 rounded-lg border border-white/15 bg-black/60 flex items-center justify-center text-xs text-[#a1a1aa] hover:border-[#F5B800] hover:text-[#F5B800] transition-all"
                title="Next Floor Up"
              >
                ▲
              </button>
              <button
                onClick={handleNextFloorDown}
                disabled={!canGoDown}
                className="w-8 h-8 rounded-lg border border-white/15 bg-black/60 flex items-center justify-center text-xs text-[#a1a1aa] hover:border-[#F5B800] hover:text-[#F5B800] transition-all"
                title="Next Floor Down"
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
