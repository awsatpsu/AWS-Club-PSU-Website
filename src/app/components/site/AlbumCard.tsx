import { Link } from "react-router";
import type { AlbumWithCount } from "../../../lib/data";
import { formatDate } from "../../../lib/date";
import { colorFor } from "../../site";
import { ColorBlock } from "./Chrome";

export function photoCountLabel(n: number) {
  return `${n} ${n === 1 ? "photo" : "photos"}`;
}

export function AlbumCard({ album, compact = false }: { album: AlbumWithCount; compact?: boolean }) {
  const color = colorFor(album.id);
  const height = compact ? "h-[220px]" : "h-[240px] sm:h-[280px]";
  return (
    <Link
      to={`/events/${album.id}`}
      aria-label={`Open the ${album.label} album, ${photoCountLabel(album.photo_count)}`}
      className="group flex flex-col no-underline text-white bg-ink-raised border border-line hover:border-fog transition-colors"
    >
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
        {album.date && <span className="font-mono text-[13px] text-fog">{formatDate(album.date)}</span>}
        <span className={`font-mono font-semibold ${compact ? "text-xl" : "text-[22px]"}`}>{album.label}</span>
        {!compact && <span className="mt-2.5 font-mono text-[15px] text-brand-sky">View album →</span>}
      </span>
    </Link>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-4 bottom-4 bg-ink text-white font-mono text-[13px] px-2.5 py-1.5">
      {photoCountLabel(n)}
    </span>
  );
}
