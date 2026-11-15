import styles from "./Hero.module.css";

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 40 40" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" />
        <path d="m14 4 12 32M26 4 14 36M4 14l32 12M4 26l32-12" />
      </g>
    </svg>
  );
}

export default function Hero() {
  return (
    <main className={styles.hero} data-theme="dusk" id="main">
      <div className={styles.brand}>
        <BrandMark />
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
        <span className={styles.integrationMark} aria-hidden="true">✦</span>
        <span>Plugs into<br />{" "}any platform</span>
      </div>

      <details className={styles.action}>
        <summary>Start For Free</summary>
        <p>The domain preview is not available yet.</p>
      </details>
    </main>
  );
}
