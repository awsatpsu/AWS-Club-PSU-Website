import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchAlbum, fetchPhotos, type AlbumWithCount } from "../../lib/data";
import type { GalleryPhoto } from "../../lib/types";
import { photoCountLabel } from "../components/site/AlbumCard";
import { formatDate } from "../../lib/date";
import { colorFor, pad } from "../site";

export default function AlbumPage() {
  const { albumId = "" } = useParams();
  const [album, setAlbum] = useState<AlbumWithCount | null | undefined>(undefined);
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    setAlbum(undefined);
    setPhotos(null);
    setOpen(null);
    fetchAlbum(albumId).then(setAlbum);
    fetchPhotos(albumId).then(setPhotos);
  }, [albumId]);

  const color = colorFor(albumId);
  const count = photos?.length ?? album?.photo_count ?? 0;

  return (
    <>
      <section className="border-b border-line">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-10 pb-14 flex flex-col gap-7">
          <Link
            to="/events"
            className="self-start border border-line bg-ink text-white no-underline font-mono text-[15px] px-[18px] py-3 hover:border-fog"
          >
            ← All events
          </Link>
          {album === null ? (
            <h1 className="m-0 font-mono font-semibold text-[40px] leading-[1.1]">Album not found.</h1>
          ) : (
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4" style={{ background: color }} />
                  {album?.date && <span className="font-mono text-sm text-fog">{formatDate(album.date)}</span>}
                </div>
                <h1 className="m-0 font-mono font-semibold text-[36px] sm:text-[52px] leading-[1.1] tracking-[-0.02em]">
                  {album?.label ?? " "}
                </h1>
              </div>
              {album && (
                <span className="font-mono text-[15px] border border-line px-3.5 py-2.5">{photoCountLabel(count)}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {album !== null && (
        <section>
          <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-12 pb-28">
            {photos === null ? (
              <p className="m-0 font-mono text-fog">Loading…</p>
            ) : photos.length === 0 ? (
              <p className="m-0 font-mono text-fog">No photos yet for this event.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] auto-rows-[160px] sm:auto-rows-[220px] grid-flow-dense gap-3">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`View photo ${i + 1} of ${photos.length}`}
                    className={`group relative overflow-hidden border-0 p-0 bg-ink-raised cursor-zoom-in ${
                      i % 7 === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || ""}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {open !== null && photos && photos[open] && (
        <Lightbox
          title={album?.label ?? ""}
          photos={photos}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  title,
  photos,
  index,
  onChange,
  onClose,
}: {
  title: string;
  photos: GalleryPhoto[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const total = photos.length;
  const prev = () => onChange((index - 1 + total) % total);
  const next = () => onChange((index + 1) % total);
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  const iconButton =
    "shrink-0 flex items-center justify-center border border-white bg-transparent text-white cursor-pointer hover:bg-white hover:text-ink";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 bg-[rgba(10,14,18,0.94)] flex flex-col p-4 sm:p-6 gap-4"
    >
      <div className="flex items-center justify-between gap-4 font-mono text-[15px]">
        <span>
          {title} — {pad(index + 1)} / {pad(total)}
        </span>
        <button type="button" onClick={onClose} aria-label="Close photo viewer" className={`${iconButton} w-12 h-12`} autoFocus>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center gap-2 sm:gap-4">
        <button type="button" onClick={prev} aria-label="Previous photo" className={`${iconButton} w-11 h-11 sm:w-14 sm:h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 h-full min-w-0 flex flex-col items-center justify-center gap-3">
          <img src={photo.image_url} alt={photo.caption || ""} className="max-w-full min-h-0 flex-1 object-contain" />
          {photo.caption && <p className="m-0 text-mist text-center">{photo.caption}</p>}
        </div>
        <button type="button" onClick={next} aria-label="Next photo" className={`${iconButton} w-11 h-11 sm:w-14 sm:h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
