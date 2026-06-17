'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Film, ArrowRight, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/workspace');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/workspace');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/workspace`,
        },
      });

      if (error) throw error;
      setMessage('Check your email for the magic link!');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/workspace`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-dm-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] bg-[#f0b429]/5 rounded-full blur-[120px] absolute" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center justify-center space-x-2 mb-10 group">
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:border-[#f0b429]/50 transition-colors">
            <Film className="h-6 w-6 text-[#f0b429]" />
          </div>
          <span className="text-3xl font-regular tracking-tighter text-white font-bebas-neue">CINEMA AI</span>
        </Link>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-regular mb-2 font-bebas-neue tracking-wide">
            Welcome Director
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            Sign in to access your workspace and start directing.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-[#f0b429]/10 border border-[#f0b429]/50 text-[#f0b429] p-3 rounded-xl text-sm mb-6">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Google Auth */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-bold rounded-xl py-3 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider font-bold">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* 2. Magic Link */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f0b429] transition-all text-white placeholder-gray-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black font-bold rounded-xl py-3 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 shadow-[0_0_15px_rgba(240,180,41,0.2)]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Magic Link'}
              </button>
            </form>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('dev_token', 'DEV_TOKEN');
                  router.push('/workspace');
                }}
                className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold rounded-xl py-3 mt-4 flex items-center justify-center hover:bg-red-500/20 transition-colors"
              >
                Skip Auth (DEV MODE)
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
