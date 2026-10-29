import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="page-shell">{children}</main>
      <footer className="simple-footer"><span>© 2025 HireHub</span><span>Work, with purpose.</span></footer>
    </>
  );
}
