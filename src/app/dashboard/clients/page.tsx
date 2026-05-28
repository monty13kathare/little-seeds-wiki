'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  LuUsers as Users, LuPlus as Plus, LuTrash2 as Trash2, LuEye as Eye, LuEyeOff as EyeOff, LuCopy as Copy, LuCheck as Check,
  LuX as X, LuCircleAlert as AlertCircle, LuMail as Mail, LuLock as Lock, LuUser as User2, LuBriefcase as Briefcase,
  LuShieldCheck as ShieldCheck, LuRefreshCw as RefreshCw, LuPen as Edit3, LuExternalLink as ExternalLink, LuFolderOpen as FolderOpen
} from 'react-icons/lu';
import { cn, toSlug } from '@/lib/utils';
import axios from 'axios';
import { Select } from '@/components/ui/select';

interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedProjectId: string | null;
  avatar: string;
  createdAt: string;
}

type ModalMode = 'create' | 'edit';

const emptyForm = { name: '', email: '', password: '', assignedProjectId: '' };

export default function ClientsAdminPage() {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const router = useRouter();

  const projectOptions = projects.map(p => ({
    value: p.id,
    label: p.name,
    icon: <span className="text-sm select-none">{p.icon}</span>,
  }));

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin' || user?.role === 'ADMIN';

  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Misc UI state
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ClientUser | null>(null);

  useEffect(() => {
    if (!isAdmin) { router.replace('/dashboard'); return; }
    fetchProjects();
    loadClients();
  }, [isAdmin]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      if (res.data.success) setClients(res.data.data);
    } catch {}
    setLoading(false);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Open create modal ────────────────────────────────────────────────────────
  const openCreate = () => {
    setModalMode('create');
    setEditingClient(null);
    setForm(emptyForm);
    setShowPassword(false);
    setShowModal(true);
  };

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (client: ClientUser) => {
    setModalMode('edit');
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      password: '',                                     // blank → keep existing
      assignedProjectId: client.assignedProjectId || '',
    });
    setShowPassword(false);
    setShowModal(true);
  };

  // ── Submit (create or update) ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalMode === 'create') {
        if (!form.name || !form.email || !form.password || !form.assignedProjectId) {
          showToast('All fields are required for new clients.', 'error');
          setSaving(false);
          return;
        }
        const res = await axios.post('/api/users', form);
        if (res.data.success) {
          setClients(prev => [res.data.data, ...prev]);
          setShowModal(false);
          showToast('Client account created!', 'success');
        } else {
          showToast(res.data.message || 'Failed to create client.', 'error');
        }
      } else {
        // Edit — only send changed / non-empty fields
        if (!form.name || !form.email || !form.assignedProjectId) {
          showToast('Name, email and project are required.', 'error');
          setSaving(false);
          return;
        }
        const payload: any = {
          id: editingClient!.id,
          name: form.name,
          email: form.email,
          assignedProjectId: form.assignedProjectId,
        };
        if (form.password) payload.password = form.password;

        const res = await axios.patch('/api/users', payload);
        if (res.data.success) {
          setClients(prev => prev.map(c => c.id === editingClient!.id ? res.data.data : c));
          setShowModal(false);
          showToast('Client updated successfully!', 'success');
        } else {
          showToast(res.data.message || 'Failed to update client.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Something went wrong.', 'error');
    }
    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const openDelete = (client: ClientUser) => setDeleteTarget(client);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await axios.delete('/api/users', { data: { id: deleteTarget.id } });
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Client removed successfully.', 'success');
    } catch {
      showToast('Failed to delete client.', 'error');
    }
    setDeletingId(null);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getPortalUrl = (projectId: string | null) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    const slugOrId = project ? toSlug(project.name) : projectId;
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/client/${slugOrId}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground font-outfit uppercase tracking-wider flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" /> Client Portal Access
          </h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Create and manage client accounts with project-scoped doc access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadClients}
            className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Client
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
          <span className="font-black text-foreground">How it works:</span> Create a client account and assign them to a project. They'll log in with their email + password and see{' '}
          <span className="font-bold text-foreground">only that project's published documents</span> — no admin dashboard, no other projects.
        </p>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="bg-accent/40 border-b border-border px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {clients.length} Client{clients.length !== 1 ? 's' : ''} Registered
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mr-3" />
            <span className="text-xs font-bold">Loading clients…</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 px-8">
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-black text-foreground">No clients yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">Create your first client account to give portal access to a project's documentation.</p>
            <button
              onClick={openCreate}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Client
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {clients.map(client => {
              const project = projects.find(p => p.id === client.assignedProjectId);
              const portalUrl = getPortalUrl(client.assignedProjectId);
              const isNotAssigned = !client.assignedProjectId;

              return (
                <div key={client.id} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/20 transition-all group">

                  {/* Avatar */}
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-9 h-9 rounded-xl border border-border object-cover shrink-0"
                  />

                  {/* Name + Email */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">{client.name}</p>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded-md tracking-wide shrink-0">
                        {client.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 shrink-0" /> {client.email}
                    </p>
                  </div>

                  {/* Assigned Project */}
                  <div className="hidden md:block shrink-0 min-w-[160px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Project Access</p>
                    {isNotAssigned ? (
                      <button
                        onClick={() => openEdit(client)}
                        className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold underline underline-offset-2">Assign project</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-base shrink-0">{project?.icon || '📂'}</span>
                        <span className="text-[11px] font-bold text-foreground truncate max-w-[110px]">
                          {project?.name || client.assignedProjectId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">

                    {/* Portal Link */}
                    {portalUrl && (
                      <button
                        onClick={() => copyText(portalUrl, `link-${client.id}`)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-all"
                        title="Copy portal link"
                      >
                        {copied === `link-${client.id}`
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3" />
                        }
                        <span className="hidden lg:inline">{copied === `link-${client.id}` ? 'Copied!' : 'Link'}</span>
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(client)}
                      className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                      title="Edit client"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => openDelete(client)}
                      disabled={deletingId === client.id}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                      title="Remove client"
                    >
                      {deletingId === client.id
                        ? <span className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin inline-block" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">

            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground font-outfit uppercase tracking-wider">
                {modalMode === 'create' ? 'Create Client Account' : 'Edit Client Account'}
              </h2>
              <p className="text-xs text-muted-foreground font-bold">
                {modalMode === 'create'
                  ? 'Client will log in and see only their assigned project docs.'
                  : `Editing ${editingClient?.name} — leave password blank to keep existing.`
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl border border-border bg-background focus-within:border-primary/50 transition-all">
                  <User2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="flex-1 bg-transparent text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Address</label>
                <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl border border-border bg-background focus-within:border-primary/50 transition-all">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jane@company.com"
                    className="flex-1 bg-transparent text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Password{modalMode === 'edit' && <span className="normal-case font-semibold text-muted-foreground/60 ml-1">(leave blank to keep current)</span>}
                </label>
                <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl border border-border bg-background focus-within:border-primary/50 transition-all">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={modalMode === 'create'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={modalMode === 'edit' ? '••••••••  (unchanged)' : 'Create a secure password'}
                    className="flex-1 bg-transparent text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Assigned Project */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Assign Project</label>
                <Select
                  value={form.assignedProjectId}
                  onChange={val => setForm(f => ({ ...f, assignedProjectId: val }))}
                  options={projectOptions}
                  placeholder="— Select a project —"
                  className={cn(
                    "w-full",
                    !form.assignedProjectId && "border-amber-500/50"
                  )}
                />
                {!form.assignedProjectId && (
                  <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> A project must be assigned for client portal access.
                  </p>
                )}
              </div>

              {/* Preview: what the client will see */}
              {form.assignedProjectId && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2.5">
                  <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Client Portal URL</p>
                    <p className="text-[10px] font-bold text-primary truncate">
                      {`/client/${toSlug(projects.find(p => p.id === form.assignedProjectId)?.name || form.assignedProjectId)}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  ) : (
                    modalMode === 'create' ? 'Create Client' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 relative">

            {/* Close */}
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={!!deletingId}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-foreground font-outfit uppercase tracking-wider">Delete Client?</h2>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  This will permanently remove this client account. They will no longer be able to log in.
                </p>
              </div>
            </div>

            {/* Client preview card */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15">
              <img
                src={deleteTarget.avatar}
                alt={deleteTarget.name}
                className="w-9 h-9 rounded-xl border border-border object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{deleteTarget.name}</p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0" /> {deleteTarget.email}
                </p>
                {deleteTarget.assignedProjectId && (
                  <p className="text-[10px] text-rose-400 font-bold mt-0.5">
                    {projects.find(p => p.id === deleteTarget.assignedProjectId)?.name
                      ? `Access to: ${projects.find(p => p.id === deleteTarget.assignedProjectId)?.name} will be revoked`
                      : 'Portal access will be revoked'}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-accent transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
                  : <><Trash2 className="w-3.5 h-3.5" /> Delete Client</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-bold max-w-sm animate-in slide-in-from-bottom-4 duration-200',
          toast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100'
            : 'bg-rose-950/80 border-rose-500/30 text-rose-100'
        )}>
          {toast.type === 'success'
            ? <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
}
