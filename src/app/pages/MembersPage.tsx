import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { fetchTeam } from "../../lib/data";
import type { TeamMember } from "../../lib/types";
import { JOIN_LINK, PageHero } from "../components/site/Chrome";
import { PALETTE } from "../site";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default function MembersPage() {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTeam().then(setTeam);
  }, []);

  const toggle = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }));

  return (
    <>
      <PageHero
        eyebrow="THE TEAM"
        eyebrowClass="text-brand-pink"
        title="Meet the team."
        lede="The students who plan the workshops, run the hackathons and keep the group going. Tap a card to flip it."
      />

      <section>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-9 pb-14 sm:pt-[72px] sm:pb-28">
          {team === null ? (
            <p className="m-0 font-mono text-fog">Loading…</p>
          ) : team.length === 0 ? (
            <p className="m-0 font-mono text-fog">Team info coming soon.</p>
          ) : (
            <div className="flex flex-col gap-[18px] sm:gap-7">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-brand-orange" />
                <h2 className="m-0 font-mono font-semibold text-[22px] sm:text-[28px]">Executive board</h2>
                <span className="max-sm:ml-auto font-mono text-[13px] sm:text-sm text-fog">
                  {team.length} {team.length === 1 ? "person" : "people"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 sm:gap-6">
                {team.map((member, i) => (
                  <FlipCard
                    key={member.id}
                    member={member}
                    color={PALETTE[i % PALETTE.length]}
                    delay={`${(0.35 + Math.min(i, 16) * 0.06).toFixed(2)}s`}
                    flipped={!!flipped[member.id]}
                    onFlip={() => toggle(member.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-brand-mint text-ink">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-12 sm:py-20 flex max-sm:flex-col sm:flex-wrap sm:items-center justify-between gap-6 sm:gap-8">
          <p className="m-0 sm:flex-[1_1_560px] font-mono text-[26px] sm:text-4xl leading-[1.2] font-medium">
            Want to build with us? Everyone is welcome.
          </p>
          <Link to={JOIN_LINK} className="sbg-btn max-sm:flex max-sm:justify-center max-sm:mr-1 bg-ink text-white no-underline font-mono font-bold text-[17px] px-8 py-[18px]">
            Join us <span className="sbg-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function FlipCard({
  member,
  color,
  delay,
  flipped,
  onFlip,
}: {
  member: TeamMember;
  color: string;
  delay: string;
  flipped: boolean;
  onFlip: () => void;
}) {
  const linkedin = member.linkedin
    ? member.linkedin.startsWith("http")
      ? member.linkedin
      : `https://${member.linkedin}`
    : "";

  return (
    <div className="sbg-card h-[270px] sm:h-[380px] perspective-[1200px]" style={{ "--c": color, animationDelay: delay } as CSSProperties}>
      <div
        className={`relative w-full h-full transform-3d transition-transform duration-[550ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <button
          type="button"
          onClick={onFlip}
          aria-hidden={flipped}
          tabIndex={flipped ? -1 : 0}
          aria-label={`${member.name}, ${member.title} — press to see details`}
          className="absolute inset-0 backface-hidden flex flex-col bg-ink-raised border border-line text-left text-white p-0 cursor-pointer"
        >
          <span className="relative flex-1 w-full overflow-hidden" style={{ background: color }}>
            {member.photo_url ? (
              <img src={member.photo_url} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              <>
                <span className="absolute top-2.5 right-2.5 w-5 h-5 sm:top-3.5 sm:right-3.5 sm:w-7 sm:h-7 bg-ink" />
                <span className="absolute top-[30px] right-[30px] w-2.5 h-2.5 sm:top-[42px] sm:right-[42px] sm:w-3.5 sm:h-3.5 bg-ink" />
                <span className="absolute left-2.5 bottom-2.5 sm:left-3.5 sm:bottom-3.5 font-mono text-[28px] sm:text-[40px] font-semibold text-ink leading-none">
                  {initials(member.name)}
                </span>
              </>
            )}
          </span>
          <span className="w-full flex flex-col gap-0.5 sm:gap-1 px-3 pt-3 pb-3.5 sm:px-5 sm:pt-[18px] sm:pb-5 border-t border-line">
            <span className="font-mono text-[15px] sm:text-xl font-semibold leading-[1.3] break-words">{member.name}</span>
            <span className="flex justify-between items-center gap-1.5 sm:gap-2">
              <span className="min-w-0 font-mono text-xs sm:text-sm text-mist leading-[1.3]">{member.title}</span>
              <span aria-hidden="true" className="shrink-0 font-mono text-sm sm:text-[13px] text-fog">
                <span className="sbg-flipicon">↻</span>
                <span className="max-sm:hidden"> flip</span>
              </span>
            </span>
          </span>
        </button>

        {/* Back */}
        <div
          aria-hidden={!flipped}
          className="absolute inset-0 backface-hidden rotate-y-180 text-ink flex flex-col justify-between p-3.5 sm:p-6"
          style={{ background: color }}
        >
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <span className="font-mono text-[11px] sm:text-[13px] font-semibold">{member.title}</span>
            <span className="font-mono text-base sm:text-[22px] font-semibold leading-tight break-words">{member.name}</span>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3.5">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={flipped ? 0 : -1}
                className="flex flex-col gap-0.5 border-t border-ink pt-2 sm:pt-2.5 text-ink no-underline hover:underline"
              >
                <span className="font-mono text-[10px] sm:text-xs font-semibold">LINKEDIN</span>
                <span className="text-[13px] sm:text-[15px] leading-[1.4]">Connect with {member.name.split(" ")[0]} →</span>
              </a>
            )}
            <button
              type="button"
              onClick={onFlip}
              tabIndex={flipped ? 0 : -1}
              className="self-start min-h-11 border border-ink bg-transparent text-ink font-mono text-xs sm:text-sm font-semibold px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-ink hover:text-white active:bg-ink active:text-white"
            >
              ↻ Flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
