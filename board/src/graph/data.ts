export type NodeKind = "theory" | "application" | "stub";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  summary: string;
  /** Route to navigate to on click. Absent = not yet linkable. */
  route?: string;
  /** Accent color key from the CSS palette (k1..k4), for visual grouping. */
  accent?: "k1" | "k2" | "k3" | "k4";
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

// The graph is meant to grow as new modules derived from the S-entropy
// framework are added. Only nodes with real content get a `route`; stub
// nodes render dimmed and inert until they do.
export const nodes: GraphNode[] = [
  {
    id: "s-entropy",
    label: "S-Entropy",
    kind: "theory",
    summary:
      "One floor, three coordinates. The generative axiom and the ternary resolution coordinates derived from individuation in a bounded whole.",
    route: "/theory/s-entropy",
    accent: "k1",
  },
];

export const edges: GraphEdge[] = [];
