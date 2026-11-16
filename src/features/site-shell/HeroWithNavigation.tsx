import Hero from "../hero/Hero";
import { SiteHeader } from "./SiteHeader";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation() {
  return (
    <div className={styles.stage}>
      <div className={styles.navigation}>
        <SiteHeader variant="hero" />
      </div>
      <Hero />
    </div>
  );
}
