import React, { useState } from 'react';
import {
  TreeDeciduous,
  GitBranch,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Heart,
  Network,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Check,
} from 'lucide-react';

const LandingPage = ({
  isLoginTab,
  setIsLoginTab,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  authProcess,
  showPassword,
  setShowPassword,
  showForgotPassword,
  setShowForgotPassword,
  resetSent,
  setResetSent,
  handleAuthSubmit,
  handleForgotPasswordSubmit,
  loginWithGoogle,
  setAuthProcess,
}) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Network size={22} />,
      title: 'Visual Family Tree',
      description: 'Interactive graph-based visualization with auto-layout powered by Dagre. See your entire lineage at a glance.',
      color: 'emerald',
    },
    {
      icon: <Heart size={22} />,
      title: 'Kinship Calculator',
      description: 'Discover exact relationship terms between any two family members using Dravidian kinship parity rules.',
      color: 'rose',
    },
    {
      icon: <Shield size={22} />,
      title: 'Role-Based Access',
      description: 'Fine-grained permissions with Admin, Sub-Admin, and Standard roles. Control who can edit your family data.',
      color: 'amber',
    },
    {
      icon: <Globe size={22} />,
      title: 'Cross-Tree Linking',
      description: 'Connect families across different trees through marriages. Navigate between linked lineages seamlessly.',
      color: 'cyan',
    },
  ];

  const stats = [
    { value: '∞', label: 'Generations' },
    { value: '3', label: 'Access Roles' },
    { value: '100%', label: 'Free Forever' },
  ];

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
  };

  return (
    <div className="min-h-screen w-screen bg-surface-0 font-sans relative overflow-y-auto overflow-x-hidden">
      {/* ══════════ AMBIENT BACKGROUND ══════════ */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-left glow */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px] animate-glow-pulse" />
        {/* Top-right glow */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />
        {/* Bottom glow */}
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-teal-500/[0.05] rounded-full blur-[130px] animate-glow-pulse" style={{ animationDelay: '3s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="sticky top-0 z-50 glass-heavy border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-xl flex items-center justify-center w-9 h-9 shadow-glow-sm">
                <img src="/fist.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wide gradient-text-brand uppercase leading-tight">
                  Sangam Roots
                </h1>
                <span className="text-[9px] text-slate-500 font-medium uppercase tracking-[0.15em] leading-tight block">
                  Family Heritage
                </span>
              </div>
            </div>
            <a
              href="#auth"
              className="btn-primary text-xs px-5 py-2 flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Pill badge */}
          <div className="animate-fade-in-up stagger-1 inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={13} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300/90">Powered by Dravidian Kinship Logic</span>
          </div>

          {/* Headline */}
          <h2 className="animate-fade-in-up stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            <span className="text-slate-100">Discover Your</span>
            <br />
            <span className="gradient-text">Family Heritage</span>
          </h2>

          {/* Subheadline */}
          <p className="animate-fade-in-up stagger-3 mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Build, visualize, and explore your family tree with{' '}
            <span className="text-slate-200 font-medium">mathematical precision</span>.
            Connect generations, discover kinship relationships, and preserve your lineage.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up stagger-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#auth"
              className="btn-primary text-sm px-8 py-3.5 flex items-center space-x-2 w-full sm:w-auto justify-center shadow-glow-md"
            >
              <span>Start Building Your Tree</span>
              <ArrowRight size={16} />
            </a>
            <a
              href="#features"
              className="btn-secondary text-sm px-8 py-3.5 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>Explore Features</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up stagger-5 mt-16 flex items-center justify-center gap-8 sm:gap-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text-brand">{stat.value}</div>
                <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-1/4 left-[8%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float hidden lg:block" />
        <div className="absolute top-1/3 right-[12%] w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-float-delayed hidden lg:block" />
        <div className="absolute bottom-1/4 left-[15%] w-1 h-1 bg-teal-400/40 rounded-full animate-float-slow hidden lg:block" />
      </section>

      {/* ══════════ FEATURES SECTION ══════════ */}
      <section id="features" className="relative py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-slate-800/40 border border-slate-700/30 rounded-full px-4 py-1.5 mb-6">
              <Zap size={13} className="text-emerald-400" />
              <span className="text-xs font-semibold text-slate-400">Core Features</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Everything You Need
            </h3>
            <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Purpose-built for mapping Dravidian kinship structures with unmatched precision and clarity.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((feature, i) => {
              const colors = colorMap[feature.color];
              return (
                <div
                  key={i}
                  onMouseEnter={() => setActiveFeature(i)}
                  className={`group relative p-6 sm:p-7 rounded-2xl border transition-all duration-500 cursor-default ${
                    activeFeature === i
                      ? `${colors.bg} ${colors.border} shadow-xl ${colors.glow}`
                      : 'bg-slate-900/30 border-slate-800/40 hover:bg-slate-900/50 hover:border-slate-700/40'
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-xl border mb-4 transition-colors duration-300 ${
                    activeFeature === i
                      ? `${colors.bg} ${colors.border}`
                      : 'bg-slate-800/30 border-slate-700/30'
                  }`}>
                    <span className={`transition-colors duration-300 ${
                      activeFeature === i ? colors.text : 'text-slate-400'
                    }`}>
                      {feature.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-100 mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS SECTION ══════════ */}
      <section className="relative py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Get Started in Minutes
            </h3>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Three simple steps to build your family tree
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Users size={24} />,
                title: 'Create Account',
                desc: 'Sign up with email or Google. Verify your identity to get started.',
              },
              {
                step: '02',
                icon: <GitBranch size={24} />,
                title: 'Build Your Tree',
                desc: 'Add family members, define relationships, and watch your tree come alive.',
              },
              {
                step: '03',
                icon: <Sparkles size={24} />,
                title: 'Discover Connections',
                desc: 'Use the kinship calculator to find relationships between any two members.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-slate-900/30 border border-slate-800/30 group hover:bg-slate-900/50 hover:border-slate-700/40 transition-all duration-300"
              >
                <div className="text-[64px] font-black text-slate-800/30 absolute -top-2 right-4 leading-none select-none group-hover:text-emerald-500/10 transition-colors duration-500">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-base font-bold text-slate-100 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AUTH SECTION ══════════ */}
      <section id="auth" className="relative py-20 sm:py-28 px-4">
        <div className="max-w-md mx-auto relative z-10">
          <div className="card overflow-hidden">
            {/* Logo header */}
            <div className="bg-surface-1/80 px-8 py-8 border-b border-slate-700/30 text-center flex flex-col items-center">
              <div className="bg-emerald-950/50 border border-emerald-500/25 p-3 rounded-2xl text-emerald-400 mb-4 shadow-glow-sm">
                <TreeDeciduous size={28} />
              </div>
              <h2 className="text-xl font-extrabold tracking-wide gradient-text-brand uppercase">
                Sangam Roots
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold tracking-[0.15em] uppercase mt-1">
                {showForgotPassword ? 'Reset your password' : 'Find your roots along with us'}
              </p>
            </div>

            {showForgotPassword ? (
              /* ── Forgot Password Form ── */
              <form onSubmit={handleForgotPasswordSubmit} className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-200">Forgot Password</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your email and we'll send a reset link.
                  </p>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl animate-fade-in">
                    {authError}
                  </div>
                )}

                {resetSent && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl animate-fade-in flex items-center space-x-2">
                    <Check size={14} />
                    <span>Reset email sent! Check your inbox.</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="section-label block">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authProcess}
                  className="btn-primary w-full text-xs font-bold py-3"
                >
                  {authProcess ? 'Processing...' : 'Send Reset Email'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setAuthError(''); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer bg-transparent border-none"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              /* ── Login / Register Form ── */
              <form onSubmit={handleAuthSubmit} className="p-8 space-y-5">
                {/* Tabs */}
                <div className="flex bg-slate-800/30 rounded-xl p-1 mb-1">
                  <button
                    type="button"
                    onClick={() => { setIsLoginTab(true); setAuthError(''); }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      isLoginTab
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsLoginTab(false); setAuthError(''); }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      !isLoginTab
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl animate-fade-in">
                    {authError}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="section-label block">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="section-label block">Password</label>
                    {isLoginTab && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setAuthError(''); }}
                        className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold tracking-wider uppercase transition-colors cursor-pointer bg-transparent border-none"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none p-0.5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={authProcess}
                  className="btn-primary w-full text-xs font-bold py-3"
                >
                  {authProcess ? 'Processing...' : isLoginTab ? 'Sign In to Account' : 'Create New Account'}
                </button>

                {/* Google Sign-In Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/40"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900/60 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setAuthProcess(true);
                    setAuthError('');
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setAuthError(err.message || 'Google Sign-In failed.');
                    } finally {
                      setAuthProcess(false);
                    }
                  }}
                  disabled={authProcess}
                  className="btn-secondary w-full text-xs font-semibold py-3 flex items-center justify-center space-x-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-slate-800/30 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-500">
            <TreeDeciduous size={16} className="text-emerald-500/60" />
            <span className="text-xs font-semibold">Sangam Roots</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-[11px] text-slate-600 text-center">
            Built with mathematical precision for Dravidian kinship structures.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
