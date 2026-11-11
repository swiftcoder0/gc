import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, UserCheck, Shield } from 'lucide-react';

/**
 * WelcomeScreen: Landing portal for Gotham Collage.
 * Provides two primary gateways:
 * 1. MEMBER: Access personal venture studio dashboard & induction credentials.
 * 2. ADMIN: Studio management & registry administration.
 */
export default function WelcomeScreen() {
  const { openMemberLogin, openAdminLogin } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[280px] bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm text-center space-y-8 animate-fade-in relative z-10">
        {/* Branding Section: Logo in middle, GOTHAM COLLAGE, Building What's Next. */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/80 p-1 flex items-center justify-center">
              <img
                src="/assets/images/gotham-logo.jpg"
                alt="Gotham Collage"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              GOTHAM COLLAGE
            </h1>
            <p className="font-mono text-xs text-[#9599A8] tracking-widest uppercase">
              Building What's Next.
            </p>
          </div>
        </div>

        {/* Two Options: MEMBER and ADMIN */}
        <div className="pt-2 space-y-3.5">
          {/* 1. MEMBER */}
          <div
            onClick={openMemberLogin}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openMemberLogin()}
            className="group w-full rounded-lg border border-[#262836] hover:border-white/40 bg-[#0E0F14] hover:bg-[#15161E] p-4 sm:p-5 cursor-pointer transition-all duration-200 text-left flex items-center justify-between shadow-lg shadow-black/40 hover:shadow-black/70"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded border border-[#262836] bg-[#12131A] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-white/30 transition-all shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="font-serif text-base font-bold tracking-wider text-white uppercase">
                MEMBER
              </span>
            </div>

            <div className="text-[#656A7C] group-hover:text-white transition-colors ml-3 shrink-0">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. ADMIN */}
          <div
            onClick={openAdminLogin}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openAdminLogin()}
            className="group w-full rounded-lg border border-[#262836] hover:border-white/40 bg-[#0E0F14] hover:bg-[#15161E] p-4 sm:p-5 cursor-pointer transition-all duration-200 text-left flex items-center justify-between shadow-lg shadow-black/40 hover:shadow-black/70"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded border border-[#262836] bg-[#12131A] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-white/30 transition-all shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-serif text-base font-bold tracking-wider text-white uppercase">
                ADMIN
              </span>
            </div>

            <div className="text-[#656A7C] group-hover:text-white transition-colors ml-3 shrink-0">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Confidential Footer */}
        <div className="pt-3 text-center">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#4D5060]">
            Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
