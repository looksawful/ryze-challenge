"use client";

import Image from "next/image";
import styles from "./Hero.module.css";
import IntegrationLogos from "../integrations/IntegrationLogos";
import HeroConversation from "./HeroConversation";
import { Typography } from "../../ui/Typography";
import RizzieMascot from "../mascot/RizzieMascot";
import type { RizzieScenario } from "../mascot/mascot-model";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type HeroProps = {
  mascotScenario?: RizzieScenario;
  mascotResetKey?: number;
  theme?: "dawn" | "dusk";
};

export default function Hero({ mascotScenario = "auto", mascotResetKey = 0, theme = "dusk" }: HeroProps) {
  return (
    <main className={styles.hero} data-theme={theme} id="main" data-conversational-hero>
      <div className={styles.brand} data-motion-slot="brand">
        <Image className={styles.brandMark} src={basePath + "/brand-mark.svg"} alt="" width={40} height={40} unoptimized loading="eager" />
        <span>Ryze</span>
      </div>
      <Typography as="h1" variant="heading" className={styles.headline} data-motion-slot="headline">
        <span>AI autopilot <span className={styles.muted}>for</span></span>{" "}
        <span><span className={styles.muted}>your</span> Shopify</span>
      </Typography>
      <Typography as="p" variant="lead" className={styles.lead} data-motion-slot="lead">A new way to grow your store.</Typography>
      <Typography as="p" variant="paragraph" className={styles.description} data-motion-slot="description">
        Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.
      </Typography>
      <div className={styles.actionCluster}>
        <div className={styles.action} data-motion-slot="action">
          <HeroConversation />
        </div>
        <div className={styles.integration} data-motion-slot="integration">
          <IntegrationLogos />
        </div>
      </div>
      <a className={styles.contact} href="https://ryze.cal.com/hello/partner-program" target="_blank" rel="noopener noreferrer">
        Contact us <span aria-hidden="true">↗</span>
      </a>
      <div className={styles.mascot} data-motion-slot="mascot">
        <RizzieMascot key={mascotScenario + ":" + mascotResetKey} scenario={mascotScenario}
          onActivate={() => document.getElementById("ryze-preview-email")?.focus()} actionOpen={false} />
      </div>
    </main>
  );
}
