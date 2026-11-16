"use client";

import Hero from "../hero/Hero";
import { SiteHeader } from "./SiteHeader";
import { previewNotice } from "./link-model";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation() {
  return (
    <div className={styles.stage} data-ryze-dark-end>
      <div className={styles.navigation}>
        <SiteHeader
          variant="dock"
          enhancement="auto"
          onPreviewDestination={(destination) => {
            window.dispatchEvent(new CustomEvent("rizzie:message", {
              detail: { text: previewNotice(destination) },
            }));
          }}
        />
      </div>
      <Hero />
    </div>
  );
}
