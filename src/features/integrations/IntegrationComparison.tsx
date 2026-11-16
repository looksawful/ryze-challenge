"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IntegrationComparison.module.css";

type Layout = "single" | "wrap";
type Caption = "right" | "below";
type Device = { name: string; width: number; height: number };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DEVICES: Device[] = [
  { name: "Compact phone", width: 320, height: 700 },
  { name: "Phone", width: 360, height: 780 },
  { name: "iPhone", width: 390, height: 844 },
  { name: "Duo folded", width: 540, height: 720 },
  { name: "Small tablet", width: 700, height: 900 },
  { name: "Duo unfolded", width: 720, height: 540 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Small laptop", width: 1024, height: 768 },
  { name: "Laptop", width: 1280, height: 800 },
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Breakpoint -1", width: 1599, height: 900 },
  { name: "Breakpoint +0", width: 1600, height: 900 },
  { name: "Large desktop", width: 1728, height: 1117 },
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "Ultrawide", width: 2400, height: 1350 },
];

function getUrl(layout: Layout, caption: Caption, motion: boolean) {
  return basePath + "/preview/integrations/" + (layout === "single" ? "a" : "b") + "-" + caption + "/" + (motion ? "?motion=auto" : "");
}

function Frame({
  layout, caption, motion, device, scale, title,
}: {
  layout: Layout;
  caption: Caption;
  motion: boolean;
  device: Device;
  scale: number;
  title: string;
}) {
  const url = getUrl(layout, caption, motion);
  return (
    <section className={styles.frameCard} aria-label={title}>
      <div className={styles.frameHead}>
        <strong>{title}</strong>
        <a href={url} target="_blank" rel="noopener noreferrer">Открыть страницу ↗</a>
      </div>
      <div className={styles.frameStage} style={{ height: device.height * scale }}>
        <iframe
          key={url}
          title={title + ": " + device.width + " × " + device.height}
          className={styles.frame}
          src={url}
          width={device.width}
          height={device.height}
          style={{ width: device.width, height: device.height, transform: "scale(" + scale + ")" }}
        />
      </div>
    </section>
  );
}

export default function IntegrationComparison() {
  const [deviceIndex, setDeviceIndex] = useState(2);
  const [layout, setLayout] = useState<Layout>("single");
  const [caption, setCaption] = useState<Caption>("right");
  const [motion, setMotion] = useState(false);
  const [compare, setCompare] = useState(false);
  const [available, setAvailable] = useState(0);
  const measure = useRef<HTMLDivElement>(null);
  const device = DEVICES[deviceIndex]!;

  useEffect(() => {
    const element = measure.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setAvailable(element.clientWidth));
    observer.observe(element);
    setAvailable(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const slots = compare ? 2 : 1;
  const slotWidth = Math.max(150, (available - (compare ? 14 : 0)) / slots);
  const scale = Math.min(1, slotWidth / device.width);
  const chosenUrl = getUrl(layout, caption, motion);

  return (
    <main className={styles.root}>
      <header className={styles.toolbar}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>RYZE / UI APPROVAL</span>
          <h1>Интеграции: полноэкранные прототипы</h1>
          <p>Оригинальная страница, компоненты, изображения, CTA и навигация. Изменяется только расположение интеграций.</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.selector}>
            <span>Экран</span>
            <select value={deviceIndex} onChange={(e) => setDeviceIndex(Number(e.target.value))}>
              {DEVICES.map((d, index) => <option key={d.width} value={index}>{d.name} · {d.width}×{d.height}</option>)}
            </select>
          </label>
          <fieldset className={styles.choice}>
            <legend>Логотипы</legend>
            <label><input type="radio" name="layout" value="single" checked={layout === "single"} onChange={() => setLayout("single")} /> A · один ряд</label>
            <label><input type="radio" name="layout" value="wrap" checked={layout === "wrap"} onChange={() => setLayout("wrap")} /> B · перенос</label>
          </fieldset>
          <fieldset className={styles.choice}>
            <legend>Подпись</legend>
            <label><input type="radio" name="caption" value="right" checked={caption === "right"} onChange={() => setCaption("right")} /> справа</label>
            <label><input type="radio" name="caption" value="below" checked={caption === "below"} onChange={() => setCaption("below")} /> снизу</label>
          </fieldset>
          <label className={styles.check}>
            <input type="checkbox" checked={motion} onChange={(e) => setMotion(e.target.checked)} />
            WebGL
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            A / B рядом
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => { setLayout("single"); setCaption("right"); setCompare(false); }} className={styles.button}>Версия A</button>
          <button type="button" onClick={() => { setLayout("wrap"); setCaption("below"); setCompare(false); }} className={styles.button}>Версия B</button>
          <a className={styles.mainLink} href={chosenUrl} target="_blank" rel="noopener noreferrer">Полная страница ↗</a>
        </div>
      </header>
      <div ref={measure} className={styles.measure}>
        <div className={styles.meta}>
          <span>{device.width} × {device.height} CSS px</span>
          <span>Масштаб предпросмотра {Math.round(scale * 100)}%; в новой вкладке 100%</span>
        </div>
        <div className={styles.panels}>
          {compare ? (
            <>
              <Frame title="A · Один ряд, подпись справа" layout="single" caption="right" motion={motion} device={device} scale={scale} />
              <Frame title="B · Перенос, подпись снизу" layout="wrap" caption="below" motion={motion} device={device} scale={scale} />
            </>
          ) : (
            <Frame title={(layout === "single" ? "A · Один ряд" : "B · Перенос") + " / " + (caption === "right" ? "Подпись справа" : "Подпись снизу")} layout={layout} caption={caption} motion={motion} device={device} scale={scale} />
          )}
        </div>
      </div>
    </main>
  );
}
