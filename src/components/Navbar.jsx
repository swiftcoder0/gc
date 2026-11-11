import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, currentScreen, logout } = useAuth();

  // Remove top navbar on welcome, login, induction, and member profile screens
  // This eliminates the top line and duplicate logo/title completely!
  if (!user || currentScreen !== 'admin_dashboard') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080A]/90 backdrop-blur-md transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-black border border-[#272935] p-0.5 flex items-center justify-center">
            <img 
              src="/assets/images/gotham-logo.jpg" 
              alt="Gotham Collage" 
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
            />
          </div>
          <div>
            <span className="font-serif tracking-[0.2em] text-xs sm:text-sm font-bold text-white uppercase block leading-none">
              Gotham Collage
            </span>
            <p className="text-[9px] tracking-wider uppercase font-mono text-[#5E6273] mt-0.5">
              Building What's Next.
            </p>
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-white block uppercase">
              {isAdmin ? 'ADMIN' : user.full_name}
            </span>
            <span className="text-[10px] font-mono text-[#7B8092] uppercase">
              {isAdmin ? 'System Admin' : user.designation}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-red-950/40 hover:border-red-800/60 bg-red-950/15 hover:bg-red-950/30 text-[11px] font-mono text-red-300 transition-all"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
