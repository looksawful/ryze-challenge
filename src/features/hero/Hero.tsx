"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./Hero.module.css";
import IntegrationLogos from "../integrations/IntegrationLogos";
import HeroAction, { type HeroActionHandle } from "./HeroAction";
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
  const actionRef = useRef<HeroActionHandle>(null);
  const [actionOpen, setActionOpen] = useState(false);
  return (
    <main className={styles.hero} data-theme={theme} data-action-open={actionOpen || undefined} id="main">
      <div className={styles.brand}>
        <Image className={styles.brandMark} src={`${basePath}/brand-mark.svg`} alt="" width={40} height={40} unoptimized loading="eager" />
        <span>Ryze</span>
      </div>

      <Typography as="h1" variant="heading" className={styles.headline}>
        <span>AI autopilot <span className={styles.muted}>for</span></span>{" "}
        <span><span className={styles.muted}>your</span> Shopify</span>
      </Typography>

      <Typography as="p" variant="lead" className={styles.lead}>A new way to grow<br />{" "}your store.</Typography>
      <Typography as="p" variant="paragraph" className={styles.description}>
        Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.
      </Typography>

      <div className={styles.mascot}>
        <RizzieMascot key={`${mascotScenario}:${mascotResetKey}`} scenario={mascotScenario} onActivate={(trigger) => actionRef.current?.activate(trigger)} actionOpen={actionOpen} />
      </div>

      <div className={styles.action}>
        <HeroAction ref={actionRef} onOpenChange={setActionOpen} />
      </div>

      <div className={styles.integration}>
        <IntegrationLogos />
      </div>
    </main>
  );
}
