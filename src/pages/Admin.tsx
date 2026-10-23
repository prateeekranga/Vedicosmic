import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Settings as SettingsIcon, Lock, LogOut, ShieldCheck, ShieldAlert, Wrench, Newspaper,
} from 'lucide-react';
import { TOOLS, TOOL_CATEGORIES, liveTools } from '@/content/routes';
import { BLOG_POSTS } from '@/data/blog';
import {
  getAdminAccess, onAdminAuthChange, adminLogin, adminLogout, changeAdminPassword, getAdminEmail, type AdminAccess,
} from '@/lib/adminAuth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { BlogManager } from '@/components/admin/BlogManager';
import { AdminBar, ADMIN_BAR_HEIGHT } from '@/components/admin/AdminBar';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { useSEO } from '@/hooks/useSEO';

const ACCENT = ['#FFD700', '#39B7F0', '#8B5CF6', '#0D9488', '#F0D080', '#E63427'];

/** Gates the whole dashboard behind a Supabase session on the admin allowlist (see
 *  lib/adminAuth.ts). `onAdminAuthChange` re-checks on every sign-in, sign-out or token
 *  expiry, so the dashboard drops back to the login screen without a reload. */
export default function Admin() {
  const [access, setAccess] = useState<AdminAccess | 'checking'>('checking');
  useSEO({ key: 'admin', path: '/vc-portal-x7', title: 'Admin · VediCosmic', description: 'Internal admin dashboard.', noindex: true });

  useEffect(() => {
    const check = () => { getAdminAccess().then(setAccess); };
    check();
    return onAdminAuthChange(check);
  }, []);

  if (access === 'checking') return null;
  if (access === 'signed-out') return <AdminLogin />;
  if (access === 'not-admin') return <NotAnAdmin />;
  return <AdminShell unchecked={access === 'unchecked'} onLogout={() => { adminLogout(); }} />;
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const result = await adminLogin(email, password);
    setBusy(false);
    // On success, the onAdminAuthChange subscription in Admin() re-checks access on its own.
    if (!result.ok) setErr(result.error);
  };

  return (
    <div className="container-vc flex min-h-[80vh] items-center justify-center py-20">
      <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-cosmic-light/40 p-8 backdrop-blur-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="mb-6 text-center">
          <span className="grid mx-auto mb-3 h-12 w-12 place-items-center rounded-full bg-gold-400/10 text-gold-300"><Lock className="h-6 w-6" /></span>
          <h1 className="font-heading text-h3 text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-white/50">Sign in with your VediCosmic admin account to manage the site.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input id="admin-email" type="email" label="Email" value={email} autoComplete="username" required
            onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
          <Input id="admin-password" type="password" label="Password" value={password} error={err} required
            autoComplete="current-password" placeholder="••••••••"
            onChange={(e) => { setPassword(e.target.value); setErr(''); }} />
          <Button type="submit" className="w-full" disabled={busy}>
            <ShieldCheck className="mr-2 h-4 w-4" /> {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function NotAnAdmin() {
  return (
    <div className="container-vc flex min-h-[80vh] items-center justify-center py-20">
      <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-cosmic-light/40 p-8 text-center backdrop-blur-md">
        <span className="grid mx-auto mb-3 h-12 w-12 place-items-center rounded-full bg-error/10 text-error"><ShieldAlert className="h-6 w-6" /></span>
        <h1 className="font-heading text-h3 text-white">Not an admin account</h1>
        <p className="mt-2 text-sm text-white/55">This account is signed in but is not on the admin allowlist.</p>
        <Button variant="ghost" className="mt-6" onClick={() => { adminLogout(); }}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'blog', label: 'Blog', Icon: Newspaper },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
] as const;
type TabId = typeof TABS[number]['id'];

function AdminShell({ unchecked, onLogout }: { unchecked: boolean; onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [email, setEmail] = useState<string | undefined>();
  useEffect(() => { getAdminEmail().then(setEmail); }, []);

  return (
    <div className="min-h-screen bg-cosmic-darker">
      <AdminBar email={email} onLogout={onLogout} />
      <div style={{ paddingTop: ADMIN_BAR_HEIGHT }}>
        {unchecked && (
          <div role="alert" className="border-b border-warning/30 bg-warning/10 px-5 py-3 text-sm text-warning">
            The admin allowlist is not installed, so any signed-in account can open this dashboard and edit
            blog posts. Run <code>supabase/policies.sql</code> in the Supabase SQL editor and turn off public
            sign-ups to lock it down.
          </div>
        )}
        {/* Mobile: horizontal scrollable tab bar instead of a fixed sidebar */}
        <nav className="flex gap-2 overflow-x-auto border-b border-white/10 bg-cosmic-dark/60 px-3 py-2.5 lg:hidden">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                tab === id ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
              }`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </nav>

        <div className="lg:flex">
          {/* Desktop: persistent, sticky sidebar — stays put while the content column scrolls,
              same as wp-admin's left menu. */}
          <aside className="hidden shrink-0 border-r border-white/10 bg-cosmic-dark/60 lg:block lg:w-[210px]">
            <div className="sticky flex flex-col overflow-y-auto py-5" style={{ top: ADMIN_BAR_HEIGHT, height: `calc(100vh - ${ADMIN_BAR_HEIGHT}px)` }}>
              <div className="mb-5 flex items-center gap-2 px-4">
                <Logo />
                <span className="rounded-full border border-gold-400/30 bg-gold-400/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold-300">Admin</span>
              </div>
              <nav className="flex flex-col gap-0.5 px-2">
                {TABS.map(({ id, label, Icon }) => (
                  <span key={id}>
                    {id === 'settings' && <span className="my-2 block border-t border-white/8" />}
                    <button onClick={() => setTab(id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-all ${
                        tab === id ? 'border-gold-400 bg-gold-400/10 text-gold-200' : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                      }`}>
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  </span>
                ))}
              </nav>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-5 sm:p-8">
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'blog' && <BlogManager />}
            {tab === 'settings' && <SettingsPanel onLogout={onLogout} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, Icon }: { label: string; value: string; sub?: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-white/45">{label}</span>
        <Icon className="h-4 w-4 text-gold-300" />
      </div>
      <p className="mt-2 font-heading text-h2 text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
    </div>
  );
}

function Dashboard() {
  // Same merged list the public Blog page uses: static posts plus live database posts.
  const { posts: allPosts, loading: postsLoading } = useAllBlogPosts();
  const live = liveTools();
  const catData = useMemo(() => TOOL_CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => ({ name: c.label, value: live.filter((t) => t.category === c.id).length })), [live]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h3 text-white">At a Glance</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tools live" value={`${live.length}`} sub={`${TOOLS.length - live.length} coming soon`} Icon={Wrench} />
        <StatCard label="Posts live" value={postsLoading ? '…' : `${allPosts.length}`} sub={`${BLOG_POSTS.length} static + database`} Icon={Newspaper} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-5 lg:max-w-xl">
        <h3 className="mb-4 font-heading text-h5 text-white">Live tools by category</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name} (${e.value})`}
              labelLine={false} style={{ fontSize: 10 }}>
              {catData.map((_, i) => <Cell key={i} fill={ACCENT[i % ACCENT.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SettingsPanel({ onLogout }: { onLogout: () => void }) {
  const [p1, setP1] = useState(''); const [p2, setP2] = useState('');
  const [msg, setMsg] = useState(''); const [msgOk, setMsgOk] = useState(false); const [busy, setBusy] = useState(false);
  const changePass = async () => {
    setMsg('');
    if (p1.length < 8) { setMsg('Use at least 8 characters.'); setMsgOk(false); return; }
    if (p1 !== p2) { setMsg('Passwords do not match.'); setMsgOk(false); return; }
    setBusy(true);
    const result = await changeAdminPassword(p1);
    setBusy(false);
    if (result.ok) { setMsg('Password updated.'); setMsgOk(true); setP1(''); setP2(''); }
    else { setMsg(result.error); setMsgOk(false); }
  };
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h3 text-white">Settings</h1>
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Change password</h3>
        <p className="text-xs text-white/45">A real, server-side change to the signed-in admin account.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="np1" type="password" label="New password" value={p1} onChange={(e) => { setP1(e.target.value); setMsg(''); }} />
          <Input id="np2" type="password" label="Confirm password" value={p2} onChange={(e) => { setP2(e.target.value); setMsg(''); }} />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={changePass} disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
          {msg && <span className={`text-sm ${msgOk ? 'text-success' : 'text-error'}`}>{msg}</span>}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6">
        <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" /> Log out</Button>
      </div>
    </div>
  );
}
