import { useEffect, useRef } from "react";

interface D3ChartProps {
  id?: string;
  className?: string;
  /**
   * Imperative D3 mount function. Receives the chart's own container div
   * (`el`) to draw the SVG into, and the slide's shared control scope
   * (`scope`) to query for sibling controls/readouts rendered outside the
   * chart div (sliders, buttons, `.readout` divs) — matching the original
   * deck's `document.getElementById(...)` calls, which could reach anywhere
   * on the page. `scope` is `el`'s parent element, since every slide renders
   * `<D3Chart>` and its controls as siblings under one wrapping div. Must
   * clean up its own SVG (chartUtils.mountSvg does this on each call).
   */
  draw: (el: HTMLDivElement, scope: HTMLElement) => void | (() => void);
  /** Re-run draw when any of these change. */
  deps?: unknown[];
}

/** Bridges a React-owned div to an imperatively-drawn D3 chart, matching
 * the original deck's build() functions almost verbatim. */
export default function D3Chart({ id, className = "chart", draw, deps = [] }: D3ChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scope = el.parentElement ?? el;
    const cleanup = draw(el, scope);
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return <div id={id} className={className} ref={ref} />;
}
