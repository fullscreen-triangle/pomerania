import * as d3 from "d3";

/** Fixed palette matching the site's CSS custom properties, resolved to
 * literal hex so D3 attr() calls (which don't cascade) get real values. */
export const C = {
  k1: "#5fa8d3",
  k2: "#e08b90",
  k3: "#5cbf95",
  k4: "#e0b464",
  ink: "#e8eef4",
  ink2: "#a9bccd",
  ink3: "#7f95a6",
  line: "#26374a",
  panel: "#17222e",
  good: "#5cbf95",
  bad: "#e08b90",
  bg: "#0a0f16",
  accent: "#5fa8d3",
} as const;

export const fmt = d3.format(".3f");

/** Clears and returns a fresh responsive SVG mounted into the given
 * container element, matching the deck's `svg(sel, w, h)` helper. */
export function mountSvg(container: HTMLElement, w: number, h: number) {
  d3.select(container).selectAll("*").remove();
  return d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
}
