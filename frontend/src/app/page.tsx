'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Lock, Shield, Key, RefreshCw, Sun, Moon, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Lock className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            VaultX
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center clay-card clay-card-hover cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
          
          <Link href="/login" className="px-5 py-2 text-sm font-semibold hover:text-blue-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-semibold clay-btn">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Side Copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 w-fit">
            <Shield className="w-3.5 h-3.5" /> End-to-End Encrypted Storage
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Secure Your Digital World in a{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Soft-Clay Vault
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            VaultX stores, organizes, and protects your passwords under AES-256 encryption. Beautiful design meets military-grade security.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Link href="/register" className="px-8 py-3.5 text-base font-bold clay-btn gap-2">
              Start Free Vault <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="px-8 py-3.5 text-base font-bold clay-card clay-card-hover text-center min-w-[160px]">
              Access Vault
            </Link>
          </div>
        </motion.div>

        {/* Right Side Visual: Claymorphic Lock Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          className="flex items-center justify-center"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Soft decorative background circles */}
            <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            
            {/* The Claymorphic 3D Lock */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-56 h-56 rounded-[40px] bg-gradient-to-tr from-yellow-300 to-amber-400 dark:from-yellow-400 dark:to-amber-500 border border-white/40 shadow-[10px_10px_25px_rgba(0,0,0,0.15),-10px_-10px_25px_rgba(255,255,255,0.9),inset_4px_4px_8px_rgba(255,255,255,0.7),inset_-4px_-4px_8px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative z-10"
            >
              {/* Shackle */}
              <div className="absolute -top-12 w-28 h-24 border-8 border-slate-700 dark:border-slate-800 border-b-0 rounded-t-full -z-10"></div>
              
              {/* Keyhole */}
              <div className="w-8 h-12 bg-slate-800 dark:bg-slate-900 rounded-full relative shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-slate-800 dark:bg-slate-900"></div>
              </div>
              
              {/* Pulse glow */}
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] absolute top-6 right-8"></div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-slate-100/50 dark:bg-slate-950/20 py-20 px-6 w-full border-t border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Security Features You Can Trust</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your credentials are safer than ever with modern encryption and zero-knowledge configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="clay-card p-8 flex flex-col gap-4 clay-card-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shadow-inner">
                <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">AES-256 Encryption</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Plaintext passwords never hit the database. Credentials are encrypted at rest with Node.js crypto ciphers.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="clay-card p-8 flex flex-col gap-4 clay-card-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shadow-inner">
                <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">Smart Generator</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Generate highly secure, random passwords dynamically. Select length, symbols, numbers, and case adjustments.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="clay-card p-8 flex flex-col gap-4 clay-card-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold">Inactivity Lockout</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Your browser vault locks automatically after a period of user inactivity to prevent unauthorized physical access.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200/50 dark:border-slate-800/30 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} VaultX. All rights reserved. Created for portfolio presentation.
      </footer>
    </div>
  );
}
