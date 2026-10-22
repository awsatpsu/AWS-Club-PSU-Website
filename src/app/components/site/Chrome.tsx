import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

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
  { to: "/", label: "Home", end: true },
  { to: "/members", label: "Members", end: false },
  { to: "/events", label: "Events", end: false },
  { to: "/gallery", label: "Gallery", end: false },
];

export const JOIN_LINK = { pathname: "/", hash: "#join" };

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <nav
        aria-label="Main"
        className="max-w-[1320px] mx-auto px-4 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4"
      >
        <Link to="/" className="flex items-center gap-3.5 text-white no-underline">
          <span className="w-11 h-11 bg-brand-orange text-ink flex items-center justify-center">
            <BuilderMark />
          </span>
          <span className="flex flex-col leading-tight font-mono">
            <span className="font-semibold text-[15px]">AWS Student Builder Group</span>
            <span className="text-[13px] text-fog">Penn State</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[15px]">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-white no-underline px-3.5 py-3 border-b-2 ${
                  isActive ? "border-brand-orange" : "border-transparent hover:border-line"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to={JOIN_LINK}
            className="ml-2 bg-brand-orange text-ink no-underline font-bold px-5 py-3 hover:bg-[#FFAD33]"
          >
            Join us →
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-[1320px] mx-auto flex flex-wrap items-stretch border-x border-line">
        <div className="w-16 min-h-16 bg-brand-orange text-ink flex items-center justify-center">
          <BuilderMark />
        </div>
        <p className="flex-[1_1_320px] m-0 px-6 py-5 font-mono text-sm text-fog">
          AWS Student Builder Group · Penn State — a student-run organization.
        </p>
        <div className="flex flex-wrap font-mono text-sm">
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} className="text-white no-underline px-6 py-5 border-l border-line hover:bg-ink-raised">
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
    <section className="site-grid-bg border-b border-line">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-16 sm:pt-[88px] pb-14 sm:pb-20 flex flex-wrap items-end justify-between gap-8">
        <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5">
          <p className={`m-0 font-mono text-sm tracking-[0.08em] ${eyebrowClass}`}>{eyebrow}</p>
          <h1 className="m-0 font-mono font-semibold text-[40px] sm:text-[60px] leading-[1.08] tracking-[-0.02em]">
            {title}
          </h1>
          <p className="m-0 max-w-[600px] text-lg sm:text-xl text-mist">{lede}</p>
        </div>
        {aside}
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
