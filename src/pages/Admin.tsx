import { useMemo, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useEffect } from 'react';
import {
  LayoutDashboard, GraduationCap, Wrench, Megaphone, Settings as SettingsIcon,
  Lock, LogOut, RotateCcw, Download, ShieldCheck, Eye, EyeOff, Star, IndianRupee, Users,
  FileText, Search, Plus, Newspaper,
} from 'lucide-react';
import { COURSES } from '@/data/courses';
import { TOOLS, TOOL_CATEGORIES } from '@/data/tools';
import { BLOG_POSTS } from '@/data/blog';
import { STATIC_ROUTES } from '@/data/routes';
import { formatINR } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import { isBlogAdminAuthed, onAdminAuthChange, adminLogin, adminLogout, changeAdminPassword, getAdminEmail } from '@/lib/adminAuth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { ArrayEditor } from '@/components/admin/ArrayEditor';
import { CourseEditorModal, blankCourse } from '@/components/admin/CourseEditorModal';
import { BlogManager } from '@/components/admin/BlogManager';
import { AdminBar, ADMIN_BAR_HEIGHT } from '@/components/admin/AdminBar';
import { AdminNoticeBanner } from '@/components/admin/AdminNotice';
import { StatusFilterPills } from '@/components/admin/StatusFilterPills';
import { BulkActionBar, type BulkAction } from '@/components/admin/BulkActionBar';
import { useAdminNotice } from '@/hooks/useAdminNotice';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import {
  getCourseOverrides, setCourseOverride, getToolOverrides, setToolOverride,
  getAnnouncement, setAnnouncement, resetCourseOverrides, resetToolOverrides, exportOverrides,
  mergedCourses, isCustomCourseId, addCustomCourse, deleteCustomCourse,
  getFeatureFlags, setFeatureFlag, isToolComingSoon,
  type Announcement,
} from '@/lib/overrides';
import {
  mergedHomeContent, setHomeContent, resetHomeContent,
  mergedAboutContent, setAboutContent, resetAboutContent,
  mergedContactContent, setContactContent, resetContactContent,
  getSEOOverrides, setSEOOverride, resetSEOOverrides, exportSiteContent,
} from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import type { CourseLevel, Course } from '@/types/course.types';
import type { HomeContent, AboutContent, ContactContent } from '@/types/content.types';

const ACCENT = ['#FFD700', '#39B7F0', '#8B5CF6', '#0D9488', '#F0D080', '#E63427'];

/** Gates the *entire* dashboard (every tab, not just Blog → Database Posts) behind a single
 *  server-verified Supabase session — replaces the old browser-local passcode, which had no
 *  real enforcement (no rate limiting, first-visitor-wins passcode creation, a hash sitting in
 *  localStorage) and only ever protected `localStorage`-only tabs anyway. `onAdminAuthChange`
 *  means a session expiring or a manual sign-out anywhere (this tab, another tab, the Settings
 *  panel) immediately drops the whole dashboard back to the login screen — no page reload needed. */
export default function Admin() {
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>('checking');

  useEffect(() => {
    isBlogAdminAuthed().then((ok) => setStatus(ok ? 'authed' : 'unauthed'));
    return onAdminAuthChange((ok) => setStatus(ok ? 'authed' : 'unauthed'));
  }, []);

  if (status === 'checking') return null;
  if (status === 'unauthed') return <AdminLogin />;
  return <AdminShell onLogout={() => { adminLogout(); }} />;
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
    // On success, the onAdminAuthChange subscription in Admin() flips status to 'authed'
    // on its own — no local state to set here.
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
        <p className="mt-4 text-center text-xs text-white/35">
          Server-verified sign-in — the same account protects every tab here, including the blog's Database Posts.
        </p>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', Icon: GraduationCap },
  { id: 'tools', label: 'Tools', Icon: Wrench },
  { id: 'blog', label: 'Blog', Icon: Newspaper },
  { id: 'content', label: 'Site Content', Icon: FileText },
  { id: 'seo', label: 'SEO', Icon: Search },
  { id: 'announce', label: 'Announcement', Icon: Megaphone },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
] as const;
type TabId = typeof TABS[number]['id'];

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [email, setEmail] = useState<string | undefined>();
  useEffect(() => { getAdminEmail().then(setEmail); }, []);
  useSEO({ key: 'admin', path: '/admin', title: 'Admin · VediCosmic', description: 'Internal admin dashboard.', noindex: true });

  return (
    <div className="min-h-screen bg-cosmic-darker">
      <AdminBar email={email} onLogout={onLogout} />
      <div style={{ paddingTop: ADMIN_BAR_HEIGHT }}>
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
            {tab === 'courses' && <CoursesManager />}
            {tab === 'tools' && <ToolsManager />}
            {tab === 'blog' && <BlogManager />}
            {tab === 'content' && <SiteContentManager />}
            {tab === 'seo' && <SEOManager />}
            {tab === 'announce' && <AnnouncementManager />}
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
  useOverridesVersion();
  const { user } = useAuth();
  const cOv = getCourseOverrides(); const tOv = getToolOverrides();
  const allCourses = mergedCourses();
  const visibleCourses = allCourses.filter((c) => !cOv[c.id]?.hidden);
  const visibleTools = TOOLS.filter((t) => !tOv[t.id]?.hidden);
  // Merges the 32 static posts with live DB-authored ones, same source of truth the public
  // Blog page uses — the static-only count this used to show (visibleBlogPosts()) silently
  // under-reported once posts could also be written from the Database Posts editor.
  const { posts: allPosts, loading: postsLoading } = useAllBlogPosts();
  const livePosts = allPosts;
  const enrollments = allCourses.reduce((s, c) => s + c.enrollmentCount, 0);
  const revenue = allCourses.reduce((s, c) => s + c.price * c.enrollmentCount, 0);
  const avgRating = (allCourses.reduce((s, c) => s + c.rating, 0) / allCourses.length).toFixed(2);

  const enrollData = useMemo(() => [...allCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 8)
    .map((c) => ({ name: c.title.split(' ').slice(0, 2).join(' '), value: c.enrollmentCount })), [allCourses]);
  const catData = useMemo(() => TOOL_CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => ({ name: c.label, value: TOOLS.filter((t) => t.category === c.id).length })), []);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h3 text-white">At a Glance</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tools live" value={`${visibleTools.length}`} sub={`of ${TOOLS.length} total`} Icon={Wrench} />
        <StatCard label="Courses live" value={`${visibleCourses.length}`} sub={`of ${allCourses.length} total`} Icon={GraduationCap} />
        <StatCard label="Total enrollments" value={enrollments.toLocaleString('en-IN')} sub="across all courses" Icon={Users} />
        <StatCard label="Est. revenue" value={formatINR(revenue)} sub="price × enrollments" Icon={IndianRupee} />
        <StatCard label="Posts live" value={postsLoading ? '…' : `${livePosts.length}`} sub={`${BLOG_POSTS.length} static + database`} Icon={Newspaper} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-5">
          <h3 className="mb-4 font-heading text-h5 text-white">Enrollments by course</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={enrollData} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-5">
          <h3 className="mb-4 font-heading text-h5 text-white">Tools by category · avg rating {avgRating}★</h3>
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

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-5">
        <h3 className="mb-3 font-heading text-h5 text-white">This browser's activity</h3>
        {user ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Mini label="Signed in as" value={user.displayName} />
            <Mini label="Enrolled" value={`${user.enrolledCourses.length}`} />
            <Mini label="Saved readings" value={`${user.savedReadings.length}`} />
            <Mini label="Mantra streak" value={`${user.mantraStreak.currentStreak} days`} />
          </div>
        ) : <p className="text-sm text-white/45">No user is signed in on this device. Local-first data appears here when someone signs in.</p>}
      </div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 truncate font-medium text-white">{value}</p></div>;
}

const COURSE_BULK_ACTIONS: BulkAction[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'feature', label: 'Mark as Featured' },
  { value: 'unfeature', label: 'Remove Featured' },
  { value: 'delete', label: 'Delete (custom courses only)' },
];

function CoursesManager() {
  const v = useOverridesVersion();
  const ov = getCourseOverrides();
  const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const [editorSeed, setEditorSeed] = useState<Course | null>(null);
  const allRows = mergedCourses();
  const flags = getFeatureFlags();
  const { notice, notify, dismiss } = useAdminNotice();
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState('');

  const visibleCount = allRows.filter((c) => !ov[c.id]?.hidden).length;
  const hiddenCount = allRows.length - visibleCount;
  const rows = allRows.filter((c) => {
    if (statusFilter === 'visible') return !ov[c.id]?.hidden;
    if (statusFilter === 'hidden') return !!ov[c.id]?.hidden;
    return true;
  });

  const saveCourse = (course: Course) => {
    if (COURSES.some((bc) => bc.id === course.id)) {
      const { id: _id, slug: _slug, ...patch } = course;
      setCourseOverride(course.id, patch);
    } else {
      addCustomCourse(course);
    }
    notify('success', `"${course.title || 'Untitled'}" saved.`);
  };

  const toggleSelectAll = (checked: boolean) => setSelected(checked ? new Set(rows.map((c) => c.id)) : new Set());
  const toggleSelect = (id: string, checked: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });

  const applyBulk = () => {
    if (!bulkValue || selected.size === 0) return;
    let count = 0; let skipped = 0;
    selected.forEach((id) => {
      if (bulkValue === 'show') { setCourseOverride(id, { hidden: false }); count++; }
      else if (bulkValue === 'hide') { setCourseOverride(id, { hidden: true }); count++; }
      else if (bulkValue === 'feature') { setCourseOverride(id, { isFeatured: true }); count++; }
      else if (bulkValue === 'unfeature') { setCourseOverride(id, { isFeatured: false }); count++; }
      else if (bulkValue === 'delete') {
        if (isCustomCourseId(id)) { deleteCustomCourse(id); count++; } else skipped++;
      }
    });
    const label = COURSE_BULK_ACTIONS.find((a) => a.value === bulkValue)?.label ?? 'Action';
    notify('success', `${label}: ${count} course${count === 1 ? '' : 's'} updated.${skipped ? ` ${skipped} built-in course${skipped === 1 ? '' : 's'} skipped — only custom courses can be deleted.` : ''}`);
    setSelected(new Set());
    setBulkValue('');
  };

  return (
    <div className="space-y-4" key={v}>
      {notice && <AdminNoticeBanner notice={notice} onDismiss={dismiss} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-h3 text-white">Courses</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setEditorSeed(blankCourse())}><Plus className="mr-2 h-4 w-4" /> Add New Course</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all course changes?')) { resetCourseOverrides(); notify('success', 'All course changes reset.'); } }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <StatusFilterPills value={statusFilter} onChange={setStatusFilter} options={[
        { id: 'all', label: 'All', count: allRows.length },
        { id: 'visible', label: 'Visible', count: visibleCount },
        { id: 'hidden', label: 'Hidden', count: hiddenCount },
      ]} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-cosmic-light/40 p-5">
        <div>
          <p className="font-medium text-white">Show "Coming Soon" on the public Courses page</p>
          <p className="mt-0.5 text-xs text-white/45">When on, visitors see a Coming Soon notice instead of the course catalog at /courses.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={flags.coursesComingSoon}
            onChange={(e) => setFeatureFlag({ coursesComingSoon: e.target.checked })}
            className="h-4 w-4 accent-gold-400" /> Coming Soon
        </label>
      </div>

      <BulkActionBar actions={COURSE_BULK_ACTIONS} selectedCount={selected.size} value={bulkValue} onChange={setBulkValue} onApply={applyBulk} />

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)} className="h-4 w-4 accent-gold-400" aria-label="Select all" />
              </th>
              <th className="p-3">Course</th><th className="p-3">Level</th><th className="p-3">Price (₹)</th><th className="p-3 text-center">Featured</th><th className="p-3 text-center">Visible</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const o = ov[c.id] ?? {};
              const hidden = !!o.hidden;
              const custom = isCustomCourseId(c.id);
              return (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={(e) => toggleSelect(c.id, e.target.checked)}
                      className="h-4 w-4 accent-gold-400" aria-label={`Select ${c.title}`} />
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-white">{c.title || <span className="text-white/30">Untitled</span>}</p>
                    <p className="text-xs text-white/40">{c.slug}{custom && <span className="ml-2 text-brand-cyan-300">custom</span>}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                      <button onClick={() => setEditorSeed(c)} className="text-brand-cyan-soft hover:underline">Edit</button>
                      <a href={`/courses/${c.slug}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white hover:underline">View</a>
                      {custom && (
                        <button onClick={() => { if (confirm(`Delete "${c.title}" permanently?`)) { deleteCustomCourse(c.id); notify('success', `"${c.title}" deleted.`); } }}
                          className="text-error/70 hover:text-error hover:underline">Delete</button>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <select value={o.level ?? c.level} onChange={(e) => setCourseOverride(c.id, { level: e.target.value as CourseLevel })}
                      className="rounded-lg border border-white/15 bg-cosmic-dark/70 px-2 py-1 text-white">
                      {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <input type="number" min={0} value={o.price ?? c.price} onChange={(e) => setCourseOverride(c.id, { price: Math.max(0, Number(e.target.value)) })}
                      className="w-24 rounded-lg border border-white/15 bg-cosmic-dark/70 px-2 py-1 text-white" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={o.isFeatured ?? !!c.isFeatured} onChange={(e) => setCourseOverride(c.id, { isFeatured: e.target.checked })} className="h-4 w-4 accent-gold-400" />
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => setCourseOverride(c.id, { hidden: !hidden })} className={hidden ? 'text-white/30' : 'text-brand-cyan-300'}>
                      {hidden ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/40">Changes save instantly and reflect on the public Courses page. Click Edit to change every field, including the full curriculum.</p>
      {editorSeed && (
        <CourseEditorModal open={!!editorSeed} onClose={() => setEditorSeed(null)} seed={editorSeed} onSave={saveCourse} />
      )}
    </div>
  );
}

const TOOL_BULK_ACTIONS: BulkAction[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'mark-new', label: 'Mark as New' },
  { value: 'unmark-new', label: 'Remove New badge' },
];

function ToolsManager() {
  const v = useOverridesVersion();
  const ov = getToolOverrides();
  const { notice, notify, dismiss } = useAdminNotice();
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState('');

  const visibleCount = TOOLS.filter((t) => !ov[t.id]?.hidden).length;
  const hiddenCount = TOOLS.length - visibleCount;
  const rows = TOOLS.filter((t) => {
    if (statusFilter === 'visible') return !ov[t.id]?.hidden;
    if (statusFilter === 'hidden') return !!ov[t.id]?.hidden;
    return true;
  });

  const toggleSelectAll = (checked: boolean) => setSelected(checked ? new Set(rows.map((t) => t.id)) : new Set());
  const toggleSelect = (id: string, checked: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });

  const applyBulk = () => {
    if (!bulkValue || selected.size === 0) return;
    selected.forEach((id) => {
      if (bulkValue === 'show') setToolOverride(id, { hidden: false });
      else if (bulkValue === 'hide') setToolOverride(id, { hidden: true });
      else if (bulkValue === 'mark-new') setToolOverride(id, { isNew: true });
      else if (bulkValue === 'unmark-new') setToolOverride(id, { isNew: false });
    });
    const label = TOOL_BULK_ACTIONS.find((a) => a.value === bulkValue)?.label ?? 'Action';
    notify('success', `${label}: ${selected.size} tool${selected.size === 1 ? '' : 's'} updated.`);
    setSelected(new Set());
    setBulkValue('');
  };

  return (
    <div className="space-y-4" key={v}>
      {notice && <AdminNoticeBanner notice={notice} onDismiss={dismiss} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-h3 text-white">Tools</h1>
        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all tool changes?')) { resetToolOverrides(); notify('success', 'All tool changes reset.'); } }}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <StatusFilterPills value={statusFilter} onChange={setStatusFilter} options={[
        { id: 'all', label: 'All', count: TOOLS.length },
        { id: 'visible', label: 'Visible', count: visibleCount },
        { id: 'hidden', label: 'Hidden', count: hiddenCount },
      ]} />

      <BulkActionBar actions={TOOL_BULK_ACTIONS} selectedCount={selected.size} value={bulkValue} onChange={setBulkValue} onApply={applyBulk} />

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)} className="h-4 w-4 accent-gold-400" aria-label="Select all" />
              </th>
              <th className="p-3">Tool</th><th className="p-3">Category</th><th className="p-3 text-center">"New" badge</th><th className="p-3 text-center">Coming Soon</th><th className="p-3 text-center">Visible</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const o = ov[t.id] ?? {};
              const hidden = !!o.hidden;
              const comingSoon = isToolComingSoon(t.id);
              return (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={(e) => toggleSelect(t.id, e.target.checked)}
                      className="h-4 w-4 accent-gold-400" aria-label={`Select ${t.name}`} />
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
                      <a href={`/tools/${t.slug}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white hover:underline">View</a>
                    </div>
                  </td>
                  <td className="p-3 capitalize text-white/60">{t.category}</td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={o.isNew ?? !!t.isNew} onChange={(e) => setToolOverride(t.id, { isNew: e.target.checked })} className="h-4 w-4 accent-brand-cyan-400" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={comingSoon} onChange={(e) => setToolOverride(t.id, { comingSoon: e.target.checked })} className="h-4 w-4 accent-gold-400" />
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => setToolOverride(t.id, { hidden: !hidden })} className={hidden ? 'text-white/30' : 'text-brand-cyan-300'}>
                      {hidden ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/40">Hidden tools disappear from the public Tools page. A tool marked "Coming Soon" stays listed but shows a Coming Soon notice instead of the tool. Changes are instant.</p>
    </div>
  );
}

const CONTENT_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;
type ContentSectionId = typeof CONTENT_SECTIONS[number]['id'];

function SiteContentManager() {
  const [section, setSection] = useState<ContentSectionId>('home');
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-h3 text-white">Site Content</h1>
        <div className="flex gap-2">
          {CONTENT_SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                section === s.id ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {section === 'home' && <HomeContentEditor />}
      {section === 'about' && <AboutContentEditor />}
      {section === 'contact' && <ContactContentEditor />}
    </div>
  );
}

function HomeContentEditor() {
  const v = useOverridesVersion();
  const [c, setC] = useState<HomeContent>(() => mergedHomeContent());
  useEffect(() => { setC(mergedHomeContent()); }, [v]);
  const set = (patch: Partial<HomeContent>) => { setHomeContent(patch); setC((prev) => ({ ...prev, ...patch })); };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-h5 text-white">Hero</h3>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset Home content to defaults?')) resetHomeContent(); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
        <Input label="Badge text" value={c.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Heading line 1" value={c.heroLine1} onChange={(e) => set({ heroLine1: e.target.value })} />
          <Input label="Heading highlight word" value={c.heroHighlight} onChange={(e) => set({ heroHighlight: e.target.value })} />
        </div>
        <Input label="Heading line 2" value={c.heroLine2} onChange={(e) => set({ heroLine2: e.target.value })} />
        <Textarea label="Subtitle" rows={3} value={c.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Testimonials</h3>
        <ArrayEditor
          items={c.testimonials}
          onChange={(next) => set({ testimonials: next })}
          addLabel="Add testimonial"
          emptyItem={() => ({ id: `home-testimonial-${Date.now()}`, name: '', place: '', initials: '', text: '' })}
          renderFields={(item, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                <Input label="Place" value={item.place} onChange={(e) => update({ place: e.target.value })} />
                <Input label="Initials" value={item.initials} onChange={(e) => update({ initials: e.target.value })} />
              </div>
              <Textarea rows={2} value={item.text} onChange={(e) => update({ text: e.target.value })} />
            </>
          )}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">FAQ</h3>
        <ArrayEditor
          items={c.faqs}
          onChange={(next) => set({ faqs: next })}
          addLabel="Add question"
          emptyItem={() => ({ id: `home-faq-${Date.now()}`, header: '', body: '' })}
          renderFields={(item, update) => (
            <>
              <Input label="Question" value={item.header} onChange={(e) => update({ header: e.target.value })} />
              <Textarea rows={2} value={item.body} onChange={(e) => update({ body: e.target.value })} />
            </>
          )}
        />
      </div>
    </div>
  );
}

function AboutContentEditor() {
  const v = useOverridesVersion();
  const [c, setC] = useState<AboutContent>(() => mergedAboutContent());
  useEffect(() => { setC(mergedAboutContent()); }, [v]);
  const set = (patch: Partial<AboutContent>) => { setAboutContent(patch); setC((prev) => ({ ...prev, ...patch })); };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-h5 text-white">Hero & mission</h3>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset About content to defaults?')) resetAboutContent(); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
        <Input label="Badge text" value={c.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
        <Input label="Heading" value={c.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
        <Textarea label="Subtitle" rows={2} value={c.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
        <Textarea label="Mission" rows={2} value={c.missionText} onChange={(e) => set({ missionText: e.target.value })} />
        <Textarea label="Vision" rows={2} value={c.visionText} onChange={(e) => set({ visionText: e.target.value })} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Values</h3>
        <ArrayEditor
          items={c.values}
          onChange={(next) => set({ values: next })}
          addLabel="Add value"
          emptyItem={() => ({ id: `about-value-${Date.now()}`, glyph: '✶', title: '', text: '' })}
          renderFields={(item, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                <Input label="Glyph" value={item.glyph} onChange={(e) => update({ glyph: e.target.value })} />
                <Input label="Title" value={item.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <Textarea rows={2} value={item.text} onChange={(e) => update({ text: e.target.value })} />
            </>
          )}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Team</h3>
        <ArrayEditor
          items={c.team}
          onChange={(next) => set({ team: next })}
          addLabel="Add team member"
          emptyItem={() => ({ id: `about-team-${Date.now()}`, initials: '', name: '', role: '' })}
          renderFields={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Initials" value={item.initials} onChange={(e) => update({ initials: e.target.value })} />
              <Input label="Name" value={item.name} onChange={(e) => update({ name: e.target.value })} />
              <Input label="Role" value={item.role} onChange={(e) => update({ role: e.target.value })} />
            </div>
          )}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Timeline</h3>
        <ArrayEditor
          items={c.timeline}
          onChange={(next) => set({ timeline: next })}
          addLabel="Add milestone"
          emptyItem={() => ({ id: `about-timeline-${Date.now()}`, year: '', text: '' })}
          renderFields={(item, update) => (
            <>
              <Input label="Year" value={item.year} onChange={(e) => update({ year: e.target.value })} />
              <Textarea rows={2} value={item.text} onChange={(e) => update({ text: e.target.value })} />
            </>
          )}
        />
      </div>
    </div>
  );
}

function ContactContentEditor() {
  const v = useOverridesVersion();
  const [c, setC] = useState<ContactContent>(() => mergedContactContent());
  useEffect(() => { setC(mergedContactContent()); }, [v]);
  const set = (patch: Partial<ContactContent>) => { setContactContent(patch); setC((prev) => ({ ...prev, ...patch })); };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-h5 text-white">Hero & details</h3>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset Contact content to defaults?')) resetContactContent(); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
        <Input label="Heading" value={c.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
        <Textarea label="Subtitle" rows={2} value={c.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Contact email" value={c.email} onChange={(e) => set({ email: e.target.value })} />
          <Input label="Address line" value={c.addressLine} onChange={(e) => set({ addressLine: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Instagram URL" value={c.socials.instagram ?? ''} onChange={(e) => set({ socials: { ...c.socials, instagram: e.target.value } })} />
          <Input label="YouTube URL" value={c.socials.youtube ?? ''} onChange={(e) => set({ socials: { ...c.socials, youtube: e.target.value } })} />
          <Input label="Twitter/X URL" value={c.socials.twitter ?? ''} onChange={(e) => set({ socials: { ...c.socials, twitter: e.target.value } })} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">FAQ</h3>
        <ArrayEditor
          items={c.faqs}
          onChange={(next) => set({ faqs: next })}
          addLabel="Add question"
          emptyItem={() => ({ id: `contact-faq-${Date.now()}`, header: '', body: '' })}
          renderFields={(item, update) => (
            <>
              <Input label="Question" value={item.header} onChange={(e) => update({ header: e.target.value })} />
              <Textarea rows={2} value={item.body} onChange={(e) => update({ body: e.target.value })} />
            </>
          )}
        />
      </div>
    </div>
  );
}

function SEOManager() {
  const v = useOverridesVersion();
  const [rows, setRows] = useState<Record<string, { title: string; description: string; ogImage: string }>>(() => seedSEORows());
  useEffect(() => { setRows(seedSEORows()); }, [v]);

  const set = (path: string, patch: Partial<{ title: string; description: string; ogImage: string }>) => {
    setSEOOverride(path, patch);
    setRows((prev) => ({ ...prev, [path]: { ...prev[path], ...patch } }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-h3 text-white">SEO</h1>
        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all SEO overrides?')) resetSEOOverrides(); }}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
      <div className="space-y-4">
        {STATIC_ROUTES.map((r) => {
          const row = rows[r.path] ?? { title: '', description: '', ogImage: '' };
          return (
            <div key={r.path} className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
                <span className="text-gold-300">{r.seoLabel}</span><span className="text-white/25">{r.path}</span>
              </div>
              <Input label="Title override" placeholder="Leave blank to use the default title" value={row.title}
                onChange={(e) => set(r.path, { title: e.target.value })} />
              <Textarea label="Description override" rows={2} placeholder="Leave blank to use the default description" value={row.description}
                onChange={(e) => set(r.path, { description: e.target.value })} />
              <Input label="OG image URL override" placeholder="Leave blank to use the site default" value={row.ogImage}
                onChange={(e) => set(r.path, { ogImage: e.target.value })} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/40">
        Blank fields fall back to each page's built-in title/description. Like the rest of this admin
        panel, overrides apply immediately but only in <em>this browser</em> — they don't change what's
        actually deployed, so search engines and other visitors won't see them.
      </p>
    </div>
  );
}
function seedSEORows(): Record<string, { title: string; description: string; ogImage: string }> {
  const ov = getSEOOverrides();
  const out: Record<string, { title: string; description: string; ogImage: string }> = {};
  for (const r of STATIC_ROUTES) out[r.path] = { title: ov[r.path]?.title ?? '', description: ov[r.path]?.description ?? '', ogImage: ov[r.path]?.ogImage ?? '' };
  return out;
}

function AnnouncementManager() {
  const [a, setA] = useState<Announcement>(() => getAnnouncement());
  const tones: Announcement['tone'][] = ['gold', 'cyan', 'info'];
  const { notice, notify, dismiss } = useAdminNotice();
  const save = () => { setAnnouncement(a); notify('success', 'Announcement saved.'); };
  return (
    <div className="space-y-5">
      {notice && <AdminNoticeBanner notice={notice} onDismiss={dismiss} />}
      <h1 className="font-heading text-h3 text-white">Site Announcement</h1>
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <Input id="ann-text" label="Banner message" value={a.text} onChange={(e) => setA({ ...a, text: e.target.value })}
          placeholder="✦ New course just launched — explore Vedic Mantra Science" />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={a.active} onChange={(e) => setA({ ...a, active: e.target.checked })} className="h-4 w-4 accent-gold-400" /> Active
          </label>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button key={t} onClick={() => setA({ ...a, tone: t })}
                className={`rounded-full border px-3 py-1 text-xs capitalize ${a.tone === t ? 'border-white/40 text-white' : 'border-white/12 text-white/50'}`}>{t}</button>
            ))}
          </div>
          <Button size="sm" className="ml-auto" onClick={save}>Save banner</Button>
        </div>
        {a.text && (
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-gold-400/15 to-transparent px-4 py-2.5 text-center text-sm text-gold-200">
            {a.text}
          </div>
        )}
      </div>
      <p className="text-xs text-white/40">When active, this appears as a dismissible banner at the top of every page.</p>
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
  const doExport = () => {
    const merged = { ...JSON.parse(exportOverrides()), ...JSON.parse(exportSiteContent()) };
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'vedicosmic-admin-config.json'; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h3 text-white">Settings</h1>
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-4">
        <h3 className="font-heading text-h5 text-white">Change password</h3>
        <p className="text-xs text-white/45">This is a real, server-side change to the signed-in admin account — unlike the settings below, it isn't scoped to this browser.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="np1" type="password" label="New password" value={p1} onChange={(e) => { setP1(e.target.value); setMsg(''); }} />
          <Input id="np2" type="password" label="Confirm password" value={p2} onChange={(e) => { setP2(e.target.value); setMsg(''); }} />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={changePass} disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
          {msg && <span className={`text-sm ${msgOk ? 'text-success' : 'text-error'}`}>{msg}</span>}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 space-y-3">
        <h3 className="font-heading text-h5 text-white">Configuration</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={doExport}><Download className="mr-2 h-4 w-4" /> Export config (JSON)</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm('Clear all admin overrides (courses, tools, site content, SEO, announcement)?')) { resetCourseOverrides(); resetToolOverrides(); resetHomeContent(); resetAboutContent(); resetContactContent(); resetSEOOverrides(); setAnnouncement({ text: '', active: false, tone: 'gold' }); } }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Clear all overrides
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" /> Log out</Button>
        </div>
      </div>
      <p className="inline-flex items-center gap-1.5 text-xs text-white/35">
        <Star className="h-3 w-3" /> Sign-in is real and server-verified, but Courses, Tools, Site Content, SEO and
        Announcement still only save to this browser's localStorage — a different device sees the defaults, not your
        edits. Blog → Database Posts is the one section backed by a real shared database.
      </p>
    </div>
  );
}
