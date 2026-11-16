"use client";

import { useState } from "react";
import Hero from "../hero/Hero";
import { SiteHeader } from "./SiteHeader";
import { previewNotice } from "./link-model";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation() {
  const [notice, setNotice] = useState<{ text: string } | null>(null);

  return (
    <div className={styles.stage}>
      <div className={styles.navigation}>
        <SiteHeader
          variant="hero"
          onPreviewDestination={(destination) => setNotice({ text: previewNotice(destination) })}
        />
      </div>
      <Hero
        notice={notice}
        onDismissNotice={() => setNotice(null)}
        onPreviewExperience={(domain) => setNotice({
          text: `On the live site, this action would open a Ryze experience preview for ${domain}. This demonstration stays on the same page.`,
        })}
      />
    </div>
  );
}
