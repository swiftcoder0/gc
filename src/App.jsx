import React from 'react';
import { useAuth } from './context/AuthContext';
import {
  Navbar,
  WelcomeScreen,
  MemberLogin,
  AdminLogin,
  InductionLetter,
  MemberDashboard,
  AdminDashboard,
} from './components';

export default function App() {
  const { currentScreen, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-white/20 p-1 flex items-center justify-center shadow-2xl animate-pulse">
          <img
            src="/assets/images/gotham-logo.jpg"
            alt="Gotham Collage"
            className="w-full h-full object-contain"
            onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
          />
        </div>
        <div className="text-xs font-mono tracking-[0.25em] uppercase text-[#73788C]">
          Initializing Gotham Syndicate Gateway...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F6FA] flex flex-col relative selection:bg-white selection:text-black">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'welcome' && <WelcomeScreen />}
        {currentScreen === 'member_login' && <MemberLogin />}
        {currentScreen === 'admin_login' && <AdminLogin />}
        {currentScreen === 'induction' && <InductionLetter />}
        {currentScreen === 'member_profile' && <MemberDashboard />}
        {currentScreen === 'admin_dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}
