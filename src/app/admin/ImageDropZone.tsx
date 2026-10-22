import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

export const IMAGE_ACCEPT = 'image/*,.heic,.heif';

const HEIC = /\.(heic|heif)$/i;
const isHeic = (f: File) => HEIC.test(f.name) || /heic|heif/i.test(f.type);

// iPhones save photos as HEIC, which most browsers can't show, so those get converted to JPG.
// Keeps the original order; returns notes about anything skipped.
export async function prepareImages(
  files: File[],
  onConvert?: (done: number, total: number) => void,
): Promise<{ images: File[]; notes: string[] }> {
  const heicCount = files.filter(isHeic).length;
  // The converter is large, so only load it when there's something to convert.
  const heicTo = heicCount ? (await import('heic-to')).heicTo : null;
  const images: File[] = [];
  const failed: string[] = [];
  let videos = 0;
  let other = 0;
  let converted = 0;
  if (heicCount) onConvert?.(0, heicCount);

  for (const f of files) {
    if (heicTo && isHeic(f)) {
      try {
        const blob = await heicTo({ blob: f, type: 'image/jpeg', quality: 0.9 });
        images.push(new File([blob], f.name.replace(HEIC, '.jpg'), { type: 'image/jpeg', lastModified: f.lastModified }));
      } catch {
        failed.push(f.name);
      }
      onConvert?.(++converted, heicCount);
    } else if (f.type.startsWith('image/')) images.push(f);
    else if (f.type.startsWith('video/') || /\.(mov|mp4|m4v)$/i.test(f.name)) videos++;
    else other++;
  }

  const notes: string[] = [];
  if (failed.length) {
    notes.push(`Couldn't convert ${failed.length} HEIC photo(s) (${failed.slice(0, 3).join(', ')}${failed.length > 3 ? '…' : ''}).`);
  }
  if (videos) notes.push(`Skipped ${videos} video(s) — only photos are supported.`);
  if (other) notes.push(`Skipped ${other} non-image file(s).`);
  return { images, notes };
}

// Pasted images all arrive as "image.png"; give each a unique name so they don't look like duplicates.
function renamePasted(files: File[]): File[] {
  const stamp = Date.now();
  return files.map((f, i) =>
    f.name === 'image.png' || !f.name
      ? new File([f], `pasted-${stamp}-${i}.${f.type.split('/')[1] || 'png'}`, { type: f.type })
      : f
  );
}

// Calls onFiles with any files pasted (Ctrl+V / ⌘V) anywhere on the page.
// Text pastes into inputs are left alone.
export function usePasteFiles(onFiles: (files: File[]) => void, enabled = true) {
  const handler = useRef(onFiles);
  handler.current = onFiles;

  useEffect(() => {
    if (!enabled) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length === 0) return;
      e.preventDefault();
      handler.current(renamePasted(files));
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [enabled]);
}

// Keeps a file dropped outside the drop zone from making the browser open it and leave the page.
export function useBlockWindowDrop(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const block = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, [enabled]);
}

// A single-image picker: click to choose, drag & drop, or paste.
export function ImageDropZone({
  imageUrl,
  uploading,
  onFile,
  noun = 'photo',
}: {
  imageUrl: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  noun?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = uploading || converting;

  const take = async (files: File[]) => {
    if (busy || files.length === 0) return;
    setError('');
    setConverting(true);
    const { images, notes } = await prepareImages(files.slice(0, 1));
    setConverting(false);
    if (images[0]) onFile(images[0]);
    else setError(notes.join(' ') || "That isn't an image.");
  };

  usePasteFiles(take);
  useBlockWindowDrop();

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          take(files);
        }}
      />
      <button
        type="button"
        onClick={() => { if (!busy) fileRef.current?.click(); }}
        onDragEnter={e => { e.preventDefault(); if (!busy) setDragging(true); }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = busy ? 'none' : 'copy'; }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          take(Array.from(e.dataTransfer.files));
        }}
        aria-disabled={busy}
        className={`w-full flex items-center gap-4 p-3 border-2 border-dashed rounded-lg text-left transition-colors ${
          dragging
            ? 'border-[#FF9900] bg-[#FF9900]/10'
            : 'border-[#2a2a2a] hover:border-[#444] hover:bg-[#0e0e0e]'
        } ${busy ? 'cursor-progress' : 'cursor-pointer'}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-20 h-20 object-cover rounded border border-[#2a2a2a] shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded bg-[#111] flex items-center justify-center shrink-0">
            <Upload className={`w-6 h-6 ${dragging ? 'text-[#FF9900]' : 'text-[#444]'}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">
            {converting
              ? 'Converting HEIC to JPG…'
              : uploading
              ? 'Uploading…'
              : dragging
                ? 'Drop to upload'
                : `${imageUrl ? 'Replace' : 'Add'} ${noun} — drag & drop or paste (Ctrl+V)`}
          </p>
          <p className="text-[#555] text-xs mt-0.5">or click to choose a file · JPG, PNG, WebP, GIF, HEIC</p>
        </div>
      </button>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </>
  );
}
