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
  {
    id: "bloodhound",
    label: "Bloodhound",
    kind: "application",
    summary:
      "Repo-Federation Tracker: a conserved character invariant χ, computed as a live graph minimum cut over a repo's own symbols, for measuring how much forks and clones of the same project have drifted — plus a small query language, st-Hurbert, for asking a federation of tracked repos about itself.",
    route: "/application/bloodhound",
    accent: "k3",
  },
  {
    id: "wind-tunnel",
    label: "Wind Tunnel",
    kind: "application",
    summary:
      "A code testing suite built on the claim that passing every unit test does not prove a system is correct: semantic entropy as a floor-positive residual, a proved witness for local-tests-blind-to-global-failure, Kirchhoff-style holonomy, and Kuramoto ensemble dynamics for judging a codebase's coordination regime.",
    route: "/application/wind-tunnel",
    accent: "k4",
  },
  {
    id: "absicht",
    label: "Absicht",
    kind: "application",
    summary:
      "Accountable Compilation: training a domain-specific model at its extremal regime for free downward transfer, federating receivers with a provable floor, routing a fixed budget across them by an exact 0-1 knapsack, and certifying the combination with a minimum loop of three mutually-checking receivers.",
    route: "/application/absicht",
    accent: "k1",
  },
  {
    id: "equilateral-frag",
    label: "Equilateral (RAG)",
    kind: "application",
    summary:
      "Federated Retrieval-Augmentation: a retrieval result as a minimum cut against an inexhaustible medium, content and meaning provably diverging, receiver-relative relevance, coherence requiring a triangle of sources, closure as the correct stopping rule, and a four-column route-audit for cross-source verification.",
    route: "/application/equilateral-frag",
    accent: "k2",
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
  { source: "s-entropy", target: "bloodhound", label: "applies to" },
  { source: "s-entropy", target: "wind-tunnel", label: "applies to" },
  { source: "bloodhound", target: "wind-tunnel", label: "hands off to" },
  { source: "s-entropy", target: "absicht", label: "applies to" },
  { source: "s-entropy", target: "equilateral-frag", label: "applies to" },
  { source: "absicht", target: "equilateral-frag", label: "shares verification with" },
];
