import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TeamMember } from '../../lib/types';

type MemberDraft = Omit<TeamMember, 'id'>;

const BLANK: MemberDraft = {
  name: '',
  title: '',
  linkedin: '',
  photo_url: null,
  sort_order: 0,
};

const inputCls =
  'w-full bg-[#111] border border-[#2a2a2a] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#555] placeholder:text-[#3a3a3a]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#666] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Form({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: MemberDraft;
  onSave: (d: MemberDraft) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<MemberDraft>(initial);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof MemberDraft>(k: K, v: MemberDraft[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('team').upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('team').getPublicUrl(path);
      set('photo_url', publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="max-w-xl">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h2 className="text-base font-semibold text-white mb-6">
        {initial.name ? 'Edit Member' : 'New Member'}
      </h2>
      <div className="space-y-4">
        <Field label="Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Role / Title">
          <input
            className={inputCls}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="President"
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            className={inputCls}
            value={form.linkedin}
            onChange={e => set('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            type="url"
          />
        </Field>
        <Field label="Photo">
          {form.photo_url && (
            <img
              src={form.photo_url}
              alt="Preview"
              className="w-16 h-16 object-cover rounded mb-2 border border-[#2a2a2a]"
            />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded hover:border-[#444] hover:text-white disabled:opacity-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading…' : form.photo_url ? 'Replace photo' : 'Upload photo'}
          </button>
        </Field>
        <Field label="Sort order (lower = first)">
          <input
            className={inputCls}
            type="number"
            value={form.sort_order}
            onChange={e => set('sort_order', Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name || !form.title}
          className="px-5 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded hover:border-[#444] hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TeamAdmin() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (draft: MemberDraft) => {
    setSaving(true);
    if (editing) {
      await supabase.from('team_members').update(draft).eq('id', editing.id);
    } else {
      await supabase.from('team_members').insert(draft);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const remove = async (member: TeamMember) => {
    if (!confirm(`Delete ${member.name}?`)) return;
    if (member.photo_url) {
      const path = member.photo_url.split('/object/public/team/').pop();
      if (path) await supabase.storage.from('team').remove([decodeURIComponent(path)]);
    }
    await supabase.from('team_members').delete().eq('id', member.id);
    load();
  };

  if (showForm) {
    return (
      <div className="p-8">
        <Form
          initial={editing ?? BLANK}
          onSave={save}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Team</h1>
          <p className="text-xs text-[#555] mt-1">{members.length} members</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Member
        </button>
      </div>

      {loading ? (
        <p className="text-[#444] text-sm">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-[#444] text-sm">No team members yet.</p>
      ) : (
        <div className="border border-[#1e1e1e] rounded overflow-hidden">
          {members.map((member, i) => (
            <div
              key={member.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#0e0e0e] ${
                i < members.length - 1 ? 'border-b border-[#1a1a1a]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] shrink-0 overflow-hidden flex items-center justify-center">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-[#444] font-bold">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <p className="text-xs text-[#555] mt-0.5">{member.title}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setEditing(member); setShowForm(true); }}
                  className="p-2 text-[#444] hover:text-white transition-colors rounded hover:bg-[#1a1a1a]"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(member)}
                  className="p-2 text-[#444] hover:text-red-400 transition-colors rounded hover:bg-[#1a1a1a]"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
