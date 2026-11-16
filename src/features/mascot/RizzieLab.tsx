"use client";

import { useState } from "react";
import RizzieMascot from "./RizzieMascot";
import type { AnimationName, RizzieScenario } from "./mascot-model";
import styles from "./RizzieLab.module.css";

type Playback = AnimationName | "natural";
type Props = { theme: "dawn" | "dusk" };

const animations: { id: Playback; label: string }[] = [
  { id: "natural", label: "Natural" },
  { id: "idle", label: "Idle" },
  { id: "running-right", label: "Run right" },
  { id: "running-left", label: "Run left" },
  { id: "waving", label: "Wave" },
  { id: "jumping", label: "Jump" },
  { id: "failed", label: "Failed" },
  { id: "waiting", label: "Waiting" },
  { id: "working", label: "Working" },
  { id: "review", label: "Review" },
];

const modes: { id: RizzieScenario; label: string }[] = [
  { id: "auto", label: "Auto (simulated width)" },
  { id: "full", label: "Full motion" },
  { id: "touch", label: "Touch input" },
  { id: "reduced-motion", label: "Reduced motion" },
  { id: "unsupported-browser", label: "Unsupported browser" },
  { id: "touch-unavailable", label: "Touch unavailable" },
  { id: "no-js", label: "No JavaScript (simulation)" },
];

export default function RizzieLab({ theme }: Props) {
  const [playback, setPlayback] = useState<Playback>("natural");
  const [scenario, setScenario] = useState<RizzieScenario>("auto");
  const [replayKey, setReplayKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [stageWidth, setStageWidth] = useState(940);
  const [message, setMessage] = useState(
    "On the live site, this opens the destination. This preview stays here.",
  );

  function showMessage() {
    window.dispatchEvent(new CustomEvent("rizzie:message", { detail: { text: message } }));
  }

  const interactive = scenario === "full" || scenario === "touch" || scenario === "auto";
  const hidden = scenario === "no-js";

  return (
    <section className={styles.lab} data-theme={theme} aria-label="Rizzie motion laboratory">
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Component / Mascot</p>
          <h1>Rizzie Motion Lab</h1>
          <p className={styles.description}>
            Real sprite, real interactions. Drag Rizzie with the mouse, inspect
            animations and test fallbacks.
          </p>
        </div>
        <span className={styles.counter}>09 sprite actions</span>
      </header>

      <div className={styles.layout}>
        <div className={styles.preview}>
          <div className={styles.previewHead}>
            <span>Live preview</span>
            <span>{stageWidth} px</span>
          </div>
          <div className={styles.viewport}>
            <div className={styles.stage} style={{ width: stageWidth }}>
              <div className={styles.guidance} aria-live="polite">
                <span className={styles.stageLabel}>
                  {hidden ? "Rizzie is absent without JavaScript" :
                    scenario === "touch" ? "Touch mode: drag with a finger · Reset to return" :
                      scenario === "auto" ? "Auto capability mode · Drag when interactive" :
                        interactive ? "Drag with mouse · Reset to return" :
                        "Static fallback · Movement disabled"}
                </span>
              </div>
              <RizzieMascot
                key={`${scenario}:${resetKey}`}
                scenario={scenario}
                actionOpen={false}
                previewAnimation={playback}
                previewReplayKey={replayKey}
                previewViewportWidth={stageWidth}
                onActivate={showMessage}
              />
            </div>
          </div>
          <div className={styles.previewFoot}>
            <label htmlFor="rizzie-lab-width">Simulated width</label>
            <input
              id="rizzie-lab-width"
              type="range"
              min="320"
              max="1440"
              step="10"
              value={stageWidth}
              onChange={(event) => setStageWidth(Number(event.target.value))}
            />
            <span>320–1440 px</span>
          </div>
          <p className={styles.note} style={{ padding: "0 18px 14px" }}>
            Simulates capability width, not browser media queries. Resize the Storybook viewport to test actual responsive CSS.
          </p>
        </div>

        <div className={styles.controls}>
          <section className={styles.group} aria-labelledby="rizzie-lab-playback">
            <h2 id="rizzie-lab-playback">Animation</h2>
            <div className={styles.actions} role="group" aria-label="Rizzie animation">
              {animations.map(({ id, label }) => (
                <button
                  key={id}
                  className={styles.choice}
                  type="button"
                  aria-pressed={playback === id}
                  onClick={() => {
                    setPlayback(id);
                    setReplayKey((key) => key + 1);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.command}
              onClick={() => setReplayKey((key) => key + 1)}
              disabled={!interactive}
            >
              Replay animation
            </button>
            <p className={styles.note}>
              One-shot actions return to idle. Natural mode restores ambient behavior.
              Motion respects your system preference.
            </p>
          </section>

          <section className={styles.group} aria-labelledby="rizzie-lab-scenario">
            <h2 id="rizzie-lab-scenario">Capability</h2>
            <label className={styles.fieldLabel} htmlFor="rizzie-lab-mode">Mode</label>
            <select
              id="rizzie-lab-mode"
              className={styles.select}
              value={scenario}
              onChange={(event) => setScenario(event.target.value as RizzieScenario)}
            >
              {modes.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
            <button
              type="button"
              className={styles.command}
              onClick={() => {
                setResetKey((key) => key + 1);
                setReplayKey((key) => key + 1);
              }}
            >
              Reset position
            </button>
          </section>

          <section className={styles.group} aria-labelledby="rizzie-lab-message">
            <h2 id="rizzie-lab-message">Explanation</h2>
            <label className={styles.fieldLabel} htmlFor="rizzie-lab-text">Message</label>
            <textarea
              id="rizzie-lab-text"
              className={styles.textarea}
              maxLength={240}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
            />
            <button
              type="button"
              className={styles.command}
              onClick={showMessage}
              disabled={hidden || !message.trim()}
            >
              Show message
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}
