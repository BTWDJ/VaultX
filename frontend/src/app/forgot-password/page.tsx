'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ShieldAlert, ArrowLeft, Send, Sun, Moon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useTheme } from 'next-themes';

export default function ForgotPasswordPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await (authClient as any).forgetPassword({
        email,
        redirectTo: '/reset-password',
      });

      if (result.error) {
        setError(result.error.message || 'Failed to send reset link.');
      } else {
        setSuccess('Password reset link has been sent to your email.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-screen px-6 py-12">
      {/* Theme Toggler */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full flex items-center justify-center clay-card clay-card-hover cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md clay-card p-8 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mb-2">
            <Mail className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Reset Master Password</h2>
          <p className="text-sm text-slate-500">We'll send a password recovery link to your inbox</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/30">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-900/30">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3.5 clay-input text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 clay-btn text-sm font-bold gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Recovery Link'}
            {!loading && <Send className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
