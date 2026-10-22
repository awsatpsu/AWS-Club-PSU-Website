import { useEffect, useState } from "react";
import { fetchAlbums, type AlbumWithCount } from "../../lib/data";
import { AlbumCard } from "../components/site/AlbumCard";
import { PageHero } from "../components/site/Chrome";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumWithCount[] | null>(null);

  useEffect(() => {
    fetchAlbums().then(setAlbums);
  }, []);

  return (
    <>
      <PageHero
        eyebrow="GALLERY"
        eyebrowClass="text-brand-violet"
        title="Photos from every event."
        lede="Each album belongs to one of our events. Click a card to flip it open."
      />

      <section>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-[72px] pb-28">
          {albums === null ? (
            <p className="m-0 font-mono text-fog">Loading…</p>
          ) : albums.length === 0 ? (
            <p className="m-0 font-mono text-fog">Photos coming soon — check back after our next event.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] max-sm:grid-cols-1 gap-8">
              {albums.map((album, i) => (
                <AlbumCard key={album.id} album={album} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
