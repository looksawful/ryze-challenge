import { useId } from "react";
import Image from "next/image";
import { footerGroups } from "./link-model";
import { HomeworkCookieSettingsButton } from "../consent/HomeworkCookieNotice";
import styles from "./SiteFooter.module.css";

/** Footer layout restored from the original Homework prototype. */
export function SiteFooter() {
  const prefix = useId();
  return (
    <div className={styles.frame} data-footer-frame>
      <footer id="footer" className={styles.footer} aria-label="Ryze footer" data-theme="dusk">
        <div className={styles.rail}>
          <a className={styles.brand} href="#main" aria-label="Ryze, back to top">
            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/ryze-lockup-pink.svg`}
              width={126} height={40} alt="" unoptimized />
          </a>
          <a className={styles.backToTop} href="#main">Back to top <span aria-hidden="true">↑</span></a>
          <HomeworkCookieSettingsButton className={styles.cookieSettings} />
        </div>
        <div className={styles.columns}>
          {footerGroups.map((group, index) => {
            const titleId = `${prefix}-footer-${index}`;
            return (
              <nav className={styles.column} key={group.id} aria-labelledby={titleId}>
                <h2 id={titleId}>{group.label}</h2>
                <ul>{group.links.map(link => (
                  <li key={link.id}><a href={link.href}>{link.label}</a></li>
                ))}</ul>
              </nav>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
