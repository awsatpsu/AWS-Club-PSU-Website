import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { SiteHeader, SiteFooter } from "./components/site/Chrome";
import HomePage from "./pages/HomePage";
import MembersPage from "./pages/MembersPage";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import AlbumPage from "./pages/AlbumPage";

// Route changes start at the top, unless the link targets an anchor on the page.
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);
  return null;
}

export default function App() {
  return (
    <div className="site min-h-screen bg-ink text-white">
      <ScrollManager />
      <SiteHeader />
      <main>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="gallery/:albumId" element={<AlbumPage />} />
          {/* Album links from before the gallery got its own tab. */}
          <Route path="events/:albumId" element={<AlbumPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}
