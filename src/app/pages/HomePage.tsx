import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAlbums, type AlbumWithCount } from "../../lib/data";
import { AlbumCard } from "../components/site/AlbumCard";
import { JOIN_LINK } from "../components/site/Chrome";
import { albumPath, photoCountLabel } from "../components/site/AlbumCard";
import { formatDate } from "../../lib/date";
import { colorFor, JOIN_DETAILS, LINKTREE_URL, pad } from "../site";

const MOSAIC = ["OO.P.OO", "O.POP.O", ".P.K.P.", "POK.KOP", ".P.K.P.", "O.POP.O", "OO.P.OO"];
const MOSAIC_COLORS: Record<string, string> = { O: "#FF9900", P: "#AC5BFF", K: "#FF57E9", ".": "#151D25" };

// Tiles pop in outward from the center, then a brightness wave rolls out on a loop.
const MOSAIC_CELLS = MOSAIC.flatMap((row, r) =>
  row.split("").map((c, col) => {
    const d = Math.abs(r - 3) + Math.abs(col - 3);
    const jitter = ((r * 7 + col * 13) % 5) * 0.02;
    const pop = (0.5 + d * 0.09 + jitter).toFixed(2);
    const wave = (2.2 + d * 0.11).toFixed(2);
    return c === "."
      ? { bg: MOSAIC_COLORS[c], cls: "sbg-ghost", delay: `${wave}s` }
      : { bg: MOSAIC_COLORS[c], cls: "sbg-pix", delay: `${pop}s, ${wave}s` };
  }),
);

const PILLARS = [
  { n: "01", title: "Learn", body: "Hands-on workshops on core AWS services — from compute and storage to serverless and generative AI." },
  { n: "02", title: "Build", body: "Team projects and hackathons where you ship something real and add it to your portfolio." },
  { n: "03", title: "Connect", body: "Meet fellow builders, AWS engineers and alumni through talks, socials and career events." },
];

const ACTIVITIES = [
  { n: "01", color: "#FF9900", title: "Workshops", body: "Guided, laptop-open sessions on AWS services — you leave with something running." },
  { n: "02", color: "#41B3FF", title: "Build nights", body: "Open co-working for team projects, with experienced members on hand to help you get unstuck." },
  { n: "03", color: "#00E582", title: "Hackathons", body: "Weekend sprints to design, build and demo a cloud project with a team." },
  { n: "04", color: "#AC5BFF", title: "Certification prep", body: "Study groups for AWS Certified Cloud Practitioner and the associate-level exams." },
  { n: "05", color: "#FF57E9", title: "Speaker sessions", body: "Talks from AWS engineers, alumni and industry builders on careers and real architectures." },
  { n: "06", color: "#FF9900", title: "Socials", body: "Game nights, food and plenty of time to meet the rest of the group." },
];

const container = "max-w-[1320px] mx-auto px-5 sm:px-10";
const h2 = "m-0 font-mono font-semibold text-[30px] sm:text-[40px] leading-[1.15]";
// Phones stack the buttons full width; the 4px right margin leaves room for their offset shadow.
const stackBtn = "max-sm:flex max-sm:justify-center max-sm:mr-1";

export default function HomePage() {
  const [recent, setRecent] = useState<AlbumWithCount[]>([]);

  useEffect(() => {
    fetchAlbums(3).then(setRecent);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="site-grid-bg sbg-drift border-b border-line">
        <div className={`${container} pt-12 pb-14 sm:pt-24 sm:pb-28 flex flex-wrap items-center gap-11 sm:gap-16`}>
          <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5 sm:gap-7">
            <p className="sbg-up m-0 font-mono text-xs sm:text-sm tracking-[0.08em] text-brand-mint" style={{ animationDelay: "0.15s" }}>
              PENN STATE · UNIVERSITY PARK
            </p>
            <h1 style={{ animationDelay: "0.3s" }} className="sbg-up m-0 font-mono font-semibold text-[36px] sm:text-[64px] leading-[1.1] sm:leading-[1.08] tracking-[-0.02em]">
              Learn the cloud by building on it.
              <span className="sbg-cursor" aria-hidden="true" />
            </h1>
            <p className="sbg-up m-0 max-w-[600px] text-[17px] sm:text-xl text-mist" style={{ animationDelay: "0.45s" }}>
              We're Penn State's AWS Student Builder Group — a student-run community where students of every major
              learn cloud computing, ship real projects, and meet the people building with AWS.
            </p>
            <div className="sbg-up flex max-sm:flex-col sm:flex-wrap gap-3.5 sm:gap-4 pt-2 font-mono text-[17px]" style={{ animationDelay: "0.6s" }}>
              <Link to={JOIN_LINK} className={`sbg-btn sbg-ring ${stackBtn} bg-brand-orange text-ink no-underline font-bold px-8 py-[18px]`}>
                Join us <span className="sbg-arrow" aria-hidden="true">→</span>
              </Link>
              <Link
                to="/events"
                className="sbg-ghostbtn max-sm:justify-center max-sm:mr-1 border border-white text-white no-underline font-medium px-[31px] py-[17px]"
              >
                See our events <span className="sbg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="w-full max-w-[428px] grid grid-cols-7 gap-px bg-line border border-line">
            {MOSAIC_CELLS.map((cell, i) => (
              <div key={i} className={`aspect-square ${cell.cls}`} style={{ background: cell.bg, animationDelay: cell.delay }} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b border-line max-sm:scroll-mt-16">
        <div className={`sbg-reveal ${container} py-16 sm:py-28 flex flex-col gap-8 sm:gap-14`}>
          <div className="flex flex-wrap gap-6 sm:gap-12 items-start">
            <h2 className={`flex-[1_1_360px] ${h2}`}>About the group</h2>
            <p className="flex-[2_1_520px] m-0 text-[17px] sm:text-xl text-mist">
              AWS Student Builder Groups are student-led communities on campuses around the world. Our Penn State
              chapter runs hands-on workshops, build nights and hackathons so members can go from their first login
              to a deployed project — no prior cloud experience needed.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-px bg-line border border-line">
            {PILLARS.map((p) => (
              <div key={p.n} className="sbg-cell bg-ink p-6 sm:p-8 flex sm:flex-col items-start sm:items-stretch gap-4 sm:min-h-60">
                <span className="sbg-num shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-brand-sky text-ink font-mono font-semibold text-sm sm:text-[15px] flex items-center justify-center">
                  {p.n}
                </span>
                <div className="flex flex-col gap-1.5 sm:gap-4">
                  <h3 className="m-0 sm:mt-4 font-mono text-[22px] sm:text-[26px] font-semibold">{p.title}</h3>
                  <p className="m-0 text-[15px] sm:text-[17px] text-mist">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-white text-ink">
        <div className={`sbg-reveal ${container} py-16 sm:py-28 flex flex-col gap-6 sm:gap-12`}>
          <div className="flex flex-wrap justify-between items-end gap-2.5 sm:gap-6">
            <h2 className={h2}>What we do</h2>
            <p className="m-0 max-w-[480px] text-[15px] sm:text-[17px] text-slate">
              Something for first-timers and seasoned builders alike, every semester.
              <span className="sm:hidden font-mono font-semibold text-ink">
                {" "}
                Swipe <span className="sbg-nudge" aria-hidden="true">→</span>
              </span>
            </p>
          </div>
          <div className="sbg-scroll grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-px bg-line-light border border-line-light max-sm:flex max-sm:gap-3 max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-5 max-sm:-mx-5 max-sm:px-5 max-sm:pt-1 max-sm:pb-2 max-sm:bg-transparent max-sm:border-0">
            {ACTIVITIES.map((a) => (
              <div
                key={a.n}
                className="sbg-wcell bg-white p-6 sm:px-8 sm:pt-7 sm:pb-9 flex flex-col gap-2.5 sm:gap-3 max-sm:flex-[0_0_280px] max-sm:snap-start max-sm:min-h-[220px] max-sm:border max-sm:border-line-light"
              >
                <span className="flex justify-between items-center">
                  <span className="font-mono text-[13px] sm:text-sm text-slate-soft">
                    {a.n}
                    <span className="sm:hidden"> / {pad(ACTIVITIES.length)}</span>
                  </span>
                  <span className="sm:hidden w-3.5 h-3.5" style={{ background: a.color }} aria-hidden="true" />
                </span>
                <span className="sbg-bar max-sm:hidden" aria-hidden="true" />
                <h3 className="mt-5 sm:mt-3 mb-0 font-mono text-xl sm:text-[22px] font-semibold">{a.title}</h3>
                <p className="m-0 text-[15px] sm:text-[17px] text-slate">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Band */}
      <section className="bg-brand-violet text-ink">
        <div className={`sbg-reveal ${container} py-14 sm:py-24 flex max-sm:flex-col sm:flex-wrap sm:items-center justify-between gap-7 sm:gap-10`}>
          <p className="m-0 sm:flex-[1_1_560px] font-mono text-[30px] sm:text-[44px] leading-[1.2] font-medium">
            No cloud experience required. Just curiosity.
          </p>
          <Link to={JOIN_LINK} className={`sbg-btn ${stackBtn} bg-ink text-white no-underline font-mono font-bold text-[17px] px-8 py-[18px]`}>
            Join us <span className="sbg-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Recent events */}
      {recent.length > 0 && (
        <section className="border-b border-line">
          <div className={`sbg-reveal ${container} py-16 sm:py-28 flex flex-col gap-5 sm:gap-12`}>
            <div className="flex flex-wrap justify-between items-end gap-6">
              <h2 className={h2}>Recent events</h2>
              <Link to="/gallery" className="max-sm:hidden sbg-textlink font-mono text-base py-3 text-brand-sky hover:text-[#8FD0FF]">
                All photos <span className="sbg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="max-sm:hidden grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              {recent.map((album) => (
                <AlbumCard key={album.id} album={album} compact />
              ))}
            </div>
            <div className="sm:hidden flex flex-col border-t border-line">
              {recent.map((album) => (
                <RecentRow key={album.id} album={album} />
              ))}
            </div>
            <Link
              to="/gallery"
              className="sm:hidden sbg-ghostbtn justify-center mr-1 border border-white text-white no-underline font-mono text-base px-5 py-[15px]"
            >
              All photos <span className="sbg-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Join */}
      <section id="join" className="bg-brand-orange text-ink scroll-mt-4 max-sm:scroll-mt-16">
        <div className={`sbg-reveal ${container} py-16 sm:py-28 flex flex-wrap gap-6 sm:gap-16 items-start`}>
          <div className="flex-[1_1_420px] min-w-0 flex flex-col gap-6">
            <h2 className="m-0 font-mono font-semibold text-[36px] sm:text-[52px] leading-[1.1]">Join the group</h2>
            <p className="m-0 text-[17px] sm:text-xl max-w-[520px]">
              Membership is free and open to every Penn State student. Sign up to get meeting reminders, workshop
              invites and hackathon news.
            </p>
            <div className="sm:mt-4 grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px bg-ink border border-ink">
              {JOIN_DETAILS.map((d) => (
                <div key={d.label} className="min-w-0 bg-brand-orange p-4 sm:p-5">
                  <p className="m-0 font-mono text-xs sm:text-[13px] font-semibold">{d.label}</p>
                  <p className="mt-1 sm:mt-1.5 mb-0 text-[15px] sm:text-[17px] break-words">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-[1_1_420px] min-w-0 bg-ink text-white px-5 pt-6 pb-7 sm:p-10 flex flex-col gap-4 sm:gap-5 justify-center min-h-[280px] sm:min-h-[360px]">
            <span className="sbg-check w-[52px] h-[52px] sm:w-14 sm:h-14 bg-brand-mint text-ink flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </span>
            <h3 className="m-0 font-mono text-2xl sm:text-[28px] font-semibold">Get on the list.</h3>
            <p className="m-0 text-mist">
              Sign-up, our group chat and every upcoming event live on our Linktree. Join in a minute — no experience
              needed.
            </p>
            <a
              href={LINKTREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sbg-btn mt-2 sm:self-start max-sm:justify-center max-sm:mr-1 bg-brand-orange text-ink no-underline font-mono font-bold text-[17px] px-6 py-[18px]"
            >
              Sign up <span className="sbg-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Phone version of a recent album: a thumbnail row instead of a card.
function RecentRow({ album }: { album: AlbumWithCount }) {
  const meta = [album.date && formatDate(album.date), photoCountLabel(album.photo_count)].filter(Boolean).join(" · ");
  return (
    <Link
      to={albumPath(album.id)}
      className="sbg-press flex items-center gap-4 py-3.5 border-b border-line bg-ink text-white no-underline"
    >
      <span className="shrink-0 w-20 h-20 overflow-hidden" style={{ background: colorFor(album.id) }}>
        {album.cover_image_url && <img src={album.cover_image_url} alt="" className="w-full h-full object-cover" />}
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="font-mono text-xs text-fog">{meta}</span>
        <span className="font-mono text-[17px] font-semibold leading-[1.3]">{album.label}</span>
      </span>
      <span aria-hidden="true" className="font-mono text-brand-sky pr-1">
        →
      </span>
    </Link>
  );
}
