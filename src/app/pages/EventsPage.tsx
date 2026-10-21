import { useEffect, useState } from "react";
import { fetchAlbums, fetchPastEvents, fetchUpcomingEvents, type AlbumWithCount } from "../../lib/data";
import type { Event } from "../../lib/types";
import { formatDate } from "../../lib/date";
import { AlbumCard } from "../components/site/AlbumCard";
import { PageHero } from "../components/site/Chrome";

const TAG_COLORS: Record<string, string> = {
  Workshop: "#41B3FF",
  "Study Group": "#00E582",
  Speaker: "#AC5BFF",
  Hackathon: "#FF9900",
  Career: "#FF57E9",
};

export default function EventsPage() {
  const [albums, setAlbums] = useState<AlbumWithCount[] | null>(null);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [past, setPast] = useState<Event[]>([]);

  useEffect(() => {
    fetchAlbums().then(setAlbums);
    fetchUpcomingEvents().then(setUpcoming);
    fetchPastEvents().then(setPast);
  }, []);

  return (
    <>
      <PageHero
        eyebrow="EVENTS & PHOTOS"
        eyebrowClass="text-brand-sky"
        title="What we've been building."
        lede="One photo for every event. Click a cover to open the full album."
      />

      {upcoming.length > 0 && (
        <section className="border-b border-line">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-[72px] pb-[72px] flex flex-col gap-8">
            <SectionTitle color="#FF9900" title="Coming up" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] max-sm:grid-cols-1 gap-px bg-line border border-line">
              {upcoming.map((ev) => (
                <EventItem key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={past.length > 0 ? "border-b border-line" : ""}>
        <div className={`max-w-[1320px] mx-auto px-4 sm:px-10 pt-[72px] flex flex-col gap-8 ${past.length > 0 ? "pb-[72px]" : "pb-28"}`}>
          <SectionTitle color="#41B3FF" title="Photo albums" />
          {albums === null ? (
            <p className="m-0 font-mono text-fog">Loading…</p>
          ) : albums.length === 0 ? (
            <p className="m-0 font-mono text-fog">Photos coming soon — check back after our next event.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] max-sm:grid-cols-1 gap-8">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-[72px] pb-28 flex flex-col gap-8">
            <SectionTitle color="#A9B4C0" title="Past events" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] max-sm:grid-cols-1 gap-px bg-line border border-line">
              {past.map((ev) => (
                <EventItem key={ev.id} event={ev} past />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SectionTitle({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-4 h-4" style={{ background: color }} />
      <h2 className="m-0 font-mono font-semibold text-[28px]">{title}</h2>
    </div>
  );
}

function EventItem({ event, past = false }: { event: Event; past?: boolean }) {
  const meta = [formatDate(event.date), event.time, event.location].filter(Boolean).join(" · ");
  return (
    <div className="bg-ink p-7 flex flex-col gap-3">
      {event.tag && (
        <span className="flex items-center gap-2.5 font-mono text-[13px] font-semibold">
          <span className="w-2.5 h-2.5" style={{ background: TAG_COLORS[event.tag] ?? "#A9B4C0" }} />
          {event.tag.toUpperCase()}
        </span>
      )}
      <h3 className="m-0 font-mono text-[22px] font-semibold leading-tight">{event.title}</h3>
      {meta && <p className="m-0 font-mono text-[13px] text-fog">{meta}</p>}
      {event.description && <p className="m-0 text-mist">{event.description}</p>}
      {!past && event.capacity && <p className="m-0 font-mono text-[13px] text-fog">{event.capacity}</p>}
      {!past && event.rsvp_url && (
        <a
          href={event.rsvp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 self-start bg-brand-orange text-ink no-underline font-mono font-bold text-[15px] px-5 py-3 hover:bg-[#FFAD33]"
        >
          RSVP →
        </a>
      )}
    </div>
  );
}
