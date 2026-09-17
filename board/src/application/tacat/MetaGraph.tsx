import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "blockers",
    title: "Blockers",
    subtitle: "tacat v2 meta-graph",
    summary: "Open blockers against the v2 submission, generated directly from the meta-graph's own tracked state.",
    to: "/tacat-meta-graph/blockers.html",
    external: true,
    accent: "k2",
  },
  {
    id: "coverage",
    title: "Coverage Matrix",
    subtitle: "tacat v2 meta-graph",
    summary: "Which parts of the submission each competency question is backed by, laid out as a matrix.",
    to: "/tacat-meta-graph/coverage.html",
    external: true,
    accent: "k3",
  },
  {
    id: "questions",
    title: "Question Coverage",
    subtitle: "tacat v2 meta-graph",
    summary: "Which competency questions the graph can currently answer, and which it cannot yet.",
    to: "/tacat-meta-graph/questions.html",
    external: true,
    accent: "k1",
  },
];

export default function MetaGraph() {
  return (
    <PaperChooser
      title="Tacat: Meta-Graph"
      intro="A generated coverage dashboard for the v2 submission — not authored prose, but a direct report of the meta-graph's own tracked state."
      papers={papers}
      backTo="/"
      backLabel="board"
    />
  );
}
