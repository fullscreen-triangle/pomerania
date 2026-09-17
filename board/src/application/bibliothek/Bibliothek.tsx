import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "federated-context-closure",
    title: "Federated Context Closure",
    subtitle: "Routing to Sufficiency Instead of Storing Answers",
    summary:
      "A resolution floor derived from individuation alone, closure as strictly stronger than confidence, provenance- and truth-blind coordination, a sufficiency theorem requiring three mutually supporting catalysts, generative recombination without new content, and an examiner-regress impossibility for certified completeness.",
    to: "/bibliothek/index.html",
    external: true,
    accent: "k1",
  },
  {
    id: "process-occupation-propagation",
    title: "Occupation Propagation Without an Orchestrator",
    subtitle: "Closure by Negation as the Only Coordination Primitive",
    summary:
      "Why propagation needs no trigger, why exit from a region is knowable only by its complement rather than a measured threshold, three blindness theorems (provenance, motive, class), hierarchy collapse with no privileged level, and liveness with no priced backpressure signal.",
    to: "/bibliothek/occupation.html",
    external: true,
    accent: "k3",
  },
];

export default function Bibliothek() {
  return (
    <PaperChooser
      title="Bibliothek"
      intro="Two technical notes deriving a process-automation coordination primitive — closure by negation — from the same individuation structure as S-Entropy, applied to federated context retrieval and orchestrator-free propagation."
      papers={papers}
    />
  );
}
