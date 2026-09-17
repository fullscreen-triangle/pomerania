import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SEntropyDeck from "./theory/sentropy/SEntropyDeck";
import Bibliothek from "./application/bibliothek/Bibliothek";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/theory/s-entropy" element={<SEntropyDeck />} />
      <Route path="/application/bibliothek" element={<Bibliothek />} />
    </Routes>
  );
}

export default App;
