import { HomeworkCookieNotice } from "@/features/consent/HomeworkCookieNotice";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";
import { SiteFooter } from "@/features/site-shell/SiteFooter";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div data-theme="dusk">
      <HeroWithNavigation />
      <div className={styles.desktopCookies} data-motion-slot="cookies">
        <HomeworkCookieNotice />
      </div>
      <SiteFooter />
    </div>
  );
}