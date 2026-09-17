import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SEntropyDeck from "./theory/sentropy/SEntropyDeck";
import Bibliothek from "./application/bibliothek/Bibliothek";
import Pylon from "./application/pylon/Pylon";
import FederatedUnderstandingDeck from "./application/pylon/federated-understanding/FederatedUnderstandingDeck";
import NetworkYieldDeck from "./application/pylon/network-yield/NetworkYieldDeck";
import Primers from "./application/tacat/Primers";
import Architecture from "./application/tacat/Architecture";
import Decks from "./application/tacat/Decks";
import MetaGraph from "./application/tacat/MetaGraph";
import BloodhoundDeck from "./application/bloodhound/BloodhoundDeck";
import WindTunnelDeck from "./application/windtunnel/WindTunnelDeck";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/theory/s-entropy" element={<SEntropyDeck />} />
      <Route path="/application/bibliothek" element={<Bibliothek />} />
      <Route path="/application/pylon" element={<Pylon />} />
      <Route
        path="/application/pylon/federated-understanding"
        element={<FederatedUnderstandingDeck />}
      />
      <Route
        path="/application/pylon/network-yield"
        element={<NetworkYieldDeck />}
      />
      <Route path="/application/tacat/primers" element={<Primers />} />
      <Route path="/application/tacat/architecture" element={<Architecture />} />
      <Route path="/application/tacat/decks" element={<Decks />} />
      <Route path="/application/tacat/meta-graph" element={<MetaGraph />} />
      <Route path="/application/bloodhound" element={<BloodhoundDeck />} />
      <Route path="/application/wind-tunnel" element={<WindTunnelDeck />} />
    </Routes>
  );
}

export default App;
