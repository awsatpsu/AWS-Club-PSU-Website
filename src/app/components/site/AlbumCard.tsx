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

export function AlbumCard({ album, compact = false }: { album: AlbumWithCount; compact?: boolean }) {
  const color = colorFor(album.id);
  const height = compact ? "h-[220px]" : "h-[240px] sm:h-[280px]";
  return (
    <FlipCard
      to={albumPath(album.id)}
      color={color}
      title={album.label}
      label={`Open the ${album.label} album, ${photoCountLabel(album.photo_count)}`}
    >
      <div className="h-full flex flex-col text-white bg-ink-raised border border-line group-hover:border-fog transition-colors">
        {album.cover_image_url ? (
          <span className={`relative block overflow-hidden ${height}`}>
            <img
              src={album.cover_image_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {!compact && <CountBadge n={album.photo_count} />}
          </span>
        ) : (
          <ColorBlock color={color} label="COVER PHOTO" notch={compact ? 0 : 48} className={height}>
            {!compact && <CountBadge n={album.photo_count} />}
          </ColorBlock>
        )}
        <span className={`flex flex-col gap-1.5 ${compact ? "px-6 pt-5 pb-6" : "px-6 pt-[22px] pb-[26px]"}`}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px]">
            {album.event?.tag && <EventTag tag={album.event.tag} />}
            {album.date && <span className="text-fog">{formatDate(album.date)}</span>}
          </span>
          <span className={`font-mono font-semibold ${compact ? "text-xl" : "text-[22px]"}`}>{album.label}</span>
          {album.event && album.event.title !== album.label && (
            <span className="font-mono text-[13px] text-fog">From {album.event.title}</span>
          )}
          {!compact && <span className="mt-2.5 font-mono text-[15px] text-brand-sky">View photos →</span>}
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
    <span className="absolute right-4 bottom-4 bg-ink text-white font-mono text-[13px] px-2.5 py-1.5">
      {photoCountLabel(n)}
    </span>
  );
}
