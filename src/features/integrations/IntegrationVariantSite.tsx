"use client";

import { useEffect, useState } from "react";
import { HomeworkCookieNotice, HomeworkCookieSettingsButton } from "@/features/consent/HomeworkCookieNotice";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";
import type { IntegrationLayout, IntegrationCaption } from "./IntegrationLogos";

export default function IntegrationVariantSite({
  layout,
  caption,
}: {
  layout: IntegrationLayout;
  caption: IntegrationCaption;
}) {
  const [motion, setMotion] = useState<"static" | "auto">("static");

  useEffect(() => {
    setMotion(new URLSearchParams(window.location.search).get("motion") === "auto" ? "auto" : "static");
  }, []);

  return (
    <div data-theme="dusk">
      <HeroWithNavigation
        integrationLayout={layout}
        integrationCaption={caption}
        integrationPreviewMode={motion}
      />
      <HomeworkCookieNotice />
      <footer className="wrapper" style={{ paddingBlock: "var(--space-4)" }}>
        <HomeworkCookieSettingsButton />
      </footer>
    </div>
  );
}
