import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { recordSiteVisit } from "@/lib/site-visits";

export function SiteVisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (pathname) {
      recordSiteVisit(pathname);
    }
  }, [pathname]);

  return null;
}
