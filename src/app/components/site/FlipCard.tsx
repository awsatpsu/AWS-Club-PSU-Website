import { useState, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";

// State handed to the destination page so it can finish the flip as it enters.
export interface FlipState {
  flipped?: boolean;
  from?: string;
}

// A card that turns over to reveal its color and title, then opens `to`.
// The whole card is one link; put `relative z-10` on any other link inside it.
export function FlipCard({
  to,
  color,
  title,
  label,
  className = "",
  children,
}: {
  to: string;
  color: string;
  title: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  const [flipping, setFlipping] = useState(false);
  const state: FlipState = { flipped: !reduceMotion, from: pathname };

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab clicks, and skip the animation if motion is reduced.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduceMotion) return;
    e.preventDefault();
    setFlipping(true);
  };

  return (
    <div className={`group relative ${flipping ? "z-20" : ""} ${className}`} style={{ perspective: 1400 }}>
      <motion.div
        className="relative h-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: flipping ? 180 : 0, scale: flipping ? 1.04 : 1 }}
        transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => flipping && navigate(to, { state })}
      >
        <div className="relative h-full" style={{ backfaceVisibility: "hidden" }}>
          {children}
          <Link to={to} state={state} aria-label={label} onClick={open} className="absolute inset-0" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col justify-end gap-2 p-7 text-ink"
          style={{ background: color, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="absolute top-0 right-0 w-12 h-12 bg-ink" />
          <span className="font-mono font-semibold text-[22px] leading-tight">{title}</span>
          <span className="font-mono text-[13px] font-semibold">OPENING PHOTOS →</span>
        </div>
      </motion.div>
    </div>
  );
}
