import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut } from 'lucide-react';

/**
 * MemberDashboard: Authenticated member profile workspace.
 * Features:
 * - Natural unshaded Gotham Tower background view
 * - Minimal greeting ("Hi, [First Name]")
 * - Induction document retrieval
 * - Announcements display (General Broadcasts + Personal Direct Messages)
 */
export default function MemberDashboard() {
  const { user, logout, viewWelcomeLetter } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Extract first name (e.g. 'Marcus' from 'Marcus Chen')
  const firstName = user?.full_name ? user.full_name.trim().split(/\s+/)[0] : 'Member';

  // Fetch announcements for this member (general + personal)
  useEffect(() => {
    async function loadAnnouncements() {
      try {
        setLoadingAnnouncements(true);
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.announcements)) {
            setAnnouncements(data.announcements);
          }
        }
      } catch (err) {
        console.warn('Error fetching announcements:', err);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <div className="relative h-[100dvh] flex flex-col justify-between p-4 sm:p-12 lg:p-16 text-white overflow-hidden">
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
      <div className="max-w-lg space-y-2 sm:space-y-4 text-left animate-fade-in pt-3 sm:pt-6 relative z-10">
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
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
      <div className="max-w-md w-full text-left space-y-1.5 animate-fade-in pb-4 sm:pb-2 pt-0 relative z-10">
        <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-white uppercase font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          GOTHAM COLLAGE
        </p>

        <div className="flex items-center space-x-2">
          <h2 className="font-serif text-xs tracking-widest uppercase text-zinc-200 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Announcements
          </h2>
          {announcements.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              {announcements.length}
            </span>
          )}
        </div>

        {loadingAnnouncements ? (
          <div className="pt-1 text-[11px] font-mono text-zinc-400 tracking-wider uppercase animate-pulse">
            Checking announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="pt-1 text-[11px] font-mono text-zinc-300 tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            No Active Announcements
          </div>
        ) : (
          <div className="max-h-28 sm:max-h-44 overflow-y-auto space-y-2 pr-1 pt-1">
            {announcements.map((item) => {
              const isPersonal = item.target_type === 'PERSONAL';
              return (
                <div
                  key={item.id}
                  className={`p-2.5 sm:p-3 rounded-lg backdrop-blur-md border text-left transition-all ${
                    isPersonal
                      ? 'bg-amber-950/50 border-amber-500/50 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                      : 'bg-black/70 border-white/25 shadow-[0_2px_10px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                        isPersonal
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                          : 'bg-white/10 text-zinc-300 border border-white/20'
                      }`}
                    >
                      {isPersonal ? '★ Direct to You' : 'Studio Broadcast'}
                    </span>
                    {item.created_at && (
                      <span className="text-[9px] font-mono text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xs font-bold text-white drop-shadow leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed mt-1 whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
