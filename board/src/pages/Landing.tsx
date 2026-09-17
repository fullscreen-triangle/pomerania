import LandingGraph from "../graph/LandingGraph";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Pomerania</h1>
        <p className="landing-sub">
          A map of ideas derived from the S-entropy framework. Click a node.
        </p>
      </header>
      <div className="landing-graph">
        <LandingGraph />
      </div>
    </div>
  );
}
