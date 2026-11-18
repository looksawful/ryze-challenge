"use client";

import { useRef } from "react";
import styles from "./Hero.module.css";
import { useRizzieStageMotion } from "./useRizzieStageMotion";
import { bookingLink } from "../site-shell/link-model";
import IntegrationLogos from "../integrations/IntegrationLogos";
import HeroConversation from "./HeroConversation";
import { Typography } from "../../ui/Typography";
import RizzieMascot from "../mascot/RizzieMascot";
import type { RizzieScenario } from "../mascot/mascot-model";

type HeroProps = {
  mascotScenario?: RizzieScenario;
  mascotResetKey?: number;
  theme?: "dawn" | "dusk";
};

export default function Hero({ mascotScenario = "auto", mascotResetKey = 0, theme = "dusk" }: HeroProps) {
  const mascotZoneRef = useRef<HTMLDivElement>(null);
  useRizzieStageMotion(mascotZoneRef);
  return (
    <main className={styles.hero} data-theme={theme} id="main" data-conversational-hero>
      <Typography as="h1" variant="heading" className={styles.headline} data-motion-slot="headline" aria-label="AI autopilot for your Shopify">
        <span>AI autopilot <span className={styles.muted}>for</span></span>{" "}
        <span><span className={styles.muted}>your</span> Shopify</span>
      </Typography>
      <div className={styles.prose} data-flow>
        <Typography as="p" variant="lead" className={styles.lead} data-motion-slot="lead">A new way to grow<br />{" "}your store.</Typography>
        <Typography as="p" variant="paragraph" className={styles.description} data-motion-slot="description">
          Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.
        </Typography>
      </div>

      <div className={styles.mascot} data-motion-slot="mascot" ref={mascotZoneRef}>
        <RizzieMascot key={`${mascotScenario}:${mascotResetKey}`} scenario={mascotScenario}
          onActivate={() => window.open(bookingLink.href, "_blank", "noopener,noreferrer")}
          href={bookingLink.href} ambientWander={false} interactiveDesktopOnly actionOpen={false} />
      </div>
      <div className={styles.action} data-motion-slot="action">
        <HeroConversation />
      </div>
      <div className={styles.integration} data-motion-slot="integration">
        <IntegrationLogos />
      </div>
    </main>
  );
}
