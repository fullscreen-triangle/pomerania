import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "primer-kundai",
    title: "Tacat Primer",
    subtitle: "The computer science behind the NFDI4Cat submission, for a biochemist",
    summary:
      "Nine chapters plus a three-minute TL;DR: facts as data, meaning and inference, asking questions, checking the data, serving it, shipping it, the chemistry, and defending it.",
    to: "/tacat-primers/kundai/index.html",
    external: true,
    accent: "k1",
  },
  {
    id: "primer-julian",
    title: "Tacat Primer — CS Edition",
    subtitle: "The chemistry and biology behind the NFDI4Cat submission, for a computer scientist",
    summary:
      "Nine chapters: RDF as a database, SPARQL and the protocol, OWL and inference, SHACL and validation, stores and the stack, enzymes from zero, chemical identity, the reference databases, and a repo map and glossary.",
    to: "/tacat-primers/julian/index.html",
    external: true,
    accent: "k2",
  },
];

export default function Primers() {
  return (
    <PaperChooser
      title="Tacat: Primers"
      intro="Two complete onboarding tracks for the same submission, written for two different readers who need to reach the same understanding from opposite starting points."
      papers={papers}
      backTo="/"
      backLabel="board"
    />
  );
}
