"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./Hero.module.css";
import IntegrationLogos from "../integrations/IntegrationLogos";
import HeroAction from "./HeroAction";
import RizzieMascot from "../mascot/RizzieMascot";
import type { RizzieScenario } from "../mascot/mascot-model";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type HeroProps = {
  mascotScenario?: RizzieScenario;
  mascotResetKey?: number;
  theme?: "dawn" | "dusk";
};

export default function Hero({ mascotScenario = "auto", mascotResetKey = 0, theme = "dusk" }: HeroProps) {
  const [activation, setActivation] = useState<{ trigger: HTMLAnchorElement } | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  return (
    <main className={styles.hero} data-theme={theme} id="main">
      <div className={styles.brand}>
        <Image className={styles.brandMark} src={`${basePath}/brand-mark.svg`} alt="" width={40} height={40} unoptimized loading="eager" />
        <span>Ryze</span>
      </div>

      <h1 className={styles.headline}>
        <span>AI autopilot <span className={styles.muted}>for</span></span>{" "}
        <span><span className={styles.muted}>your</span> Shopify</span>
      </h1>

      <p className={styles.lead}>A new way to grow<br />{" "}your store.</p>
      <p className={styles.description}>
        Paid ads, SEO, AI visibility &amp; CRO. One AI autopilot built around your business.
      </p>

      <div className={styles.mascot}>
        <RizzieMascot key={`${mascotScenario}:${mascotResetKey}`} scenario={mascotScenario} onActivate={(trigger) => setActivation({ trigger })} actionOpen={actionOpen} />
      </div>

      <div className={styles.integration}>
        <IntegrationLogos />
      </div>

      <div className={styles.action}>
        <HeroAction activation={activation} onOpenChange={setActionOpen} />
      </div>
    </main>
  );
}
