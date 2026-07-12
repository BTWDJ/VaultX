'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { Key, Star, Shield, LayoutGrid, Clock, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'User';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiFetch('/vault/stats'),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Fallback defaults
  const total = stats?.total ?? 0;
  const favorites = stats?.favorites ?? 0;
  const recent = stats?.recent ?? [];
  const categories = stats?.categories ?? [];

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Welcome Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-500 text-sm">
          Here is a summary of your encrypted credentials. Your master key is secure.
        </p>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clay-card p-6 flex items-center justify-between clay-card-hover"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Credentials</span>
            <span className="text-4xl font-extrabold">{total}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Key className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        {/* Favorites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="clay-card p-6 flex items-center justify-between clay-card-hover"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Favorites</span>
            <span className="text-4xl font-extrabold">{favorites}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Star className="w-7 h-7 text-amber-500" />
          </div>
        </motion.div>

        {/* Health / Security rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="clay-card p-6 flex items-center justify-between clay-card-hover"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vault Health</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2">
              <ShieldCheck className="w-5 h-5" /> Secured
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-emerald-500" />
          </div>
        </motion.div>
      </div>

      {/* Categories & Recent Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 clay-card p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <LayoutGrid className="w-5 h-5 text-slate-500" />
            <h3 className="font-extrabold text-lg">Categories</h3>
          </div>

          {categories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <p className="text-sm text-slate-400 font-semibold">No category data</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {categories.map((cat: any) => (
                <div key={cat.categoryId || 'uncategorized'} className="flex items-center justify-between p-3.5 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/20">
                  <span className="text-sm font-semibold">{cat.categoryName}</span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                    {cat.count} items
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recently Added Items */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 clay-card p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h3 className="font-extrabold text-lg">Recently Added</h3>
            </div>
            <Link href="/vault" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-pulse mb-2" />
              <p className="text-sm text-slate-500 font-semibold">Your vault is empty</p>
              <Link href="/vault" className="text-xs font-bold text-blue-500 hover:underline mt-1">
                Add your first password
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/20 hover:bg-slate-100/80 dark:hover:bg-slate-900/40 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{item.websiteName}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-[280px]">
                      {item.username || 'No username'}
                    </span>
                  </div>
                  {item.category && (
                    <span className="text-xs font-bold px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-full">
                      {item.category.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
