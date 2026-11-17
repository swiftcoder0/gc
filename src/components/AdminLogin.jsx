import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const { loginAdmin, backToWelcome, openMemberLogin } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both Admin Username and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginAdmin(username.trim(), password.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 w-full">
      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Navigation back */}
        <button
          onClick={backToWelcome}
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#74788A] hover:text-white mb-4 sm:mb-5 transition-colors group min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Card */}
        <div className="rounded-xl border border-[#2B2E3D] bg-[#0E0F14] p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Logo in middle, GOTHAM COLLAGE, Building What's Next */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black border border-white/10 shadow-md p-1 flex items-center justify-center">
                <img
                  src="/assets/images/gotham-logo.jpg"
                  alt="Gotham Collage Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
                />
              </div>
            </div>

            <div className="pt-1">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
                GOTHAM COLLAGE
              </h1>
              <p className="font-mono text-[10px] sm:text-xs text-[#8E93A6] tracking-widest uppercase mt-0.5">
                Building What's Next.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-900/60 bg-red-950/20 text-red-200 text-xs flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8C90A2]">
                Admin Username
              </label>
              <div className="relative rounded-lg bg-[#08080B] border border-[#272938] focus-within:border-white/50 transition-all">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-3 sm:py-2.5 bg-transparent text-sm sm:text-xs text-white placeholder-[#454756] font-mono focus:outline-none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8C90A2]">
                Password
              </label>
              <div className="relative rounded-lg bg-[#08080B] border border-[#272938] focus-within:border-white/50 transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-3 sm:py-2.5 bg-transparent text-sm sm:text-xs text-white placeholder-[#454756] font-mono focus:outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#55586B] hover:text-[#9EA2B4] transition-colors min-h-[44px] min-w-[36px] justify-center"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SIGN IN Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg font-mono text-xs uppercase tracking-widest font-semibold bg-white text-black hover:bg-[#E5E7EB] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2 min-h-[44px]"
            >
              {loading ? <span>Signing In...</span> : <span>Sign In as Admin</span>}
            </button>

            {/* Toggle to Member Login */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#656A7C]">Standard member?</span>
              <button
                type="button"
                onClick={openMemberLogin}
                className="text-[#9EA2B4] hover:text-[#F5B800] transition-colors uppercase tracking-wider cursor-pointer"
              >
                Member Portal →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
