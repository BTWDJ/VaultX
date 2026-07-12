'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Search, 
  Star, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit, 
  Trash2, 
  Download, 
  X,
  ExternalLink,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react';
import PasswordGenerator from '@/app/components/PasswordGenerator';
import { authClient } from '@/lib/auth-client';

interface VaultItem {
  id: string;
  websiteName: string;
  websiteUrl?: string;
  username?: string;
  password?: string;
  notes?: string;
  categoryId?: string;
  favorite: boolean;
  category?: { id: string; name: string };
  createdAt: string;
}

export default function VaultPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [revealPasswordId, setRevealPasswordId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(activeTimeouts.current).forEach(timer => clearTimeout(timer));
      setRevealedPasswords({});
      setRevealPasswordId(null);
    };
  }, []);
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  // Form states
  const [websiteName, setWebsiteName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [favorite, setFavorite] = useState(false);

  // Password Generator overlay
  const [showGenOverlay, setShowGenOverlay] = useState(false);

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Array<{ id: string; name: string }>>('/categories'),
  });

  // Fetch Vault Items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['vault-items', selectedCategory, search],
    queryFn: () => {
      let url = '/vault?';
      if (selectedCategory === 'favorites') {
        url += 'favorite=true';
      } else if (selectedCategory !== 'all') {
        url += `categoryId=${selectedCategory}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      return apiFetch<VaultItem[]>(url);
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/vault', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setAddModalOpen(false);
      resetForm();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiFetch(`/vault/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setEditModalOpen(false);
      resetForm();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/vault/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const resetForm = () => {
    setWebsiteName('');
    setWebsiteUrl('');
    setUsername('');
    setPassword('');
    setNotes('');
    setCategoryId('');
    setFavorite(false);
    setSelectedItem(null);
  };

  const handleOpenEdit = async (item: VaultItem) => {
    try {
      const res = await apiFetch<VaultItem>(`/vault/${item.id}`);
      setSelectedItem(item);
      setWebsiteName(item.websiteName);
      setWebsiteUrl(item.websiteUrl || '');
      setUsername(item.username || '');
      setPassword(res.password || '');
      setNotes(item.notes || '');
      setCategoryId(item.categoryId || '');
      setFavorite(item.favorite);
      setEditModalOpen(true);
    } catch (err) {
      console.error('Failed to load item password for editing:', err);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      websiteName,
      websiteUrl,
      username,
      password,
      notes,
      categoryId: categoryId || undefined,
      favorite,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    updateMutation.mutate({
      id: selectedItem.id,
      data: {
        websiteName,
        websiteUrl,
        username,
        password,
        notes,
        categoryId: categoryId || null,
        favorite,
      },
    });
  };

  const handleToggleFavorite = (item: VaultItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { favorite: !item.favorite },
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleReveal = async (itemId: string) => {
    if (revealPasswordId === itemId) {
      // User manual hide - cancel timer and erase password
      if (activeTimeouts.current[itemId]) {
        clearTimeout(activeTimeouts.current[itemId]);
        delete activeTimeouts.current[itemId];
      }
      setRevealedPasswords(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setRevealPasswordId(null);
      return;
    }

    // Cancel existing timeout if any
    if (activeTimeouts.current[itemId]) {
      clearTimeout(activeTimeouts.current[itemId]);
      delete activeTimeouts.current[itemId];
    }

    let pwd = revealedPasswords[itemId];
    if (!pwd) {
      try {
        const res = await apiFetch<{ password: string }>(`/vault/${itemId}/reveal`);
        pwd = res.password;
        setRevealedPasswords(prev => ({ ...prev, [itemId]: pwd }));
      } catch (err) {
        console.error('Failed to reveal password:', err);
        return;
      }
    }

    setRevealPasswordId(itemId);

    // Set 10-second auto-clear timeout
    const timer = setTimeout(() => {
      setRevealedPasswords(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setRevealPasswordId(currentId => currentId === itemId ? null : currentId);
      delete activeTimeouts.current[itemId];
    }, 10000);

    activeTimeouts.current[itemId] = timer;
  };

  const handleCopyPassword = async (itemId: string) => {
    let pwd = revealedPasswords[itemId];
    if (pwd) {
      copyToClipboard(pwd, `pass-${itemId}`);
      return;
    }

    try {
      const res = await apiFetch<{ password: string }>(`/vault/${itemId}/reveal`);
      copyToClipboard(res.password, `pass-${itemId}`);
    } catch (err) {
      console.error('Failed to fetch password for copying:', err);
    }
  };

  const handleSelectPassword = async (gen: string) => {
    setPassword(gen);
    setShowGenOverlay(false);
    try {
      await apiFetch('/audit', {
        method: 'POST',
        body: JSON.stringify({ action: 'password generator usage' }),
      });
    } catch (err) {
      console.error('Failed to log generator usage audit:', err);
    }
  };

  // Export JSON
  const handleExportJSON = async () => {
    try {
      const data = await apiFetch<any[]>('/vault/export/json', { method: 'POST' });
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaultx_export_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const session = await authClient.getSession();
      const token = session.data?.session?.token;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/vault/export/csv`, {
        method: 'POST',
        headers
      });
      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaultx_export_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Vault</h1>
          <p className="text-slate-500 text-sm">Retrieve and manage your encrypted login keys</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export button */}
          <div className="relative group">
            <button className="w-11 h-11 rounded-2xl flex items-center justify-center clay-card clay-card-hover cursor-pointer">
              <Download className="w-5 h-5 text-slate-500" />
            </button>
            <div className="absolute right-0 top-12 hidden group-hover:flex flex-col gap-1.5 p-2.5 clay-card bg-white dark:bg-[#0f141c] z-20 min-w-[140px] shadow-lg">
              <button onClick={handleExportJSON} className="text-xs font-bold py-2 px-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                Export JSON
              </button>
              <button onClick={handleExportCSV} className="text-xs font-bold py-2 px-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                Export CSV
              </button>
            </div>
          </div>

          <button 
            onClick={() => { resetForm(); setAddModalOpen(true); }} 
            className="clay-btn py-3 px-6 gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-1 relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials..."
            className="w-full pl-11 pr-4 py-3.5 clay-input text-sm"
          />
        </div>

        {/* Categories Pill filters */}
        <div className="md:col-span-2 flex gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-inner'
                : 'clay-card text-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              selectedCategory === 'favorites'
                ? 'bg-amber-500 text-white shadow-inner'
                : 'clay-card text-slate-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" /> Favorites
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white shadow-inner'
                  : 'clay-card text-slate-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-200/50 dark:bg-slate-800/30 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-extrabold text-xl">No credentials found</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Add a new credential or modify your filters to see items inside your vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="clay-card p-6 flex flex-col gap-4 clay-card-hover justify-between"
              >
                <div className="flex flex-col gap-3">
                  {/* Top Row: Title, Fav and Domain */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-250/20">
                        {item.websiteUrl ? (
                          <Globe className="w-4.5 h-4.5 text-blue-500" />
                        ) : (
                          <Key className="w-4.5 h-4.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm">{item.websiteName}</span>
                        {item.websiteUrl && (
                          <a 
                            href={item.websiteUrl.startsWith('http') ? item.websiteUrl : `https://${item.websiteUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                          >
                            Go to site <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFavorite(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${item.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    </button>
                  </div>

                  {/* Username/Email */}
                  <div className="flex flex-col gap-1 p-3 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Username / Email</span>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold truncate">{item.username || '—'}</span>
                      {item.username && (
                        <button
                          onClick={() => copyToClipboard(item.username!, `user-${item.id}`)}
                          className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-850/50 rounded-lg"
                        >
                          {copiedId === `user-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1 p-3 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</span>
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-mono text-xs truncate max-w-[140px] font-bold">
                        {revealPasswordId === item.id ? (revealedPasswords[item.id] || '••••••••••••') : '••••••••••••'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleReveal(item.id)}
                          className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-850/50 rounded-lg"
                        >
                          {revealPasswordId === item.id ? (
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyPassword(item.id)}
                          className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-850/50 rounded-lg"
                        >
                          {copiedId === `pass-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet if present */}
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/20 dark:bg-slate-900/10 p-2.5 rounded-xl border border-dotted border-slate-250/20 line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Footer Card Actions: Category and Edit/Delete */}
                <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/20 pt-3 mt-1">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-full max-w-[100px] truncate">
                    {item.category?.name || 'Uncategorized'}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modals */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg clay-card p-6 flex flex-col gap-6 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/30 pb-3">
              <h3 className="font-extrabold text-xl">
                {addModalOpen ? 'Add Secure Key' : 'Edit Credential'}
              </h3>
              <button 
                onClick={() => { setAddModalOpen(false); setEditModalOpen(false); resetForm(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center clay-card hover:text-red-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Website Name *</label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. Steam"
                    className="w-full px-4 py-3.5 clay-input text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Website URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. steamcommunity.com"
                    className="w-full px-4 py-3.5 clay-input text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3.5 clay-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
                  <button
                    type="button"
                    onClick={() => setShowGenOverlay(!showGenOverlay)}
                    className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate
                  </button>
                </div>
                
                {showGenOverlay && (
                  <PasswordGenerator onSelectPassword={handleSelectPassword} />
                )}

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure key"
                  className="w-full px-4 py-3.5 clay-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3.5 clay-input text-sm bg-transparent cursor-pointer"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="dark:bg-[#0f141c]">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="favorite-check"
                    checked={favorite}
                    onChange={(e) => setFavorite(e.target.checked)}
                    className="rounded border-slate-350 text-blue-650 focus:ring-blue-550 w-4.5 h-4.5 accent-blue-550 cursor-pointer"
                  />
                  <label htmlFor="favorite-check" className="text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer">
                    Favorite
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about the account..."
                  rows={2}
                  className="w-full px-4 py-3 clay-input text-sm rounded-2xl resize-none"
                />
              </div>

              <button type="submit" className="clay-btn py-4 mt-2 font-bold text-sm w-full cursor-pointer">
                {addModalOpen ? 'Save Key' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
