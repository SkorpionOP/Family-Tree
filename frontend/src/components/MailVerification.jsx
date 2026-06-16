import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, RefreshCw, LogOut, Send } from 'lucide-react';

const MailVerification = () => {
  const { fbUser, checkVerificationStatus, resendVerification, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Cooldown timer for resending
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleCheck = async () => {
    setChecking(true);
    setMessage({ text: '', type: '' });
    try {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        setMessage({ text: 'Email verified successfully! Redirecting...', type: 'success' });
      } else {
        setMessage({ text: 'Email not verified yet. Please check your inbox and spam folder.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Verification check failed', type: 'error' });
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setMessage({ text: '', type: '' });
    try {
      await resendVerification();
      setMessage({ text: 'Verification email resent successfully!', type: 'success' });
      setCooldown(60); // 1 minute cooldown
    } catch (err) {
      setMessage({ text: err.message || 'Failed to resend verification email', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#020617] flex items-center justify-center font-sans relative overflow-hidden px-4">
      {/* Decorative Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 p-8 space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-full text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5 animate-pulse">
            <Mail size={40} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-300 mt-2 max-w-sm">
            We've sent a verification link to <span className="text-emerald-400 font-semibold">{fbUser?.email}</span>. Please verify your email address to activate your account.
          </p>
          <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-2 rounded-xl mt-3.5 max-w-sm leading-relaxed text-center">
            ⚠️ <strong>Important:</strong> If the email is missing, check your <strong>Spam / Junk folder</strong> and mark it as "Not Spam".
          </div>
        </div>

        {message.text && (
          <div className={`text-xs px-4 py-3 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {checking ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>I Have Verified My Email</span>
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full flex items-center justify-center space-x-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-350 font-semibold text-xs py-3.5 rounded-xl transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {resending ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Resending...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Send size={14} className="opacity-50" />
                <span>Resend Link ({cooldown}s)</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Resend Verification Link</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-350 text-xs font-semibold mx-auto transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MailVerification;
