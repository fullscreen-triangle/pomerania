import PaperChooser, { type PaperCard } from "../../components/PaperChooser";

const papers: PaperCard[] = [
  {
    id: "federated-understanding",
    title: "Federated Understanding",
    subtitle:
      "Automated Deep Research Through Problem-Directed Trajectory Completion in Distributed Domain-Specific Language Model Networks",
    summary:
      "Research protocols as trajectories through S-entropy coordinate space, compiled by domain-specific models into morphism chains that extract only question-relevant information. An information minimality theorem, cross-modal composition preserving conservation, and an analysis graph that crystallizes to a validated answer under variance restoration.",
    to: "/application/pylon/federated-understanding",
    accent: "k1",
  },
  {
    id: "network-yield-computing-allocation",
    title: "Network Yield and Computing Allocation",
    subtitle:
      "A Unified Framework for Distributed Task Scheduling via Thermodynamic Resolution Floors, Cell-Partition Control, and Market Clearing",
    summary:
      "A single compute-tick plays three roles at once — physical resolution floor, algorithmic closure threshold, and minimum market lot — forcing yield-optimality, deterministic scheduler closure, and market clearing to coincide at one fixed point. Liveness without pricing, structural incorruptibility, and allocated processes re-read as persistent goal-directed agents.",
    to: "/application/pylon/network-yield",
    accent: "k2",
  },
];

export default function Pylon() {
  return (
    <PaperChooser
      title="Pylon"
      intro="Two technical notes applying S-entropy-coordinate reasoning to distributed infrastructure: question-directed extraction across federated domain models, and a compute-tick that unifies observation, scheduling, and market clearing for task allocation."
      papers={papers}
    />
  );
}
