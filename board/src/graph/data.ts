export type NodeKind = "theory" | "application" | "stub";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  summary: string;
  /** Route to navigate to on click. Absent = not yet linkable. */
  route?: string;
  /** If true, `route` is a static/external path (e.g. a prebuilt app under
   * public/) and clicking should do a full page navigation rather than a
   * client-side React Router transition. */
  external?: boolean;
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
  {
    id: "bibliothek",
    label: "Bibliothek",
    kind: "application",
    summary:
      "Closure by negation as a coordination primitive: routing to sufficiency instead of storing answers, and orchestrator-free occupation propagation.",
    route: "/application/bibliothek",
    accent: "k3",
  },
  {
    id: "pylon",
    label: "Pylon",
    kind: "application",
    summary:
      "Federated understanding and network-yield scheduling: question-directed extraction across distributed domain models, and a compute-tick unifying observation, scheduling, and market clearing.",
    route: "/application/pylon",
    accent: "k2",
  },
  {
    id: "equilateral",
    label: "Equilateral",
    kind: "application",
    summary:
      "Retrieval-augmented generation reframed as individuation, not lookup: content and meaning provably diverge, relevance is receiver-relative, and a society of split-attention agents replaces the fixed retrieve-then-generate pipeline.",
    route: "/equilateral/index.html",
    external: true,
    accent: "k4",
  },
  {
    id: "tacat-extension",
    label: "Tacat: Extension",
    kind: "application",
    summary:
      "What to build next, and why. Nine chapters: five gaps the tacat documentation already records against itself, each paired with one concrete proposal, plus a three-part argument for enforcing rather than merely representing the extension.",
    route: "/tacat-extension/index.html",
    external: true,
    accent: "k1",
  },
  {
    id: "tacat-primers",
    label: "Tacat: Primers",
    kind: "application",
    summary:
      "Two nine-chapter onboarding tracks for the tacat submission, one for a computer scientist and one for a biochemist — facts as data, meaning and inference, asking questions, checking, serving, shipping, and defending it.",
    route: "/application/tacat/primers",
    accent: "k2",
  },
  {
    id: "tacat-architecture",
    label: "Tacat: Architecture",
    kind: "application",
    summary:
      "A five-part system walkthrough: overview, the ontology, build and delivery, identity and federation, and the request path — what is authored, what is generated, and where the seams are.",
    route: "/application/tacat/architecture",
    accent: "k3",
  },
  {
    id: "tacat-decks",
    label: "Tacat: Decks",
    kind: "application",
    summary:
      "Six standalone presentations: the NFDI4Cat demo deck and its presenter-control companion, cytochrome P450 across seventeen papers, the medium as a gated allocator, three more ways to model a transaminase, and pylon's one quantum in three readings.",
    route: "/application/tacat/decks",
    accent: "k4",
  },
  {
    id: "tacat-ckg",
    label: "Tacat: Causal Knowledge Graph",
    kind: "application",
    summary:
      "One object, several readings: the medium as a vertex, path opacity, propagation recovered rather than asserted, the graph as runtime, S-entropy as distance to truth, and what federated querying and this all mean for a laboratory pipeline.",
    route: "/tacat-ckg/index.html",
    external: true,
    accent: "k1",
  },
  {
    id: "tacat-cards",
    label: "Tacat: Cards",
    kind: "application",
    summary:
      "A recall cheatsheet — the tacat submission's own definitions, competency questions, and structural claims distilled into a single reviewable card deck.",
    route: "/tacat-cards/index.html",
    external: true,
    accent: "k2",
  },
  {
    id: "tacat-meta-graph",
    label: "Tacat: Meta-Graph",
    kind: "application",
    summary:
      "A generated coverage dashboard for the v2 submission: open blockers, the competency-question coverage matrix, and which questions the graph can and cannot yet answer.",
    route: "/application/tacat/meta-graph",
    accent: "k3",
  },
  {
    id: "tacat-adventure",
    label: "Tacat: Adventure",
    kind: "application",
    summary:
      "\"The laboratory that remembers\" — a visionary sketch of what enzyme catalysis becomes once machines keep the memory, assembled from what is already being built.",
    route: "/tacat-adventure/index.html",
    external: true,
    accent: "k4",
  },
];

export const edges: GraphEdge[] = [
  { source: "s-entropy", target: "bibliothek", label: "applies to" },
  { source: "s-entropy", target: "pylon", label: "applies to" },
  { source: "s-entropy", target: "equilateral", label: "applies to" },
  { source: "s-entropy", target: "tacat-extension", label: "applies to" },
  { source: "tacat-extension", target: "tacat-primers", label: "onboarding" },
  { source: "tacat-extension", target: "tacat-architecture", label: "documents" },
  { source: "tacat-extension", target: "tacat-decks", label: "presents" },
  { source: "tacat-extension", target: "tacat-ckg", label: "presents" },
  { source: "tacat-extension", target: "tacat-cards", label: "recall" },
  { source: "tacat-extension", target: "tacat-meta-graph", label: "coverage" },
  { source: "tacat-extension", target: "tacat-adventure", label: "vision" },
];
