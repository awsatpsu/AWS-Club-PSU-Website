import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { pad } from "../../site";

export function BuilderMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="1" />
      <rect x="3" y="10" width="8" height="1" />
      <rect x="3" y="3" width="1" height="8" />
      <rect x="10" y="3" width="1" height="8" />
      <rect x="5" y="1" width="1" height="2" />
      <rect x="8" y="1" width="1" height="2" />
      <rect x="5" y="11" width="1" height="2" />
      <rect x="8" y="11" width="1" height="2" />
      <rect x="1" y="5" width="2" height="1" />
      <rect x="1" y="8" width="2" height="1" />
      <rect x="11" y="5" width="2" height="1" />
      <rect x="11" y="8" width="2" height="1" />
      <rect x="5" y="5" width="1" height="1" />
    </svg>
  );
}

const NAV = [
  { to: "/", label: "Home", end: true, color: "#FF9900" },
  { to: "/members", label: "Team", end: false, color: "#FF57E9" },
  { to: "/events", label: "Events", end: false, color: "#41B3FF" },
  { to: "/gallery", label: "Gallery", end: false, color: "#AC5BFF" },
];

export const JOIN_LINK = { pathname: "/", hash: "#join" };

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash, key } = useLocation();

  // Any navigation closes the phone menu.
  useEffect(() => setMenuOpen(false), [pathname, hash, key]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    // The menu only exists below sm; widening the window past it closes the menu.
    const wide = window.matchMedia("(min-width: 40rem)");
    const onWide = () => wide.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sbg-down border-b border-line max-sm:sticky max-sm:top-0 max-sm:z-40 max-sm:bg-ink">
        <nav
          aria-label="Main"
          className="max-w-[1320px] mx-auto pl-4 pr-3 sm:px-10 h-16 sm:h-auto sm:py-3.5 flex sm:flex-wrap items-center justify-between gap-3 sm:gap-4"
        >
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 text-white no-underline">
            <span className="sbg-num w-10 h-10 sm:w-11 sm:h-11 bg-brand-orange text-ink flex items-center justify-center">
              <BuilderMark />
            </span>
            <span className="flex flex-col leading-tight font-mono">
              <span className="font-semibold text-[13px] sm:text-[15px]">AWS Student Builder Group</span>
              <span className="text-xs sm:text-[13px] text-fog">Penn State</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="sbg-burger sm:hidden shrink-0 w-12 h-12 border border-line bg-ink p-0 cursor-pointer flex flex-col items-center justify-center gap-[5px]"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="max-sm:hidden flex flex-wrap items-center gap-2 font-mono text-[15px]">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sbg-link text-white no-underline px-3.5 py-3 border-b-2 ${
                    isActive ? "border-brand-orange" : "border-transparent hover:border-line"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to={JOIN_LINK}
              className="sbg-btn ml-2 bg-brand-orange text-ink no-underline font-bold px-5 py-3"
            >
              Join us <span className="sbg-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Outside the header: its entrance transform would otherwise trap this fixed overlay. */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menu"
          className="sbg-menu site-grid-bg sm:hidden fixed top-[65px] inset-x-0 bottom-0 z-30 overflow-y-auto flex flex-col gap-1 px-4 pt-6 pb-8"
        >
          {NAV.map(({ to, label, end, color }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="sbg-menuitem sbg-press flex items-baseline gap-4 px-2 py-[18px] border-b border-line text-white no-underline font-mono text-[32px] font-semibold"
              style={{ animationDelay: `${(0.05 + i * 0.07).toFixed(2)}s` }}
            >
              <span className="text-[13px]" style={{ color }}>
                {pad(i + 1)}
              </span>
              {label}
            </NavLink>
          ))}
          <Link
            to={JOIN_LINK}
            onClick={() => setMenuOpen(false)}
            className="sbg-menuitem sbg-btn mt-7 mr-1 justify-center bg-brand-orange text-ink no-underline font-mono font-bold text-[17px] px-6 py-[18px]"
            style={{ animationDelay: `${(0.05 + NAV.length * 0.07).toFixed(2)}s` }}
          >
            Join us <span className="sbg-arrow" aria-hidden="true">→</span>
          </Link>
        </nav>
      )}
    </>
  );
}

// Phones only: keeps the way in to the group under the thumb on every page but Home,
// which already ends on the join section.
export function MobileJoinBar() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <div className="sbg-joinbar sm:hidden sticky bottom-0 z-10 bg-ink border-t border-line px-4 pt-3 pb-4">
      <Link
        to={JOIN_LINK}
        className="sbg-btn flex justify-center mr-1 bg-brand-orange text-ink no-underline font-mono font-bold text-base px-5 py-[15px]"
      >
        Join the group <span className="sbg-arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-[1320px] mx-auto flex flex-wrap items-stretch sm:border-x border-line">
        <div className="w-14 min-h-14 sm:w-16 sm:min-h-16 bg-brand-orange text-ink flex items-center justify-center">
          <BuilderMark />
        </div>
        <p className="flex-[1_1_0] sm:flex-[1_1_320px] min-w-0 self-center m-0 px-4 py-3 sm:px-6 sm:py-5 font-mono text-xs sm:text-sm text-fog">
          AWS Student Builder Group · Penn State — a student-run organization.
        </p>
        <div className="max-sm:w-full max-sm:grid max-sm:grid-cols-4 max-sm:border-t border-line flex flex-wrap font-mono text-sm">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="sbg-link sbg-press text-white no-underline px-6 py-5 max-sm:px-0 max-sm:py-[18px] max-sm:text-center border-l border-line max-sm:first:border-l-0 hover:bg-ink-raised"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  eyebrowClass,
  title,
  lede,
  aside,
}: {
  eyebrow: string;
  eyebrowClass: string;
  title: string;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <section className="site-grid-bg sbg-drift border-b border-line">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-11 sm:pt-[88px] pb-9 sm:pb-20 flex flex-wrap items-end justify-between gap-6 sm:gap-8">
        <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-4 sm:gap-5">
          <p className={`sbg-up m-0 font-mono text-xs sm:text-sm tracking-[0.08em] ${eyebrowClass}`} style={{ animationDelay: "0.1s" }}>
            {eyebrow}
          </p>
          <h1 style={{ animationDelay: "0.2s" }} className="sbg-up m-0 font-mono font-semibold text-[36px] sm:text-[60px] leading-[1.1] sm:leading-[1.08] tracking-[-0.02em]">
            {title}
          </h1>
          <p className="sbg-up m-0 max-w-[600px] text-base sm:text-xl text-mist" style={{ animationDelay: "0.3s" }}>
            {lede}
          </p>
        </div>
        {aside && (
          <div className="sbg-up" style={{ animationDelay: "0.4s" }}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

// Colored stand-in used wherever a real image is missing, with the design's notched corner.
export function ColorBlock({
  color,
  label,
  notch = 48,
  className = "",
  children,
}: {
  color: string;
  label?: string;
  notch?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`relative block ${className}`} style={{ background: color }}>
      <span className="absolute top-0 right-0 bg-ink" style={{ width: notch, height: notch }} />
      <span className="absolute bg-ink" style={{ top: notch, right: notch, width: notch / 2, height: notch / 2 }} />
      {label && (
        <span className="absolute left-4 bottom-4 font-mono text-[13px] font-semibold text-ink">{label}</span>
      )}
      {children}
    </span>
  );
}
