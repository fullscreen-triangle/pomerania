import type { ReactNode } from "react";

/** One slide in the S-entropy deck. `maxStep` is the highest data-step index
 * used by this slide's reveal content (0 if the slide has no stepped reveal). */
export interface SlideDef {
  title: string;
  maxStep: number;
  render: (step: number) => ReactNode;
}
