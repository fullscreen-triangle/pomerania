import { useNavigate } from "react-router-dom";
import "./bibliothek.css";

const papers = [
  {
    id: "federated-context-closure",
    title: "Federated Context Closure",
    subtitle: "Routing to Sufficiency Instead of Storing Answers",
    summary:
      "A resolution floor derived from individuation alone, closure as strictly stronger than confidence, provenance- and truth-blind coordination, a sufficiency theorem requiring three mutually supporting catalysts, generative recombination without new content, and an examiner-regress impossibility for certified completeness.",
    href: "/bibliothek/index.html",
    accent: "k1" as const,
  },
  {
    id: "process-occupation-propagation",
    title: "Occupation Propagation Without an Orchestrator",
    subtitle: "Closure by Negation as the Only Coordination Primitive",
    summary:
      "Why propagation needs no trigger, why exit from a region is knowable only by its complement rather than a measured threshold, three blindness theorems (provenance, motive, class), hierarchy collapse with no privileged level, and liveness with no priced backpressure signal.",
    href: "/bibliothek/occupation.html",
    accent: "k3" as const,
  },
];

export default function Bibliothek() {
  const navigate = useNavigate();

  return (
    <div className="bib-root">
      <button className="bib-home-btn" onClick={() => navigate("/")}>
        ← board
      </button>

      <header className="bib-header">
        <h1>Bibliothek</h1>
        <p className="bib-sub">
          Two technical notes deriving a process-automation coordination
          primitive — closure by negation — from the same individuation
          structure as S-Entropy, applied to federated context retrieval and
          orchestrator-free propagation.
        </p>
      </header>

      <div className="bib-cards">
        {papers.map((p) => (
          <a key={p.id} className="bib-card" href={p.href} data-accent={p.accent}>
            <h2>{p.title}</h2>
            <p className="bib-card-subtitle">{p.subtitle}</p>
            <p className="bib-card-summary">{p.summary}</p>
            <span className="bib-card-link">Open →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
