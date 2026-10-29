type IconName =
  | "search"
  | "map"
  | "briefcase"
  | "arrow"
  | "check"
  | "close"
  | "menu"
  | "spark"
  | "logout";

const paths: Record<IconName, string> = {
  search: "M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z",
  map: "M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zm0 0V3m6 3v15",
  briefcase: "M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m-9 4h14m-16-2h18v11a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z",
  arrow: "M5 12h14m-6-6l6 6-6 6",
  check: "M5 12l4 4L19 6",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 6h16M4 12h16M4 18h16",
  spark: "M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z",
  logout: "M10 17l5-5-5-5m5 5H3m8-9h7a2 2 0 012 2v14a2 2 0 01-2 2h-7",
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
