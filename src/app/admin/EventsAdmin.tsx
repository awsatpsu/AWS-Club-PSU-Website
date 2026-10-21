import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TAG_COLORS, TAG_OPTIONS } from '../../lib/types';
import type { Event } from '../../lib/types';
import { formatDate, todayISO } from '../../lib/date';

type EventDraft = Omit<Event, 'id'>;

const isPast = (e: Event) => e.is_past || (!!e.date && e.date < todayISO());

const BLANK: EventDraft = {
  title: '',
  description: '',
  date: null,
  time: '',
  location: '',
  capacity: '',
  tag: 'Workshop',
  is_past: false,
  rsvp_url: '',
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
  initial: EventDraft;
  onSave: (d: EventDraft) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EventDraft>(initial);
  const set = <K extends keyof EventDraft>(k: K, v: EventDraft[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-2xl">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h2 className="text-base font-semibold text-white mb-6">
        {initial.title ? 'Edit Event' : 'New Event'}
      </h2>
      <div className="space-y-4">
        <Field label="Title">
          <input
            className={inputCls}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Serverless Workshop"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What will attendees do or learn?"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input
              className={`${inputCls} [color-scheme:dark]`}
              type="date"
              required
              value={form.date ?? ''}
              onChange={e => set('date', e.target.value || null)}
            />
          </Field>
          <Field label="Time">
            <input
              className={inputCls}
              value={form.time}
              onChange={e => set('time', e.target.value)}
              placeholder="2:00 PM – 5:00 PM"
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="IST Building, Room 220"
          />
        </Field>
        <Field label="Capacity">
          <input
            className={inputCls}
            value={form.capacity}
            onChange={e => set('capacity', e.target.value)}
            placeholder="40 spots available"
          />
        </Field>
        <Field label="RSVP Link (optional)">
          <input
            className={inputCls}
            value={form.rsvp_url}
            onChange={e => set('rsvp_url', e.target.value)}
            placeholder="https://forms.gle/..."
            type="url"
          />
        </Field>
        <Field label="Tag">
          <select
            className={`${inputCls} bg-[#111]`}
            value={form.tag}
            onChange={e => set('tag', e.target.value)}
          >
            {TAG_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_past}
            onChange={e => set('is_past', e.target.checked)}
            className="accent-[#FF9900] w-3.5 h-3.5"
          />
          <span className="text-sm text-[#aaa]">Mark as past event</span>
        </label>
        <p className="text-xs text-[#555]">
          Events are sorted by date and leave the public "Coming up" list automatically once their date has passed.
        </p>
        {form.tag && (
          <p className="text-xs text-[#555]">
            Tag preview:&nbsp;
            <span className={`border px-1.5 py-0.5 rounded text-xs ${TAG_COLORS[form.tag] ?? 'text-gray-400 border-gray-400/40'}`}>
              {form.tag}
            </span>
          </p>
        )}
      </div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title || !form.date}
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

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (draft: EventDraft) => {
    setSaving(true);
    if (editing) {
      await supabase.from('events').update(draft).eq('id', editing.id);
    } else {
      await supabase.from('events').insert(draft);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
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
          <h1 className="text-xl font-bold text-white">Events</h1>
          <p className="text-xs text-[#555] mt-1">{events.length} total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
      </div>

      {loading ? (
        <p className="text-[#444] text-sm">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-[#444] text-sm">No events yet.</p>
      ) : (
        <div className="border border-[#1e1e1e] rounded overflow-hidden">
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#0e0e0e] ${
                i < events.length - 1 ? 'border-b border-[#1a1a1a]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{event.title}</p>
                <p className="text-xs text-[#555] mt-0.5">
                  {formatDate(event.date)}
                  {event.tag ? ` · ${event.tag}` : ''}
                  {isPast(event) ? ' · Past' : ' · Upcoming'}
                  {event.rsvp_url ? ' · RSVP link set' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setEditing(event); setShowForm(true); }}
                  className="p-2 text-[#444] hover:text-white transition-colors rounded hover:bg-[#1a1a1a]"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(event.id)}
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
