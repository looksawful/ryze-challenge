import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <main className={styles.hero} data-theme="dusk" id="main">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true" />
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
        <span className={styles.integrationMark} aria-hidden="true" />
        <span>Plugs into<br />{" "}any platform</span>
      </div>

      <details className={styles.action}>
        <summary>Start For Free</summary>
        <p>The domain preview is not available yet.</p>
      </details>
    </main>
  );
}
