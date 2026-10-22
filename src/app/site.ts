export const LINKTREE_URL =
  "https://linktr.ee/aws.psu?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn1h7pSofemCCtxrAGYLR_sKkt21hPeDtdtneMT8Zo8DyVj_mtI40F91hTFNE_aem_PFCGIbrpMFgF-eBIXb0cpA";

export const PALETTE = ["#FF9900", "#41B3FF", "#00E582", "#AC5BFF", "#FF57E9"];

// Stable color per record, so an album keeps its color between the list and its page.
export function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const EVENT_TAG_COLORS: Record<string, string> = {
  Workshop: "#41B3FF",
  "Study Group": "#00E582",
  Speaker: "#AC5BFF",
  Hackathon: "#FF9900",
  Career: "#FF57E9",
};

export function tagColor(tag: string) {
  return EVENT_TAG_COLORS[tag] ?? "#A9B4C0";
}

export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// TODO: fill in the club's real meeting details.
export const JOIN_DETAILS = [
  { label: "WE MEET", value: "[Day] · [Time]" },
  { label: "WHERE", value: "[Building & room]" },
  { label: "CHAT WITH US", value: "[Discord / GroupMe link]" },
  { label: "FOLLOW", value: "[@instagram handle]" },
];
