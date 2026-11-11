import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut } from 'lucide-react';

/**
 * MemberDashboard: Authenticated member profile workspace.
 * Features:
 * - Natural unshaded Gotham Tower background view
 * - Minimal greeting ("Hi, [First Name]")
 * - Induction document retrieval
 * - Announcements display
 */
export default function MemberDashboard() {
  const { user, logout, viewWelcomeLetter } = useAuth();

  // Extract first name (e.g. 'Marcus' from 'Marcus Chen')
  const firstName = user?.full_name ? user.full_name.trim().split(/\s+/)[0] : 'Member';

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 text-white overflow-x-hidden">
      {/* Gotham Tower Background Video Loop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/images/gotham-tower.png"
          className="w-full h-full object-cover object-center"
        >
          <source src="/assets/video/gotham-tower-background.mp4" type="video/mp4" />
          <source src="/assets/video/gotham%20tower%20background.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Top Left: Large "Hi, [First Name]" greeting and member actions */}
      <div className="max-w-lg space-y-4 text-left animate-fade-in pt-4 sm:pt-6 relative z-10">
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          Hi, {firstName}
        </h1>

        {/* Minimal Actions below */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={viewWelcomeLetter}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-black/75 hover:bg-black/90 border border-white/30 hover:border-amber-400 text-xs font-mono text-amber-200 hover:text-white transition-all backdrop-blur-md shadow-xl active:scale-95 min-h-[42px]"
            title="View and download your official induction letter"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Induction Letter</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-red-950/70 hover:bg-red-900/90 border border-red-700/60 hover:border-red-500 text-xs font-mono text-red-200 transition-all backdrop-blur-md shadow-xl active:scale-95 min-h-[42px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Bottom Left: Announcements section with "GOTHAM COLLAGE" on top */}
      <div className="max-w-md w-full text-left space-y-1.5 animate-fade-in pb-4 sm:pb-2 pt-12 sm:pt-0 relative z-10">
        <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-white uppercase font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          GOTHAM COLLAGE
        </p>

        <h2 className="font-serif text-xs tracking-widest uppercase text-zinc-200 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          Announcements
        </h2>

        <div className="pt-1 text-[11px] font-mono text-zinc-300 tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          No Active Announcements
        </div>
      </div>
    </div>
  );
}
