import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "01-system",
    title: "01 · System Overview",
    subtitle: "tacat architecture",
    summary: "The whole system in one pass, before any of the four parts that follow.",
    to: "/tacat-architecture/01-system.html",
    external: true,
    accent: "k1",
  },
  {
    id: "02-ontology",
    title: "02 · The Ontology",
    subtitle: "tacat architecture",
    summary: "What is authored, what is generated, and where the ontology's own seams are.",
    to: "/tacat-architecture/02-ontology.html",
    external: true,
    accent: "k2",
  },
  {
    id: "03-delivery",
    title: "03 · Build and Delivery",
    subtitle: "tacat architecture",
    summary: "How the ontology and its data move from source to a servable artifact.",
    to: "/tacat-architecture/03-delivery.html",
    external: true,
    accent: "k3",
  },
  {
    id: "04-identity",
    title: "04 · Identity and Federation",
    subtitle: "tacat architecture",
    summary: "How external identifiers are handled, and what federation actually requires of them.",
    to: "/tacat-architecture/04-identity.html",
    external: true,
    accent: "k4",
  },
  {
    id: "05-request",
    title: "05 · The Request Path",
    subtitle: "tacat architecture",
    summary: "What happens, concretely, between a query arriving and an answer being served.",
    to: "/tacat-architecture/05-request.html",
    external: true,
    accent: "k1",
  },
];

export default function Architecture() {
  return (
    <PaperChooser
      title="Tacat: Architecture"
      intro="A five-part system walkthrough, distinguishing what is authored from what is generated at every layer."
      papers={papers}
      backTo="/"
      backLabel="board"
    />
  );
}
