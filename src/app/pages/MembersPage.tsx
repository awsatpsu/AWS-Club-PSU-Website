import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { fetchTeam } from "../../lib/data";
import { TEAM_GROUP_LABELS, type TeamGroup } from "../../lib/types";
import type { TeamMember } from "../../lib/types";
import { JOIN_LINK, PageHero } from "../components/site/Chrome";
import { PALETTE } from "../site";

type GroupId = TeamGroup;

const GROUPS: { id: GroupId; title: string; color: string }[] = [
  { id: "exec", title: TEAM_GROUP_LABELS.exec, color: "#FF9900" },
  { id: "leads", title: TEAM_GROUP_LABELS.leads, color: "#41B3FF" },
];

const FILTERS: { id: "all" | GroupId; label: string }[] = [
  { id: "all", label: "Everyone" },
  ...GROUPS.map((g) => ({ id: g.id, label: g.title })),
];

// Set in /admin; members saved before groups existed count as team leads.
function groupOf(member: TeamMember): GroupId {
  return member.team_group === "exec" ? "exec" : "leads";
}

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
  const [filter, setFilter] = useState<"all" | GroupId>("all");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTeam().then(setTeam);
  }, []);

  const groups = GROUPS.filter((g) => filter === "all" || filter === g.id)
    .map((g, gi) => ({
      ...g,
      members: (team ?? [])
        .filter((m) => groupOf(m) === g.id)
        .map((m, i) => ({ member: m, color: PALETTE[(gi * 4 + i) % PALETTE.length] })),
    }))
    .filter((g) => g.members.length > 0);

  // Cards deal in one after another across both groups.
  let dealt = 0;

  const toggle = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }));

  return (
    <>
      <PageHero
        eyebrow="THE TEAM"
        eyebrowClass="text-brand-pink"
        title="Meet the builders."
        lede="The students who plan the workshops, run the hackathons and keep the group going. Tap a card to flip it."
        aside={
          <div role="group" aria-label="Filter members" className="flex flex-wrap border border-line font-mono text-[15px]">
            {FILTERS.map((f) => {
              const on = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`sbg-chip px-5 py-3.5 text-[15px] font-normal cursor-pointer ${
                    on ? "bg-white text-ink" : "bg-ink text-white hover:bg-ink-raised"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        }
      />

      <section>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-10 pt-[72px] pb-28 flex flex-col gap-[72px]">
          {team === null ? (
            <p className="m-0 font-mono text-fog">Loading…</p>
          ) : groups.length === 0 ? (
            <p className="m-0 font-mono text-fog">Team info coming soon.</p>
          ) : (
            groups.map((g) => (
              <div key={g.id} className="flex flex-col gap-7">
                <div className="flex items-center gap-4">
                  <span className="w-4 h-4" style={{ background: g.color }} />
                  <h2 className="m-0 font-mono font-semibold text-[28px]">{g.title}</h2>
                  <span className="font-mono text-sm text-fog">
                    {g.members.length} {g.members.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                  {g.members.map(({ member, color }) => (
                    <FlipCard
                      key={member.id}
                      member={member}
                      color={color}
                      delay={`${(0.35 + Math.min(dealt++, 16) * 0.06).toFixed(2)}s`}
                      flipped={!!flipped[member.id]}
                      onFlip={() => toggle(member.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-brand-mint text-ink">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-10 py-20 flex flex-wrap items-center justify-between gap-8">
          <p className="m-0 flex-[1_1_560px] font-mono text-[28px] sm:text-4xl leading-[1.2] font-medium">
            Want your card on this page? Every member can lead.
          </p>
          <Link to={JOIN_LINK} className="sbg-btn bg-ink text-white no-underline font-mono font-bold text-[17px] px-8 py-[18px]">
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
    <div className="sbg-card h-[380px] perspective-[1200px]" style={{ "--c": color, animationDelay: delay } as CSSProperties}>
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
                <span className="absolute top-3.5 right-3.5 w-7 h-7 bg-ink" />
                <span className="absolute top-[42px] right-[42px] w-3.5 h-3.5 bg-ink" />
                <span className="absolute left-3.5 bottom-3.5 font-mono text-[40px] font-semibold text-ink leading-none">
                  {initials(member.name)}
                </span>
              </>
            )}
          </span>
          <span className="w-full flex flex-col gap-1 px-5 pt-[18px] pb-5 border-t border-line">
            <span className="font-mono text-xl font-semibold">{member.name}</span>
            <span className="flex justify-between items-center gap-2">
              <span className="font-mono text-sm text-mist">{member.title}</span>
              <span aria-hidden="true" className="font-mono text-[13px] text-fog">
                <span className="sbg-flipicon">↻</span> flip
              </span>
            </span>
          </span>
        </button>

        {/* Back */}
        <div
          aria-hidden={!flipped}
          className="absolute inset-0 backface-hidden rotate-y-180 text-ink flex flex-col justify-between p-6"
          style={{ background: color }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[13px] font-semibold">{member.title}</span>
            <span className="font-mono text-[22px] font-semibold leading-tight">{member.name}</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={flipped ? 0 : -1}
                className="flex flex-col gap-0.5 border-t border-ink pt-2.5 text-ink no-underline hover:underline"
              >
                <span className="font-mono text-xs font-semibold">LINKEDIN</span>
                <span className="text-[15px]">Connect with {member.name.split(" ")[0]} →</span>
              </a>
            )}
            <button
              type="button"
              onClick={onFlip}
              tabIndex={flipped ? 0 : -1}
              className="self-start border border-ink bg-transparent text-ink font-mono text-sm font-semibold px-4 py-3 cursor-pointer hover:bg-ink hover:text-white"
            >
              ↻ Flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
