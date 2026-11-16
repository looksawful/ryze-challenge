import Image from "next/image";
import styles from "./Hero.module.css";
import IntegrationLogos from "../integrations/IntegrationLogos";
import HeroAction from "./HeroAction";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type HeroProps = {
  notice?: { text: string } | null;
  onDismissNotice?: () => void;
  onPreviewExperience?: (domain: string) => void;
};

export default function Hero({ notice, onDismissNotice, onPreviewExperience }: HeroProps) {
  return (
    <main className={styles.hero} data-theme="dusk" id="main">
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

      <div className={styles.integration}>
        <IntegrationLogos />
        <span>Plugs into<br />{" "}any platform</span>
      </div>

      <div className={styles.action}>
        <HeroAction notice={notice} onDismissNotice={onDismissNotice} onPreviewExperience={onPreviewExperience} />
      </div>
    </main>
  );
}
