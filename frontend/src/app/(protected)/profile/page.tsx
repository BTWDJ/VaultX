'use client';

import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  const { user } = session;

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
        <p className="text-slate-500 text-sm">Manage your vault account settings</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card p-8 flex flex-col gap-6"
      >
        {/* User Badge */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="font-extrabold text-xl">{user.name}</h3>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">
              {(user as any).role} Account
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="flex flex-col gap-4 border-t border-slate-200/50 dark:border-slate-800/30 pt-6">
          <div className="flex items-center gap-3 p-4 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-250/20">
            <Mail className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</span>
              <span className="text-sm font-semibold">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-250/20">
            <Shield className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Security Clearance</span>
              <span className="text-sm font-semibold">AES-256 Encrypted Vault Access</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-250/20">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Member Since</span>
              <span className="text-sm font-semibold">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
