import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { motion } from "motion/react";
import { fetchAlbum, fetchPhotos, type AlbumWithCount } from "../../lib/data";
import type { GalleryPhoto } from "../../lib/types";
import { EventTag, photoCountLabel } from "../components/site/AlbumCard";
import type { FlipState } from "../components/site/FlipCard";
import { formatDate } from "../../lib/date";
import { colorFor, pad } from "../site";

export default function AlbumPage() {
  const { albumId = "" } = useParams();
  const { state } = useLocation() as { state: FlipState | null };
  const fromEvents = state?.from === "/events";
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
      {/* Arriving from a flipped card, the page turns the rest of the way in. */}
      <div style={{ perspective: 2000 }}>
        <motion.div
          initial={state?.flipped ? { rotateY: -90, opacity: 0 } : false}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center top" }}
        >
          <section className="border-b border-line">
            <div className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-5 pb-7 sm:pt-10 sm:pb-14 flex flex-col gap-[18px] sm:gap-7">
              <Link
                to={fromEvents ? "/events" : "/gallery"}
                className="sbg-outline sbg-back sbg-up self-start min-h-11 border border-line text-white no-underline font-mono text-sm sm:text-[15px] px-4 py-2.5 sm:px-[18px] sm:py-3"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="sbg-arrow" aria-hidden="true">←</span> {fromEvents ? "All events" : "Gallery"}
              </Link>
              {album === null ? (
                <h1 className="m-0 font-mono font-semibold text-[32px] sm:text-[40px] leading-[1.1]">Album not found.</h1>
              ) : (
                <div className="sbg-up flex flex-wrap items-end justify-between gap-4 sm:gap-6" style={{ animationDelay: "0.15s" }}>
                  <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-2.5 sm:gap-3.5">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <span className="w-3 h-3 sm:w-4 sm:h-4" style={{ background: color }} />
                      {album?.event?.tag && <EventTag tag={album.event.tag} />}
                      {album?.date && <span className="font-mono text-xs sm:text-sm text-fog">{formatDate(album.date)}</span>}
                    </div>
                    <h1 className="m-0 font-mono font-semibold text-[32px] sm:text-[52px] leading-[1.12] sm:leading-[1.1] tracking-[-0.02em]">
                      {album?.label ?? " "}
                    </h1>
                    {album?.event && album.event.title !== album.label && (
                      <p className="m-0 font-mono text-[15px] text-fog">From {album.event.title}</p>
                    )}
                  </div>
                  {album && (
                    <span className="font-mono text-xs sm:text-[15px] border border-line px-2 py-1 sm:px-3.5 sm:py-2.5">{photoCountLabel(count)}</span>
                  )}
                </div>
              )}
            </div>
          </section>

          {album !== null && (
            <section>
              <div className="max-w-[1320px] mx-auto px-3 sm:px-10 pt-4 pb-12 sm:pt-12 sm:pb-28">
                {photos === null ? (
                  <p className="m-0 font-mono text-fog">Loading…</p>
                ) : photos.length === 0 ? (
                  <p className="m-0 font-mono text-fog">No photos yet for this event.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] auto-rows-[168px] sm:auto-rows-[220px] grid-flow-dense gap-2 sm:gap-3">
                    {photos.map((photo, i) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setOpen(i)}
                        aria-label={`View photo ${i + 1} of ${photos.length}`}
                        style={{ animationDelay: `${(0.25 + Math.min(i, 40) * 0.045).toFixed(3)}s` }}
                        className={`sbg-photo relative overflow-hidden border-0 p-0 bg-ink-raised cursor-zoom-in ${
                          i % 7 === 0 ? "col-span-2 row-span-2" : ""
                        }`}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption || ""}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </motion.div>
      </div>

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
  const touchX = useRef<number | null>(null);

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
    "sbg-outline shrink-0 flex items-center justify-center border border-white text-white cursor-pointer";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="sbg-lightbox fixed inset-0 z-50 bg-[rgba(10,14,18,0.97)] sm:bg-[rgba(10,14,18,0.94)] flex flex-col px-3 pt-3 pb-5 sm:p-6 gap-3 sm:gap-4"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4 pl-1 sm:pl-0 font-mono text-[13px] sm:text-[15px]">
        <span className="min-w-0">
          {title}
          <span className="max-sm:hidden">
            {" "}
            — {pad(index + 1)} / {pad(total)}
          </span>
        </span>
        <button type="button" onClick={onClose} aria-label="Close photo viewer" className={`${iconButton} w-12 h-12`} autoFocus>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
      {/* Swiping the photo left or right steps through the album on touch screens. */}
      <div
        className="flex-1 min-h-0 flex items-center gap-2 sm:gap-4"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        }}
      >
        <button type="button" onClick={prev} aria-label="Previous photo" className={`${iconButton} max-sm:hidden w-14 h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 h-full min-w-0 flex flex-col items-center justify-center gap-3">
          {/* Keyed by position so each new photo pops in. */}
          <img key={index} src={photo.image_url} alt={photo.caption || ""} className="sbg-lbimg max-w-full min-h-0 flex-1 object-contain" />
          {photo.caption && <p className="m-0 text-mist text-center">{photo.caption}</p>}
        </div>
        <button type="button" onClick={next} aria-label="Next photo" className={`${iconButton} max-sm:hidden w-14 h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Phones: arrows and the counter sit under the photo, within thumb reach. */}
      <div className="sm:hidden flex items-center justify-between gap-3">
        <button type="button" onClick={prev} aria-label="Previous photo" className={`${iconButton} w-16 h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="font-mono text-[15px]">
          {pad(index + 1)} / {pad(total)}
        </span>
        <button type="button" onClick={next} aria-label="Next photo" className={`${iconButton} w-16 h-14`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
