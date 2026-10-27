import type { CSSProperties } from "react";
import type { AlbumWithCount } from "../../../lib/data";
import { formatDate } from "../../../lib/date";
import { colorFor, tagColor } from "../../site";
import { ColorBlock } from "./Chrome";
import { FlipCard } from "./FlipCard";

export function photoCountLabel(n: number) {
  return `${n} ${n === 1 ? "photo" : "photos"}`;
}

export function albumPath(albumId: string) {
  return `/gallery/${albumId}`;
}

// Cards in a grid deal in one after another; `index` sets this card's place in that stagger.
export function dealDelay(index: number) {
  return `${(0.35 + Math.min(index, 12) * 0.08).toFixed(2)}s`;
}

export function AlbumCard({
  album,
  compact = false,
  index = 0,
}: {
  album: AlbumWithCount;
  compact?: boolean;
  index?: number;
}) {
  const color = colorFor(album.id);
  const height = compact ? "h-[220px]" : "h-[210px] sm:h-[280px]";
  return (
    <FlipCard
      to={albumPath(album.id)}
      color={color}
      title={album.label}
      label={`Open the ${album.label} album, ${photoCountLabel(album.photo_count)}`}
      className={compact ? "sbg-lift" : "sbg-card"}
      style={{ "--c": color, animationDelay: compact ? undefined : dealDelay(index) } as CSSProperties}
    >
      <div className="h-full flex flex-col text-white bg-ink-raised border border-line">
        {album.cover_image_url ? (
          <span className={`relative block overflow-hidden ${height}`}>
            <img
              src={album.cover_image_url}
              alt=""
              className="sbg-zoom w-full h-full object-cover"
            />
            {!compact && <CountBadge n={album.photo_count} />}
          </span>
        ) : (
          <span className={`relative block overflow-hidden ${height}`}>
            <ColorBlock color={color} label="COVER PHOTO" notch={compact ? 0 : 48} className="sbg-zoom h-full" />
            {!compact && <CountBadge n={album.photo_count} />}
          </span>
        )}
        <span className={`flex flex-col gap-1.5 ${compact ? "px-6 pt-5 pb-6" : "px-4 pt-4 pb-[18px] sm:px-6 sm:pt-[22px] sm:pb-[26px]"}`}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs sm:text-[13px]">
            {album.event?.tag && <EventTag tag={album.event.tag} />}
            {album.date && <span className="text-fog">{formatDate(album.date)}</span>}
          </span>
          <span className={`font-mono font-semibold leading-[1.3] ${compact ? "text-xl" : "text-lg sm:text-[22px]"}`}>
            {album.label}
            {compact && <span className="sbg-arrow ml-2" aria-hidden="true">→</span>}
          </span>
          {album.event && album.event.title !== album.label && (
            <span className="font-mono text-[13px] text-fog">From {album.event.title}</span>
          )}
          {!compact && (
            <span className="mt-1.5 sm:mt-2.5 font-mono text-sm sm:text-[15px] text-brand-sky">
              View photos <span className="sbg-arrow" aria-hidden="true">→</span>
            </span>
          )}
        </span>
      </div>
    </FlipCard>
  );
}

export function EventTag({ tag }: { tag: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[13px] font-semibold text-white">
      <span className="w-2.5 h-2.5" style={{ background: tagColor(tag) }} />
      {tag.toUpperCase()}
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 bg-ink text-white font-mono text-xs sm:text-[13px] px-2 py-1 sm:px-2.5 sm:py-1.5">
      {photoCountLabel(n)}
    </span>
  );
}
