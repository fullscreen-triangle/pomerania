import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SlideDef } from "./deckTypes";
import "./deck.css";

interface DeckProps {
  slides: SlideDef[];
  /** Route to return to via the home button (e.g. "/" or "/application/pylon"). */
  backTo: string;
  /** Label shown in the home button, e.g. "board" or "pylon". */
  backLabel: string;
}

export default function Deck({ slides, backTo, backLabel }: DeckProps) {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [step, setStep] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const maxStep = slides[cur].maxStep;

  const show = useCallback(
    (i: number, resetStep = true) => {
      if (i < 0 || i >= slides.length) return;
      setCur(i);
      setStep(resetStep ? 0 : slides[i].maxStep);
      window.scrollTo(0, 0);
    },
    [slides]
  );

  const advance = useCallback(() => {
    if (step < maxStep) setStep((s) => s + 1);
    else show(cur + 1);
  }, [step, maxStep, cur, show]);

  const retreat = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
    else if (cur > 0) show(cur - 1, false);
  }, [step, cur, show]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        show(cur + 1);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        show(cur - 1);
        e.preventDefault();
      } else if (e.key === " ") {
        advance();
        e.preventDefault();
      } else if (e.key === "Backspace") {
        retreat();
        e.preventDefault();
      } else if (e.key.toLowerCase() === "m") {
        setTocOpen((v) => !v);
      } else if (e.key === "Escape") {
        setTocOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cur, advance, retreat, show]);

  const slide = slides[cur];

  return (
    <div className="deck-root">
      <div id="progress">
        <div
          id="progress-bar"
          style={{ width: `${((cur + 1) / slides.length) * 100}%` }}
        />
      </div>

      <button className="home-btn" onClick={() => navigate(backTo)} title={`Back to ${backLabel}`}>
        ← {backLabel}
      </button>

      <nav id="chrome">
        <button title="Previous (←)" onClick={() => show(cur - 1)}>
          ‹
        </button>
        <span id="counter">
          {cur + 1} / {slides.length}
        </span>
        <button title="Next (→)" onClick={() => show(cur + 1)}>
          ›
        </button>
        <button title="Contents (m)" onClick={() => setTocOpen((v) => !v)}>
          ☰
        </button>
      </nav>

      {tocOpen && (
        <div id="toc">
          <h3>Contents</h3>
          <ol id="toc-list">
            {slides.map((s, i) => (
              <li
                key={s.title}
                className={i === cur ? "active" : ""}
                onClick={() => {
                  show(i);
                  setTocOpen(false);
                }}
              >
                {s.title}
              </li>
            ))}
          </ol>
          <p className="toc-hint">
            ← → to move · <b>space</b> to advance a step · <b>m</b> for this menu
          </p>
        </div>
      )}

      <main id="deck">
        <section className="slide current" key={cur}>
          {slide.render(step)}
        </section>
      </main>
    </div>
  );
}
