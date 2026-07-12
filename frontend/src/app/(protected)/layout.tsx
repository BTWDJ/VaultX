'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { 
  Lock, 
  LayoutDashboard, 
  Key, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Clock
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { data: session, isPending } = authClient.useSession();
  
  // Inactivity Auto-Logout settings (5 minutes in milliseconds = 300,000)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; 
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up inactivity timer
  useEffect(() => {
    if (!session) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleAutoLogout, INACTIVITY_TIMEOUT);
    };

    const handleAutoLogout = async () => {
      console.log('User inactive. Auto-logging out...');
      try {
        await apiFetch('/audit', {
          method: 'POST',
          body: JSON.stringify({ action: 'logout', metadata: { reason: 'inactivity' } }),
        });
      } catch (err) {
        console.error('Failed to log auto-logout audit:', err);
      }
      await authClient.signOut();
      router.push('/login?reason=inactivity');
    };

    // Events to track user activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session, router]);

  const handleLogout = async () => {
    try {
      await apiFetch('/audit', {
        method: 'POST',
        body: JSON.stringify({ action: 'logout', metadata: { reason: 'manual' } }),
      });
    } catch (err) {
      console.error('Failed to log logout audit:', err);
    }
    await authClient.signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center animate-spin">
          <Lock className="w-6 h-6 text-blue-500" />
        </div>
        <p className="mt-4 text-sm text-slate-500 font-semibold">Loading secure environment...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Let middleware redirect
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vault', path: '/vault', icon: Key },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if ((session.user as any).role === 'admin') {
    menuItems.push({ name: 'Admin', path: '/admin', icon: Clock }); // Use simple icon for Admin
  }

  const sidebarContent = (
    <div className="flex flex-col h-full gap-8 p-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Lock className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          VaultX
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all relative ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl -z-10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.2),inset_-2px_-2px_4px_rgba(0,0,0,0.15)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer controls / User Card */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-850/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4)]">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[110px]">{session.user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {(session.user as any).role}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full flex items-center justify-center clay-card clay-card-hover cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Lock Vault
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex min-h-screen bg-slate-50 dark:bg-[#07090e]">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-20 p-4">
        <div className="h-full clay-card bg-white/70 dark:bg-[#0f141c]/70">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/30 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lock className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg">VaultX</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center clay-card cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm">
            <aside className="w-64 h-full bg-white dark:bg-[#0f141c] shadow-2xl relative animate-slide-in">
              {sidebarContent}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </aside>
          </div>
        )}

        {/* Main Content body */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
