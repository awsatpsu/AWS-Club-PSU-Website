import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

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
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const take = (files: File[]) => {
    if (uploading) return;
    const file = files.find(f => f.type.startsWith('image/') && !/heic|heif/i.test(f.type));
    if (!file) {
      setError(files.some(f => /\.(heic|heif)$/i.test(f.name) || /heic|heif/i.test(f.type))
        ? "HEIC photos can't be shown in browsers — convert to JPG first."
        : 'That isn\'t an image.');
      return;
    }
    setError('');
    onFile(file);
  };

  usePasteFiles(take);
  useBlockWindowDrop();

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          take(files);
        }}
      />
      <button
        type="button"
        onClick={() => { if (!uploading) fileRef.current?.click(); }}
        onDragEnter={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = uploading ? 'none' : 'copy'; }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          take(Array.from(e.dataTransfer.files));
        }}
        aria-disabled={uploading}
        className={`w-full flex items-center gap-4 p-3 border-2 border-dashed rounded-lg text-left transition-colors ${
          dragging
            ? 'border-[#FF9900] bg-[#FF9900]/10'
            : 'border-[#2a2a2a] hover:border-[#444] hover:bg-[#0e0e0e]'
        } ${uploading ? 'cursor-progress' : 'cursor-pointer'}`}
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
            {uploading
              ? 'Uploading…'
              : dragging
                ? 'Drop to upload'
                : `${imageUrl ? 'Replace' : 'Add'} ${noun} — drag & drop or paste (Ctrl+V)`}
          </p>
          <p className="text-[#555] text-xs mt-0.5">or click to choose a file · JPG, PNG, WebP, GIF</p>
        </div>
      </button>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </>
  );
}
