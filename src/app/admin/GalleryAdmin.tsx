import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, ArrowLeft, Upload, Pencil, Camera, Images, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event, GalleryAlbum, GalleryPhoto } from '../../lib/types';
import { formatDate } from '../../lib/date';
import { IMAGE_ACCEPT, ImageDropZone, prepareImages, useBlockWindowDrop, usePasteFiles } from './ImageDropZone';

const UPLOAD_CONCURRENCY = 4;

// Collects files from a drop, walking into any dropped folders.
async function filesFromDrop(dt: DataTransfer): Promise<File[]> {
  const entries = Array.from(dt.items)
    .map(item => item.webkitGetAsEntry?.())
    .filter((e): e is FileSystemEntry => !!e);
  if (entries.length === 0) return Array.from(dt.files);

  const out: File[] = [];
  const walk = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      out.push(await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej)));
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // readEntries returns results in chunks; keep reading until it comes back empty.
      for (;;) {
        const batch = await new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej));
        if (batch.length === 0) break;
        for (const child of batch) await walk(child);
      }
    }
  };
  for (const entry of entries) await walk(entry);
  return out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

type View = 'albums' | 'photos' | 'album-form' | 'batch';

type BatchItem = { file: File; preview: string };

type AlbumDraft = Omit<GalleryAlbum, 'id'>;

const BLANK_ALBUM: AlbumDraft = { event_id: null, label: '', date: null, cover_image_url: null, sort_order: 0 };

type EventOption = Pick<Event, 'id' | 'title' | 'date'>;

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

export default function GalleryAdmin() {
  const [view, setView] = useState<View>('albums');
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [progress, setProgress] = useState<{ label: string; done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [albumForm, setAlbumForm] = useState<AlbumDraft>(BLANK_ALBUM);
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [batchEventId, setBatchEventId] = useState('');

  const photosFileRef = useRef<HTMLInputElement>(null);
  const batchFileRef = useRef<HTMLInputElement>(null);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_albums')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    setAlbums(data ?? []);
    setLoading(false);
  }, []);

  const loadPhotos = useCallback(async (albumId: string) => {
    const { data } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('sort_order')
      .order('created_at');
    setPhotos(data ?? []);
  }, []);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, date')
      .order('date', { ascending: false, nullsFirst: false });
    setEvents(data ?? []);
  }, []);

  useEffect(() => { loadAlbums(); loadEvents(); }, [loadAlbums, loadEvents]);

  const eventTitle = (id: string | null) => events.find(ev => ev.id === id)?.title;

  // Picking an event fills in the album name and date, unless they were already changed by hand.
  const pickEvent = (id: string) => {
    const ev = events.find(e => e.id === id);
    setAlbumForm(p => {
      const prev = events.find(e => e.id === p.event_id);
      return {
        ...p,
        event_id: id || null,
        label: !p.label || p.label === prev?.title ? ev?.title ?? '' : p.label,
        date: !p.date || p.date === prev?.date ? ev?.date ?? null : p.date,
      };
    });
  };

  // A file dropped outside the drop zone would make the browser open it and leave the page.
  useBlockWindowDrop(view === 'photos' || view === 'batch');

  // Ctrl+V / ⌘V adds copied images, same as dropping them.
  usePasteFiles(files => {
    if (uploading) return;
    if (view === 'photos') uploadPhotos(files);
    else addToBatch(files);
  }, view === 'photos' || view === 'batch');

  const openAlbum = (album: GalleryAlbum) => {
    setSelectedAlbum(album);
    loadPhotos(album.id);
    setView('photos');
  };

  const openAlbumForm = (album?: GalleryAlbum) => {
    setEditingAlbum(album ?? null);
    setAlbumForm(album ?? BLANK_ALBUM);
    setView('album-form');
  };

  const saveAlbum = async () => {
    setSaving(true);
    if (editingAlbum) {
      await supabase.from('gallery_albums').update(albumForm).eq('id', editingAlbum.id);
      setSaving(false);
      setView('albums');
      loadAlbums();
    } else {
      const { data } = await supabase.from('gallery_albums').insert(albumForm).select().single();
      setSaving(false);
      loadAlbums();
      if (data) {
        setSelectedAlbum(data);
        setPhotos([]);
        setView('photos');
      }
    }
  };

  const deleteAlbum = async (album: GalleryAlbum) => {
    if (!confirm(`Delete album "${album.label}" and all its photos?`)) return;
    await supabase.from('gallery_albums').delete().eq('id', album.id);
    loadAlbums();
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    const path = `covers/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      setAlbumForm(prev => ({ ...prev, cover_image_url: publicUrl }));
    }
    setUploading(false);
  };

  // Uploads a few at a time so large batches (e.g. a whole folder) don't time out.
  // New photos go after the album's existing ones; the first becomes the cover if it has none.
  // Returns notes about anything that failed.
  const uploadToAlbum = async (album: GalleryAlbum, sources: File[], existingCount: number): Promise<string[]> => {
    setUploading(true);
    setUploadError('');
    setProgress({ label: 'Uploading', done: 0, total: sources.length });
    const errors: string[] = [];
    let firstUrl: string | null = null;
    let next = 0;

    const worker = async () => {
      while (next < sources.length) {
        const i = next++;
        try {
          const file = sources[i];
          const path = `albums/${album.id}/${Date.now()}-${i}.${file.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('gallery').upload(path, file, { contentType: file.type });
          if (error) throw new Error(`${file.name}: ${error.message}`);
          const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
          await supabase.from('gallery_photos').insert({
            album_id: album.id,
            image_url: publicUrl,
            caption: '',
            sort_order: existingCount + i,
          });
          if (i === 0 || !firstUrl) firstUrl = publicUrl;
        } catch (e) {
          errors.push(e instanceof Error ? e.message : String(e));
        }
        setProgress(p => p && { ...p, done: p.done + 1 });
      }
    };
    await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));

    if (firstUrl && !album.cover_image_url) {
      await supabase.from('gallery_albums').update({ cover_image_url: firstUrl }).eq('id', album.id);
    }
    setUploading(false);
    setProgress(null);
    return errors.length
      ? [`${errors.length} failed — ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '…' : ''}`]
      : [];
  };

  // Converts any HEIC photos, showing progress in the drop zone meanwhile.
  const prepare = async (picked: File[]) => {
    setUploading(true);
    setUploadError('');
    const result = await prepareImages(picked, (done, total) =>
      setProgress({ label: 'Converting HEIC', done, total }));
    setProgress(null);
    setUploading(false);
    return result;
  };

  const uploadPhotos = async (picked: File[]) => {
    const { images: sources, notes } = await prepare(picked);
    if (!selectedAlbum || sources.length === 0) {
      setUploadError(notes.join(' '));
      return;
    }
    notes.unshift(...await uploadToAlbum(selectedAlbum, sources, photos.length));
    if (notes.length) setUploadError(notes.join(' '));
    loadPhotos(selectedAlbum.id);
    loadAlbums();
  };

  // ── Batch upload: pick many photos, choose their event, upload together ──
  const addToBatch = async (picked: File[]) => {
    const { images, notes } = await prepare(picked);
    setUploadError(notes.join(' '));
    setBatch(prev => {
      // Picking the same file twice shouldn't add it twice.
      const seen = new Set(prev.map(b => `${b.file.name}:${b.file.size}`));
      const added = images
        .filter(f => !seen.has(`${f.name}:${f.size}`))
        .map(file => ({ file, preview: URL.createObjectURL(file) }));
      return [...prev, ...added];
    });
  };

  const removeFromBatch = (preview: string) => {
    URL.revokeObjectURL(preview);
    setBatch(prev => prev.filter(b => b.preview !== preview));
  };

  const clearBatch = () => {
    batch.forEach(b => URL.revokeObjectURL(b.preview));
    setBatch([]);
  };

  const openBatch = () => {
    clearBatch();
    setBatchEventId('');
    setUploadError('');
    setView('batch');
  };

  const uploadBatch = async () => {
    const ev = events.find(e => e.id === batchEventId);
    if (!ev || batch.length === 0) return;
    setUploadError('');

    // Add to the event's album, creating it the first time.
    let album = albums.find(a => a.event_id === ev.id) ?? null;
    if (!album) {
      const { data, error } = await supabase
        .from('gallery_albums')
        .insert({ event_id: ev.id, label: ev.title, date: ev.date, cover_image_url: null, sort_order: 0 })
        .select()
        .single();
      if (error || !data) {
        setUploadError(`Couldn't create the album: ${error?.message ?? 'unknown error'}`);
        return;
      }
      album = data as GalleryAlbum;
    }
    const { count } = await supabase
      .from('gallery_photos')
      .select('id', { count: 'exact', head: true })
      .eq('album_id', album.id);

    const notes = await uploadToAlbum(album, batch.map(b => b.file), count ?? 0);
    clearBatch();
    loadAlbums();
    setSelectedAlbum(album);
    loadPhotos(album.id);
    setView('photos');
    if (notes.length) setUploadError(notes.join(' '));
  };

  const deletePhoto = async (photo: GalleryPhoto) => {
    if (!confirm('Delete this photo?')) return;
    const path = photo.image_url.split('/object/public/gallery/').pop();
    if (path) await supabase.storage.from('gallery').remove([decodeURIComponent(path)]);
    await supabase.from('gallery_photos').delete().eq('id', photo.id);
    if (selectedAlbum) loadPhotos(selectedAlbum.id);
  };

  const setCover = async (photo: GalleryPhoto) => {
    if (!selectedAlbum) return;
    await supabase.from('gallery_albums').update({ cover_image_url: photo.image_url }).eq('id', selectedAlbum.id);
    loadAlbums();
  };

  // ── Album form ──────────────────────────────────────────
  if (view === 'album-form') {
    return (
      <div className="p-8 max-w-xl">
        <button
          onClick={() => setView('albums')}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-base font-semibold text-white mb-6">
          {editingAlbum ? 'Edit Album' : 'New Album'}
        </h2>
        <div className="space-y-4">
          <Field label="Event">
            <select
              className={`${inputCls} [color-scheme:dark]`}
              value={albumForm.event_id ?? ''}
              onChange={e => pickEvent(e.target.value)}
            >
              <option value="">Choose the event these photos are from…</option>
              {events.map(ev => {
                const taken = albums.some(a => a.event_id === ev.id && a.id !== editingAlbum?.id);
                return (
                  <option key={ev.id} value={ev.id} disabled={taken}>
                    {ev.title}{ev.date ? ` — ${formatDate(ev.date)}` : ''}{taken ? ' (has an album)' : ''}
                  </option>
                );
              })}
            </select>
            {events.length === 0 && (
              <p className="mt-1.5 text-xs text-[#555]">No events yet — add the event in the Events tab first.</p>
            )}
          </Field>
          <Field label="Album name">
            <input
              className={inputCls}
              value={albumForm.label}
              onChange={e => setAlbumForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Serverless Workshop"
            />
          </Field>
          <Field label="Date">
            <input
              className={`${inputCls} [color-scheme:dark]`}
              type="date"
              required
              value={albumForm.date ?? ''}
              onChange={e => setAlbumForm(p => ({ ...p, date: e.target.value || null }))}
            />
          </Field>
          <Field label="Cover photo">
            <ImageDropZone imageUrl={albumForm.cover_image_url} uploading={uploading} onFile={uploadCover} noun="cover" />
          </Field>
        </div>
        <p className="mt-3 text-xs text-[#555]">Each album belongs to one event. Albums are listed newest date first.</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={saveAlbum}
            disabled={saving || !albumForm.event_id || !albumForm.label || !albumForm.date}
            className="px-5 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setView('albums')}
            className="px-5 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded hover:border-[#444] hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Batch upload ────────────────────────────────────────
  if (view === 'batch') {
    const target = albums.find(a => a.event_id === batchEventId);
    return (
      <div className="p-8">
        <button
          onClick={() => { clearBatch(); setUploadError(''); setView('albums'); }}
          disabled={uploading}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white mb-6 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> All albums
        </button>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Upload photos</h1>
          <p className="text-xs text-[#555] mt-1">Select as many photos as you like, choose their event, and upload them together.</p>
        </div>

        <div className="max-w-xl mb-6">
          <Field label="Event">
            <select
              className={`${inputCls} [color-scheme:dark]`}
              value={batchEventId}
              disabled={uploading}
              onChange={e => setBatchEventId(e.target.value)}
            >
              <option value="">Choose the event these photos are from…</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}{ev.date ? ` — ${formatDate(ev.date)}` : ''}
                </option>
              ))}
            </select>
          </Field>
          {batchEventId && (
            <p className="mt-1.5 text-xs text-[#555]">
              {target ? `Adds to the existing "${target.label}" album.` : 'Creates a new album for this event.'}
            </p>
          )}
          {events.length === 0 && (
            <p className="mt-1.5 text-xs text-[#555]">No events yet — add the event in the Events tab first.</p>
          )}
        </div>

        <input
          ref={batchFileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            addToBatch(files);
          }}
        />
        <button
          type="button"
          onClick={() => { if (!uploading) batchFileRef.current?.click(); }}
          onDragEnter={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = uploading ? 'none' : 'copy'; }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
          onDrop={async e => {
            e.preventDefault();
            setDragging(false);
            if (uploading) return;
            addToBatch(await filesFromDrop(e.dataTransfer));
          }}
          aria-disabled={uploading}
          className={`w-full mb-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-colors ${
            batch.length === 0 ? 'py-20' : 'py-8'
          } ${
            dragging
              ? 'border-[#FF9900] bg-[#FF9900]/10'
              : 'border-[#2a2a2a] hover:border-[#444] hover:bg-[#0e0e0e]'
          } ${uploading ? 'cursor-progress' : 'cursor-pointer'}`}
        >
          {progress ? (
            <>
              <p className="text-white text-sm font-medium">{progress.label} {progress.done} / {progress.total}…</p>
              <div className="w-64 h-1.5 bg-[#1e1e1e] rounded overflow-hidden">
                <div
                  className="h-full bg-[#FF9900] transition-[width]"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Images className={`w-7 h-7 ${dragging ? 'text-[#FF9900]' : 'text-[#444]'}`} />
              <p className="text-white text-sm font-medium">
                {dragging ? 'Drop to add' : batch.length ? 'Add more photos' : 'Drag & drop photos or a folder here'}
              </p>
              <p className="text-[#555] text-xs">
                paste with Ctrl+V (⌘V), or click to choose files — hold Ctrl (⌘ on Mac) or Shift to select many · JPG, PNG, WebP, GIF, HEIC
              </p>
            </>
          )}
        </button>

        {uploadError && <p className="text-red-400 text-sm mb-4">{uploadError}</p>}

        {batch.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-white">{batch.length} {batch.length === 1 ? 'photo' : 'photos'} selected</p>
              <div className="flex gap-3">
                <button
                  onClick={clearBatch}
                  disabled={uploading}
                  className="px-4 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded hover:border-[#444] hover:text-white disabled:opacity-50 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={uploadBatch}
                  disabled={uploading || !batchEventId}
                  title={batchEventId ? undefined : 'Choose an event first'}
                  className="flex items-center gap-2 px-5 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : `Upload ${batch.length} ${batch.length === 1 ? 'photo' : 'photos'}`}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {batch.map(b => (
                <div key={b.preview} className="relative group aspect-square overflow-hidden rounded border border-[#1e1e1e]">
                  <img src={b.preview} alt={b.file.name} className="w-full h-full object-cover" />
                  {!uploading && (
                    <button
                      onClick={() => removeFromBatch(b.preview)}
                      title="Remove from upload"
                      aria-label={`Remove ${b.file.name}`}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 rounded text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Photos view ─────────────────────────────────────────
  if (view === 'photos' && selectedAlbum) {
    return (
      <div className="p-8">
        <button
          onClick={() => { setView('albums'); setSelectedAlbum(null); setPhotos([]); }}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All albums
        </button>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">{selectedAlbum.label}</h1>
            <p className="text-xs text-[#555] mt-1">
              {eventTitle(selectedAlbum.event_id) ?? 'No event'} · {photos.length} photos · {formatDate(selectedAlbum.date)}
            </p>
          </div>
        </div>

        <input
          ref={photosFileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            uploadPhotos(files);
          }}
        />
        <button
          type="button"
          onClick={() => { if (!uploading) photosFileRef.current?.click(); }}
          onDragEnter={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = uploading ? 'none' : 'copy'; }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
          onDrop={async e => {
            e.preventDefault();
            setDragging(false);
            if (uploading) return;
            uploadPhotos(await filesFromDrop(e.dataTransfer));
          }}
          aria-disabled={uploading}
          className={`w-full mb-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-colors ${
            photos.length === 0 ? 'py-20' : 'py-10'
          } ${
            dragging
              ? 'border-[#FF9900] bg-[#FF9900]/10'
              : 'border-[#2a2a2a] hover:border-[#444] hover:bg-[#0e0e0e]'
          } ${uploading ? 'cursor-progress' : 'cursor-pointer'}`}
        >
          {progress ? (
            <>
              <p className="text-white text-sm font-medium">{progress.label} {progress.done} / {progress.total}…</p>
              <div className="w-64 h-1.5 bg-[#1e1e1e] rounded overflow-hidden">
                <div
                  className="h-full bg-[#FF9900] transition-[width]"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className={`w-7 h-7 ${dragging ? 'text-[#FF9900]' : 'text-[#444]'}`} />
              <p className="text-white text-sm font-medium">
                {dragging ? 'Drop to upload' : 'Drag & drop photos or a folder here'}
              </p>
              <p className="text-[#555] text-xs">paste with Ctrl+V (⌘V), or click to choose files · JPG, PNG, WebP, GIF, HEIC</p>
            </>
          )}
        </button>

        {uploadError && (
          <p className="text-red-400 text-sm mb-4">{uploadError}</p>
        )}

        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center py-6">
            <Camera className="w-8 h-8 text-[#333]" />
            <p className="text-[#555] text-sm">No photos in this album yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square overflow-hidden rounded border border-[#1e1e1e]">
                <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCover(photo)}
                    title="Set as album cover"
                    className="p-1.5 bg-[#FF9900] rounded text-black hover:opacity-90 transition-opacity"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePhoto(photo)}
                    title="Delete photo"
                    className="p-1.5 bg-red-500 rounded text-white hover:opacity-90 transition-opacity"
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

  // ── Albums list ─────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Gallery</h1>
          <p className="text-xs text-[#555] mt-1">{albums.length} albums</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAlbumForm()}
            className="flex items-center gap-2 px-4 py-2 border border-[#2a2a2a] text-[#888] text-sm rounded hover:border-[#444] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Album
          </button>
          <button
            onClick={openBatch}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-black font-bold text-sm rounded hover:opacity-90 transition-opacity"
          >
            <Images className="w-3.5 h-3.5" /> Upload photos
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#444] text-sm">Loading…</p>
      ) : albums.length === 0 ? (
        <p className="text-[#444] text-sm">No albums yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map(album => (
            <div key={album.id} className="border border-[#1e1e1e] rounded overflow-hidden group">
              <button
                onClick={() => openAlbum(album)}
                className="w-full aspect-video bg-[#111] overflow-hidden block"
              >
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt={album.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#333]" />
                  </div>
                )}
              </button>
              <div className="p-3 border-t border-[#1a1a1a] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{album.label}</p>
                    <p className="text-xs text-[#555] mt-0.5">{formatDate(album.date)}</p>
                    {album.event_id ? (
                      <p className="text-xs text-[#777] mt-0.5 truncate">{eventTitle(album.event_id)}</p>
                    ) : (
                      <p className="text-xs text-amber-400 mt-0.5">No event — edit to assign</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openAlbumForm(album)}
                      className="p-1.5 text-[#444] hover:text-white transition-colors rounded hover:bg-[#1a1a1a]"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteAlbum(album)}
                      className="p-1.5 text-[#444] hover:text-red-400 transition-colors rounded hover:bg-[#1a1a1a]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => openAlbum(album)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-[#2a2a2a] text-[#777] text-xs rounded hover:border-[#FF9900] hover:text-[#FF9900] transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  Add / view photos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
