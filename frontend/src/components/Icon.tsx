export type IconName =
  | "search"
  | "map"
  | "briefcase"
  | "arrow"
  | "check"
  | "close"
  | "menu"
  | "spark"
  | "logout"
  | "building"
  | "clock"
  | "calendar"
  | "user"
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "filter"
  | "badgeCheck"
  | "dollar"
  | "share"
  | "eye"
  | "eyeOff"
  | "bookmark"
  | "code"
  | "award"
  | "phone"
  | "mail"
  | "lock"
  | "bell"
  | "refresh"
  | "edit"
  | "external"
  | "fileText"
  | "zap"
  | "sliders"
  | "trash"
  | "send"
  | "star"
  | "info"
  | "users"
  | "trendingUp"
  | "checkCircle";

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
  building: "M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h1m4 0h1m-5 4h1m4 0h1m-5 4h1m4 0h1",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 5l7 7-7 7",
  chevronLeft: "M15 19l-7-7 7-7",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  badgeCheck: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  dollar: "M12 1v22m5-18H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  share: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  eyeOff: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18",
  bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  award: "M12 15l-2 5l-4-2l-4 2l2-5m8 0a7 7 0 10-14 0a7 7 0 0014 0z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6m0 0v6m0-6L10 14",
  fileText: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  sliders: "M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  info: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 00-3-3.87M23 21v-2a4 4 0 00-3-3.87m-4-6.13a4 4 0 11-8 0 4 4 0 018 0z",
  trendingUp: "M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6",
  checkCircle: "M22 11.08V12a10 10 0 11-5.93-9.14m17.93 2.14L12 14.01l-3-3",
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const path = paths[name] || paths.briefcase;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
