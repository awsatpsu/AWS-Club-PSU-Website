import { useEffect, useState, type CSSProperties } from "react";
import { fetchAlbums, fetchPastEvents, fetchUpcomingEvents, type AlbumWithCount } from "../../lib/data";
import type { Event } from "../../lib/types";
import { formatDate } from "../../lib/date";
import { albumPath, dealDelay, EventTag, photoCountLabel } from "../components/site/AlbumCard";
import { PageHero } from "../components/site/Chrome";
import { FlipCard } from "../components/site/FlipCard";
import { colorFor } from "../site";

export default function EventsPage() {
  const [upcoming, setUpcoming] = useState<Event[] | null>(null);
  const [past, setPast] = useState<Event[]>([]);
  const [albumByEvent, setAlbumByEvent] = useState<Map<string, AlbumWithCount>>(new Map());

  useEffect(() => {
    fetchUpcomingEvents().then(setUpcoming);
    fetchPastEvents().then(setPast);
    fetchAlbums().then((albums) =>
      setAlbumByEvent(new Map(albums.filter((a) => a.event_id).map((a) => [a.event_id!, a]))),
    );
  }, []);

  return (
    <>
      <PageHero
        eyebrow="EVENTS"
        eyebrowClass="text-brand-sky"
        title="What we've been building."
        lede="Workshops, build nights and talks. Click an event with photos to flip it open."
      />

      <section className={past.length > 0 ? "border-b border-line" : ""}>
        <div className={`max-w-[1320px] mx-auto px-4 sm:px-10 pt-9 sm:pt-[72px] flex flex-col gap-5 sm:gap-8 ${past.length > 0 ? "pb-12 sm:pb-[72px]" : "pb-14 sm:pb-28"}`}>
          <SectionTitle color="#FF9900" title="Coming up" />
          {upcoming === null ? (
            <p className="m-0 font-mono text-fog">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="m-0 font-mono text-fog">Nothing scheduled yet — check back soon.</p>
          ) : (
            <EventGrid events={upcoming} albumByEvent={albumByEvent} />
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-12 pb-14 sm:pt-[72px] sm:pb-28 flex flex-col gap-5 sm:gap-8">
            <SectionTitle color="#A9B4C0" title="Past events" />
            <EventGrid events={past} albumByEvent={albumByEvent} past />
          </div>
        </section>
      )}
    </>
  );
}

function SectionTitle({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ background: color }} />
      <h2 className="m-0 font-mono font-semibold text-[22px] sm:text-[28px]">{title}</h2>
    </div>
  );
}

function EventGrid({
  events,
  albumByEvent,
  past = false,
}: {
  events: Event[];
  albumByEvent: Map<string, AlbumWithCount>;
  past?: boolean;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] max-sm:grid-cols-1 gap-px bg-line border border-line">
      {events.map((ev, i) => {
        const album = albumByEvent.get(ev.id);
        const item = <EventItem event={ev} album={album} past={past} />;
        // Events with photos deal in and lift on hover; the rest only deal in.
        return album ? (
          <FlipCard
            key={ev.id}
            to={albumPath(album.id)}
            color={colorFor(album.id)}
            title={ev.title}
            label={`See photos from ${ev.title}, ${photoCountLabel(album.photo_count)}`}
            className="sbg-card"
            style={{ "--c": colorFor(album.id), animationDelay: dealDelay(i) } as CSSProperties}
          >
            {item}
          </FlipCard>
        ) : (
          <div key={ev.id} className="sbg-deal" style={{ animationDelay: dealDelay(i) }}>
            {item}
          </div>
        );
      })}
    </div>
  );
}

function EventItem({ event, album, past }: { event: Event; album?: AlbumWithCount; past: boolean }) {
  const meta = [formatDate(event.date), event.time, event.location].filter(Boolean).join(" · ");
  return (
    <div className="h-full bg-ink p-5 sm:p-7 flex flex-col gap-3">
      {event.tag && <EventTag tag={event.tag} />}
      <h3 className="m-0 font-mono text-xl sm:text-[22px] font-semibold leading-tight">{event.title}</h3>
      {meta && <p className="m-0 font-mono text-xs sm:text-[13px] text-fog">{meta}</p>}
      {event.description && <p className="m-0 text-[15px] sm:text-[17px] text-mist">{event.description}</p>}
      {!past && event.capacity && <p className="m-0 font-mono text-[13px] text-fog">{event.capacity}</p>}
      {(album || (!past && event.rsvp_url)) && (
        <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          {!past && event.rsvp_url && (
            <a
              href={event.rsvp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="sbg-btn relative z-10 bg-brand-orange text-ink no-underline font-mono font-bold text-[15px] px-5 py-3"
            >
              RSVP <span className="sbg-arrow" aria-hidden="true">→</span>
            </a>
          )}
          {album && (
            <span className="font-mono text-[15px] text-brand-sky">
              {photoCountLabel(album.photo_count)} <span className="sbg-arrow" aria-hidden="true">→</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
