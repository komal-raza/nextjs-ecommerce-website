/** Inline SVG icons — no icon library. All inherit `currentColor`. */
type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const SearchIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const BagIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const UserIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></svg>
);
export const MenuIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 7h18M3 12h18M3 17h18" /></svg>
);
export const CloseIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const ArrowRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const ChevronDown = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const PlusIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14" /></svg>
);
export const CheckIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);

// Social (filled/outlined simple glyphs)
export const InstagramIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>
);
export const FacebookIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" /></svg>
);
export const PinterestIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M11 9.5c2-1 4 .2 3.5 2.3-.4 1.7-1.6 2.7-2.6 2.2M11.5 12 10 20" /></svg>
);
export const XIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 4l16 16M20 4 4 20" /></svg>
);
export const YoutubeIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5v-5Z" /></svg>
);

