import type { ReactNode } from "react";
import Hero from "../hero/Hero";
import { SiteHeader } from "./SiteHeader";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={styles.navigation}>
        <SiteHeader variant="hero" />
      </div>
      <Hero>{children}</Hero>
    </div>
  );
}
