import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useNavigate } from 'react-router';
import { Cloud, CalendarDays, Users, Camera, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import EventsAdmin from './EventsAdmin';
import TeamAdmin from './TeamAdmin';
import GalleryAdmin from './GalleryAdmin';
import AccountsAdmin from './AccountsAdmin';
import type { Profile } from '../../lib/types';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    if (signingUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      // No session means Supabase wants the email confirmed first.
      else if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Cloud className="w-5 h-5 text-[#FF9900]" />
          <span className="font-bold text-white tracking-tight">Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#777] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#555]"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-[#777] mb-1.5">Password</label>
            <input
              type="password"
              minLength={signingUp ? 6 : undefined}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#555]"
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {notice && <p className="text-[#aaa] text-xs">{notice}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {signingUp
              ? (loading ? 'Creating account…' : 'Create Account')
              : (loading ? 'Signing in…' : 'Sign In')}
          </button>
        </form>
        <button
          onClick={() => { setSigningUp(!signingUp); setError(''); setNotice(''); }}
          className="w-full mt-4 text-xs text-[#555] hover:text-[#aaa] transition-colors"
        >
          {signingUp ? 'Already have an account? Sign in' : 'New member? Create an account'}
        </button>
      </div>
    </div>
  );
}

function PendingApproval({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Cloud className="w-5 h-5 text-[#FF9900]" />
          <span className="font-bold text-white tracking-tight">Admin</span>
        </div>
        <h1 className="text-base font-semibold text-white mb-2">Waiting for approval</h1>
        <p className="text-sm text-[#777] mb-8">
          {email} is signed up. You'll be able to edit the site once the admin approves your account.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-[#555] hover:text-[#aaa] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminLayout({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin', { replace: true });
  };

  const navLinks = [
    { to: '/admin/events', label: 'Events', Icon: CalendarDays },
    { to: '/admin/team', label: 'Team', Icon: Users },
    { to: '/admin/gallery', label: 'Gallery', Icon: Camera },
    ...(isAdmin ? [{ to: '/admin/accounts', label: 'Accounts', Icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-52 border-r border-[#1e1e1e] flex flex-col shrink-0 fixed h-full">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-[#1e1e1e]">
          <Cloud className="w-4 h-4 text-[#FF9900]" />
          <span className="text-sm font-bold tracking-tight">Admin</span>
        </div>
        <nav className="flex-1 p-2.5 space-y-0.5">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-[#666] hover:text-[#ccc] hover:bg-[#141414]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2.5 border-t border-[#1e1e1e] space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#555] hover:text-[#aaa] hover:bg-[#141414] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#555] hover:text-red-400 hover:bg-[#141414] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-52 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileFor, setProfileFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) { setProfile(null); setProfileFor(null); return; }
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      .then(({ data }) => { setProfile(data); setProfileFor(userId); });
  }, [userId]);

  if (loading || (session && profileFor !== session.user.id)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#444] text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) return <AdminLogin />;
  if (!profile?.approved) return <PendingApproval email={session.user.email ?? ''} />;

  const isAdmin = profile.role === 'admin';

  return (
    <AdminLayout isAdmin={isAdmin}>
      <Routes>
        <Route index element={<Navigate to="events" replace />} />
        <Route path="events" element={<EventsAdmin />} />
        <Route path="team" element={<TeamAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        {isAdmin && <Route path="accounts" element={<AccountsAdmin selfId={profile.id} />} />}
      </Routes>
    </AdminLayout>
  );
}
