import type { ReactNode } from "react";
import { BreakingNewsBanner } from "@/components/site/breaking-news-banner";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreakingNewsBanner />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
