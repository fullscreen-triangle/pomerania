import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "deck",
    title: "The NFDI4Cat Demo",
    subtitle: "tacat — main presentation",
    summary:
      "The demo deck itself. Navigate with arrow keys; press ? for the full key list.",
    to: "/tacat-decks/deck.html",
    external: true,
    accent: "k1",
  },
  {
    id: "control",
    title: "Presenter Control",
    subtitle: "tacat — NFDI4Cat demo, control surface",
    summary:
      "A second-screen companion to the main deck: presenter notes and a live mirror of what the audience sees. Open alongside the deck, not instead of it.",
    to: "/tacat-decks/control.html",
    external: true,
    accent: "k2",
  },
  {
    id: "biochem",
    title: "Cytochrome P450",
    subtitle: "One axiom, seventeen papers",
    summary: "The biochemistry case study built from a single axiom, traced across seventeen supporting papers.",
    to: "/tacat-decks/biochem.html",
    external: true,
    accent: "k3",
  },
  {
    id: "medium",
    title: "The Medium",
    subtitle: "Direction, refusal, and a gated allocator",
    summary: "What the medium vertex is for: how it directs, when it refuses, and how a gated allocator uses it.",
    to: "/tacat-decks/medium.html",
    external: true,
    accent: "k4",
  },
  {
    id: "ontology",
    title: "Three More Ways",
    subtitle: "Three more ways to model a transaminase",
    summary: "Alternative ontological treatments of one enzyme class, compared directly.",
    to: "/tacat-decks/ontology.html",
    external: true,
    accent: "k1",
  },
  {
    id: "pylon",
    title: "Pylon",
    subtitle: "One quantum, three readings",
    summary: "The compute-tick reappearing as a presentation: one constant, three simultaneous roles.",
    to: "/tacat-decks/pylon.html",
    external: true,
    accent: "k2",
  },
];

export default function Decks() {
  return (
    <PaperChooser
      title="Tacat: Decks"
      intro="Six standalone presentations built for the NFDI4Cat submission and its surrounding talks."
      papers={papers}
      backTo="/"
      backLabel="board"
    />
  );
}
