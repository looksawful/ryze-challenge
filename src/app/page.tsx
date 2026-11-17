import { HomeworkCookieNotice } from "@/features/consent/HomeworkCookieNotice";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div data-theme="dusk">
      <HeroWithNavigation />
      <div className={styles.desktopCookies}>
        <HomeworkCookieNotice />
      </div>
    </div>
  );
}