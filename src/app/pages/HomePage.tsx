import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAlbums, type AlbumWithCount } from "../../lib/data";
import { AlbumCard } from "../components/site/AlbumCard";
import { JOIN_LINK } from "../components/site/Chrome";
import { JOIN_DETAILS, LINKTREE_URL } from "../site";

const MOSAIC = ["OO.P.OO", "O.POP.O", ".P.K.P.", "POK.KOP", ".P.K.P.", "O.POP.O", "OO.P.OO"];
const MOSAIC_COLORS: Record<string, string> = { O: "#FF9900", P: "#AC5BFF", K: "#FF57E9", ".": "#151D25" };

const PILLARS = [
  { n: "01", title: "Learn", body: "Hands-on workshops on core AWS services — from compute and storage to serverless and generative AI." },
  { n: "02", title: "Build", body: "Team projects and hackathons where you ship something real and add it to your portfolio." },
  { n: "03", title: "Connect", body: "Meet fellow builders, AWS engineers and alumni through talks, socials and career events." },
];

const ACTIVITIES = [
  { n: "01", title: "Workshops", body: "Guided, laptop-open sessions on AWS services — you leave with something running." },
  { n: "02", title: "Build nights", body: "Open co-working for team projects, with experienced members on hand to help you get unstuck." },
  { n: "03", title: "Hackathons", body: "Weekend sprints to design, build and demo a cloud project with a team." },
  { n: "04", title: "Certification prep", body: "Study groups for AWS Certified Cloud Practitioner and the associate-level exams." },
  { n: "05", title: "Speaker sessions", body: "Talks from AWS engineers, alumni and industry builders on careers and real architectures." },
  { n: "06", title: "Socials", body: "Game nights, food and plenty of time to meet the rest of the group." },
];

const container = "max-w-[1320px] mx-auto px-4 sm:px-10";
const h2 = "m-0 font-mono font-semibold text-[32px] sm:text-[40px] leading-[1.15]";

export default function HomePage() {
  const [recent, setRecent] = useState<AlbumWithCount[]>([]);

  useEffect(() => {
    fetchAlbums(3).then(setRecent);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="site-grid-bg border-b border-line">
        <div className={`${container} py-20 sm:pt-24 sm:pb-28 flex flex-wrap items-center gap-16`}>
          <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-7">
            <p className="m-0 font-mono text-sm tracking-[0.08em] text-brand-mint">PENN STATE · UNIVERSITY PARK</p>
            <h1 className="m-0 font-mono font-semibold text-[42px] sm:text-[64px] leading-[1.08] tracking-[-0.02em]">
              Learn the cloud by building on it.
            </h1>
            <p className="m-0 max-w-[600px] text-lg sm:text-xl text-mist">
              We're Penn State's AWS Student Builder Group — a student-run community where students of every major
              learn cloud computing, ship real projects, and meet the people building with AWS.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 font-mono text-[17px]">
              <Link to={JOIN_LINK} className="bg-brand-orange text-ink no-underline font-bold px-8 py-[18px] hover:bg-[#FFAD33]">
                Join us →
              </Link>
              <Link
                to="/events"
                className="border border-white text-white no-underline font-medium px-[31px] py-[17px] hover:bg-white hover:text-ink"
              >
                See our events
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="w-full max-w-[428px] grid grid-cols-7 gap-px bg-line border border-line">
            {MOSAIC.join("").split("").map((c, i) => (
              <div key={i} className="aspect-square" style={{ background: MOSAIC_COLORS[c] }} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b border-line">
        <div className={`${container} py-20 sm:py-28 flex flex-col gap-14`}>
          <div className="flex flex-wrap gap-12 items-start">
            <h2 className={`flex-[1_1_360px] ${h2}`}>About the group</h2>
            <p className="flex-[2_1_520px] m-0 text-lg sm:text-xl text-mist">
              AWS Student Builder Groups are student-led communities on campuses around the world. Our Penn State
              chapter runs hands-on workshops, build nights and hackathons so members can go from their first login
              to a deployed project — no prior cloud experience needed.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-px bg-line border border-line">
            {PILLARS.map((p) => (
              <div key={p.n} className="bg-ink p-8 flex flex-col gap-4 min-h-60">
                <span className="w-12 h-12 bg-brand-sky text-ink font-mono font-semibold text-[15px] flex items-center justify-center">
                  {p.n}
                </span>
                <h3 className="mt-4 mb-0 font-mono text-[26px] font-semibold">{p.title}</h3>
                <p className="m-0 text-mist">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-white text-ink">
        <div className={`${container} py-20 sm:py-28 flex flex-col gap-12`}>
          <div className="flex flex-wrap justify-between items-end gap-6">
            <h2 className={h2}>What we do</h2>
            <p className="m-0 max-w-[480px] text-slate">
              Something for first-timers and seasoned builders alike, every semester.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-px bg-line-light border border-line-light">
            {ACTIVITIES.map((a) => (
              <div key={a.n} className="bg-white px-8 pt-7 pb-9 flex flex-col gap-3">
                <span className="font-mono text-sm text-slate-soft">{a.n}</span>
                <h3 className="mt-6 mb-0 font-mono text-[22px] font-semibold">{a.title}</h3>
                <p className="m-0 text-slate">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Band */}
      <section className="bg-brand-violet text-ink">
        <div className={`${container} py-20 sm:py-24 flex flex-wrap items-center justify-between gap-10`}>
          <p className="m-0 flex-[1_1_560px] font-mono text-[32px] sm:text-[44px] leading-[1.2] font-medium">
            No cloud experience required. Just curiosity.
          </p>
          <Link to={JOIN_LINK} className="bg-ink text-white no-underline font-mono font-bold text-[17px] px-8 py-[18px] hover:bg-ink-raised">
            Join us →
          </Link>
        </div>
      </section>

      {/* Recent events */}
      {recent.length > 0 && (
        <section className="border-b border-line">
          <div className={`${container} py-20 sm:py-28 flex flex-col gap-12`}>
            <div className="flex flex-wrap justify-between items-end gap-6">
              <h2 className={h2}>Recent events</h2>
              <Link to="/events" className="font-mono text-base py-3 text-brand-sky hover:text-[#8FD0FF]">
                All events and photos →
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              {recent.map((album) => (
                <AlbumCard key={album.id} album={album} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join */}
      <section id="join" className="bg-brand-orange text-ink scroll-mt-4">
        <div className={`${container} py-20 sm:py-28 flex flex-wrap gap-16 items-start`}>
          <div className="flex-[1_1_420px] min-w-0 flex flex-col gap-6">
            <h2 className="m-0 font-mono font-semibold text-[40px] sm:text-[52px] leading-[1.1]">Join the group</h2>
            <p className="m-0 text-xl max-w-[520px]">
              Membership is free and open to every Penn State student. Sign up to get meeting reminders, workshop
              invites and hackathon news.
            </p>
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px bg-ink border border-ink">
              {JOIN_DETAILS.map((d) => (
                <div key={d.label} className="bg-brand-orange p-5">
                  <p className="m-0 font-mono text-[13px] font-semibold">{d.label}</p>
                  <p className="mt-1.5 mb-0">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-[1_1_420px] min-w-0 bg-ink text-white p-8 sm:p-10 flex flex-col gap-5 justify-center min-h-[360px]">
            <span className="w-14 h-14 bg-brand-mint text-ink flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </span>
            <h3 className="m-0 font-mono text-[28px] font-semibold">Get on the list.</h3>
            <p className="m-0 text-mist">
              Sign-up, our group chat and every upcoming event live on our Linktree. Join in a minute — no experience
              needed.
            </p>
            <a
              href={LINKTREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 self-start bg-brand-orange text-ink no-underline font-mono font-bold text-[17px] px-6 py-[18px] hover:bg-[#FFAD33]"
            >
              Sign up →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
