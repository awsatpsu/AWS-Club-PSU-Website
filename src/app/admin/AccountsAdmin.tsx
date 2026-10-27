import { useState, useEffect, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';
import { formatDate } from '../../lib/date';

export default function AccountsAdmin({ selfId }: { selfId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('approved', { ascending: true })
      .order('created_at', { ascending: true });
    setProfiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setApproved = async (profile: Profile, approved: boolean) => {
    if (!approved && !confirm(`Revoke access for ${profile.email}?`)) return;
    await supabase.from('profiles').update({ approved }).eq('id', profile.id);
    load();
  };

  const pending = profiles.filter(p => !p.approved).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Accounts</h1>
        <p className="text-xs text-[#555] mt-1">
          {profiles.length} accounts{pending > 0 && ` · ${pending} awaiting approval`}
        </p>
      </div>

      {loading ? (
        <p className="text-[#444] text-sm">Loading…</p>
      ) : (
        <div className="border border-[#1e1e1e] rounded overflow-hidden">
          {profiles.map((profile, i) => (
            <div
              key={profile.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#0e0e0e] ${
                i < profiles.length - 1 ? 'border-b border-[#1a1a1a]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.email}</p>
                <p className="text-xs text-[#555] mt-0.5">
                  {profile.role === 'admin' ? 'Admin' : 'Member'} · joined {formatDate(profile.created_at)}
                </p>
              </div>
              {profile.approved ? (
                <span className="text-xs text-[#555] shrink-0">Approved</span>
              ) : (
                <span className="text-xs text-[#FF9900] shrink-0">Pending</span>
              )}
              {profile.id !== selfId && (
                <div className="flex items-center gap-1 shrink-0">
                  {profile.approved ? (
                    <button
                      onClick={() => setApproved(profile, false)}
                      className="p-2 text-[#444] hover:text-red-400 transition-colors rounded hover:bg-[#1a1a1a]"
                      title="Revoke access"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setApproved(profile, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9900] text-black font-bold text-xs rounded hover:opacity-90 transition-opacity"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
