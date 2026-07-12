'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { Users, Key, FolderOpen, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  // Redirect if not admin
  useEffect(() => {
    if (!isPending && (!session || (session.user as any).role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Admin Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiFetch('/admin/stats'),
    enabled: (session?.user as any)?.role === 'admin',
  });

  // Users List
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch<any[]>('/admin/users'),
    enabled: (session?.user as any)?.role === 'admin',
  });

  // Role toggle mutation
  const roleMutation = useMutation({
    mutationFn: (userId: string) => apiFetch(`/admin/users/${userId}/role`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  if (isPending || !session || (session.user as any).role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center">
        <p className="text-sm text-slate-500 font-semibold">Checking authorization...</p>
      </div>
    );
  }

  const isLoading = statsLoading || usersLoading;

  return (
    <div className="flex-1 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-sm">System-wide monitoring and user management</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      ) : (
        <>
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="clay-card p-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Users</span>
                <span className="text-4xl font-extrabold">{stats?.users ?? 0}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="clay-card p-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Credentials Stored</span>
                <span className="text-4xl font-extrabold">{stats?.credentials ?? 0}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Key className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="clay-card p-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</span>
                <span className="text-4xl font-extrabold">{stats?.categories ?? 0}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-card p-6 flex flex-col gap-4 overflow-hidden"
          >
            <h3 className="font-extrabold text-lg">User Directory</h3>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/30 text-slate-500 font-bold">
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Registered</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-100/50 dark:border-slate-850/10 hover:bg-slate-100/30 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-4 font-semibold">{u.name}</td>
                      <td className="py-4 px-4 font-mono text-xs">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-150 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => roleMutation.mutate(u.id)}
                          className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          disabled={u.id === session.user.id}
                        >
                          <Award className="w-3.5 h-3.5" /> Toggle Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
