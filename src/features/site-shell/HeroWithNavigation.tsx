"use client";

import Hero from "../hero/Hero";
import type { IntegrationLayout, IntegrationCaption, IntegrationPreviewMode } from "../integrations/IntegrationLogos";
import { SiteHeader } from "./SiteHeader";
import { previewNotice } from "./link-model";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation({
  integrationLayout,
  integrationCaption,
  integrationPreviewMode,
}: {
  integrationLayout?: IntegrationLayout;
  integrationCaption?: IntegrationCaption;
  integrationPreviewMode?: IntegrationPreviewMode;
} = {}) {
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
      <Hero integrationLayout={integrationLayout} integrationCaption={integrationCaption} integrationPreviewMode={integrationPreviewMode} />
    </div>
  );
}
